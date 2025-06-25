
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { document } = await req.json();
    
    if (!document) {
      return new Response(
        JSON.stringify({ error: "No document data provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Processing document:", document.fileName || "Unknown document");
    
    const openAIKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIKey) {
      return new Response(
        JSON.stringify({ error: "OpenAI API key is not configured" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Enhanced prompt for ChatGPT with more specific instructions
    const prompt = `
Please parse this travel document thoroughly and extract ALL travel-related information.
Format the data as structured JSON with complete details about:
- Booking/confirmation references and numbers
- Traveler information (names, loyalty numbers, contact details)
- Flight details (dates, times, flight numbers, terminals, seat assignments, baggage allowance)
- Accommodation details (check-in/out dates, hotel names, addresses, room types)
- Transportation details (rental cars, transfers)
- Event information (tours, activities, ticket numbers)
- Cruise information (ship name, itinerary, cabin details)
- Agency/contact information
- Payment/pricing details if available

Determine if this is primarily a flight, accommodation, event, transport, or cruise document.

OUTPUT FORMAT: Return valid JSON with the following structure:
{
  "documentType": "flight|accommodation|event|transport|cruise",
  "parsedData": { ... all extracted fields with maximum detail ... }
}

Be as comprehensive as possible, ensuring all dates, times, locations, and identifiers are properly captured.

Document content to parse:
${document.content.substring(0, 12000)}
`;

    // Call OpenAI's API with enhanced parameters
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openAIKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o",  // Using gpt-4o for better parsing capability
        messages: [
          { 
            role: "system", 
            content: "You are a specialized travel document parser that extracts detailed information from travel documents. Extract all information accurately and format it as valid JSON." 
          },
          { role: "user", content: prompt }
        ],
        temperature: 0.1,  // Lower temperature for more deterministic responses
        max_tokens: 4000,  // Increased max tokens to allow for detailed responses
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI API error:", errorText);
      throw new Error(`OpenAI API returned status ${response.status}`);
    }

    const result = await response.json();
    const parsedContent = result.choices[0].message.content.trim();
    
    console.log("Raw ChatGPT response:", parsedContent);
    
    // Extract the JSON from the response
    let parsedJson;
    try {
      parsedJson = JSON.parse(parsedContent);
    } catch (e) {
      const jsonMatch = parsedContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          parsedJson = JSON.parse(jsonMatch[0]);
        } catch (e2) {
          throw new Error("Failed to parse JSON from ChatGPT response");
        }
      } else {
        throw new Error("No valid JSON found in ChatGPT response");
      }
    }
    
    return new Response(
      JSON.stringify({
        fileName: document.fileName,
        mimeType: document.mimeType,
        documentType: parsedJson.documentType || "unknown",
        parsedData: parsedJson.parsedData || {}
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );

  } catch (error) {
    console.error("Error processing document:", error);
    return new Response(
      JSON.stringify({ error: "Document parsing failed", details: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
