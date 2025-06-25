import { useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ClientAvatar } from "./ClientAvatar";
import { useNavigate } from "react-router-dom";

interface TopClientsSectionProps {
  clients: any[];
  trips: any[];
}

export function TopClientsSection({ clients, trips }: TopClientsSectionProps) {
  const navigate = useNavigate();
  
  const topClients = useMemo(() => {
    // Create a map of client IDs to trip counts
    const clientTrips = new Map<string, number>();
    
    // Count trips for each client
    trips.forEach(trip => {
      if (trip.client_id) {
        const clientIds = typeof trip.client_id === 'string' 
          ? [trip.client_id] 
          : Array.isArray(trip.client_id) 
            ? trip.client_id 
            : Object.keys(trip.client_id || {});
        
        clientIds.forEach(clientId => {
          clientTrips.set(clientId, (clientTrips.get(clientId) || 0) + 1);
        });
      }
    });
    
    // Convert to array and sort by trip count
    return clients
      .map(client => ({
        ...client,
        tripCount: clientTrips.get(client.id) || 0
      }))
      .sort((a, b) => b.tripCount - a.tripCount)
      .slice(0, 5);
  }, [clients, trips]);

  return (
    <Card className="border shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-medium">Top Clients</CardTitle>
        <p className="text-sm text-gray-500">Clients with the most trips</p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 md:gap-4">
          {topClients.map((client) => (
            <div 
              key={client.id} 
              className="flex flex-col items-center text-center border rounded-lg p-2 md:p-4 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => navigate(`/clients/${client.id}`)}
            >
              <ClientAvatar name={client.name} size="sm" />
              <h3 className="mt-2 text-sm md:text-base font-medium">{client.name}</h3>
              <p className="text-xs md:text-sm text-gray-500 truncate w-full">{client.email}</p>
              <div className="mt-2 flex items-center justify-between w-full text-xs">
                <span className="text-gray-500">
                  {client.tripCount} {client.tripCount === 1 ? 'Trip' : 'Trips'}
                </span>
                <span className="bg-green-100 text-green-700 rounded-full px-1.5 py-0.5">
                  Active
                </span>
              </div>
            </div>
          ))}
          
          {topClients.length === 0 && (
            <div className="col-span-full text-center py-4 md:py-8">
              <p className="text-sm text-gray-500">No clients with trips yet</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
