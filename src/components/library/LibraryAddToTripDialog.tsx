
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface LibraryAddToTripDialogProps {
  document: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LibraryAddToTripDialog({ document, open, onOpenChange }: LibraryAddToTripDialogProps) {
  const [trips, setTrips] = useState<any[]>([]);
  const [selectedTrip, setSelectedTrip] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchTrips = async () => {
      const { data, error } = await supabase
        .from('trips')
        .select('id, trip_name')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setTrips(data);
      }
    };

    if (open) {
      fetchTrips();
    }
  }, [open]);

  const handleAddToTrip = async () => {
    if (!selectedTrip || !document) return;

    setLoading(true);
    try {
      const { data: trip, error: tripError } = await supabase
        .from('trips')
        .select('trip_documents')
        .eq('id', selectedTrip)
        .single();

      if (tripError) throw tripError;

      // Fixed: Properly handle trip_documents array, ensuring we have a valid array to spread
      const existingDocs = Array.isArray(trip.trip_documents) ? trip.trip_documents : [];
      const newDocs = [...existingDocs, document.library_document];

      const { error: updateError } = await supabase
        .from('trips')
        .update({ trip_documents: newDocs })
        .eq('id', selectedTrip);

      if (updateError) throw updateError;

      toast({
        title: "Success",
        description: "Document added to trip successfully",
      });

      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add document to trip. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add to Trip</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Select Trip</Label>
            <Select
              value={selectedTrip}
              onValueChange={setSelectedTrip}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a trip" />
              </SelectTrigger>
              <SelectContent>
                {trips.map((trip) => (
                  <SelectItem key={trip.id} value={trip.id}>
                    {trip.trip_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button 
            className="w-full"
            onClick={handleAddToTrip}
            disabled={!selectedTrip || loading}
          >
            {loading ? "Adding..." : "Add to Trip"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
