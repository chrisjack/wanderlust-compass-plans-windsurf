import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { OpenAI } from 'https://esm.sh/openai@4.0.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Verify SendGrid signature
    const signature = req.headers.get('x-twilio-email-event-webhook-signature')
    const timestamp = req.headers.get('x-twilio-email-event-webhook-timestamp')
    
    if (!signature || !timestamp) {
      throw new Error('Missing required headers')
    }

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: Deno.env.get('OPENAI_API_KEY'),
    })

    // Parse the request body
    const formData = await req.formData()
    const fromEmail = formData.get('from') as string
    const subject = formData.get('subject') as string
    const text = formData.get('text') as string
    const html = formData.get('html') as string
    const toEmail = formData.get('to') as string

    if (!fromEmail || !toEmail || (!text && !html)) {
      throw new Error('Missing required email fields')
    }

    // Extract type from the toEmail address
    const type = toEmail.split('@')[0].split('.')[0] // e.g., flights@wanderlustcompass.com -> flights

    // Find the user associated with this email
    const { data: userEmail, error: userEmailError } = await supabase
      .from('user_emails')
      .select('user_id')
      .eq('email', fromEmail)
      .single()

    if (userEmailError || !userEmail) {
      throw new Error('No user found for this email address')
    }

    // Process the email
    const parsedData = await processIncomingEmail(
      type,
      text || html, // Use text if available, otherwise use HTML
      userEmail.user_id,
      supabase,
      openai
    )

    return new Response(
      JSON.stringify({ success: true, data: parsedData }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error processing email:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})

async function processIncomingEmail(
  type: string,
  content: string,
  userId: string,
  supabase: any,
  openai: OpenAI
) {
  const config = {
    flights: {
      prompt: `Extract flight information from this email. Return a JSON object with these fields:
      {
        "airline": "airline name",
        "flight_number": "flight number",
        "departure_airport": "departure airport code",
        "departure_terminal": "departure terminal",
        "departure_date": "YYYY-MM-DD",
        "departure_time": "HH:MM",
        "arrival_airport": "arrival airport code",
        "arrival_terminal": "arrival terminal",
        "arrival_date": "YYYY-MM-DD",
        "arrival_time": "HH:MM",
        "confirmation_number": "booking confirmation number"
      }`
    },
    accommodation: {
      prompt: `Extract hotel/accommodation information from this email. Return a JSON object with these fields:
      {
        "name": "hotel name",
        "address": "full address",
        "check_in_date": "YYYY-MM-DD",
        "check_out_date": "YYYY-MM-DD",
        "confirmation_number": "booking confirmation number",
        "room_type": "room type/description"
      }`
    },
    events: {
      prompt: `Extract event information from this email. Return a JSON object with these fields:
      {
        "name": "event name",
        "venue": "venue name",
        "address": "venue address",
        "date": "YYYY-MM-DD",
        "time": "HH:MM",
        "confirmation_number": "booking confirmation number"
      }`
    },
    transport: {
      prompt: `Extract transport information from this email. Return a JSON object with these fields:
      {
        "provider": "transport company name",
        "type": "car rental/train/etc",
        "pickup_location": "pickup address",
        "dropoff_location": "dropoff address",
        "pickup_date": "YYYY-MM-DD",
        "pickup_time": "HH:MM",
        "confirmation_number": "booking confirmation number"
      }`
    },
    cruise: {
      prompt: `Extract cruise information from this email. Return a JSON object with these fields:
      {
        "cruise_line": "cruise line name",
        "ship_name": "ship name",
        "departure_port": "departure port",
        "arrival_port": "arrival port",
        "departure_date": "YYYY-MM-DD",
        "arrival_date": "YYYY-MM-DD",
        "confirmation_number": "booking confirmation number",
        "cabin": "cabin number/type"
      }`
    }
  }

  const typeConfig = config[type as keyof typeof config]
  if (!typeConfig) {
    throw new Error(`Invalid email type: ${type}`)
  }

  // Parse the email content using OpenAI
  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: `${typeConfig.prompt}\n\nEmail content: ${content}` }],
    response_format: { type: "json_object" }
  })

  const parsedData = JSON.parse(response.choices[0].message.content)

  // Save to the appropriate table
  const { error } = await supabase
    .from(`import_${type}`)
    .insert([{
      ...parsedData,
      user_id: userId,
      source: 'email',
      created_at: new Date().toISOString()
    }])

  if (error) throw error

  return parsedData
} 