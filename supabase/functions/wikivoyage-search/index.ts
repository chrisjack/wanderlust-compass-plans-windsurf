import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://wanderlust-compass-plans-windsurf.vercel.app',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query } = await req.json();
    
    // Input validation
    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'Query parameter is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Query length validation (max 200 characters)
    if (query.length > 200) {
      return new Response(
        JSON.stringify({ error: 'Query too long (max 200 characters)' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Basic sanitization - remove potentially dangerous characters
    const sanitizedQuery = query.replace(/[<>\"'&]/g, '').trim();
    
    if (sanitizedQuery.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Query contains only invalid characters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Encode the search query for the URL
    const encodedQuery = encodeURIComponent(sanitizedQuery);
    
    // WikiVoyage API endpoint for searching pages
    const url = `https://en.wikivoyage.org/w/api.php?action=query&list=search&srsearch=${encodedQuery}&format=json&origin=*`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`WikiVoyage API returned status ${response.status}`);
    }
    
    const data = await response.json();
    
    // Validate response structure
    if (!data.query || !data.query.search || !Array.isArray(data.query.search)) {
      throw new Error('Invalid response from WikiVoyage API');
    }
    
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
