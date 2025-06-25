
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function RecentBookings() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: recentTrips, isLoading } = useQuery({
    queryKey: ['recent-trips', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      try {
        const { data, error } = await supabase
          .from('trips')
          .select('id, trip_name, client_id, trip_destination, trip_start_date, trip_end_date')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5);

        if (error) {
          console.error("Error fetching recent trips:", error);
          throw error;
        }
        
        console.log("Recent trips data:", data);
        return data || [];
      } catch (error) {
        console.error("Failed to fetch recent trips:", error);
        return [];
      }
    },
    enabled: !!user
  });

  const formatDateRange = (startDate: string, endDate?: string) => {
    if (!startDate) return 'No date';
    
    const start = new Date(startDate);
    const formattedStart = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    
    if (!endDate) return formattedStart;
    
    const end = new Date(endDate);
    const formattedEnd = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    
    return `${formattedStart} - ${formattedEnd}`;
  };

  return (
    <Card className="bg-white shadow-sm border border-gray-100">
      <CardHeader className="px-6 pt-6 pb-0">
        <CardTitle className="text-lg font-medium">Recent Bookings</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mt-4">
          <div className="grid grid-cols-4 text-sm font-medium text-gray-500 py-3 border-b">
            <div>Trip</div>
            <div>Traveler</div>
            <div>Destination</div>
            <div>Dates</div>
          </div>
          
          {isLoading ? (
            <div className="py-6 text-center text-sm text-gray-500">Loading recent bookings...</div>
          ) : recentTrips && recentTrips.length > 0 ? (
            <div>
              {recentTrips.map((trip) => (
                <div 
                  key={trip.id} 
                  className="grid grid-cols-4 text-sm border-b py-4 hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => navigate(`/trips/${trip.id}`)}
                >
                  <div className="font-medium">{trip.trip_name || 'Unnamed Trip'}</div>
                  <div className="text-gray-600">{typeof trip.client_id === 'string' ? trip.client_id : 'N/A'}</div>
                  <div className="text-gray-600">{trip.trip_destination || 'No destination'}</div>
                  <div className="text-gray-600">
                    {formatDateRange(trip.trip_start_date, trip.trip_end_date)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-6 text-center text-sm text-gray-500">No recent bookings found</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
