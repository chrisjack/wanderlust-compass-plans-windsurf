
import { Button } from "@/components/ui/button"
import { Edit, Plus, Trash2, UserPlus, X } from "lucide-react"
import { useState } from "react"
import { ActivitySideDrawer } from "@/components/ActivitySideDrawer"
import { ScrollArea } from "@/components/ui/scroll-area"
import { supabase } from "@/integrations/supabase/client"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { useNavigate } from "react-router-dom"
import { useToast } from "@/hooks/use-toast"
import { DocumentsSection } from "@/components/documents/DocumentsSection"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from "@/components/ui/sheet"
import { FacilitiesSection } from "@/components/FacilitiesSection"

interface AccommodationDetailsProps {
  accommodation: {
    id: string;
    accommodation_name: string;
    accommodation_description?: string;
    accommodation_address?: string;
    accommodation_arrival_date?: string;
    accommodation_departure_date?: string;
    accommodation_checkin_time?: string;
    accommodation_checkout_time?: string;
    accommodation_confirmation_number?: string;
    accommodation_notes?: string;
    accommodation_phone?: string;
    accommodation_email?: string;
    accommodation_website?: string;
    accommodation_city?: string;
    accommodation_country?: string;
    accommodation_feature_image?: string;
    accommodation_gallery_images?: any;
    accommodation_documents?: any;
    accommodation_number_of_rooms?: number;
    accommodation_nights_stay?: number;
    trip_id: string;
  }
}

interface GuestType {
  id: string;
  name: string;
  room_number?: string;
  room_type?: string;
  guest_loyalty_number?: string;
  accommodation_id: string;
  notes?: string;
}

interface FacilityType {
  id: string;
  facility_name: string;
  accommodation_id: string;
}

export function AccommodationDetails({ accommodation }: AccommodationDetailsProps) {
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false)
  const [isAddGuestDrawerOpen, setIsAddGuestDrawerOpen] = useState(false)
  const [editingGuest, setEditingGuest] = useState<GuestType | null>(null)
  const navigate = useNavigate()
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const [guestForm, setGuestForm] = useState({
    name: "",
    room_number: "",
    room_type: "",
    guest_loyalty_number: ""
  })

  const { data: guests } = useQuery({
    queryKey: ['guests', accommodation.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('accommodation_guests')
        .select('*')
        .eq('accommodation_id', accommodation.id);

      if (error) throw error;
      return (data || []) as GuestType[];
    }
  })

  const { data: facilities, refetch: refetchFacilities } = useQuery({
    queryKey: ['facilities', accommodation.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('accommodation_facilities')
        .select('*')
        .eq('accommodation_id', accommodation.id);

      if (error) throw error;
      return (data || []) as FacilityType[];
    }
  })

  const handleDelete = async () => {
    const { error } = await supabase
      .from('accommodation')
      .delete()
      .eq('id', accommodation.id)

    if (error) {
      toast({
        title: "Error",
        description: "Could not delete accommodation",
        variant: "destructive",
      })
      return
    }

    toast({
      title: "Success",
      description: "Accommodation deleted successfully",
    })

    const tripPath = `/trips/${accommodation.trip_id}`
    navigate(tripPath)
  }

  const handleAddDocument = async (document: any) => {
    const existingDocs = Array.isArray(accommodation?.accommodation_documents) ? accommodation.accommodation_documents : [];
    const documentExists = existingDocs.some((doc: any) => doc.id === document.id);
    
    if (documentExists) {
      toast({
        title: "Document already added",
        description: "This document is already attached to the accommodation.",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase
      .from('accommodation')
      .update({
        accommodation_documents: [...existingDocs, document]
      })
      .eq('id', accommodation.id);

    if (error) {
      toast({
        title: "Error",
        description: "Could not add document to accommodation",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Document added to accommodation",
    });
    navigate(`/trips/${accommodation.trip_id}`);
  };

  const handleSaveGuest = async () => {
    if (!guestForm.name.trim()) {
      toast({
        title: "Error",
        description: "Guest name is required",
        variant: "destructive"
      });
      return;
    }

    try {
      if (editingGuest) {
        const { error } = await supabase
          .from('accommodation_guests')
          .update({
            name: guestForm.name,
            room_number: guestForm.room_number,
            room_type: guestForm.room_type,
            guest_loyalty_number: guestForm.guest_loyalty_number
          })
          .eq('id', editingGuest.id);

        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Guest updated successfully"
        });
      } else {
        const { error } = await supabase
          .from('accommodation_guests')
          .insert({
            accommodation_id: accommodation.id,
            name: guestForm.name,
            room_number: guestForm.room_number,
            room_type: guestForm.room_type,
            guest_loyalty_number: guestForm.guest_loyalty_number
          });

        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Guest added successfully"
        });
      }

      setGuestForm({
        name: "",
        room_number: "",
        room_type: "",
        guest_loyalty_number: ""
      });
      setEditingGuest(null);
      setIsAddGuestDrawerOpen(false);
      
      queryClient.invalidateQueries({ queryKey: ['guests', accommodation.id] });
    } catch (error) {
      console.error("Error saving guest:", error);
      toast({
        title: "Error",
        description: "Failed to save guest information",
        variant: "destructive"
      });
    }
  };

  const handleDeleteGuest = async (guestId: string) => {
    try {
      const { error } = await supabase
        .from('accommodation_guests')
        .delete()
        .eq('id', guestId);

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Guest removed successfully"
      });
      
      queryClient.invalidateQueries({ queryKey: ['guests', accommodation.id] });
    } catch (error) {
      console.error("Error deleting guest:", error);
      toast({
        title: "Error",
        description: "Failed to remove guest",
        variant: "destructive"
      });
    }
  };

  const handleEditGuest = (guest: GuestType) => {
    setEditingGuest(guest);
    setGuestForm({
      name: guest.name || "",
      room_number: guest.room_number || "",
      room_type: guest.room_type || "",
      guest_loyalty_number: guest.guest_loyalty_number || ""
    });
    setIsAddGuestDrawerOpen(true);
  };

  return (
    <div className="h-[calc(100vh-8rem)]">
      <ScrollArea className="h-full">
        <div className="bg-white rounded-lg space-y-6 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">{accommodation.accommodation_name}</h2>
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
                      This will permanently delete this accommodation from the trip. This action cannot be undone.
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
            {accommodation.accommodation_feature_image && (
              <img
                src={accommodation.accommodation_feature_image}
                alt={accommodation.accommodation_name}
                className="w-full h-48 object-cover rounded-lg"
              />
            )}

            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Location</h3>
              <div className="space-y-1">
                <p>{accommodation.accommodation_address}</p>
                {(accommodation.accommodation_city || accommodation.accommodation_country) && (
                  <p>
                    {accommodation.accommodation_city}
                    {accommodation.accommodation_city && accommodation.accommodation_country && ", "}
                    {accommodation.accommodation_country}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Check-in</h3>
                <div className="space-y-1">
                  <p>{accommodation.accommodation_arrival_date}</p>
                  {accommodation.accommodation_checkin_time && (
                    <p>Time: {accommodation.accommodation_checkin_time}</p>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Check-out</h3>
                <div className="space-y-1">
                  <p>{accommodation.accommodation_departure_date}</p>
                  {accommodation.accommodation_checkout_time && (
                    <p>Time: {accommodation.accommodation_checkout_time}</p>
                  )}
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Stay Details</h3>
              <div className="space-y-1">
                {accommodation.accommodation_nights_stay && (
                  <p>{accommodation.accommodation_nights_stay} nights stay</p>
                )}
                {accommodation.accommodation_number_of_rooms && (
                  <p>{accommodation.accommodation_number_of_rooms} rooms booked</p>
                )}
                {accommodation.accommodation_confirmation_number && (
                  <p>Reference: {accommodation.accommodation_confirmation_number}</p>
                )}
              </div>
            </div>

            {accommodation.accommodation_description && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Description</h3>
                <p>{accommodation.accommodation_description}</p>
              </div>
            )}

            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Contact Information</h3>
              <div className="space-y-1">
                {accommodation.accommodation_phone && (
                  <p>Phone: {accommodation.accommodation_phone}</p>
                )}
                {accommodation.accommodation_email && (
                  <p>Email: {accommodation.accommodation_email}</p>
                )}
                {accommodation.accommodation_website && (
                  <p>Website: {accommodation.accommodation_website}</p>
                )}
              </div>
            </div>

            {accommodation.accommodation_notes && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Notes</h3>
                <p>{accommodation.accommodation_notes}</p>
              </div>
            )}

            {facilities && (
              <FacilitiesSection 
                accommodationId={accommodation.id} 
                facilities={facilities} 
                onFacilityChange={refetchFacilities} 
              />
            )}

            <DocumentsSection 
              documents={Array.isArray(accommodation?.accommodation_documents) ? accommodation.accommodation_documents : []}
              title="Accommodation Documents"
              onDocumentSelect={handleAddDocument}
            />

            {accommodation.accommodation_gallery_images && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Gallery</h3>
                <p className="text-sm">
                  {Array.isArray(accommodation.accommodation_gallery_images) 
                    ? accommodation.accommodation_gallery_images.length + " images available"
                    : "Gallery available"}
                </p>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-muted-foreground">Guests</h3>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    setEditingGuest(null);
                    setGuestForm({
                      name: "",
                      room_number: "",
                      room_type: "",
                      guest_loyalty_number: ""
                    });
                    setIsAddGuestDrawerOpen(true);
                  }}
                >
                  <UserPlus className="h-4 w-4 mr-1" />
                  Add Guest
                </Button>
              </div>
              <div className="mt-2 space-y-2">
                {guests && guests.length > 0 ? (
                  guests.map((guest) => (
                    <div key={guest.id} className="bg-white p-3 rounded-md shadow-sm border">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium">{guest.name}</div>
                          {guest.room_number && (
                            <div className="text-sm text-muted-foreground">
                              Room: {guest.room_number}
                              {guest.room_type && ` - ${guest.room_type}`}
                            </div>
                          )}
                          {guest.guest_loyalty_number && (
                            <div className="text-sm text-muted-foreground">
                              Loyalty #: {guest.guest_loyalty_number}
                            </div>
                          )}
                        </div>
                        <div className="flex gap-1">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleEditGuest(guest)}
                          >
                            <Edit className="h-3 w-3 text-gray-500" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleDeleteGuest(guest.id)}
                          >
                            <Trash2 className="h-3 w-3 text-red-500" />
                          </Button>
                        </div>
                      </div>
                      {guest.notes && (
                        <p className="text-sm text-muted-foreground mt-2">{guest.notes}</p>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground italic">No guests added yet</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>

      <Sheet open={isAddGuestDrawerOpen} onOpenChange={setIsAddGuestDrawerOpen}>
        <SheetContent className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>{editingGuest ? "Edit Guest" : "Add Guest"}</SheetTitle>
          </SheetHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Guest Name *</Label>
              <Input 
                id="name" 
                value={guestForm.name} 
                onChange={(e) => setGuestForm({...guestForm, name: e.target.value})}
                placeholder="Full name"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="room_number">Room Number</Label>
                <Input 
                  id="room_number" 
                  value={guestForm.room_number} 
                  onChange={(e) => setGuestForm({...guestForm, room_number: e.target.value})}
                  placeholder="e.g., 101"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="room_type">Room Type</Label>
                <Select 
                  value={guestForm.room_type} 
                  onValueChange={(value) => setGuestForm({...guestForm, room_type: value})}
                >
                  <SelectTrigger id="room_type">
                    <SelectValue placeholder="Select room type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Standard">Standard</SelectItem>
                    <SelectItem value="Deluxe">Deluxe</SelectItem>
                    <SelectItem value="Suite">Suite</SelectItem>
                    <SelectItem value="Executive">Executive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="loyalty">Loyalty Number</Label>
              <Input 
                id="loyalty" 
                value={guestForm.guest_loyalty_number} 
                onChange={(e) => setGuestForm({...guestForm, guest_loyalty_number: e.target.value})}
                placeholder="Loyalty program number"
              />
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setIsAddGuestDrawerOpen(false);
                  setEditingGuest(null);
                  setGuestForm({
                    name: "",
                    room_number: "",
                    room_type: "",
                    guest_loyalty_number: ""
                  });
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleSaveGuest}>Save Guest</Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {isEditDrawerOpen && (
        <ActivitySideDrawer
          isOpen={isEditDrawerOpen}
          onClose={() => setIsEditDrawerOpen(false)}
          activityType="accommodation"
          tripId={accommodation.trip_id}
          activity={{
            ...accommodation,
            type: "accommodation",
            title: accommodation.accommodation_name,
            date: accommodation.accommodation_arrival_date ? new Date(accommodation.accommodation_arrival_date) : new Date()
          }}
          mode="edit"
          onSave={() => setIsEditDrawerOpen(false)}
        />
      )}
    </div>
  )
}
