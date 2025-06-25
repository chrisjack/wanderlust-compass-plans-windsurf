import { createClient } from '@supabase/supabase-js'
import { OpenAI } from 'openai'

// Initialize Supabase client
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
})

// Email parsing configuration
export const EMAIL_CONFIG = {
  flights: {
    address: 'flights@wanderlustcompass.com',
    parser: async (content: string) => {
      const prompt = `Extract flight information from this email. Return a JSON object with these fields:
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
      }
      Email content: ${content}`
      
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" }
      })
      
      return JSON.parse(response.choices[0].message.content)
    }
  },
  accommodation: {
    address: 'hotels@wanderlustcompass.com',
    parser: async (content: string) => {
      const prompt = `Extract hotel/accommodation information from this email. Return a JSON object with these fields:
      {
        "name": "hotel name",
        "address": "full address",
        "check_in_date": "YYYY-MM-DD",
        "check_out_date": "YYYY-MM-DD",
        "confirmation_number": "booking confirmation number",
        "room_type": "room type/description"
      }
      Email content: ${content}`
      
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" }
      })
      
      return JSON.parse(response.choices[0].message.content)
    }
  },
  events: {
    address: 'events@wanderlustcompass.com',
    parser: async (content: string) => {
      const prompt = `Extract event information from this email. Return a JSON object with these fields:
      {
        "name": "event name",
        "venue": "venue name",
        "address": "venue address",
        "date": "YYYY-MM-DD",
        "time": "HH:MM",
        "confirmation_number": "booking confirmation number"
      }
      Email content: ${content}`
      
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" }
      })
      
      return JSON.parse(response.choices[0].message.content)
    }
  },
  transport: {
    address: 'transport@wanderlustcompass.com',
    parser: async (content: string) => {
      const prompt = `Extract transport information from this email. Return a JSON object with these fields:
      {
        "provider": "transport company name",
        "type": "car rental/train/etc",
        "pickup_location": "pickup address",
        "dropoff_location": "dropoff address",
        "pickup_date": "YYYY-MM-DD",
        "pickup_time": "HH:MM",
        "confirmation_number": "booking confirmation number"
      }
      Email content: ${content}`
      
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" }
      })
      
      return JSON.parse(response.choices[0].message.content)
    }
  },
  cruise: {
    address: 'cruise@wanderlustcompass.com',
    parser: async (content: string) => {
      const prompt = `Extract cruise information from this email. Return a JSON object with these fields:
      {
        "cruise_line": "cruise line name",
        "ship_name": "ship name",
        "departure_port": "departure port",
        "arrival_port": "arrival port",
        "departure_date": "YYYY-MM-DD",
        "arrival_date": "YYYY-MM-DD",
        "confirmation_number": "booking confirmation number",
        "cabin": "cabin number/type"
      }
      Email content: ${content}`
      
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" }
      })
      
      return JSON.parse(response.choices[0].message.content)
    }
  }
}

// Function to process incoming email
export async function processIncomingEmail(type: string, content: string, userId: string) {
  const config = EMAIL_CONFIG[type as keyof typeof EMAIL_CONFIG]
  if (!config) {
    throw new Error(`Invalid email type: ${type}`)
  }

  try {
    // Parse the email content
    const parsedData = await config.parser(content)
    
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
  } catch (error) {
    console.error('Error processing email:', error)
    throw error
  }
} 