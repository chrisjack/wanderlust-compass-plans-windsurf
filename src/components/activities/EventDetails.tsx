
import { Button } from "@/components/ui/button"
import { Edit, Trash2 } from "lucide-react"
import { useState } from "react"
import { ActivitySideDrawer } from "@/components/ActivitySideDrawer"
import { ScrollArea } from "@/components/ui/scroll-area"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { useNavigate } from "react-router-dom"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { DocumentsSection } from "@/components/documents/DocumentsSection"

interface EventDetailsProps {
  event: {
    id: string;
    name: string;
    description?: string;
    location?: string;
    address?: string;
    city?: string;
    country?: string;
    start_date?: string;
    end_date?: string;
    start_time?: string;
    end_time?: string;
    confirmation_number?: string;
    feature_image?: string;
    images?: any;
    documents?: any;
    trip_id: string;
  }
}

export function EventDetails({ event }: EventDetailsProps) {
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false)
  const navigate = useNavigate()
  const { toast } = useToast()

  const handleDelete = async () => {
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', event.id)

    if (error) {
      toast({
        title: "Error",
        description: "Could not delete event",
        variant: "destructive",
      })
      return
    }

    toast({
      title: "Success",
      description: "Event deleted successfully",
    })

    const tripPath = `/trips/${event.trip_id}`
    navigate(tripPath)
  }

  const handleAddDocument = async (document: any) => {
    const existingDocs = Array.isArray(event?.documents) ? event.documents : [];
    const documentExists = existingDocs.some((doc: any) => doc.id === document.id);
    
    if (documentExists) {
      toast({
        title: "Document already added",
        description: "This document is already attached to the event.",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase
      .from('events')
      .update({
        documents: [...existingDocs, document]
      })
      .eq('id', event.id);

    if (error) {
      toast({
        title: "Error",
        description: "Could not add document to event",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Document added to event",
    });
    navigate(`/trips/${event.trip_id}`);
  };

  return (
    <div className="h-[calc(100vh-8rem)]">
      <ScrollArea className="h-full">
        <div className="bg-white rounded-lg space-y-6 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">{event.name}</h2>
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
                      This will permanently delete this event from the trip. This action cannot be undone.
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
            {event.feature_image && (
              <img
                src={event.feature_image}
                alt={event.name}
                className="w-full h-48 object-cover rounded-lg"
              />
            )}

            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Location</h3>
              <div className="space-y-1">
                {event.location && <p>{event.location}</p>}
                {event.address && <p>{event.address}</p>}
                {(event.city || event.country) && (
                  <p>
                    {event.city}
                    {event.city && event.country && ", "}
                    {event.country}
                  </p>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Date & Time</h3>
              <div className="space-y-1">
                <p>
                  {event.start_date} 
                  {event.start_time && ` at ${event.start_time}`}
                </p>
                {event.end_date && (
                  <p>
                    to {event.end_date}
                    {event.end_time && ` at ${event.end_time}`}
                  </p>
                )}
              </div>
            </div>

            {event.confirmation_number && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Booking Information</h3>
                <p>Reference: {event.confirmation_number}</p>
              </div>
            )}

            {event.description && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Description</h3>
                <p>{event.description}</p>
              </div>
            )}

            {event.images && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Images</h3>
                <p className="text-sm">
                  {Array.isArray(event.images) 
                    ? event.images.length + " images available"
                    : "Images available"}
                </p>
              </div>
            )}

            {/* Documents section moved into the main content area */}
            <DocumentsSection 
              documents={Array.isArray(event?.documents) ? event.documents : []}
              title="Event Documents"
              onDocumentSelect={handleAddDocument}
            />
          </div>
        </div>
      </ScrollArea>

      {isEditDrawerOpen && (
        <ActivitySideDrawer
          isOpen={isEditDrawerOpen}
          onClose={() => setIsEditDrawerOpen(false)}
          activityType="event"
          tripId={event.trip_id}
          activity={{
            ...event,
            type: "event",
            title: event.name,
            date: event.start_date ? new Date(event.start_date) : new Date()
          }}
          mode="edit"
          onSave={() => setIsEditDrawerOpen(false)}
        />
      )}
    </div>
  )
}
