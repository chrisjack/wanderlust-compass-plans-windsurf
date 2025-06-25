import React, { useState } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"
import { supabase } from "@/integrations/supabase/client"
import { ActivityType, Activity } from "@/types/activity"
import { ScrollArea } from "@/components/ui/scroll-area"
import { FlightLookup } from "@/components/activities/FlightLookup"

interface ActivitySideDrawerProps {
  isOpen: boolean
  onClose: () => void
  onSave: () => void
  activityType: ActivityType
  tripId: string
  activity: Activity | null
  mode: 'add' | 'edit'
}

type FormData = {
  title: string;
  date: string;
  time: string;
  location: string;
  // Flight fields
  flight_airline?: string;
  flight_number?: string;
  flight_departure_city?: string;
  flight_arrival_city?: string;
  flight_departure_airport_code?: string;
  flight_arrival_airport_code?: string;
  flight_departure_terminal?: string;
  flight_arrival_terminal?: string;
  flight_departure_gate?: string;
  flight_arrival_gate?: string;
  flight_departure_boarding_time?: string;
  flight_time?: string;
  flight_confirmation_number?: string;
  flight_notes?: string;
  flight_documents?: any;
  // Accommodation fields
  accommodation_name?: string;
  accommodation_description?: string;
  accommodation_address?: string;
  accommodation_city?: string;
  accommodation_country?: string;
  accommodation_phone?: string;
  accommodation_email?: string;
  accommodation_website?: string;
  accommodation_confirmation_number?: string;
  accommodation_number_of_rooms?: number;
  accommodation_nights_stay?: number;
  accommodation_notes?: string;
  accommodation_checkout_time?: string;
  accommodation_checkin_time?: string;
  accommodation_arrival_date?: string;
  accommodation_departure_date?: string;
  accommodation_feature_image?: string;
  accommodation_gallery_images?: any;
  accommodation_documents?: any;
  // Event fields
  event_name?: string;
  event_description?: string;
  event_address?: string;
  event_city?: string;
  event_country?: string;
  event_confirmation_number?: string;
  event_start_date?: string;
  event_start_time?: string;
  event_end_date?: string;
  event_end_time?: string;
  event_feature_image?: string;
  event_images?: any;
  event_documents?: any;
  // Transport fields
  transport_name?: string;
  transport_description?: string;
  transport_provider?: string;
  transport_pickup_location?: string;
  transport_dropoff_location?: string;
  transport_reservation_number?: string;
  transport_notes?: string;
  transport_image?: string;
  transport_document?: any;
  transport_start_date?: string;
  transport_end_date?: string;
  transport_start_time?: string;
  // Cruise fields
  cruise_name?: string;
  cruise_description?: string;
  cruise_line?: string;
  cruise_ship_name?: string;
  cruise_departure_port?: string;
  cruise_arrival_port?: string;
  cruise_booking_number?: string;
  cruise_notes?: string;
  cruise_feature_image?: string;
  cruise_images?: any;
  cruise_documents?: any;
  cruise_start_date?: string;
  cruise_end_date?: string;
  cruise_boarding_time?: string;
}

const baseSchema = z.object({
  title: z.string().min(1, "Title is required"),
  date: z.string().min(1, "Date is required"),
  time: z.string().optional(),
  location: z.string().optional(),
})

const flightSchema = baseSchema.extend({
  flight_airline: z.string().min(1, "Airline is required"),
  flight_number: z.string().min(1, "Flight number is required"),
  flight_departure_city: z.string().min(1, "Departure city is required"),
  flight_arrival_city: z.string().min(1, "Arrival city is required"),
  flight_departure_airport_code: z.string().optional(),
  flight_arrival_airport_code: z.string().optional(),
  flight_departure_terminal: z.string().optional(),
  flight_arrival_terminal: z.string().optional(),
  flight_departure_gate: z.string().optional(),
  flight_arrival_gate: z.string().optional(),
  flight_departure_boarding_time: z.string().optional(),
  flight_time: z.string().optional(),
  flight_confirmation_number: z.string().optional(),
  flight_notes: z.string().optional(),
  flight_documents: z.any().optional(),
  date: z.string().min(1, "Date is required"),
  time: z.string().optional(),
  location: z.string().optional()
})

const accommodationSchema = baseSchema.extend({
  accommodation_name: z.string().min(1, "Name is required"),
  accommodation_description: z.string().optional(),
  accommodation_address: z.string().optional(),
  accommodation_confirmation_number: z.string().optional(),
  accommodation_notes: z.string().optional(),
  accommodation_phone: z.string().optional(),
  accommodation_email: z.string().optional(),
  accommodation_website: z.string().optional(),
  accommodation_city: z.string().optional(),
  accommodation_country: z.string().optional(),
  accommodation_feature_image: z.string().optional(),
  accommodation_gallery_images: z.any().optional(),
  accommodation_documents: z.any().optional(),
  accommodation_arrival_date: z.string().optional(),
  accommodation_departure_date: z.string().optional(),
  accommodation_nights_stay: z.number().optional(),
  accommodation_checkin_time: z.string().optional(),
  accommodation_checkout_time: z.string().optional(),
  accommodation_number_of_rooms: z.number().optional()
})

const eventSchema = baseSchema.extend({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  location: z.string().optional(),
  confirmation_number: z.string().optional(),
  start_date: z.string().optional(),
  start_time: z.string().optional(),
  end_date: z.string().optional(),
  end_time: z.string().optional(),
  feature_image: z.string().optional(),
  images: z.any().optional(),
  documents: z.any().optional()
})

const transportSchema = baseSchema.extend({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  provider: z.string().optional(),
  pickup_location: z.string().optional(),
  dropoff_location: z.string().optional(),
  reservation_number: z.string().optional(),
  notes: z.string().optional(),
  image: z.string().optional(),
  document: z.any().optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  start_time: z.string().optional()
})

const cruiseSchema = baseSchema.extend({
  cruise_name: z.string().min(1, "Name is required"),
  cruise_description: z.string().optional(),
  cruise_line: z.string().optional(),
  cruise_ship_name: z.string().optional(),
  cruise_departure_port: z.string().optional(),
  cruise_arrival_port: z.string().optional(),
  cruise_booking_number: z.string().optional(),
  cruise_notes: z.string().optional(),
  cruise_feature_image: z.string().optional(),
  cruise_images: z.any().optional(),
  cruise_documents: z.any().optional(),
  cruise_start_date: z.string().optional(),
  cruise_end_date: z.string().optional(),
  cruise_boarding_time: z.string().optional()
})

export function ActivitySideDrawer({
  isOpen,
  onClose,
  onSave,
  activityType,
  tripId,
  activity,
  mode
}: ActivitySideDrawerProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const getSchemaForActivityType = () => {
    switch (activityType) {
      case "flight":
        return flightSchema;
      case "accommodation":
        return accommodationSchema;
      case "event":
        return eventSchema;
      case "transport":
        return transportSchema;
      case "cruise":
        return cruiseSchema;
      default:
        return baseSchema;
    }
  }

  const form = useForm<FormData>({
    resolver: zodResolver(getSchemaForActivityType()),
    defaultValues: activity ? {
      ...activity,
      date: activity.date instanceof Date 
        ? activity.date.toISOString().split('T')[0] 
        : typeof activity.date === 'string' ? activity.date : '',
      time: activity.time || '',
      location: activity.location || '',
      // Flight fields
      flight_airline: activity.flight_airline || '',
      flight_number: activity.flight_number || '',
      flight_departure_city: activity.flight_departure_city || '',
      flight_arrival_city: activity.flight_arrival_city || '',
      flight_departure_airport_code: activity.flight_departure_airport_code || '',
      flight_arrival_airport_code: activity.flight_arrival_airport_code || '',
      flight_departure_terminal: activity.flight_departure_terminal || '',
      flight_arrival_terminal: activity.flight_arrival_terminal || '',
      flight_departure_gate: activity.flight_departure_gate || '',
      flight_arrival_gate: activity.flight_arrival_gate || '',
      flight_departure_boarding_time: activity.flight_departure_boarding_time || '',
      flight_time: activity.flight_time || '',
      flight_confirmation_number: activity.flight_confirmation_number || '',
      flight_notes: activity.flight_notes || '',
      flight_documents: activity.flight_documents || null,
    } : {
      title: "",
      date: new Date().toISOString().split('T')[0],
      time: "",
      location: "",
      // Flight fields
      flight_airline: "",
      flight_number: "",
      flight_departure_city: "",
      flight_arrival_city: "",
      flight_departure_airport_code: "",
      flight_arrival_airport_code: "",
      flight_departure_terminal: "",
      flight_arrival_terminal: "",
      flight_departure_gate: "",
      flight_arrival_gate: "",
      flight_departure_boarding_time: "",
      flight_time: "",
      flight_confirmation_number: "",
      flight_notes: "",
      flight_documents: null,
    },
  })

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true)
    
    try {
      const formattedData = formatDataForDatabase(data)
      
      const tableName = getTableNameForActivityType(activityType)
      
      if (mode === 'add') {
        formattedData.trip_id = tripId
        
        const { error } = await supabase
          .from(tableName)
          .insert(formattedData)
        
        if (error) throw error
        
        toast.success(`${capitalizeFirstLetter(activityType)} added successfully!`)
      } else if (mode === 'edit' && activity) {
        const { error } = await supabase
          .from(tableName)
          .update(formattedData)
          .eq('id', activity.id)
        
        if (error) throw error
        
        toast.success(`${capitalizeFirstLetter(activityType)} updated successfully!`)
      }
      
      onSave()
    } catch (error: any) {
      toast.error(`Error: ${error.message || "Failed to save activity"}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  function capitalizeFirstLetter(string: string) {
    return string.charAt(0).toUpperCase() + string.slice(1)
  }

  function getTableNameForActivityType(type: ActivityType): "flights" | "accommodation" | "events" | "transports" | "cruises" {
    switch (type) {
      case "flight":
        return "flights";
      case "accommodation":
        return "accommodation";
      case "event":
        return "events";
      case "transport":
        return "transports";
      case "cruise":
        return "cruises";
    }
  }

  function formatDataForDatabase(data: any): any {
    const { title, date, time, ...rest } = data
    
    switch (activityType) {
      case "flight":
        return {
          flight_departure_date: date,
          flight_departure_time: time || null,
          flight_airline: data.flight_airline,
          flight_number: data.flight_number,
          flight_departure_city: data.flight_departure_city,
          flight_arrival_city: data.flight_arrival_city,
          flight_departure_airport_code: data.flight_departure_airport_code || null,
          flight_arrival_airport_code: data.flight_arrival_airport_code || null,
          flight_departure_terminal: data.flight_departure_terminal || null,
          flight_arrival_terminal: data.flight_arrival_terminal || null,
          flight_departure_gate: data.flight_departure_gate || null,
          flight_arrival_gate: data.flight_arrival_gate || null,
          flight_departure_boarding_time: data.flight_departure_boarding_time || null,
          flight_time: data.flight_time || null,
          flight_confirmation_number: data.flight_confirmation_number || null,
          flight_notes: data.flight_notes || null,
          flight_documents: data.flight_documents || null,
          ...rest
        };
      case "accommodation":
        return {
          accommodation_name: data.accommodation_name,
          accommodation_description: data.accommodation_description || null,
          accommodation_address: data.location || null,
          accommodation_arrival_date: date,
          accommodation_checkin_time: time || null,
          accommodation_checkout_time: data.accommodation_checkout_time || null,
          accommodation_number_of_rooms: data.accommodation_number_of_rooms || null,
          accommodation_documents: data.accommodation_documents || null,
          ...rest
        };
      case "event":
        return {
          name: data.name,
          description: data.description || null,
          address: data.address || null,
          city: data.city || null,
          country: data.country || null,
          location: data.location || null,
          start_date: date,
          start_time: time || null,
          end_date: data.end_date || null,
          end_time: data.end_time || null,
          feature_image: data.feature_image || null,
          images: data.images || null,
          documents: data.documents || null,
          ...rest
        };
      case "transport":
        return {
          name: data.name,
          description: data.description || null,
          provider: data.provider || null,
          pickup_location: data.pickup_location || null,
          dropoff_location: data.dropoff_location || null,
          start_date: date,
          start_time: time || null,
          reservation_number: data.reservation_number || null,
          notes: data.notes || null,
          image: data.image || null,
          document: data.document || null,
          ...rest
        };
      case "cruise":
        return {
          cruise_name: data.cruise_name,
          cruise_description: data.cruise_description || null,
          cruise_line: data.cruise_line || null,
          cruise_ship_name: data.cruise_ship_name || null,
          cruise_departure_port: data.cruise_departure_port || null,
          cruise_arrival_port: data.cruise_arrival_port || null,
          cruise_booking_number: data.cruise_booking_number || null,
          cruise_notes: data.cruise_notes || null,
          cruise_feature_image: data.cruise_feature_image || null,
          cruise_images: data.cruise_images || null,
          cruise_documents: data.cruise_documents || null,
          cruise_start_date: date,
          cruise_boarding_time: data.cruise_boarding_time || null,
          ...rest
        };
      default:
        return data;
    }
  }

  const handleFlightSelect = (flight: any) => {
    form.setValue('flight_number', flight.flightNumber);
    form.setValue('flight_airline', flight.airline);
    form.setValue('flight_departure_city', flight.departureAirport);
    form.setValue('flight_arrival_city', flight.arrivalAirport);
    form.setValue('flight_departure_terminal', flight.departureTerminal || '');
    form.setValue('flight_arrival_terminal', flight.arrivalTerminal || '');
    form.setValue('flight_departure_gate', flight.departureGate || '');
    form.setValue('flight_arrival_gate', flight.arrivalGate || '');
    
    // Parse the ISO string dates
    const departureDate = new Date(flight.departureTime);
    const arrivalDate = new Date(flight.arrivalTime);
    
    // Set the date and time fields
    form.setValue('date', departureDate.toISOString().split('T')[0]);
    form.setValue('time', departureDate.toTimeString().slice(0, 5));
    
    // Set the location to the departure airport
    form.setValue('location', flight.departureAirport);
  };

  const renderFormFields = () => {
    const commonFields = (
      <>
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem className="mb-4">
              <FormLabel>Date</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="time"
          render={({ field }) => (
            <FormItem className="mb-4">
              <FormLabel>Time</FormLabel>
              <FormControl>
                <Input type="time" {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem className="mb-4">
              <FormLabel>Location</FormLabel>
              <FormControl>
                <Input placeholder="Location" {...field} />
              </FormControl>
            </FormItem>
          )}
        />
      </>
    );

    switch (activityType) {
      case "flight":
        return (
          <>
            <FormField
              control={form.control}
              name="flight_number"
              render={({ field }) => (
                <FormItem className="mb-4">
                  <FormLabel>Flight Number</FormLabel>
                  <FormControl>
                    <FlightLookup onFlightSelect={handleFlightSelect} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="flight_airline"
              render={({ field }) => (
                <FormItem className="mb-4">
                  <FormLabel>Airline</FormLabel>
                  <FormControl>
                    <Input placeholder="Airline name" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="flight_departure_city"
                render={({ field }) => (
                  <FormItem className="mb-4">
                    <FormLabel>Departure City</FormLabel>
                    <FormControl>
                      <Input placeholder="Departure city" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="flight_arrival_city"
                render={({ field }) => (
                  <FormItem className="mb-4">
                    <FormLabel>Arrival City</FormLabel>
                    <FormControl>
                      <Input placeholder="Arrival city" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="flight_departure_airport_code"
                render={({ field }) => (
                  <FormItem className="mb-4">
                    <FormLabel>Departure Airport Code</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., LAX" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="flight_arrival_airport_code"
                render={({ field }) => (
                  <FormItem className="mb-4">
                    <FormLabel>Arrival Airport Code</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., JFK" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="flight_departure_terminal"
                render={({ field }) => (
                  <FormItem className="mb-4">
                    <FormLabel>Departure Terminal</FormLabel>
                    <FormControl>
                      <Input placeholder="Terminal number/letter" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="flight_arrival_terminal"
                render={({ field }) => (
                  <FormItem className="mb-4">
                    <FormLabel>Arrival Terminal</FormLabel>
                    <FormControl>
                      <Input placeholder="Terminal number/letter" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="flight_departure_gate"
                render={({ field }) => (
                  <FormItem className="mb-4">
                    <FormLabel>Departure Gate</FormLabel>
                    <FormControl>
                      <Input placeholder="Gate number" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="flight_arrival_gate"
                render={({ field }) => (
                  <FormItem className="mb-4">
                    <FormLabel>Arrival Gate</FormLabel>
                    <FormControl>
                      <Input placeholder="Gate number" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="flight_departure_boarding_time"
              render={({ field }) => (
                <FormItem className="mb-4">
                  <FormLabel>Boarding Time</FormLabel>
                  <FormControl>
                    <Input type="time" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="flight_confirmation_number"
              render={({ field }) => (
                <FormItem className="mb-4">
                  <FormLabel>Confirmation Number</FormLabel>
                  <FormControl>
                    <Input placeholder="Booking reference" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="flight_notes"
              render={({ field }) => (
                <FormItem className="mb-4">
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Additional notes" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            {commonFields}
          </>
        );
      case "accommodation":
        return (
          <>
            <FormField
              control={form.control}
              name="accommodation_name"
              render={({ field }) => (
                <FormItem className="mb-4">
                  <FormLabel>Accommodation Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Hotel/Airbnb name" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="accommodation_description"
              render={({ field }) => (
                <FormItem className="mb-4">
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Description" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="accommodation_address"
              render={({ field }) => (
                <FormItem className="mb-4">
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Input placeholder="Full address" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="accommodation_city"
              render={({ field }) => (
                <FormItem className="mb-4">
                  <FormLabel>City</FormLabel>
                  <FormControl>
                    <Input placeholder="City" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="accommodation_country"
              render={({ field }) => (
                <FormItem className="mb-4">
                  <FormLabel>Country</FormLabel>
                  <FormControl>
                    <Input placeholder="Country" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="accommodation_phone"
              render={({ field }) => (
                <FormItem className="mb-4">
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input placeholder="Phone number" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="accommodation_email"
              render={({ field }) => (
                <FormItem className="mb-4">
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="Contact email" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="accommodation_website"
              render={({ field }) => (
                <FormItem className="mb-4">
                  <FormLabel>Website</FormLabel>
                  <FormControl>
                    <Input placeholder="Website URL" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="accommodation_confirmation_number"
              render={({ field }) => (
                <FormItem className="mb-4">
                  <FormLabel>Confirmation Number</FormLabel>
                  <FormControl>
                    <Input placeholder="Booking reference" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="accommodation_number_of_rooms"
              render={({ field }) => (
                <FormItem className="mb-4">
                  <FormLabel>Number of Rooms</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="accommodation_nights_stay"
              render={({ field }) => (
                <FormItem className="mb-4">
                  <FormLabel>Nights of Stay</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="accommodation_notes"
              render={({ field }) => (
                <FormItem className="mb-4">
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Additional notes" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            {commonFields}
            <FormField
              control={form.control}
              name="accommodation_checkout_time"
              render={({ field }) => (
                <FormItem className="mb-4">
                  <FormLabel>Checkout Time</FormLabel>
                  <FormControl>
                    <Input type="time" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
          </>
        );
      case "event":
        return (
          <>
            <FormField
              control={form.control}
              name="event_name"
              render={({ field }) => (
                <FormItem className="mb-4">
                  <FormLabel>Event Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Event name" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="event_description"
              render={({ field }) => (
                <FormItem className="mb-4">
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Event description" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            {commonFields}
            <FormField
              control={form.control}
              name="event_end_date"
              render={({ field }) => (
                <FormItem className="mb-4">
                  <FormLabel>End Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="event_end_time"
              render={({ field }) => (
                <FormItem className="mb-4">
                  <FormLabel>End Time</FormLabel>
                  <FormControl>
                    <Input type="time" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
          </>
        );
      case "transport":
        return (
          <>
            <FormField
              control={form.control}
              name="transport_name"
              render={({ field }) => (
                <FormItem className="mb-4">
                  <FormLabel>Transport Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Airport Taxi" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="transport_description"
              render={({ field }) => (
                <FormItem className="mb-4">
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Description" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="transport_provider"
              render={({ field }) => (
                <FormItem className="mb-4">
                  <FormLabel>Provider</FormLabel>
                  <FormControl>
                    <Input placeholder="Transport company" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="transport_pickup_location"
              render={({ field }) => (
                <FormItem className="mb-4">
                  <FormLabel>Pickup Location</FormLabel>
                  <FormControl>
                    <Input placeholder="Pickup address" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="transport_dropoff_location"
              render={({ field }) => (
                <FormItem className="mb-4">
                  <FormLabel>Dropoff Location</FormLabel>
                  <FormControl>
                    <Input placeholder="Dropoff address" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="transport_reservation_number"
              render={({ field }) => (
                <FormItem className="mb-4">
                  <FormLabel>Reservation Number</FormLabel>
                  <FormControl>
                    <Input placeholder="Booking reference" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="transport_notes"
              render={({ field }) => (
                <FormItem className="mb-4">
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Additional notes" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            {commonFields}
          </>
        );
      case "cruise":
        return (
          <>
            <FormField
              control={form.control}
              name="cruise_name"
              render={({ field }) => (
                <FormItem className="mb-4">
                  <FormLabel>Cruise Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Cruise name" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="cruise_description"
              render={({ field }) => (
                <FormItem className="mb-4">
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Cruise description" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="cruise_line"
              render={({ field }) => (
                <FormItem className="mb-4">
                  <FormLabel>Cruise Line</FormLabel>
                  <FormControl>
                    <Input placeholder="Cruise company" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="cruise_ship_name"
              render={({ field }) => (
                <FormItem className="mb-4">
                  <FormLabel>Ship Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Ship name" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="cruise_departure_port"
              render={({ field }) => (
                <FormItem className="mb-4">
                  <FormLabel>Departure Port</FormLabel>
                  <FormControl>
                    <Input placeholder="Port of departure" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="cruise_arrival_port"
              render={({ field }) => (
                <FormItem className="mb-4">
                  <FormLabel>Arrival Port</FormLabel>
                  <FormControl>
                    <Input placeholder="Port of arrival" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="cruise_booking_number"
              render={({ field }) => (
                <FormItem className="mb-4">
                  <FormLabel>Booking Number</FormLabel>
                  <FormControl>
                    <Input placeholder="Booking reference" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="cruise_notes"
              render={({ field }) => (
                <FormItem className="mb-4">
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Additional notes" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            {commonFields}
            <FormField
              control={form.control}
              name="cruise_end_date"
              render={({ field }) => (
                <FormItem className="mb-4">
                  <FormLabel>End Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="cruise_boarding_time"
              render={({ field }) => (
                <FormItem className="mb-4">
                  <FormLabel>Boarding Time</FormLabel>
                  <FormControl>
                    <Input type="time" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
          </>
        );
      default:
        return commonFields;
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-md overflow-hidden">
        <SheetHeader>
          <SheetTitle>
            {mode === 'add' ? `Add New ${capitalizeFirstLetter(activityType)}` : `Edit ${capitalizeFirstLetter(activityType)}`}
          </SheetTitle>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-8rem)]">
          <div className="py-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                {renderFormFields()}
                
                <div className="flex justify-end gap-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={onClose}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Saving...' : 'Save'}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
