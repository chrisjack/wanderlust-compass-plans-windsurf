import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";

interface Trip {
  id: string;
  trip_name: string;
  trip_start_date: string;
  trip_end_date: string;
}

interface AddToTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedFlights: any[];
}

export function AddToTripModal({ isOpen, onClose, selectedFlights }: AddToTripModalProps) {
  const { user } = useAuth();
  const [selectedTrip, setSelectedTrip] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch user's trips
  const { data: trips, isLoading } = useQuery({
    queryKey: ['trips', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      console.log('Fetching trips for user:', user.id);
      const { data, error } = await supabase
        .from('trips')
        .select('id, trip_name, trip_start_date, trip_end_date')
        .eq('user_id', user.id)
        .order('trip_start_date', { ascending: true });

      if (error) {
        console.error('Error fetching trips:', error);
        throw error;
      }

      console.log('Fetched trips:', data);
      return data as Trip[];
    },
    enabled: !!user?.id
  });

  const handleAddToTrip = async () => {
    if (!selectedTrip) {
      toast.error("Please select a trip");
      return;
    }

    setIsSubmitting(true);
    try {
      // Transform flight data for trip_flights table
      const flightData = selectedFlights.map(flight => ({
        trip_id: selectedTrip,
        flight_id: flight.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));

      const { error } = await supabase
        .from('trip_flights')
        .insert(flightData);

      if (error) throw error;

      toast.success(`Successfully added ${selectedFlights.length} flight(s) to trip`);
      onClose();
    } catch (error) {
      console.error('Error adding flights to trip:', error);
      toast.error("Failed to add flights to trip");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add to Trip</DialogTitle>
          <DialogDescription>
            Select a trip to add {selectedFlights.length} flight{selectedFlights.length !== 1 ? 's' : ''} to
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : !trips || trips.length === 0 ? (
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                No trips found. Create a trip first.
              </p>
              <Button 
                variant="outline" 
                onClick={() => {
                  onClose();
                  // Navigate to trips page
                  window.location.href = '/trips';
                }}
              >
                Create Trip
              </Button>
            </div>
          ) : (
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {trips.map((trip) => (
                <div
                  key={trip.id}
                  className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedTrip === trip.id
                      ? 'border-primary bg-primary/5'
                      : 'hover:bg-muted/50'
                  }`}
                  onClick={() => setSelectedTrip(trip.id)}
                >
                  <div>
                    <h4 className="font-medium">{trip.trip_name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {new Date(trip.trip_start_date).toLocaleDateString()} - {new Date(trip.trip_end_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleAddToTrip}
            disabled={!selectedTrip || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding...
              </>
            ) : (
              'Add to Trip'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 