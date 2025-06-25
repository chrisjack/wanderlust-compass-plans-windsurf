import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface NewChatDialogProps {
  onChatCreated: () => void;
  initialTripId?: string | null;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

interface Trip {
  id: string;
  trip_name: string;
}

export function NewChatDialog({ 
  onChatCreated, 
  initialTripId,
  open: controlledOpen,
  onOpenChange: setControlledOpen 
}: NewChatDialogProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [selectedTrip, setSelectedTrip] = useState<string>(initialTripId || "");
  const [message, setMessage] = useState("");
  const { user } = useAuth();
  const { toast } = useToast();

  // Use controlled or uncontrolled open state
  const open = controlledOpen ?? uncontrolledOpen;
  const setOpen = setControlledOpen ?? setUncontrolledOpen;

  const fetchTrips = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('trips')
      .select('id, trip_name')
      .eq('user_id', user.id)
      .order('trip_start_date', { ascending: false });

    if (error) {
      console.error('Error fetching trips:', error);
      toast({
        title: "Error",
        description: "Failed to load trips",
        variant: "destructive",
      });
      return;
    }

    setTrips(data || []);
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen) {
      fetchTrips();
      if (initialTripId) {
        setSelectedTrip(initialTripId);
      }
    } else {
      setSelectedTrip("");
      setMessage("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedTrip || !message.trim()) return;

    setLoading(true);
    try {
      // First, get the trip details to find the client
      const { data: tripData, error: tripError } = await supabase
        .from('trips')
        .select('client_id')
        .eq('id', selectedTrip)
        .single();

      if (tripError) throw tripError;

      // Get the client ID from the trip
      const clientId = tripData?.client_id?.[0];
      if (!clientId) {
        throw new Error('No client found for this trip');
      }

      // Create the message
      const { error: messageError } = await supabase
        .from('messages')
        .insert([{
          sender_id: user.id,
          reciever_id: clientId,
          trip_id: selectedTrip,
          content: message.trim(),
          read: false
        }]);

      if (messageError) throw messageError;

      toast({
        title: "Success",
        description: "Message sent successfully",
      });

      setOpen(false);
      onChatCreated();
    } catch (error) {
      console.error('Error creating chat:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">New Chat</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Start a New Chat</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Trip</label>
            <Select
              value={selectedTrip}
              onValueChange={setSelectedTrip}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose a trip" />
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
          <div className="space-y-2">
            <label className="text-sm font-medium">Message</label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message here..."
              disabled={loading}
              required
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !selectedTrip || !message.trim()}>
              {loading ? "Sending..." : "Send Message"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 