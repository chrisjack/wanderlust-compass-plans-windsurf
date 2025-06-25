
export type ActivityType = "flight" | "accommodation" | "event" | "transport" | "cruise"

export interface Activity {
  id: string
  type: ActivityType
  title: string
  subtitle?: string
  time?: string
  date: Date
  location?: string
  
  // Flight specific fields
  flight_airline?: string
  flight_number?: string
  flight_departure_city?: string
  flight_arrival_city?: string
  flight_departure_airport_code?: string
  flight_arrival_airport_code?: string
  flight_departure_terminal?: string
  flight_arrival_terminal?: string
  flight_departure_gate?: string
  flight_departure_boarding_time?: string
  flight_time?: string
  flight_confirmation_number?: string
  flight_notes?: string
  flight_documents?: any
  
  // Accommodation specific fields
  accommodation_name?: string
  accommodation_description?: string
  accommodation_address?: string
  accommodation_city?: string
  accommodation_country?: string
  accommodation_phone?: string
  accommodation_email?: string
  accommodation_website?: string
  accommodation_confirmation_number?: string
  accommodation_number_of_rooms?: number
  accommodation_nights_stay?: number
  accommodation_notes?: string
  accommodation_departure_date?: string
  accommodation_checkin_time?: string
  accommodation_checkout_time?: string
  
  // Event specific fields
  name?: string
  description?: string
  end_date?: string
  end_time?: string
  
  // Transport specific fields
  provider?: string
  pickup_location?: string
  dropoff_location?: string
  reservation_number?: string
  notes?: string
  
  // Cruise specific fields
  cruise_name?: string
  cruise_description?: string
  cruise_line?: string
  cruise_ship_name?: string
  cruise_departure_port?: string
  cruise_arrival_port?: string
  cruise_booking_number?: string
  cruise_notes?: string
  cruise_end_date?: string
  cruise_boarding_time?: string
  
  [key: string]: any // This allows for additional properties specific to each activity type
}
