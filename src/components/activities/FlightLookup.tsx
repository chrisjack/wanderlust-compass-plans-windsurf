import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface FlightLookupProps {
  onFlightSelect: (flight: any) => void;
}

interface FlightData {
  flightNumber: string;
  airline: string;
  departureAirport: string;
  arrivalAirport: string;
  departureTime: string;
  arrivalTime: string;
  departureTerminal?: string;
  arrivalTerminal?: string;
  departureGate?: string;
  arrivalGate?: string;
}

export function FlightLookup({ onFlightSelect }: FlightLookupProps) {
  const [flightNumber, setFlightNumber] = useState('');
  const [departureDate, setDepartureDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [flights, setFlights] = useState<FlightData[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const parseDate = (dateString: string | undefined): string => {
    if (!dateString) {
      return new Date().toISOString();
    }

    try {
      // Try to parse the date string
      const date = new Date(dateString);
      
      // Check if the date is valid
      if (isNaN(date.getTime())) {
        return new Date().toISOString();
      }
      
      return date.toISOString();
    } catch (error) {
      console.error('Error parsing date:', dateString, error);
      return new Date().toISOString();
    }
  };

  const handleLookup = async () => {
    if (!flightNumber) {
      toast.error('Please enter a flight number');
      return;
    }

    if (!departureDate) {
      toast.error('Please select a departure date');
      return;
    }

    const apiKey = import.meta.env.VITE_RAPIDAPI_KEY;
    if (!apiKey) {
      toast.error('API key is not configured. Please contact support.');
      return;
    }
    
    setIsLoading(true);
    try {
      // Format the date for the API (YYYY-MM-DD)
      const formattedDate = new Date(departureDate).toISOString().split('T')[0];
      
      const response = await fetch(
        `https://aerodatabox.p.rapidapi.com/flights/number/${flightNumber}/${formattedDate}`, 
        {
          headers: {
            'X-RapidAPI-Key': apiKey,
            'X-RapidAPI-Host': 'aerodatabox.p.rapidapi.com'
          }
        }
      );
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Invalid API key. Please check your RapidAPI configuration.');
        }
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data && Array.isArray(data)) {
        const formattedFlights = data.map(flight => {
          try {
            // Ensure we have valid data before creating the flight object
            if (!flight?.number || !flight?.airline?.name || !flight?.departure?.airport?.name || !flight?.arrival?.airport?.name) {
              return null;
            }

            return {
              flightNumber: flight.number,
              airline: flight.airline.name,
              departureAirport: flight.departure.airport.name,
              arrivalAirport: flight.arrival.airport.name,
              departureTime: parseDate(flight.departure?.scheduledTimeLocal),
              arrivalTime: parseDate(flight.arrival?.scheduledTimeLocal),
              departureTerminal: flight.departure?.terminal || '',
              arrivalTerminal: flight.arrival?.terminal || '',
              departureGate: flight.departure?.gate || '',
              arrivalGate: flight.arrival?.gate || ''
            };
          } catch (error) {
            console.error('Error formatting flight data:', error);
            return null;
          }
        }).filter(Boolean) as FlightData[];
        
        if (formattedFlights.length === 0) {
          toast.info('No flights found for this flight number and date');
          return;
        }
        
        setFlights(formattedFlights);
        setIsDialogOpen(true);
      } else {
        toast.error('No flight data available');
      }
    } catch (error: any) {
      console.error('Error fetching flight data:', error);
      toast.error(error.message || 'Failed to fetch flight data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFlightSelect = (flight: FlightData) => {
    try {
      // Format the flight data for the parent component
      const formattedFlight = {
        ...flight,
        // Ensure the times are in ISO format
        departureTime: parseDate(flight.departureTime),
        arrivalTime: parseDate(flight.arrivalTime)
      };
      onFlightSelect(formattedFlight);
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error selecting flight:', error);
      toast.error('Failed to select flight. Please try again.');
    }
  };

  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      if (isNaN(date.getTime())) {
        return 'Invalid time';
      }
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (error) {
      return 'Invalid time';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          placeholder="Enter flight number"
          value={flightNumber}
          onChange={(e) => setFlightNumber(e.target.value.toUpperCase())}
          className="flex-1"
        />
      </div>
      <div className="flex gap-2">
        <Input
          type="date"
          value={departureDate}
          onChange={(e) => setDepartureDate(e.target.value)}
          className="flex-1"
        />
        <Button 
          onClick={handleLookup}
          disabled={isLoading || !flightNumber || !departureDate}
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Lookup'}
        </Button>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Select Flight</DialogTitle>
            <DialogDescription>
              Choose a flight from the list below
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[300px]">
            <div className="space-y-4">
              {flights.map((flight, index) => (
                <div
                  key={index}
                  className="p-4 border rounded-lg cursor-pointer hover:bg-muted"
                  onClick={() => handleFlightSelect(flight)}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{flight.airline}</p>
                      <p className="text-sm text-muted-foreground">
                        {flight.departureAirport} → {flight.arrivalAirport}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{flight.flightNumber}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatTime(flight.departureTime)} - {formatTime(flight.arrivalTime)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
} 