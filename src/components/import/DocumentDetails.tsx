import { useState, useEffect } from "react";
import { X, Edit, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { FlightForm } from "./FlightForm";
import { AddToTripModal } from "./AddToTripModal";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { Document } from "@/types/documents";
import { ScrollArea } from "@/components/ui/scroll-area"

interface DocumentDetailsProps {
  isOpen: boolean;
  onClose: () => void;
  document: Document | null;
  onDelete?: (id: string, type: string) => void;
}

export function DocumentDetails({ isOpen, onClose, document, onDelete }: DocumentDetailsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isAddToTripOpen, setIsAddToTripOpen] = useState(false);
  const isMobile = useMediaQuery("(max-width: 768px)");
  const { toast } = useToast();

  useEffect(() => {
    console.log('DocumentDetails rendered with:', { isOpen, document });
  }, [isOpen, document]);

  const handleDelete = async () => {
    if (!document?.id) return;
    
    try {
      setIsDeleting(true);
      await onDelete(document.id, document.type);
      toast({ title: "Success", description: "Flight deleted successfully" });
      onClose();
    } catch (error) {
      console.error("Delete error:", error);
      toast({ 
        title: "Error", 
        description: "Failed to delete flight", 
        variant: "destructive" 
      });
    } finally {
      setIsDeleting(false);
      setIsConfirmingDelete(false);
    }
  };

  const renderDocumentDetails = () => {
    if (!document) return null;

    if (document.type === 'flights') {
      return (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-1">Airline</h4>
              <p className="text-sm">{document.airline || '-'}</p>
            </div>
            <div>
              <h4 className="font-medium mb-1">Flight Number</h4>
              <p className="text-sm">{document.flight_number || '-'}</p>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Departure</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h5 className="text-sm font-medium mb-1">Airport</h5>
                <p className="text-sm">{document.departure_airport || '-'}</p>
              </div>
              <div>
                <h5 className="text-sm font-medium mb-1">Terminal</h5>
                <p className="text-sm">{document.departure_terminal || '-'}</p>
              </div>
              <div>
                <h5 className="text-sm font-medium mb-1">Date</h5>
                <p className="text-sm">{document.departure_date || '-'}</p>
              </div>
              <div>
                <h5 className="text-sm font-medium mb-1">Time</h5>
                <p className="text-sm">{document.departure_time || '-'}</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Arrival</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h5 className="text-sm font-medium mb-1">Airport</h5>
                <p className="text-sm">{document.arrival_airport || '-'}</p>
              </div>
              <div>
                <h5 className="text-sm font-medium mb-1">Terminal</h5>
                <p className="text-sm">{document.arrival_terminal || '-'}</p>
              </div>
              <div>
                <h5 className="text-sm font-medium mb-1">Date</h5>
                <p className="text-sm">{document.arrival_date || '-'}</p>
              </div>
              <div>
                <h5 className="text-sm font-medium mb-1">Time</h5>
                <p className="text-sm">{document.arrival_time || '-'}</p>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-1">Confirmation Number</h4>
            <p className="text-sm">{document.confirmation_number || '-'}</p>
          </div>

          <div>
            <h4 className="font-medium mb-1">Notes</h4>
            <p className="text-sm">{document.notes || '-'}</p>
          </div>
        </div>
      );
    } else if (document.type === 'cruise') {
      return (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-1">Cruise Name</h4>
              <p className="text-sm">{document.cruise_name || '-'}</p>
            </div>
            <div>
              <h4 className="font-medium mb-1">Cruise Line</h4>
              <p className="text-sm">{document.cruise_line || '-'}</p>
            </div>
            <div>
              <h4 className="font-medium mb-1">Ship Name</h4>
              <p className="text-sm">{document.cruise_ship_name || '-'}</p>
            </div>
            <div>
              <h4 className="font-medium mb-1">Booking Number</h4>
              <p className="text-sm">{document.cruise_booking_number || '-'}</p>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Departure</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h5 className="text-sm font-medium mb-1">Port</h5>
                <p className="text-sm">{document.cruise_departure_port || '-'}</p>
              </div>
              <div>
                <h5 className="text-sm font-medium mb-1">Date</h5>
                <p className="text-sm">{document.cruise_start_date || '-'}</p>
              </div>
              <div>
                <h5 className="text-sm font-medium mb-1">Boarding Time</h5>
                <p className="text-sm">{document.cruise_boarding_time || '-'}</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Arrival</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h5 className="text-sm font-medium mb-1">Port</h5>
                <p className="text-sm">{document.cruise_arrival_port || '-'}</p>
              </div>
              <div>
                <h5 className="text-sm font-medium mb-1">Date</h5>
                <p className="text-sm">{document.cruise_end_date || '-'}</p>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-1">Notes</h4>
            <p className="text-sm">{document.cruise_notes || '-'}</p>
          </div>
        </div>
      );
    } else {
      return (
        <div className="space-y-6">
          <div>
            <h4 className="font-medium mb-1">Name</h4>
            <p className="text-sm">{document.name || '-'}</p>
          </div>
          <div>
            <h4 className="font-medium mb-1">Type</h4>
            <p className="text-sm capitalize">{document.type || '-'}</p>
          </div>
          <div>
            <h4 className="font-medium mb-1">Created At</h4>
            <p className="text-sm">{format(new Date(document.created_at), 'yyyy-MM-dd HH:mm')}</p>
          </div>
        </div>
      );
    }
  };

  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DrawerContent className="h-[80vh] overflow-y-auto">
          <DrawerHeader className="sticky top-0 z-10 bg-background border-b">
            <DrawerTitle>{document?.type === 'flights' ? 'Flight Details' : document?.type === 'cruise' ? 'Cruise Details' : 'Document Details'}</DrawerTitle>
          </DrawerHeader>
          <div className="px-4 py-6">
            {renderDocumentDetails()}
            <div className="flex gap-2 mt-6">
              <Button onClick={() => setIsAddToTripOpen(true)}>
                Add to Trip
              </Button>
              <Button variant="outline" onClick={() => setIsEditing(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button 
                variant="destructive" 
                onClick={() => setIsConfirmingDelete(true)}
                disabled={isDeleting}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {isDeleting ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="w-[500px] sm:max-w-[500px]">
        <SheetHeader className="border-b pb-4">
          <SheetTitle>{document?.type === 'flights' ? 'Flight Details' : document?.type === 'cruise' ? 'Cruise Details' : 'Document Details'}</SheetTitle>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-8rem)]">
          <div className="py-6">
            {renderDocumentDetails()}
            <div className="flex gap-2 mt-6">
              <Button onClick={() => setIsAddToTripOpen(true)}>
                Add to Trip
              </Button>
              <Button variant="outline" onClick={() => setIsEditing(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button 
                variant="destructive" 
                onClick={() => setIsConfirmingDelete(true)}
                disabled={isDeleting}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {isDeleting ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
      {isEditing && (
        <FlightForm
          flight={document}
          onSave={() => setIsEditing(false)}
          onCancel={() => setIsEditing(false)}
        />
      )}
      {isAddToTripOpen && (
        <AddToTripModal
          isOpen={isAddToTripOpen}
          onClose={() => setIsAddToTripOpen(false)}
          selectedFlights={document ? [document] : []}
        />
      )}
    </Sheet>
  );
}
