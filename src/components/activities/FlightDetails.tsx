import { Button } from "@/components/ui/button"
import { Edit, Trash2, Plus, RefreshCw } from "lucide-react"
import { useState, useEffect } from "react"
import { ActivitySideDrawer } from "@/components/ActivitySideDrawer"
import { ScrollArea } from "@/components/ui/scroll-area"
import { supabase } from "@/integrations/supabase/client"
import { PassengerDetails } from "./PassengerDetails"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { useNavigate } from "react-router-dom"
import { useToast } from "@/hooks/use-toast"
import { DocumentsSection } from "@/components/documents/DocumentsSection"
import { Badge } from "@/components/ui/badge"

interface FlightDetailsProps {
  flight: {
    id: string;
    flight_airline: string;
    flight_number: string;
    flight_departure_city: string;
    flight_arrival_city: string;
    flight_departure_date: string;
    flight_departure_time: string | null;
    flight_arrival_date: string;
    flight_arrival_time: string | null;
    flight_departure_terminal?: string;
    flight_arrival_terminal?: string;
    flight_departure_gate?: string;
    flight_departure_airport_code?: string;
    flight_arrival_airport_code?: string;
    flight_confirmation_number?: string;
    flight_time?: string;
    flight_notes?: string;
    flight_documents?: any;
    flight_departure_boarding_time?: string;
    trip_id: string;
    flight_aerodata_subscription_id?: string;
    flight_aerodata_status?: string;
    flight_aerodata_last_checked?: string;
  }
}

export function FlightDetails({ flight }: FlightDetailsProps) {
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false)
  const [isPassengerDrawerOpen, setIsPassengerDrawerOpen] = useState(false)
  const [selectedPassenger, setSelectedPassenger] = useState<any>(null)
  const [passengers, setPassengers] = useState<any[]>([])
  const [passengerMode, setPassengerMode] = useState<'add' | 'edit'>('add')
  const [isLoading, setIsLoading] = useState(false)
  const [flightHistory, setFlightHistory] = useState<any[]>([])
  const navigate = useNavigate()
  const { toast } = useToast()

  const handleDelete = async () => {
    const { error } = await supabase
      .from('flights')
      .delete()
      .eq('id', flight.id)

    if (error) {
      toast({
        title: "Error",
        description: "Could not delete flight",
        variant: "destructive",
      })
      return
    }

    toast({
      title: "Success",
      description: "Flight deleted successfully",
    })

    const tripPath = `/trips/${flight.trip_id}`
    navigate(tripPath)
  }

  const handleAddDocument = async (document: any) => {
    const existingDocs = flight?.flight_documents || [];
    const documentExists = existingDocs.some((doc: any) => doc.id === document.id);
    
    if (documentExists) {
      toast({
        title: "Document already added",
        description: "This document is already attached to the flight.",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase
      .from('flights')
      .update({
        flight_documents: [...existingDocs, document]
      })
      .eq('id', flight.id);

    if (error) {
      toast({
        title: "Error",
        description: "Could not add document to flight",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Document added to flight",
    });
    navigate(`/trips/${flight.trip_id}`);
  };

  useEffect(() => {
    fetchPassengers()
    fetchFlightHistory()
  }, [flight.id])

  const fetchPassengers = async () => {
    try {
      const { data, error } = await supabase
        .from('flights_passengers')
        .select('*')
        .eq('flight_id', flight.id)

      if (error) throw error
      setPassengers(data || [])
    } catch (error) {
      console.error('Error fetching passengers:', error)
    }
  }

  const fetchFlightHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('flight_status_history')
        .select('*')
        .eq('flight_id', flight.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setFlightHistory(data || [])
    } catch (error) {
      console.error('Error fetching flight history:', error)
    }
  }

  const handleAddPassenger = () => {
    setPassengerMode('add')
    setSelectedPassenger(null)
    setIsPassengerDrawerOpen(true)
  }

  const handleEditPassenger = (passenger: any) => {
    setPassengerMode('edit')
    setSelectedPassenger(passenger)
    setIsPassengerDrawerOpen(true)
  }

  const handleMonitorFlight = async () => {
    try {
      setIsLoading(true)
      
      const response = await supabase.functions.invoke('flight-monitor', {
        body: {
          path: 'subscribe',
          flightId: flight.id
        }
      })
      
      if (response.error) {
        throw new Error(response.error)
      }
      
      toast({
        title: "Success",
        description: "Flight is now being monitored for changes",
      })
      
      // Refresh page to show updated status
      navigate(`/trips/${flight.trip_id}`)
    } catch (error) {
      console.error('Error monitoring flight:', error)
      toast({
        title: "Error",
        description: "Could not set up flight monitoring",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCheckFlightStatus = async () => {
    try {
      setIsLoading(true)
      
      const response = await supabase.functions.invoke('flight-monitor', {
        body: {
          path: 'check',
          flightId: flight.id
        }
      })
      
      if (response.error) {
        throw new Error(response.error)
      }
      
      toast({
        title: "Success", 
        description: "Flight status checked successfully",
      })
      
      // Refresh to get updated data
      navigate(`/trips/${flight.trip_id}`)
    } catch (error) {
      console.error('Error checking flight status:', error)
      toast({
        title: "Error",
        description: "Could not check flight status",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const formatLastChecked = () => {
    if (!flight.flight_aerodata_last_checked) return 'Never';
    
    const checkedDate = new Date(flight.flight_aerodata_last_checked);
    const now = new Date();
    
    if (checkedDate.toDateString() === now.toDateString()) {
      return `Today at ${checkedDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    
    return checkedDate.toLocaleDateString();
  }

  const getStatusBadge = () => {
    if (!flight.flight_aerodata_subscription_id) {
      return <Badge variant="outline">Not Monitored</Badge>;
    }
    
    switch (flight.flight_aerodata_status?.toLowerCase()) {
      case 'scheduled':
        return <Badge className="bg-blue-100 text-blue-800">Scheduled</Badge>;
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'landed':
        return <Badge className="bg-purple-100 text-purple-800">Landed</Badge>;
      case 'diverted':
        return <Badge className="bg-yellow-100 text-yellow-800">Diverted</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800">Cancelled</Badge>;
      default:
        return <Badge variant="secondary">{flight.flight_aerodata_status || 'Unknown'}</Badge>;
    }
  }

  return (
    <div className="h-[calc(100vh-8rem)]">
      <ScrollArea className="h-full">
        <div className="bg-white rounded-lg space-y-6 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold flex items-center gap-2">
                {flight.flight_departure_city} to {flight.flight_arrival_city}
                {getStatusBadge()}
              </h2>
              <div className="text-sm text-muted-foreground mt-1">
                {flight.flight_aerodata_subscription_id ? (
                  <p>Last checked: {formatLastChecked()}</p>
                ) : (
                  <p>Flight changes are not being monitored</p>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              {!flight.flight_aerodata_subscription_id ? (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleMonitorFlight}
                  disabled={isLoading}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                  Monitor Flight
                </Button>
              ) : (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleCheckFlightStatus}
                  disabled={isLoading}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                  Check Status
                </Button>
              )}
              
              <Button variant="outline" size="sm" onClick={() => setIsEditDrawerOpen(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete this flight from the trip. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>

          <div className="bg-muted/50 rounded-lg p-4 space-y-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Airline & Flight</h3>
              <p className="text-lg">{flight.flight_airline} {flight.flight_number}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Departure</h3>
                <div className="space-y-1">
                  <p className="text-lg">
                    {flight.flight_departure_airport_code && 
                      <span className="font-medium">{flight.flight_departure_airport_code}</span>
                    }
                  </p>
                  <p>{flight.flight_departure_date}</p>
                  {flight.flight_departure_time && <p>Time: {flight.flight_departure_time}</p>}
                  {flight.flight_departure_boarding_time && (
                    <p>Boarding: {flight.flight_departure_boarding_time}</p>
                  )}
                  {flight.flight_departure_terminal && (
                    <p>Terminal: {flight.flight_departure_terminal}</p>
                  )}
                  {flight.flight_departure_gate && (
                    <p>Gate: {flight.flight_departure_gate}</p>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Arrival</h3>
                <div className="space-y-1">
                  <p className="text-lg">
                    {flight.flight_arrival_airport_code && 
                      <span className="font-medium">{flight.flight_arrival_airport_code}</span>
                    }
                  </p>
                  <p>{flight.flight_arrival_date}</p>
                  {flight.flight_arrival_time && <p>Time: {flight.flight_arrival_time}</p>}
                  {flight.flight_arrival_terminal && (
                    <p>Terminal: {flight.flight_arrival_terminal}</p>
                  )}
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Flight Information</h3>
              <div className="space-y-1">
                {flight.flight_confirmation_number && (
                  <p>Reference: {flight.flight_confirmation_number}</p>
                )}
                {flight.flight_time && <p>Duration: {flight.flight_time}</p>}
              </div>
            </div>

            {flight.flight_notes && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Notes</h3>
                <p>{flight.flight_notes}</p>
              </div>
            )}

            <DocumentsSection 
              documents={flight?.flight_documents || []}
              title="Flight Documents"
              onDocumentSelect={handleAddDocument}
            />
          </div>

          {flightHistory.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-4">Flight Status History</h3>
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {flightHistory.map((historyItem) => (
                  <div 
                    key={historyItem.id} 
                    className="bg-muted/30 p-3 rounded-md border border-gray-200"
                  >
                    <div className="flex justify-between">
                      <span className="font-medium capitalize">{historyItem.status_change_type.replace('_', ' ')}</span>
                      <span className="text-sm text-muted-foreground">
                        {new Date(historyItem.created_at).toLocaleDateString()} at {' '}
                        {new Date(historyItem.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className="mt-1 text-sm flex items-center gap-2">
                      <span>{historyItem.old_value?.value || 'Not set'}</span>
                      <span className="text-gray-400">→</span>
                      <span className="font-medium">{historyItem.new_value?.value}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Passengers</h3>
              <Button size="sm" onClick={handleAddPassenger}>
                <Plus className="h-4 w-4 mr-2" />
                Add Passenger
              </Button>
            </div>

            <div className="space-y-4 max-h-[400px] overflow-y-auto">
              {passengers.map((passenger) => (
                <div
                  key={passenger.id}
                  className="bg-muted/50 rounded-lg p-4 cursor-pointer hover:bg-muted/70"
                  onClick={() => handleEditPassenger(passenger)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{passenger.name}</p>
                      {passenger.seat && (
                        <p className="text-sm text-muted-foreground">Seat: {passenger.seat}</p>
                      )}
                      {passenger.class && (
                        <p className="text-sm text-muted-foreground">Class: {passenger.class}</p>
                      )}
                      {passenger.loyalty_number && (
                        <p className="text-sm text-muted-foreground">Loyalty #: {passenger.loyalty_number}</p>
                      )}
                      {passenger.flight_passengers_documents && passenger.flight_passengers_documents.length > 0 && (
                        <div className="mt-2">
                          <p className="text-sm text-muted-foreground">Documents:</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {Array.isArray(passenger.flight_passengers_documents) ? 
                              passenger.flight_passengers_documents.map((doc: string, index: number) => (
                                <a 
                                  key={index} 
                                  href={doc} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs hover:bg-green-200 transition-colors"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  Doc {index + 1}
                                </a>
                              )) : (
                              <p className="text-xs text-muted-foreground">Documents available</p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                  {passenger.passenger_notes && (
                    <p className="text-sm text-muted-foreground mt-2">{passenger.passenger_notes}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </ScrollArea>

      {isEditDrawerOpen && (
        <ActivitySideDrawer
          isOpen={isEditDrawerOpen}
          onClose={() => setIsEditDrawerOpen(false)}
          activityType="flight"
          tripId={flight.trip_id}
          activity={{
            ...flight,
            type: "flight",
            title: `${flight.flight_airline} ${flight.flight_number}`,
            date: new Date(flight.flight_departure_date)
          }}
          mode="edit"
          onSave={() => setIsEditDrawerOpen(false)}
        />
      )}

      {isPassengerDrawerOpen && (
        <PassengerDetails
          isOpen={isPassengerDrawerOpen}
          onClose={() => setIsPassengerDrawerOpen(false)}
          onSave={fetchPassengers}
          passenger={selectedPassenger}
          flightId={flight.id}
          mode={passengerMode}
        />
      )}
    </div>
  )
}
