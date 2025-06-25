import { Link, useParams, Navigate, useNavigate } from "react-router-dom"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useAuth } from "@/lib/auth"
import { supabase } from "@/integrations/supabase/client"
import { ArrowLeft, MessageSquare } from "lucide-react"
import { format } from "date-fns"
import { DashboardNav } from "@/components/DashboardNav"
import { TopNav } from "@/components/TopNav"
import { TripHeader } from "@/components/TripHeader"
import { TripTimeline } from "@/components/TripTimeline"
import { DocumentsSection } from "@/components/documents/DocumentsSection"
import { ActivityType } from "@/types/activity"
import { useToast } from "@/hooks/use-toast"
import { TripComponentBadges } from "@/components/trips/TripComponentBadges"
import { Button } from "@/components/ui/button"

export default function TripDetails() {
  const { tripId } = useParams()
  const { user, loading } = useAuth()
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const navigate = useNavigate()

  const { data: trip } = useQuery({
    queryKey: ['trip', tripId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('trips')
        .select('*')
        .eq('id', tripId)
        .single()

      if (error) throw error
      return data
    },
    enabled: !!tripId
  })

  const { data: flights } = useQuery({
    queryKey: ['flights', tripId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('flights')
        .select('*')
        .eq('trip_id', tripId)

      if (error) throw error
      return data || []
    },
    enabled: !!tripId
  })

  const { data: accommodations } = useQuery({
    queryKey: ['accommodations', tripId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('accommodation')
        .select('*')
        .eq('trip_id', tripId)

      if (error) throw error
      return data || []
    },
    enabled: !!tripId
  })

  const { data: events } = useQuery({
    queryKey: ['events', tripId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('trip_id', tripId)

      if (error) throw error
      return data || []
    },
    enabled: !!tripId
  })

  const { data: transports } = useQuery({
    queryKey: ['transports', tripId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('transports')
        .select('*')
        .eq('trip_id', tripId)

      if (error) throw error
      return data || []
    },
    enabled: !!tripId
  })

  const { data: cruises } = useQuery({
    queryKey: ['cruises', tripId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cruises')
        .select('*')
        .eq('trip_id', tripId)

      if (error) throw error
      return data || []
    },
    enabled: !!tripId
  })

  const refreshActivities = () => {
    queryClient.invalidateQueries({ queryKey: ['flights', tripId] });
    queryClient.invalidateQueries({ queryKey: ['accommodations', tripId] });
    queryClient.invalidateQueries({ queryKey: ['events', tripId] });
    queryClient.invalidateQueries({ queryKey: ['transports', tripId] });
    queryClient.invalidateQueries({ queryKey: ['cruises', tripId] });
  };

  const allActivities = [
    ...(flights?.map(flight => ({
      id: flight.id,
      type: "flight" as ActivityType,
      title: `${flight.flight_airline} - ${flight.flight_number}`,
      subtitle: `${flight.flight_departure_city} to ${flight.flight_arrival_city}`,
      time: flight.flight_departure_time ? format(new Date(`2000-01-01T${flight.flight_departure_time}`), 'HH:mm') : undefined,
      date: new Date(flight.flight_departure_date),
      location: `${flight.flight_departure_airport_code} → ${flight.flight_arrival_airport_code}`,
      flight_airline: flight.flight_airline,
      flight_number: flight.flight_number,
      flight_departure_city: flight.flight_departure_city,
      flight_arrival_city: flight.flight_arrival_city,
      flight_departure_airport_code: flight.flight_departure_airport_code,
      flight_arrival_airport_code: flight.flight_arrival_airport_code,
      flight_departure_terminal: flight.flight_departure_terminal,
      flight_departure_gate: flight.flight_departure_gate,
      flight_departure_boarding_time: flight.flight_departure_boarding_time,
      ...flight
    })) || []),
    ...(accommodations?.map(acc => ({
      id: acc.id,
      type: "accommodation" as ActivityType,
      title: acc.accommodation_name || "Accommodation",
      time: acc.accommodation_checkin_time ? format(new Date(`2000-01-01T${acc.accommodation_checkin_time}`), 'HH:mm') : undefined,
      date: new Date(acc.accommodation_arrival_date),
      location: acc.accommodation_address,
      accommodation_name: acc.accommodation_name,
      accommodation_address: acc.accommodation_address,
      accommodation_nights_stay: acc.accommodation_nights_stay,
      accommodation_checkin_time: acc.accommodation_checkin_time,
      accommodation_checkout_time: acc.accommodation_checkout_time,
      ...acc
    })) || []),
    ...(events?.map(event => ({
      id: event.id,
      type: "event" as ActivityType,
      title: event.name || "Event",
      time: event.start_time ? format(new Date(`2000-01-01T${event.start_time}`), 'HH:mm') : undefined,
      date: new Date(event.start_date),
      location: event.location,
      description: event.description,
      start_time: event.start_time,
      ...event
    })) || []),
    ...(transports?.map(transport => ({
      id: transport.id,
      type: "transport" as ActivityType,
      title: transport.name || "Transport",
      subtitle: `${transport.pickup_location} to ${transport.dropoff_location}`,
      time: transport.start_time ? format(new Date(`2000-01-01T${transport.start_time}`), 'HH:mm') : undefined,
      date: new Date(transport.start_date),
      location: transport.pickup_location,
      description: transport.description,
      provider: transport.provider,
      pickup_location: transport.pickup_location,
      dropoff_location: transport.dropoff_location,
      start_time: transport.start_time,
      ...transport
    })) || []),
    ...(cruises?.map(cruise => ({
      id: cruise.id,
      type: "cruise" as ActivityType,
      title: cruise.cruise_name || "Cruise",
      subtitle: `${cruise.cruise_line} - ${cruise.cruise_ship_name}`,
      time: cruise.cruise_boarding_time ? format(new Date(`2000-01-01T${cruise.cruise_boarding_time}`), 'HH:mm') : undefined,
      date: new Date(cruise.cruise_start_date),
      location: cruise.cruise_departure_port,
      cruise_name: cruise.cruise_name,
      cruise_line: cruise.cruise_line,
      cruise_ship_name: cruise.cruise_ship_name,
      cruise_description: cruise.cruise_description,
      cruise_departure_port: cruise.cruise_departure_port,
      cruise_arrival_port: cruise.cruise_arrival_port,
      cruise_boarding_time: cruise.cruise_boarding_time,
      cruise_start_date: cruise.cruise_start_date,
      cruise_end_date: cruise.cruise_end_date,
      ...cruise
    })) || [])
  ].sort((a, b) => a.date.getTime() - b.date.getTime())

  const handleAddTripDocument = async (document: any) => {
    const existingDocs = Array.isArray(trip?.trip_documents) ? trip.trip_documents : [];
    const documentExists = existingDocs.some((doc: any) => doc.id === document.id);
    
    if (documentExists) {
      toast({
        title: "Document already added",
        description: "This document is already attached to the trip.",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase
      .from('trips')
      .update({
        trip_documents: [...existingDocs, document]
      })
      .eq('id', tripId);

    if (error) {
      toast({
        title: "Error",
        description: "Could not add document to trip",
        variant: "destructive",
      });
      return;
    }

    queryClient.invalidateQueries({ queryKey: ['trip', tripId] });
    toast({
      title: "Success",
      description: "Document added to trip",
    });
  };

  const handleChatClick = () => {
    navigate(`/messages?trip=${tripId}`);
  };

  // Calculate counts for each component type
  const flightsCount = flights?.length || 0;
  const accommodationsCount = accommodations?.length || 0;
  const eventsCount = events?.length || 0;
  const transportsCount = transports?.length || 0;
  const cruisesCount = cruises?.length || 0;

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-lg font-medium">Loading...</h2>
          <p className="text-gray-500">Please wait</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/auth" replace />
  }

  if (!trip) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-lg font-medium">Trip not found</h2>
          <p className="text-gray-500">The trip you're looking for doesn't exist</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav />
      <div className="lg:pl-64">
        <TopNav />
        <main>
          <div className="max-w-7xl mx-auto pt-6 px-6">
            <Link 
              to="/trips" 
              className="flex items-center text-muted-foreground hover:text-foreground group mb-4"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              <span className="group-hover:underline">Back to Trips</span>
            </Link>
          </div>
          <TripHeader 
            trip={trip} 
            flightsCount={flightsCount}
            accommodationsCount={accommodationsCount}
            eventsCount={eventsCount}
            transportsCount={transportsCount}
            cruisesCount={cruisesCount}
          />
          <div className="p-6">
            <div className="max-w-7xl mx-auto space-y-8">
              <TripTimeline 
                activities={allActivities} 
                tripId={tripId!}
                onActivityAdded={refreshActivities}
                onActivityUpdated={refreshActivities}
              />
              <DocumentsSection 
                documents={Array.isArray(trip?.trip_documents) ? trip.trip_documents : []}
                title="Trip Documents"
                onDocumentSelect={handleAddTripDocument}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
