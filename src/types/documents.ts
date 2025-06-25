export interface Document {
  id: string;
  name: string;
  type: 'flights' | 'cruise';
  created_at: string;
  airline?: string;
  flight_number?: string;
  confirmation_number?: string;
  departure_airport?: string;
  departure_terminal?: string;
  departure_date?: string;
  departure_time?: string;
  arrival_airport?: string;
  arrival_terminal?: string;
  arrival_date?: string;
  arrival_time?: string;
  notes?: string;
  raw_text?: string;
  cruise_name?: string;
  cruise_line?: string;
  cruise_ship_name?: string;
  cruise_booking_number?: string;
  cruise_departure_port?: string;
  cruise_arrival_port?: string;
  cruise_start_date?: string;
  cruise_end_date?: string;
  cruise_boarding_time?: string;
  cruise_notes?: string;
} 