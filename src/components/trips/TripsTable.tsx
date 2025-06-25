import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TripList } from "./TripList";
import { TripsTableProps, Trip } from "@/types/trips";

export function TripsTable({ 
  searchQuery = "", 
  filters = {}, 
  sort = "asc", 
  dateRange = {}, 
  onEdit, 
  onDelete 
}: TripsTableProps) {
  const { data: trips, isLoading } = useQuery({
    queryKey: ['trips', sort, searchQuery, JSON.stringify(filters), JSON.stringify(dateRange)],
    queryFn: async () => {
      console.log("Fetching trips data...");
      
      // First get the trips with their client counts
      const { data: tripsData, error: tripsError } = await supabase
        .from('trips')
        .select(`
          *,
          clients:client_id(count)
        `)
        .order('trip_start_date', { ascending: sort === "asc" });

      if (tripsError) {
        console.error("Error fetching trips:", tripsError);
        throw tripsError;
      }

      // Then get the counts for each component type
      const tripIds = tripsData?.map(trip => trip.id) || [];
      
      const [
        flightCounts,
        accommodationCounts,
        eventCounts,
        cruiseCounts,
        transportCounts
      ] = await Promise.all([
        supabase.from('flights').select('trip_id, count').in('trip_id', tripIds),
        supabase.from('accommodation').select('trip_id, count').in('trip_id', tripIds),
        supabase.from('events').select('trip_id, count').in('trip_id', tripIds),
        supabase.from('cruises').select('trip_id, count').in('trip_id', tripIds),
        supabase.from('transports').select('trip_id, count').in('trip_id', tripIds)
      ]);
      
      // Transform the data to match our Trip interface
      const transformedData = tripsData?.map((trip) => {
        const flights = flightCounts.data?.find(f => f.trip_id === trip.id)?.count || 0;
        const accommodation = accommodationCounts.data?.find(a => a.trip_id === trip.id)?.count || 0;
        const events = eventCounts.data?.find(e => e.trip_id === trip.id)?.count || 0;
        const cruises = cruiseCounts.data?.find(c => c.trip_id === trip.id)?.count || 0;
        const transports = transportCounts.data?.find(t => t.trip_id === trip.id)?.count || 0;

        return {
          ...trip,
          clients: Array.isArray(trip.clients) ? (trip.clients[0]?.count || 0) : 0,
          flights: { count: Number(flights) },
          accommodation: { count: Number(accommodation) },
          events: { count: Number(events) },
          cruises: { count: Number(cruises) },
          transports: { count: Number(transports) }
        };
      }) as Trip[];

      console.log("Transformed trips data for TripList:", transformedData);
      return transformedData;
    }
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="rounded-lg border bg-card p-8">
          <div className="text-center text-sm text-muted-foreground">
            Loading trips...
          </div>
        </div>
      </div>
    );
  }

  if (!trips?.length) {
    return (
      <div className="space-y-6">
        <div className="rounded-lg border bg-card p-8">
          <div className="text-center">
            <h3 className="text-lg font-medium">No trips found</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Get started by creating a new trip.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const filteredTrips = trips.filter(trip => {
    let matchesSearch = true;
    let matchesFilters = true;
    let matchesDateRange = true;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      matchesSearch = 
        (trip.trip_name?.toLowerCase().includes(query) || false) ||
        (trip.trip_destination?.toLowerCase().includes(query) || false) ||
        (trip.trip_organisation?.toLowerCase().includes(query) || false);
    }

    if (filters.status && filters.status !== "all") {
      matchesFilters = matchesFilters && trip.trip_status === filters.status;
    }
    
    if (dateRange.from) {
      const tripStart = new Date(trip.trip_start_date || '');
      matchesDateRange = matchesDateRange && (!dateRange.from || tripStart >= dateRange.from);
      
      if (dateRange.to) {
        matchesDateRange = matchesDateRange && tripStart <= dateRange.to;
      }
    }

    return matchesSearch && matchesFilters && matchesDateRange;
  });

  const inProgressTrips = filteredTrips.filter(trip => trip.trip_status === 'active');
  const otherTrips = filteredTrips.filter(trip => trip.trip_status !== 'active');

  return (
    <div className="space-y-6">
      {inProgressTrips.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">In Progress Trips</h2>
          <TripList trips={inProgressTrips} onEdit={onEdit} onDelete={onDelete} />
        </div>
      )}
      
      <div>
        <h2 className="text-xl font-semibold mb-4">All Trips</h2>
        <TripList trips={otherTrips} onEdit={onEdit} onDelete={onDelete} />
      </div>
    </div>
  );
}
