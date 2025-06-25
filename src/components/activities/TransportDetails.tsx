
import { Button } from "@/components/ui/button"
import { Edit, Trash2 } from "lucide-react"
import { useState } from "react"
import { ActivitySideDrawer } from "@/components/ActivitySideDrawer"
import { ScrollArea } from "@/components/ui/scroll-area"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { useNavigate } from "react-router-dom"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { Activity } from "@/types/activity"
import { DocumentsSection } from "@/components/documents/DocumentsSection"

interface TransportDetailsProps {
  transport: Activity & {
    id: string;
    name?: string;
    description?: string;
    provider?: string;
    pickup_location?: string;
    dropoff_location?: string;
    reservation_number?: string;
    notes?: string;
    image?: string;
    document?: any;
    start_date?: string;
    end_date?: string;
    start_time?: string;
    trip_id: string;
  }
}

export function TransportDetails({ transport }: TransportDetailsProps) {
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false)
  const navigate = useNavigate()
  const { toast } = useToast()

  const handleDelete = async () => {
    const { error } = await supabase
      .from('transports')
      .delete()
      .eq('id', transport.id)

    if (error) {
      toast({
        title: "Error",
        description: "Could not delete transport",
        variant: "destructive",
      })
      return
    }

    toast({
      title: "Success",
      description: "Transport deleted successfully",
    })

    const tripPath = `/trips/${transport.trip_id}`
    navigate(tripPath)
  }

  const handleAddDocument = async (document: any) => {
    const existingDocs = Array.isArray(transport?.document) ? transport.document : [];
    const documentExists = existingDocs.some((doc: any) => doc.id === document.id);
    
    if (documentExists) {
      toast({
        title: "Document already added",
        description: "This document is already attached to the transport.",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase
      .from('transports')
      .update({
        document: [...existingDocs, document]
      })
      .eq('id', transport.id);

    if (error) {
      toast({
        title: "Error",
        description: "Could not add document to transport",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Document added to transport",
    });
    navigate(`/trips/${transport.trip_id}`);
  };

  return (
    <div className="h-[calc(100vh-8rem)]">
      <ScrollArea className="h-full">
        <div className="bg-white rounded-lg space-y-6 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">{transport.name || transport.title}</h2>
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
                      This will permanently delete this transport from the trip. This action cannot be undone.
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
            {transport.image && (
              <img
                src={transport.image}
                alt={transport.name || "Transport"}
                className="w-full h-48 object-cover rounded-lg"
              />
            )}

            {transport.provider && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Provider</h3>
                <p>{transport.provider}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Pickup</h3>
                <div className="space-y-1">
                  <p>{transport.pickup_location}</p>
                  {transport.start_date && <p>Date: {transport.start_date}</p>}
                  {transport.start_time && <p>Time: {transport.start_time}</p>}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Dropoff</h3>
                <div className="space-y-1">
                  <p>{transport.dropoff_location}</p>
                  {transport.end_date && <p>Date: {transport.end_date}</p>}
                </div>
              </div>
            </div>

            {transport.reservation_number && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Booking Information</h3>
                <p>Reference: {transport.reservation_number}</p>
              </div>
            )}

            {transport.description && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Description</h3>
                <p>{transport.description}</p>
              </div>
            )}

            {transport.notes && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Notes</h3>
                <p>{transport.notes}</p>
              </div>
            )}

            {/* Documents section moved into the main content area */}
            <DocumentsSection 
              documents={Array.isArray(transport?.document) ? transport.document : []}
              title="Transport Documents"
              onDocumentSelect={handleAddDocument}
            />
          </div>
        </div>
      </ScrollArea>

      {isEditDrawerOpen && (
        <ActivitySideDrawer
          isOpen={isEditDrawerOpen}
          onClose={() => setIsEditDrawerOpen(false)}
          activityType="transport"
          tripId={transport.trip_id}
          activity={transport}
          mode="edit"
          onSave={() => setIsEditDrawerOpen(false)}
        />
      )}
    </div>
  )
}
