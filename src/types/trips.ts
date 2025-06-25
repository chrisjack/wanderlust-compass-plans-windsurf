import { Json } from "@/integrations/supabase/types";

export interface Trip {
  id: string;
  trip_name: string;
  trip_destination?: string;
  trip_start_date: string;
  trip_end_date: string;
  trip_status: string;
  trip_organisation?: string;
  trip_image_url?: string;
  clients: number;
  flights: { count: number };
  accommodation: { count: number };
  events: { count: number };
  cruises: { count: number };
  transports: { count: number };
  created_at: string;
  updated_at: string;
  travelerNames?: string[];
}

export interface TripListProps {
  trips: Trip[];
  onEdit: (trip: Trip) => void;
  onDelete: (tripId: string) => void;
}

export interface TripStatusBadgeProps {
  status: string;
}

export interface TripComponentBadgesProps {
  flights?: any;
  accommodation?: any;
  events?: any;
  cruises?: any;
  transports?: any;
}

export interface TripFilters {
  status?: string;
  traveler?: string;
  organization?: string;
}

export interface DateRange {
  from?: Date;
  to?: Date;
}

export interface TripsTableProps {
  searchQuery?: string;
  filters?: TripFilters;
  sort?: "asc" | "desc";
  dateRange?: DateRange;
  onEdit: (trip: Trip) => void;
  onDelete: (tripId: string) => void;
}
