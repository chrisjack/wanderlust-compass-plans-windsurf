import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface FlightFormProps {
  flight: any;
  onSave: () => void;
  onCancel: () => void;
}

export function FlightForm({ flight, onSave, onCancel }: FlightFormProps) {
  const [formData, setFormData] = useState({
    flight_airline: flight.flight_airline || '',
    flight_number: flight.flight_number || '',
    flight_departure_city: flight.flight_departure_city || '',
    flight_departure_date: flight.flight_departure_date || '',
    flight_departure_time: flight.flight_departure_time || '',
    flight_departure_terminal: flight.flight_departure_terminal || '',
    flight_arrival_city: flight.flight_arrival_city || '',
    flight_arrival_date: flight.flight_arrival_date || '',
    flight_arrival_time: flight.flight_arrival_time || '',
    flight_arrival_terminal: flight.flight_arrival_terminal || '',
    flight_confirmation_number: flight.flight_confirmation_number || '',
    flight_notes: flight.flight_notes || ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('import_flights')
        .update(formData)
        .eq('id', flight.id);

      if (error) throw error;

      toast.success('Flight details updated successfully');
      onSave();
    } catch (error) {
      console.error('Error updating flight:', error);
      toast.error('Failed to update flight details');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="flight_airline">Airline</Label>
          <Input
            id="flight_airline"
            name="flight_airline"
            value={formData.flight_airline}
            onChange={handleChange}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="flight_number">Flight Number</Label>
          <Input
            id="flight_number"
            name="flight_number"
            value={formData.flight_number}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="font-medium">Departure</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="flight_departure_city">City</Label>
            <Input
              id="flight_departure_city"
              name="flight_departure_city"
              value={formData.flight_departure_city}
              onChange={handleChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="flight_departure_terminal">Terminal</Label>
            <Input
              id="flight_departure_terminal"
              name="flight_departure_terminal"
              value={formData.flight_departure_terminal}
              onChange={handleChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="flight_departure_date">Date</Label>
            <Input
              id="flight_departure_date"
              name="flight_departure_date"
              type="date"
              value={formData.flight_departure_date}
              onChange={handleChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="flight_departure_time">Time</Label>
            <Input
              id="flight_departure_time"
              name="flight_departure_time"
              type="time"
              value={formData.flight_departure_time}
              onChange={handleChange}
            />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="font-medium">Arrival</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="flight_arrival_city">City</Label>
            <Input
              id="flight_arrival_city"
              name="flight_arrival_city"
              value={formData.flight_arrival_city}
              onChange={handleChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="flight_arrival_terminal">Terminal</Label>
            <Input
              id="flight_arrival_terminal"
              name="flight_arrival_terminal"
              value={formData.flight_arrival_terminal}
              onChange={handleChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="flight_arrival_date">Date</Label>
            <Input
              id="flight_arrival_date"
              name="flight_arrival_date"
              type="date"
              value={formData.flight_arrival_date}
              onChange={handleChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="flight_arrival_time">Time</Label>
            <Input
              id="flight_arrival_time"
              name="flight_arrival_time"
              type="time"
              value={formData.flight_arrival_time}
              onChange={handleChange}
            />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="flight_confirmation_number">Confirmation Number</Label>
        <Input
          id="flight_confirmation_number"
          name="flight_confirmation_number"
          value={formData.flight_confirmation_number}
          onChange={handleChange}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="flight_notes">Notes</Label>
        <Input
          id="flight_notes"
          name="flight_notes"
          value={formData.flight_notes}
          onChange={handleChange}
        />
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Changes'
          )}
        </Button>
      </div>
    </form>
  );
} 