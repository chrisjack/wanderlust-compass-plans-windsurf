
import { Button } from "@/components/ui/button"
import { Edit, File, Plus, Trash2, User, Calendar, Ship } from "lucide-react"
import { useState } from "react"
import { ActivitySideDrawer } from "@/components/ActivitySideDrawer"
import { ScrollArea } from "@/components/ui/scroll-area"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { useNavigate } from "react-router-dom"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { DocumentsSection } from "@/components/documents/DocumentsSection"
import { useQuery } from "@tanstack/react-query"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { format } from "date-fns"

interface CruiseDetailsProps {
  cruise: {
    id: string;
    cruise_name: string;
    cruise_line?: string;
    cruise_ship_name?: string;
    cruise_description?: string;
    cruise_departure_port?: string;
    cruise_arrival_port?: string;
    cruise_start_date?: string;
    cruise_end_date?: string;
    cruise_boarding_time?: string;
    cruise_booking_number?: string;
    cruise_notes?: string;
    cruise_feature_image?: string;
    cruise_images?: any;
    cruise_documents?: any;
    trip_id: string;
  }
}

export function CruiseDetails({ cruise }: CruiseDetailsProps) {
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false)
  const navigate = useNavigate()
  const { toast } = useToast()

  // Fetch cruise passengers
  const { data: passengers } = useQuery({
    queryKey: ['cruise-passengers', cruise.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cruise_passengers')
        .select('*')
        .eq('cruise_id', cruise.id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    },
  });

  // Fetch cruise itinerary
  const { data: itinerary } = useQuery({
    queryKey: ['cruise-itinerary', cruise.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cruise_itinerary')
        .select('*')
        .eq('cruise_id', cruise.id)
        .order('day', { ascending: true });

      if (error) throw error;
      return data || [];
    },
  });

  const handleDelete = async () => {
    const { error } = await supabase
      .from('cruises')
      .delete()
      .eq('id', cruise.id)

    if (error) {
      toast({
        title: "Error",
        description: "Could not delete cruise",
        variant: "destructive",
      })
      return
    }

    toast({
      title: "Success",
      description: "Cruise deleted successfully",
    })

    const tripPath = `/trips/${cruise.trip_id}`
    navigate(tripPath)
  }

  const handleAddDocument = async (document: any) => {
    const existingDocs = Array.isArray(cruise?.cruise_documents) ? cruise.cruise_documents : [];
    const documentExists = existingDocs.some((doc: any) => doc.id === document.id);
    
    if (documentExists) {
      toast({
        title: "Document already added",
        description: "This document is already attached to the cruise.",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase
      .from('cruises')
      .update({
        cruise_documents: [...existingDocs, document]
      })
      .eq('id', cruise.id);

    if (error) {
      toast({
        title: "Error",
        description: "Could not add document to cruise",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Document added to cruise",
    });
    navigate(`/trips/${cruise.trip_id}`);
  };

  return (
    <div className="h-[calc(100vh-8rem)]">
      <ScrollArea className="h-full">
        <div className="bg-white rounded-lg space-y-6 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">{cruise.cruise_name}</h2>
            <div className="flex gap-2">
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
                      This will permanently delete this cruise from the trip. This action cannot be undone.
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
            {cruise.cruise_feature_image && (
              <img
                src={cruise.cruise_feature_image}
                alt={cruise.cruise_name}
                className="w-full h-48 object-cover rounded-lg"
              />
            )}

            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Cruise Line & Ship</h3>
              <p className="text-lg">
                {cruise.cruise_line} 
                {cruise.cruise_ship_name && ` - ${cruise.cruise_ship_name}`}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Departure</h3>
                <div className="space-y-1">
                  <p className="text-lg">{cruise.cruise_departure_port}</p>
                  {cruise.cruise_start_date && <p>{cruise.cruise_start_date}</p>}
                  {cruise.cruise_boarding_time && <p>Boarding: {cruise.cruise_boarding_time}</p>}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Arrival</h3>
                <div className="space-y-1">
                  <p className="text-lg">{cruise.cruise_arrival_port}</p>
                  {cruise.cruise_end_date && <p>{cruise.cruise_end_date}</p>}
                </div>
              </div>
            </div>

            {cruise.cruise_booking_number && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Booking Information</h3>
                <p>Reference: {cruise.cruise_booking_number}</p>
              </div>
            )}

            {cruise.cruise_description && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Description</h3>
                <p>{cruise.cruise_description}</p>
              </div>
            )}

            {cruise.cruise_notes && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Notes</h3>
                <p>{cruise.cruise_notes}</p>
              </div>
            )}

            {cruise.cruise_images && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Images</h3>
                <p className="text-sm">
                  {Array.isArray(cruise.cruise_images) 
                    ? cruise.cruise_images.length + " images available"
                    : "Images available"}
                </p>
              </div>
            )}

            {/* Passengers Section */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center mb-4">
                <User className="h-5 w-5 mr-2 text-blue-500" />
                <h3 className="text-xl font-medium">Passengers</h3>
              </div>
              
              {passengers && passengers.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Cabin Number</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {passengers.map((passenger: any) => (
                      <TableRow key={passenger.id}>
                        <TableCell>{passenger.name || 'Not specified'}</TableCell>
                        <TableCell>{passenger.cabin_number || 'Not assigned'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-muted-foreground text-sm py-2">No passenger information available</p>
              )}
            </div>

            {/* Itinerary Section */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center mb-4">
                <Ship className="h-5 w-5 mr-2 text-blue-500" />
                <h3 className="text-xl font-medium">Cruise Itinerary</h3>
              </div>
              
              {itinerary && itinerary.length > 0 ? (
                <div className="space-y-4">
                  {itinerary.map((day: any) => (
                    <div key={day.id} className="border-b pb-4 last:border-b-0">
                      <div className="flex items-center">
                        <div className="bg-blue-100 text-blue-700 font-medium h-8 w-8 rounded-full flex items-center justify-center">
                          {day.day || '?'}
                        </div>
                        <div className="ml-3">
                          <h4 className="font-medium">{day.port || 'At Sea'}</h4>
                          <p className="text-sm text-muted-foreground">
                            {day.date ? format(new Date(day.date), 'MMM dd, yyyy') : 'Date not specified'}
                          </p>
                        </div>
                      </div>

                      <div className="mt-2 ml-11">
                        {(day.arrival || day.departure) && (
                          <div className="flex gap-4 text-sm">
                            {day.arrival && <span>Arrival: {day.arrival}</span>}
                            {day.departure && <span>Departure: {day.departure}</span>}
                          </div>
                        )}
                        
                        {day.description && (
                          <p className="mt-2 text-sm">{day.description}</p>
                        )}
                        
                        {day.notes && (
                          <p className="mt-1 text-sm italic text-muted-foreground">{day.notes}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm py-2">No itinerary information available</p>
              )}
            </div>

            {/* Documents section */}
            <DocumentsSection 
              documents={Array.isArray(cruise?.cruise_documents) ? cruise.cruise_documents : []}
              title="Cruise Documents"
              onDocumentSelect={handleAddDocument}
            />
          </div>
        </div>
      </ScrollArea>

      {isEditDrawerOpen && (
        <ActivitySideDrawer
          isOpen={isEditDrawerOpen}
          onClose={() => setIsEditDrawerOpen(false)}
          activityType="cruise"
          tripId={cruise.trip_id}
          activity={{
            ...cruise,
            type: "cruise",
            title: cruise.cruise_name,
            date: cruise.cruise_start_date ? new Date(cruise.cruise_start_date) : new Date()
          }}
          mode="edit"
          onSave={() => setIsEditDrawerOpen(false)}
        />
      )}
    </div>
  )
}
