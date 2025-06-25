
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const RAPIDAPI_KEY = Deno.env.get("RAPIDAPI_KEY")
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // Get the request path
    const url = new URL(req.url)
    const path = url.pathname.split('/').pop()

    // Handle subscriptions, webhooks, and status checks
    switch (path) {
      case 'subscribe':
        return await handleSubscription(req, supabase)
      case 'webhook':
        return await handleWebhook(req, supabase)
      case 'check':
        return await handleManualCheck(req, supabase)
      default:
        return new Response(JSON.stringify({ error: 'Invalid endpoint' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
    }
  } catch (error) {
    console.error('Error in flight-monitor:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})

async function handleSubscription(req: Request, supabase) {
  const { flightId } = await req.json()
  
  // Get flight details from database
  const { data: flight, error: flightError } = await supabase
    .from('flights')
    .select('*')
    .eq('id', flightId)
    .single()
  
  if (flightError) {
    return new Response(JSON.stringify({ error: 'Flight not found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  // Format the flight date as YYYY-MM-DD
  const flightDate = flight.flight_departure_date

  // Subscribe to AeroDataBox API for flight monitoring
  try {
    const subscriptionData = {
      webhook: `${SUPABASE_URL}/functions/v1/flight-monitor/webhook`,
      flightNumber: flight.flight_number,
      airlineIata: flight.flight_airline, // Assuming flight_airline contains the IATA code
      date: flightDate
    }
    
    console.log('Subscribing to flight:', subscriptionData)
    
    const response = await fetch('https://aerodatabox.p.rapidapi.com/flights/webhooks/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-RapidAPI-Key': RAPIDAPI_KEY,
        'X-RapidAPI-Host': 'aerodatabox.p.rapidapi.com'
      },
      body: JSON.stringify(subscriptionData)
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`AeroDataBox API error: ${response.status} - ${errorText}`)
    }
    
    const subscriptionResponse = await response.json()
    
    // Update the flight with the subscription ID
    await supabase
      .from('flights')
      .update({
        flight_aerodata_subscription_id: subscriptionResponse.id,
        flight_aerodata_last_checked: new Date().toISOString(),
        flight_aerodata_status: 'subscribed'
      })
      .eq('id', flightId)
    
    return new Response(JSON.stringify({ success: true, subscription: subscriptionResponse }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Error subscribing to flight monitoring:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
}

async function handleWebhook(req: Request, supabase) {
  const webhookData = await req.json()
  console.log('Received webhook data:', webhookData)
  
  // Find the flight by subscription ID
  const { data: flight, error: flightError } = await supabase
    .from('flights')
    .select('*')
    .eq('flight_aerodata_subscription_id', webhookData.subscriptionId)
    .single()
  
  if (flightError) {
    return new Response(JSON.stringify({ error: 'Flight not found for this subscription' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
  
  // Compare and update flight details
  const updates = {}
  const changes = []

  // Check for flight status changes
  const flightStatus = webhookData.flight?.status
  if (flightStatus) {
    updates.flight_aerodata_status = flightStatus
    changes.push({
      field: 'status',
      oldValue: flight.flight_aerodata_status,
      newValue: flightStatus
    })
  }

  // Check for departure time changes
  if (webhookData.flight?.departure?.scheduledTimeLocal) {
    const newDepartureTime = webhookData.flight.departure.scheduledTimeLocal.split('T')[1].substring(0, 5)
    if (newDepartureTime !== flight.flight_departure_time) {
      updates.flight_departure_time = newDepartureTime
      changes.push({
        field: 'departure_time',
        oldValue: flight.flight_departure_time,
        newValue: newDepartureTime
      })
    }
  }

  // Check for arrival time changes
  if (webhookData.flight?.arrival?.scheduledTimeLocal) {
    const newArrivalTime = webhookData.flight.arrival.scheduledTimeLocal.split('T')[1].substring(0, 5)
    if (newArrivalTime !== flight.flight_arrival_time) {
      updates.flight_arrival_time = newArrivalTime
      changes.push({
        field: 'arrival_time',
        oldValue: flight.flight_arrival_time,
        newValue: newArrivalTime
      })
    }
  }

  // Check for terminal changes
  if (webhookData.flight?.departure?.terminal) {
    const newTerminal = webhookData.flight.departure.terminal
    if (newTerminal !== flight.flight_departure_terminal) {
      updates.flight_departure_terminal = newTerminal
      changes.push({
        field: 'departure_terminal',
        oldValue: flight.flight_departure_terminal,
        newValue: newTerminal
      })
    }
  }

  // Check for gate changes
  if (webhookData.flight?.departure?.gate) {
    const newGate = webhookData.flight.departure.gate
    if (newGate !== flight.flight_departure_gate) {
      updates.flight_departure_gate = newGate
      changes.push({
        field: 'departure_gate',
        oldValue: flight.flight_departure_gate,
        newValue: newGate
      })
    }
  }

  // Update flight if there are changes
  if (Object.keys(updates).length > 0) {
    updates.flight_aerodata_last_checked = new Date().toISOString()

    // Update the flight record
    await supabase
      .from('flights')
      .update(updates)
      .eq('id', flight.id)

    // Record the changes in history
    for (const change of changes) {
      await supabase
        .from('flight_status_history')
        .insert({
          flight_id: flight.id,
          status_change_type: change.field,
          old_value: { value: change.oldValue },
          new_value: { value: change.newValue }
        })
    }

    // Create an alert for the user
    const { data: tripData } = await supabase
      .from('trips')
      .select('user_id')
      .eq('id', flight.trip_id)
      .single()

    if (tripData) {
      await supabase
        .from('alerts')
        .insert({
          user_id: tripData.user_id,
          trip_id: flight.trip_id,
          alert_type: 'flight_update',
          alert_title: `Flight ${flight.flight_airline} ${flight.flight_number} Updated`,
          content: `Your flight from ${flight.flight_departure_city} to ${flight.flight_arrival_city} on ${flight.flight_departure_date} has been updated. ${changes.map(c => `${c.field.replace('_', ' ')}: ${c.oldValue || 'Not set'} → ${c.newValue}`).join(', ')}`,
          priority: 'high',
          read: false
        })
    }
  }

  return new Response(JSON.stringify({ success: true, changes }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
}

async function handleManualCheck(req: Request, supabase) {
  const { flightId } = await req.json()
  
  // Get flight details from database
  const { data: flight, error: flightError } = await supabase
    .from('flights')
    .select('*')
    .eq('id', flightId)
    .single()
  
  if (flightError) {
    return new Response(JSON.stringify({ error: 'Flight not found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  // Check if we have a subscription id
  if (!flight.flight_aerodata_subscription_id) {
    return new Response(JSON.stringify({ error: 'Flight is not subscribed for monitoring' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  try {
    // Format request for AeroDataBox API
    const response = await fetch(`https://aerodatabox.p.rapidapi.com/flights/${flight.flight_airline}/${flight.flight_number}/on/${flight.flight_departure_date}`, {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': RAPIDAPI_KEY,
        'X-RapidAPI-Host': 'aerodatabox.p.rapidapi.com'
      }
    })
    
    if (!response.ok) {
      throw new Error(`AeroDataBox API error: ${response.status}`)
    }
    
    const flightData = await response.json()
    
    // Process the flight data similarly to webhook handler
    const updates = {}
    const changes = []

    // Simulate webhook handling with the fetched data
    if (flightData.length > 0) {
      const flightInfo = flightData[0]
      
      // Update status
      if (flightInfo.status) {
        updates.flight_aerodata_status = flightInfo.status
        changes.push({
          field: 'status',
          oldValue: flight.flight_aerodata_status,
          newValue: flightInfo.status
        })
      }
      
      // Update times, gates, terminals etc.
      // Similar logic as in handleWebhook
    }

    // Update flight record if there are changes
    if (Object.keys(updates).length > 0) {
      // Update logic similar to handleWebhook
    }
    
    return new Response(JSON.stringify({ 
      success: true, 
      flightData,
      changes
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Error checking flight status:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
}
