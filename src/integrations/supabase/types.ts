export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      accommodation: {
        Row: {
          accommodation_address: string | null
          accommodation_arrival_date: string | null
          accommodation_checkin_time: string | null
          accommodation_checkout_time: string | null
          accommodation_city: string | null
          accommodation_confirmation_number: string | null
          accommodation_country: string | null
          accommodation_departure_date: string | null
          accommodation_description: string | null
          accommodation_documents: Json | null
          accommodation_email: string | null
          accommodation_feature_image: string | null
          accommodation_gallery_images: Json | null
          accommodation_name: string | null
          accommodation_nights_stay: number | null
          accommodation_notes: string | null
          accommodation_number_of_rooms: number | null
          accommodation_phone: string | null
          accommodation_website: string | null
          created_at: string
          id: string
          trip_id: string
          updated_at: string
        }
        Insert: {
          accommodation_address?: string | null
          accommodation_arrival_date?: string | null
          accommodation_checkin_time?: string | null
          accommodation_checkout_time?: string | null
          accommodation_city?: string | null
          accommodation_confirmation_number?: string | null
          accommodation_country?: string | null
          accommodation_departure_date?: string | null
          accommodation_description?: string | null
          accommodation_documents?: Json | null
          accommodation_email?: string | null
          accommodation_feature_image?: string | null
          accommodation_gallery_images?: Json | null
          accommodation_name?: string | null
          accommodation_nights_stay?: number | null
          accommodation_notes?: string | null
          accommodation_number_of_rooms?: number | null
          accommodation_phone?: string | null
          accommodation_website?: string | null
          created_at?: string
          id?: string
          trip_id: string
          updated_at?: string
        }
        Update: {
          accommodation_address?: string | null
          accommodation_arrival_date?: string | null
          accommodation_checkin_time?: string | null
          accommodation_checkout_time?: string | null
          accommodation_city?: string | null
          accommodation_confirmation_number?: string | null
          accommodation_country?: string | null
          accommodation_departure_date?: string | null
          accommodation_description?: string | null
          accommodation_documents?: Json | null
          accommodation_email?: string | null
          accommodation_feature_image?: string | null
          accommodation_gallery_images?: Json | null
          accommodation_name?: string | null
          accommodation_nights_stay?: number | null
          accommodation_notes?: string | null
          accommodation_number_of_rooms?: number | null
          accommodation_phone?: string | null
          accommodation_website?: string | null
          created_at?: string
          id?: string
          trip_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "accommodation_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      accommodation_facilities: {
        Row: {
          accommodation_id: string | null
          created_at: string
          facility_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          accommodation_id?: string | null
          created_at?: string
          facility_name?: string | null
          id?: string
          updated_at?: string
        }
        Update: {
          accommodation_id?: string | null
          created_at?: string
          facility_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_accommodation_facilities_accommodation"
            columns: ["accommodation_id"]
            isOneToOne: false
            referencedRelation: "accommodation"
            referencedColumns: ["id"]
          },
        ]
      }
      accommodation_guests: {
        Row: {
          accommodation_id: string
          created_at: string
          guest_loyalty_number: string | null
          id: string
          name: string | null
          room_number: string | null
          room_type: string | null
          updated_at: string
        }
        Insert: {
          accommodation_id: string
          created_at?: string
          guest_loyalty_number?: string | null
          id?: string
          name?: string | null
          room_number?: string | null
          room_type?: string | null
          updated_at?: string
        }
        Update: {
          accommodation_id?: string
          created_at?: string
          guest_loyalty_number?: string | null
          id?: string
          name?: string | null
          room_number?: string | null
          room_type?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "accommodation_guests_accommodation_id_fkey"
            columns: ["accommodation_id"]
            isOneToOne: false
            referencedRelation: "accommodation"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_invitations: {
        Row: {
          created_at: string | null
          email: string
          id: string
          invited_by: string
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          invited_by: string
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          invited_by?: string
        }
        Relationships: []
      }
      alerts: {
        Row: {
          alert_title: string | null
          alert_type: string | null
          content: string | null
          created_at: string
          expires_at: string | null
          id: string
          priority: string | null
          read: boolean | null
          trip_id: string | null
          user_id: string
        }
        Insert: {
          alert_title?: string | null
          alert_type?: string | null
          content?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          priority?: string | null
          read?: boolean | null
          trip_id?: string | null
          user_id: string
        }
        Update: {
          alert_title?: string | null
          alert_type?: string | null
          content?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          priority?: string | null
          read?: boolean | null
          trip_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      clients: {
        Row: {
          address: string | null
          created_at: string
          email: string | null
          id: string
          name: string
          organisation: string | null
          phone: string | null
          photo: string | null
          status: string | null
          trips: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          organisation?: string | null
          phone?: string | null
          photo?: string | null
          status?: string | null
          trips?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          organisation?: string | null
          phone?: string | null
          photo?: string | null
          status?: string | null
          trips?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      cruise_itinerary: {
        Row: {
          arrival: string | null
          cruise_id: string
          cruise_itinerary_image: string | null
          date: string | null
          day: number | null
          departure: string | null
          description: string | null
          id: string
          notes: string | null
          port: string | null
        }
        Insert: {
          arrival?: string | null
          cruise_id: string
          cruise_itinerary_image?: string | null
          date?: string | null
          day?: number | null
          departure?: string | null
          description?: string | null
          id?: string
          notes?: string | null
          port?: string | null
        }
        Update: {
          arrival?: string | null
          cruise_id?: string
          cruise_itinerary_image?: string | null
          date?: string | null
          day?: number | null
          departure?: string | null
          description?: string | null
          id?: string
          notes?: string | null
          port?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cruise_itinerary_cruise_id_fkey"
            columns: ["cruise_id"]
            isOneToOne: false
            referencedRelation: "cruises"
            referencedColumns: ["id"]
          },
        ]
      }
      cruise_passengers: {
        Row: {
          cabin_number: string | null
          created_at: string
          cruise_id: string
          cruise_passenger_documents: Json | null
          id: string
          name: string | null
          updated_at: string
        }
        Insert: {
          cabin_number?: string | null
          created_at?: string
          cruise_id: string
          cruise_passenger_documents?: Json | null
          id?: string
          name?: string | null
          updated_at?: string
        }
        Update: {
          cabin_number?: string | null
          created_at?: string
          cruise_id?: string
          cruise_passenger_documents?: Json | null
          id?: string
          name?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cruise_passengers_cruise_id_fkey"
            columns: ["cruise_id"]
            isOneToOne: false
            referencedRelation: "cruises"
            referencedColumns: ["id"]
          },
        ]
      }
      cruises: {
        Row: {
          created_at: string
          cruise_arrival_port: string | null
          cruise_boarding_time: string | null
          cruise_booking_number: string | null
          cruise_departure_port: string | null
          cruise_description: string | null
          cruise_documents: Json | null
          cruise_end_date: string | null
          cruise_feature_image: string | null
          cruise_images: Json | null
          cruise_line: string | null
          cruise_name: string | null
          cruise_notes: string | null
          cruise_ship_name: string | null
          cruise_start_date: string | null
          id: string
          trip_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          cruise_arrival_port?: string | null
          cruise_boarding_time?: string | null
          cruise_booking_number?: string | null
          cruise_departure_port?: string | null
          cruise_description?: string | null
          cruise_documents?: Json | null
          cruise_end_date?: string | null
          cruise_feature_image?: string | null
          cruise_images?: Json | null
          cruise_line?: string | null
          cruise_name?: string | null
          cruise_notes?: string | null
          cruise_ship_name?: string | null
          cruise_start_date?: string | null
          id?: string
          trip_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          cruise_arrival_port?: string | null
          cruise_boarding_time?: string | null
          cruise_booking_number?: string | null
          cruise_departure_port?: string | null
          cruise_description?: string | null
          cruise_documents?: Json | null
          cruise_end_date?: string | null
          cruise_feature_image?: string | null
          cruise_images?: Json | null
          cruise_line?: string | null
          cruise_name?: string | null
          cruise_notes?: string | null
          cruise_ship_name?: string | null
          cruise_start_date?: string | null
          id?: string
          trip_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cruises_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          address: string | null
          city: string | null
          confirmation_number: string | null
          country: string | null
          created_at: string
          description: string | null
          documents: Json | null
          end_date: string | null
          end_time: string | null
          feature_image: string | null
          id: string
          images: Json | null
          location: string | null
          name: string | null
          start_date: string | null
          start_time: string | null
          trip_id: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          city?: string | null
          confirmation_number?: string | null
          country?: string | null
          created_at?: string
          description?: string | null
          documents?: Json | null
          end_date?: string | null
          end_time?: string | null
          feature_image?: string | null
          id?: string
          images?: Json | null
          location?: string | null
          name?: string | null
          start_date?: string | null
          start_time?: string | null
          trip_id: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          city?: string | null
          confirmation_number?: string | null
          country?: string | null
          created_at?: string
          description?: string | null
          documents?: Json | null
          end_date?: string | null
          end_time?: string | null
          feature_image?: string | null
          id?: string
          images?: Json | null
          location?: string | null
          name?: string | null
          start_date?: string | null
          start_time?: string | null
          trip_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "events_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      flight_status_history: {
        Row: {
          created_at: string
          flight_id: string
          id: string
          new_value: Json | null
          old_value: Json | null
          status_change_type: string
        }
        Insert: {
          created_at?: string
          flight_id: string
          id?: string
          new_value?: Json | null
          old_value?: Json | null
          status_change_type: string
        }
        Update: {
          created_at?: string
          flight_id?: string
          id?: string
          new_value?: Json | null
          old_value?: Json | null
          status_change_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "flight_status_history_flight_id_fkey"
            columns: ["flight_id"]
            isOneToOne: false
            referencedRelation: "flights"
            referencedColumns: ["id"]
          },
        ]
      }
      flights: {
        Row: {
          created_at: string
          flight_aerodata_last_checked: string | null
          flight_aerodata_status: string | null
          flight_aerodata_subscription_id: string | null
          flight_airline: string | null
          flight_arrival_airport_code: string | null
          flight_arrival_city: string | null
          flight_arrival_date: string | null
          flight_arrival_terminal: string | null
          flight_arrival_time: string | null
          flight_confirmation_number: string | null
          flight_departure_airport_code: string | null
          flight_departure_boarding_time: string | null
          flight_departure_city: string | null
          flight_departure_date: string | null
          flight_departure_gate: string | null
          flight_departure_terminal: string | null
          flight_departure_time: string | null
          flight_documents: Json | null
          flight_notes: string | null
          flight_number: string | null
          flight_time: string | null
          id: string
          trip_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          flight_aerodata_last_checked?: string | null
          flight_aerodata_status?: string | null
          flight_aerodata_subscription_id?: string | null
          flight_airline?: string | null
          flight_arrival_airport_code?: string | null
          flight_arrival_city?: string | null
          flight_arrival_date?: string | null
          flight_arrival_terminal?: string | null
          flight_arrival_time?: string | null
          flight_confirmation_number?: string | null
          flight_departure_airport_code?: string | null
          flight_departure_boarding_time?: string | null
          flight_departure_city?: string | null
          flight_departure_date?: string | null
          flight_departure_gate?: string | null
          flight_departure_terminal?: string | null
          flight_departure_time?: string | null
          flight_documents?: Json | null
          flight_notes?: string | null
          flight_number?: string | null
          flight_time?: string | null
          id?: string
          trip_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          flight_aerodata_last_checked?: string | null
          flight_aerodata_status?: string | null
          flight_aerodata_subscription_id?: string | null
          flight_airline?: string | null
          flight_arrival_airport_code?: string | null
          flight_arrival_city?: string | null
          flight_arrival_date?: string | null
          flight_arrival_terminal?: string | null
          flight_arrival_time?: string | null
          flight_confirmation_number?: string | null
          flight_departure_airport_code?: string | null
          flight_departure_boarding_time?: string | null
          flight_departure_city?: string | null
          flight_departure_date?: string | null
          flight_departure_gate?: string | null
          flight_departure_terminal?: string | null
          flight_departure_time?: string | null
          flight_documents?: Json | null
          flight_notes?: string | null
          flight_number?: string | null
          flight_time?: string | null
          id?: string
          trip_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "flights_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      flights_passengers: {
        Row: {
          class: string | null
          created_at: string
          flight_id: string
          flight_passengers_documents: Json | null
          id: string
          loyalty_number: string | null
          name: string | null
          passenger_notes: string | null
          seat: string | null
          updated_at: string
        }
        Insert: {
          class?: string | null
          created_at?: string
          flight_id: string
          flight_passengers_documents?: Json | null
          id?: string
          loyalty_number?: string | null
          name?: string | null
          passenger_notes?: string | null
          seat?: string | null
          updated_at?: string
        }
        Update: {
          class?: string | null
          created_at?: string
          flight_id?: string
          flight_passengers_documents?: Json | null
          id?: string
          loyalty_number?: string | null
          name?: string | null
          passenger_notes?: string | null
          seat?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "flights_passengers_flight_id_fkey"
            columns: ["flight_id"]
            isOneToOne: false
            referencedRelation: "flights"
            referencedColumns: ["id"]
          },
        ]
      }
      import_accommodation: {
        Row: {
          accommodation_address: string | null
          accommodation_arrival_date: string | null
          accommodation_checkin_time: string | null
          accommodation_checkout_time: string | null
          accommodation_city: string | null
          accommodation_confirmation_number: string | null
          accommodation_country: string | null
          accommodation_departure_date: string | null
          accommodation_description: string | null
          accommodation_email: string | null
          accommodation_name: string | null
          accommodation_nights_stay: number | null
          accommodation_notes: string | null
          accommodation_number_of_rooms: number | null
          accommodation_phone: string | null
          accommodation_roomtype: string | null
          accommodation_website: string | null
          created_at: string
          id: string
          source: string | null
          user_id: string | null
        }
        Insert: {
          accommodation_address?: string | null
          accommodation_arrival_date?: string | null
          accommodation_checkin_time?: string | null
          accommodation_checkout_time?: string | null
          accommodation_city?: string | null
          accommodation_confirmation_number?: string | null
          accommodation_country?: string | null
          accommodation_departure_date?: string | null
          accommodation_description?: string | null
          accommodation_email?: string | null
          accommodation_name?: string | null
          accommodation_nights_stay?: number | null
          accommodation_notes?: string | null
          accommodation_number_of_rooms?: number | null
          accommodation_phone?: string | null
          accommodation_roomtype?: string | null
          accommodation_website?: string | null
          created_at?: string
          id?: string
          source?: string | null
          user_id?: string | null
        }
        Update: {
          accommodation_address?: string | null
          accommodation_arrival_date?: string | null
          accommodation_checkin_time?: string | null
          accommodation_checkout_time?: string | null
          accommodation_city?: string | null
          accommodation_confirmation_number?: string | null
          accommodation_country?: string | null
          accommodation_departure_date?: string | null
          accommodation_description?: string | null
          accommodation_email?: string | null
          accommodation_name?: string | null
          accommodation_nights_stay?: number | null
          accommodation_notes?: string | null
          accommodation_number_of_rooms?: number | null
          accommodation_phone?: string | null
          accommodation_roomtype?: string | null
          accommodation_website?: string | null
          created_at?: string
          id?: string
          source?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      import_cruise: {
        Row: {
          created_at: string
          cruise_arrival_port: string | null
          cruise_boarding_time: string | null
          cruise_booking_number: string | null
          cruise_departure_port: string | null
          cruise_description: string | null
          cruise_end_date: string | null
          cruise_line: string | null
          cruise_name: string | null
          cruise_notes: string | null
          cruise_ship_name: string | null
          cruise_start_date: string | null
          id: string
          source: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          cruise_arrival_port?: string | null
          cruise_boarding_time?: string | null
          cruise_booking_number?: string | null
          cruise_departure_port?: string | null
          cruise_description?: string | null
          cruise_end_date?: string | null
          cruise_line?: string | null
          cruise_name?: string | null
          cruise_notes?: string | null
          cruise_ship_name?: string | null
          cruise_start_date?: string | null
          id?: string
          source?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          cruise_arrival_port?: string | null
          cruise_boarding_time?: string | null
          cruise_booking_number?: string | null
          cruise_departure_port?: string | null
          cruise_description?: string | null
          cruise_end_date?: string | null
          cruise_line?: string | null
          cruise_name?: string | null
          cruise_notes?: string | null
          cruise_ship_name?: string | null
          cruise_start_date?: string | null
          id?: string
          source?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      import_event: {
        Row: {
          created_at: string
          event_confirmation_number: string | null
          event_duration: string | null
          event_email: string | null
          event_end_date: string | null
          event_end_time: string | null
          event_location: string | null
          event_name: string | null
          event_notes: string | null
          event_phone: string | null
          event_start_date: string | null
          event_start_time: string | null
          event_website: string | null
          id: string
          source: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          event_confirmation_number?: string | null
          event_duration?: string | null
          event_email?: string | null
          event_end_date?: string | null
          event_end_time?: string | null
          event_location?: string | null
          event_name?: string | null
          event_notes?: string | null
          event_phone?: string | null
          event_start_date?: string | null
          event_start_time?: string | null
          event_website?: string | null
          id?: string
          source?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          event_confirmation_number?: string | null
          event_duration?: string | null
          event_email?: string | null
          event_end_date?: string | null
          event_end_time?: string | null
          event_location?: string | null
          event_name?: string | null
          event_notes?: string | null
          event_phone?: string | null
          event_start_date?: string | null
          event_start_time?: string | null
          event_website?: string | null
          id?: string
          source?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      import_events: {
        Row: {
          address: string | null
          confirmation_number: string | null
          created_at: string
          date: string | null
          id: string
          name: string | null
          raw_text: string | null
          source: string
          time: string | null
          user_id: string
          venue: string | null
        }
        Insert: {
          address?: string | null
          confirmation_number?: string | null
          created_at?: string
          date?: string | null
          id?: string
          name?: string | null
          raw_text?: string | null
          source: string
          time?: string | null
          user_id: string
          venue?: string | null
        }
        Update: {
          address?: string | null
          confirmation_number?: string | null
          created_at?: string
          date?: string | null
          id?: string
          name?: string | null
          raw_text?: string | null
          source?: string
          time?: string | null
          user_id?: string
          venue?: string | null
        }
        Relationships: []
      }
      import_flights: {
        Row: {
          created_at: string
          flight_airline: string | null
          flight_arrival_airport_code: string | null
          flight_arrival_city: string | null
          flight_arrival_date: string | null
          flight_arrival_terminal: string | null
          flight_arrival_time: string | null
          flight_confirmation_number: string | null
          flight_departure_airport_code: string | null
          flight_departure_boarding_time: string | null
          flight_departure_city: string | null
          flight_departure_date: string | null
          flight_departure_gate: string | null
          flight_departure_terminal: string | null
          flight_departure_time: string | null
          flight_notes: string | null
          flight_number: string | null
          flight_time: string | null
          id: string
          source: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          flight_airline?: string | null
          flight_arrival_airport_code?: string | null
          flight_arrival_city?: string | null
          flight_arrival_date?: string | null
          flight_arrival_terminal?: string | null
          flight_arrival_time?: string | null
          flight_confirmation_number?: string | null
          flight_departure_airport_code?: string | null
          flight_departure_boarding_time?: string | null
          flight_departure_city?: string | null
          flight_departure_date?: string | null
          flight_departure_gate?: string | null
          flight_departure_terminal?: string | null
          flight_departure_time?: string | null
          flight_notes?: string | null
          flight_number?: string | null
          flight_time?: string | null
          id?: string
          source?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          flight_airline?: string | null
          flight_arrival_airport_code?: string | null
          flight_arrival_city?: string | null
          flight_arrival_date?: string | null
          flight_arrival_terminal?: string | null
          flight_arrival_time?: string | null
          flight_confirmation_number?: string | null
          flight_departure_airport_code?: string | null
          flight_departure_boarding_time?: string | null
          flight_departure_city?: string | null
          flight_departure_date?: string | null
          flight_departure_gate?: string | null
          flight_departure_terminal?: string | null
          flight_departure_time?: string | null
          flight_notes?: string | null
          flight_number?: string | null
          flight_time?: string | null
          id?: string
          source?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      import_transport: {
        Row: {
          created_at: string
          id: string
          source: string | null
          transport_confirmation_number: string | null
          transport_dropoff_date: string | null
          transport_dropoff_location: string | null
          transport_dropoff_time: string | null
          transport_email: string | null
          transport_name: string | null
          transport_notes: string | null
          transport_phone: string | null
          transport_pickup_date: string | null
          transport_pickup_location: string | null
          transport_pickup_time: string | null
          transport_website: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          source?: string | null
          transport_confirmation_number?: string | null
          transport_dropoff_date?: string | null
          transport_dropoff_location?: string | null
          transport_dropoff_time?: string | null
          transport_email?: string | null
          transport_name?: string | null
          transport_notes?: string | null
          transport_phone?: string | null
          transport_pickup_date?: string | null
          transport_pickup_location?: string | null
          transport_pickup_time?: string | null
          transport_website?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          source?: string | null
          transport_confirmation_number?: string | null
          transport_dropoff_date?: string | null
          transport_dropoff_location?: string | null
          transport_dropoff_time?: string | null
          transport_email?: string | null
          transport_name?: string | null
          transport_notes?: string | null
          transport_phone?: string | null
          transport_pickup_date?: string | null
          transport_pickup_location?: string | null
          transport_pickup_time?: string | null
          transport_website?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      library: {
        Row: {
          created_at: string
          document_name: string | null
          document_type: string | null
          id: string
          library_document: string | null
          library_tags: string | null
          library_trips: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          document_name?: string | null
          document_type?: string | null
          id?: string
          library_document?: string | null
          library_tags?: string | null
          library_trips?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          document_name?: string | null
          document_type?: string | null
          id?: string
          library_document?: string | null
          library_tags?: string | null
          library_trips?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string | null
          created_at: string
          id: string
          read: boolean | null
          reciever_id: string
          sender_id: string
          trip_id: string | null
          updated_at: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string
          id?: string
          read?: boolean | null
          reciever_id: string
          sender_id: string
          trip_id?: string | null
          updated_at?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string
          id?: string
          read?: boolean | null
          reciever_id?: string
          sender_id?: string
          trip_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      parsed_documents: {
        Row: {
          created_at: string
          document_type: string
          file_name: string
          id: string
          mime_type: string | null
          parsed_data: Json
        }
        Insert: {
          created_at?: string
          document_type: string
          file_name: string
          id?: string
          mime_type?: string | null
          parsed_data: Json
        }
        Update: {
          created_at?: string
          document_type?: string
          file_name?: string
          id?: string
          mime_type?: string | null
          parsed_data?: Json
        }
        Relationships: []
      }
      planner_columns: {
        Row: {
          created_at: string
          id: string
          position: number
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          position?: number
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          position?: number
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      planner_fields: {
        Row: {
          created_at: string
          id: string
          title: string
          type: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          title: string
          type: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          title?: string
          type?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      planner_files: {
        Row: {
          created_at: string
          file: string | null
          id: string
          name: string | null
          trip_id: string | null
          user: string | null
        }
        Insert: {
          created_at?: string
          file?: string | null
          id?: string
          name?: string | null
          trip_id?: string | null
          user?: string | null
        }
        Update: {
          created_at?: string
          file?: string | null
          id?: string
          name?: string | null
          trip_id?: string | null
          user?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "planner_files_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "planner_trips"
            referencedColumns: ["id"]
          },
        ]
      }
      planner_notes: {
        Row: {
          content: string
          created_at: string | null
          file: string | null
          id: string
          link: string | null
          title: string | null
          trip_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          file?: string | null
          id?: string
          link?: string | null
          title?: string | null
          trip_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          file?: string | null
          id?: string
          link?: string | null
          title?: string | null
          trip_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "planner_notes_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "planner_trips"
            referencedColumns: ["id"]
          },
        ]
      }
      planner_tags: {
        Row: {
          created_at: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      planner_tasks: {
        Row: {
          created_at: string | null
          description: string | null
          due_date: string | null
          id: string
          status: string | null
          title: string
          trip_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          status?: string | null
          title: string
          trip_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          status?: string | null
          title?: string
          trip_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "planner_tasks_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "planner_trips"
            referencedColumns: ["id"]
          },
        ]
      }
      planner_trip_field_values: {
        Row: {
          created_at: string
          field_id: string | null
          id: string
          trip_id: string | null
          updated_at: string
          value: string | null
        }
        Insert: {
          created_at?: string
          field_id?: string | null
          id?: string
          trip_id?: string | null
          updated_at?: string
          value?: string | null
        }
        Update: {
          created_at?: string
          field_id?: string | null
          id?: string
          trip_id?: string | null
          updated_at?: string
          value?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "planner_trip_field_values_field_id_fkey"
            columns: ["field_id"]
            isOneToOne: false
            referencedRelation: "planner_fields"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "planner_trip_field_values_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "planner_trips"
            referencedColumns: ["id"]
          },
        ]
      }
      planner_trip_history: {
        Row: {
          column_id: string | null
          id: string
          moved_at: string | null
          previous_column_id: string | null
          trip_id: string | null
          user_id: string | null
        }
        Insert: {
          column_id?: string | null
          id?: string
          moved_at?: string | null
          previous_column_id?: string | null
          trip_id?: string | null
          user_id?: string | null
        }
        Update: {
          column_id?: string | null
          id?: string
          moved_at?: string | null
          previous_column_id?: string | null
          trip_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "planner_trip_history_column_id_fkey"
            columns: ["column_id"]
            isOneToOne: false
            referencedRelation: "planner_columns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "planner_trip_history_previous_column_id_fkey"
            columns: ["previous_column_id"]
            isOneToOne: false
            referencedRelation: "planner_columns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "planner_trip_history_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "planner_trips"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "planner_trip_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      planner_trip_links: {
        Row: {
          created_at: string | null
          id: string
          title: string
          trip_id: string | null
          updated_at: string | null
          url: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          title: string
          trip_id?: string | null
          updated_at?: string | null
          url: string
        }
        Update: {
          created_at?: string | null
          id?: string
          title?: string
          trip_id?: string | null
          updated_at?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "planner_trip_links_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "planner_trips"
            referencedColumns: ["id"]
          },
        ]
      }
      planner_trip_tags: {
        Row: {
          created_at: string | null
          tag_id: string
          trip_id: string
        }
        Insert: {
          created_at?: string | null
          tag_id: string
          trip_id: string
        }
        Update: {
          created_at?: string | null
          tag_id?: string
          trip_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "planner_trip_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "planner_tags"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "planner_trip_tags_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "planner_trips"
            referencedColumns: ["id"]
          },
        ]
      }
      planner_trip_texts: {
        Row: {
          content: string
          created_at: string | null
          id: string
          trip_id: string | null
          updated_at: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          trip_id?: string | null
          updated_at?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          trip_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "planner_trip_texts_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "planner_trips"
            referencedColumns: ["id"]
          },
        ]
      }
      planner_trips: {
        Row: {
          client_id: string | null
          column_id: string
          created_at: string
          departureDate: string | null
          description: string | null
          id: string
          title: string
          trip_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          client_id?: string | null
          column_id: string
          created_at?: string
          departureDate?: string | null
          description?: string | null
          id?: string
          title: string
          trip_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          client_id?: string | null
          column_id?: string
          created_at?: string
          departureDate?: string | null
          description?: string | null
          id?: string
          title?: string
          trip_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_column_id_fkey"
            columns: ["column_id"]
            isOneToOne: false
            referencedRelation: "planner_columns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          admin: boolean | null
          avatar_url: string | null
          bio: string | null
          company_logo: string | null
          company_name: string | null
          company_website: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          phone: string | null
          position: string | null
          role: string | null
          updated_at: string
        }
        Insert: {
          admin?: boolean | null
          avatar_url?: string | null
          bio?: string | null
          company_logo?: string | null
          company_name?: string | null
          company_website?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          phone?: string | null
          position?: string | null
          role?: string | null
          updated_at?: string
        }
        Update: {
          admin?: boolean | null
          avatar_url?: string | null
          bio?: string | null
          company_logo?: string | null
          company_name?: string | null
          company_website?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          position?: string | null
          role?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      transports: {
        Row: {
          created_at: string
          description: string | null
          document: Json | null
          dropoff_location: string | null
          end_date: string | null
          id: string
          image: string | null
          name: string | null
          notes: string | null
          pickup_location: string | null
          provider: string | null
          reservation_number: string | null
          start_date: string | null
          start_time: string | null
          trip_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          document?: Json | null
          dropoff_location?: string | null
          end_date?: string | null
          id?: string
          image?: string | null
          name?: string | null
          notes?: string | null
          pickup_location?: string | null
          provider?: string | null
          reservation_number?: string | null
          start_date?: string | null
          start_time?: string | null
          trip_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          document?: Json | null
          dropoff_location?: string | null
          end_date?: string | null
          id?: string
          image?: string | null
          name?: string | null
          notes?: string | null
          pickup_location?: string | null
          provider?: string | null
          reservation_number?: string | null
          start_date?: string | null
          start_time?: string | null
          trip_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "transports_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      trips: {
        Row: {
          client_id: Json | null
          created_at: string
          id: string
          trip_description: string | null
          trip_destination: string | null
          trip_documents: Json | null
          trip_end_date: string | null
          trip_image_url: string | null
          trip_name: string
          trip_notes: string | null
          trip_organisation: string | null
          trip_start_date: string | null
          trip_status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          client_id?: Json | null
          created_at?: string
          id?: string
          trip_description?: string | null
          trip_destination?: string | null
          trip_documents?: Json | null
          trip_end_date?: string | null
          trip_image_url?: string | null
          trip_name: string
          trip_notes?: string | null
          trip_organisation?: string | null
          trip_start_date?: string | null
          trip_status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          client_id?: Json | null
          created_at?: string
          id?: string
          trip_description?: string | null
          trip_destination?: string | null
          trip_documents?: Json | null
          trip_end_date?: string | null
          trip_image_url?: string | null
          trip_name?: string
          trip_notes?: string | null
          trip_organisation?: string | null
          trip_start_date?: string | null
          trip_status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_emails: {
        Row: {
          created_at: string
          email: string
          id: string
          is_primary: boolean | null
          user_id: string
          verified_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          is_primary?: boolean | null
          user_id: string
          verified_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          is_primary?: boolean | null
          user_id?: string
          verified_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      insert_agent_invitation: {
        Args: { agent_email: string; inviter_id: string }
        Returns: {
          created_at: string | null
          email: string
          id: string
          invited_by: string
        }
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

export interface PlannerTrip {
  id: string;
  title: string;
  description?: string | null;
  column_id: string;
  trip_id?: string | null;
  user_id?: string;
  updated_at?: string;
  departureDate?: string | null;
  tags?: any[];
  links?: any[];
  texts?: any[];
  trips?: any;
  column?: { id: string; title: string };
  client?: { id: string; name: string };
}

export interface PlannerColumn {
  id: string;
  title: string;
  position: number;
  user_id: string;
  created_at: string;
  updated_at: string;
}
