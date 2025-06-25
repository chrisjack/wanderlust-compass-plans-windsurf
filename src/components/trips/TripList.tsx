import { Link } from "react-router-dom";
import { Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TripStatusBadge } from "./TripStatusBadge";
import { TripComponentBadges } from "./TripComponentBadges";
import { TripListProps, Trip } from "@/types/trips";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { format } from "date-fns";

export function TripList({ trips, onEdit, onDelete }: TripListProps) {
  const getClientNames = (clientData: any[] | null): string => {
    if (!clientData?.length) return "No travelers";
    try {
      // Ensure we're working with an array of clients
      const clientArray = Array.isArray(clientData) ? clientData : [];
      return clientArray.map(client => client.name).join(", ") || "No travelers";
    } catch {
      return "No travelers";
    }
  };

  const getTripInitials = (tripName: string): string => {
    return tripName
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="rounded-lg border bg-card">
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
          {trips.map((trip: Trip) => (
            <TableRow key={trip.id}>
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
              <TableCell>{Array.isArray(trip.clients) ? getClientNames(trip.clients) : 'No travelers'}</TableCell>
              <TableCell><TripStatusBadge status={trip.trip_status} /></TableCell>
              <TableCell>
                <TripComponentBadges
                  flights={trip.flights}
                  accommodation={trip.accommodation}
                  events={trip.events}
                  transports={trip.transports}
                  cruises={trip.cruises}
                />
              </TableCell>
              <TableCell className="text-right pr-6">
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
    </div>
  );
}
