import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Edit, Trash2, Plane, Hotel, CarFront, Calendar, Ship } from "lucide-react"
import { Button } from "./ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { Link, useNavigate } from "react-router-dom";
import { Badge } from "./ui/badge";
import { TripListProps, Trip } from "@/types/trips";
import { format } from "date-fns";

interface TripFilters {
  status?: string;
  traveler?: string;
  organization?: string;
}

interface DateRange {
  from?: Date;
  to?: Date;
}

interface TripsTableProps {
  searchQuery?: string;
  filters?: TripFilters;
  sort?: "asc" | "desc";
  dateRange?: DateRange;
  onEdit: (trip: any) => void;
  onDelete: (tripId: string) => void;
}

export function TripsTable({ searchQuery = "", filters = {}, sort = "asc", dateRange = {}, onEdit, onDelete }: TripsTableProps) {
  const navigate = useNavigate();
  const { data: trips, isLoading } = useQuery({
    queryKey: ['trips', sort, searchQuery, JSON.stringify(filters), JSON.stringify(dateRange)],
    queryFn: async () => {
      // Fetch all trips
      const { data: tripsData, error: tripsError } = await supabase
        .from('trips')
        .select(`*`)
        .order('trip_start_date', { ascending: sort === "asc" });
      if (tripsError) {
        console.error("Error fetching trips:", tripsError);
        throw tripsError;
      }

      // Fetch all clients (or only those referenced, for efficiency)
      const { data: clientsData, error: clientsError } = await supabase
        .from('clients')
        .select('id, name');
      if (clientsError) {
        console.error("Error fetching clients:", clientsError);
        throw clientsError;
      }
      const clientMap = new Map(clientsData.map(c => [c.id, c.name]));

      // Then get the counts for each component type
      const tripIds = tripsData?.map(trip => trip.id) || [];
      const [
        flightRows,
        accommodationRows,
        eventRows,
        cruiseRows,
        transportRows
      ] = await Promise.all([
        supabase.from('flights').select('trip_id').in('trip_id', tripIds),
        supabase.from('accommodation').select('trip_id').in('trip_id', tripIds),
        supabase.from('events').select('trip_id').in('trip_id', tripIds),
        supabase.from('cruises').select('trip_id').in('trip_id', tripIds),
        supabase.from('transports').select('trip_id').in('trip_id', tripIds)
      ]);

      // Helper to count rows by trip_id
      function countByTripId(rows: any[] | undefined, tripId: string) {
        if (!rows) return 0;
        return rows.filter(r => r.trip_id === tripId).length;
      }

      // Transform the data to match our Trip interface
      const transformedData = tripsData?.map((trip) => {
        const flights = countByTripId(flightRows.data, trip.id);
        const accommodation = countByTripId(accommodationRows.data, trip.id);
        const events = countByTripId(eventRows.data, trip.id);
        const cruises = countByTripId(cruiseRows.data, trip.id);
        const transports = countByTripId(transportRows.data, trip.id);

        // Map client_id array to client names
        let travelerNames: string[] = [];
        if (Array.isArray(trip.client_id)) {
          travelerNames = trip.client_id.map((id: string) => clientMap.get(id)).filter(Boolean);
        }

        return {
          ...trip,
          travelerNames,
          clients: Array.isArray(trip.client_id) ? trip.client_id.length : 0,
          flights: { count: Number(flights) },
          accommodation: { count: Number(accommodation) },
          events: { count: Number(events) },
          cruises: { count: Number(cruises) },
          transports: { count: Number(transports) }
        };
      }) as Trip[];
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

  const getTripInitials = (tripName: string): string => {
    return tripName
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const getClientNames = (clientData: any[] | null): string => {
    if (!clientData?.length) return "No travelers";
    try {
      const clientArray = Array.isArray(clientData) ? clientData : [];
      return clientArray.map(client => client.name).join(", ") || "No travelers";
    } catch {
      return "No travelers";
    }
  };

  const renderComponentBadges = (trip: Trip) => (
    <div className="flex gap-2">
      {trip.flights?.count > 0 && (
        <span className="flex items-center gap-1.5 px-2 py-1 rounded-full text-blue-500 bg-blue-50">
          <Plane className="w-3.5 h-3.5" />
          <span className="text-sm font-medium">{trip.flights.count}</span>
        </span>
      )}
      {trip.accommodation?.count > 0 && (
        <span className="flex items-center gap-1.5 px-2 py-1 rounded-full text-purple-500 bg-purple-50">
          <Hotel className="w-3.5 h-3.5" />
          <span className="text-sm font-medium">{trip.accommodation.count}</span>
        </span>
      )}
      {trip.events?.count > 0 && (
        <span className="flex items-center gap-1.5 px-2 py-1 rounded-full text-green-500 bg-green-50">
          <Calendar className="w-3.5 h-3.5" />
          <span className="text-sm font-medium">{trip.events.count}</span>
        </span>
      )}
      {trip.transports?.count > 0 && (
        <span className="flex items-center gap-1.5 px-2 py-1 rounded-full text-orange-500 bg-orange-50">
          <CarFront className="w-3.5 h-3.5" />
          <span className="text-sm font-medium">{trip.transports.count}</span>
        </span>
      )}
      {trip.cruises?.count > 0 && (
        <span className="flex items-center gap-1.5 px-2 py-1 rounded-full text-sky-500 bg-sky-50">
          <Ship className="w-3.5 h-3.5" />
          <span className="text-sm font-medium">{trip.cruises.count}</span>
        </span>
      )}
    </div>
  );

  const renderTable = (tripsToRender: Trip[]) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[250px]">Trip Name</TableHead>
          <TableHead>Destination</TableHead>
          <TableHead>Dates</TableHead>
          <TableHead>Travelers</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Components</TableHead>
          <TableHead className="text-right pr-6">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {tripsToRender.map((trip) => (
          <TableRow
            key={trip.id}
            className="cursor-pointer hover:bg-muted/40"
            onClick={() => navigate(`/trips/${trip.id}`)}
          >
            <TableCell className="font-medium p-0">
              <div className="flex items-center gap-3 p-2">
                <Avatar className="h-10 w-10">
                  {trip.trip_image_url ? (
                    <AvatarImage src={trip.trip_image_url} alt={trip.trip_name} className="object-cover" />
                  ) : null}
                  <AvatarFallback className="bg-muted">
                    {getTripInitials(trip.trip_name)}
                  </AvatarFallback>
                </Avatar>
                <span>{trip.trip_name}</span>
              </div>
            </TableCell>
            <TableCell>{trip.trip_destination}</TableCell>
            <TableCell>
              {trip.trip_start_date && format(new Date(trip.trip_start_date), "dd/MM/yyyy")} to {trip.trip_end_date && format(new Date(trip.trip_end_date), "dd/MM/yyyy")}
            </TableCell>
            <TableCell>{trip.travelerNames?.length ? trip.travelerNames.join(", ") : 'No travelers'}</TableCell>
            <TableCell>{trip.trip_status}</TableCell>
            <TableCell>{renderComponentBadges(trip)}</TableCell>
            <TableCell className="text-right pr-6" onClick={e => e.stopPropagation()}>
              <div className="flex justify-end gap-2">
                <Button variant="ghost" size="icon" onClick={() => onEdit(trip)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => onDelete(trip.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  return (
    <div className="space-y-6">
      {inProgressTrips.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">In Progress Trips</h2>
          <div className="rounded-lg border bg-white">
            {renderTable(inProgressTrips)}
          </div>
        </div>
      )}
      <div>
        <h2 className="text-xl font-semibold mb-4">All Trips</h2>
        <div className="rounded-lg border bg-white">
          {renderTable(otherTrips)}
        </div>
      </div>
    </div>
  );
}
