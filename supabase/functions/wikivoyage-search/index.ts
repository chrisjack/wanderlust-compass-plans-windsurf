
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query } = await req.json();
    
    // Encode the search query for the URL
    const encodedQuery = encodeURIComponent(query);
    
    // WikiVoyage API endpoint for searching pages
    const url = `https://en.wikivoyage.org/w/api.php?action=query&list=search&srsearch=${encodedQuery}&format=json&origin=*`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    // Transform the response to include only relevant information
    const results = data.query.search.map((result: any) => ({
      id: result.pageid,
      title: result.title,
      snippet: result.snippet.replace(/<\/?[^>]+(>|$)/g, ""), // Remove HTML tags
      url: `https://en.wikivoyage.org/wiki/${encodeURIComponent(result.title)}`
    }));

    return new Response(JSON.stringify({ results }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('WikiVoyage search error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to search WikiVoyage' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
