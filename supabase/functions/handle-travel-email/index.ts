
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmailParams {
  from: string;
  subject: string;
  text: string;
  html?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const email: EmailParams = await req.json();
    console.log('Received email:', email);

    // Send the email content to the parse-travel-document function
    const { data: parsedData, error: parseError } = await fetch(
      'https://diphacbvdhfzdqfkobkl.supabase.co/functions/v1/parse-travel-document',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`,
        },
        body: JSON.stringify({
          document: {
            docType: 'email',
            content: email.text,
            mimeType: 'text/plain',
            emailFrom: email.from,
            emailSubject: email.subject
          }
        })
      }
    ).then(res => res.json());

    if (parseError) throw parseError;

    // Set up email forwarding for the user
    const { data: emailData, error: emailError } = await resend.emails.create({
      from: 'Travel Imports <imports@resend.dev>',
      reply_to: email.from,
      to: 'import-user123@travelbookings.app',
      subject: `FWD: ${email.subject}`,
      text: email.text,
      html: email.html,
    });

    if (emailError) throw emailError;

    console.log('Email forwarded successfully:', emailData);

    return new Response(
      JSON.stringify({ success: true, message: 'Email processed successfully' }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error processing email:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Failed to process email',
        details: error.message 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
