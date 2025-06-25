import { useState } from "react";
import { Plus, Edit, Trash2, Bed, Wifi, ShowerHead, Utensils, Car, Tv, AirVent, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

const facilityIcons: Record<string, any> = {
  "Bed": Bed,
  "WiFi": Wifi,
  "Shower": ShowerHead,
  "Restaurant": Utensils,
  "Parking": Car,
  "TV": Tv,
  "Air Conditioning": AirVent,
  "Room Service": Bell,
};

interface FacilitiesSectionProps {
  accommodationId: string;
  facilities: { id: string; facility_name: string }[];
  onFacilityChange: () => void;
}

export function FacilitiesSection({ accommodationId, facilities, onFacilityChange }: FacilitiesSectionProps) {
  const [newFacilities, setNewFacilities] = useState("");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingFacility, setEditingFacility] = useState<{ id: string; facility_name: string } | null>(null);
  const [editedFacilityName, setEditedFacilityName] = useState("");
  const [deletingFacilityId, setDeletingFacilityId] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false);

  const handleAddFacilities = async () => {
    if (!newFacilities.trim()) {
      toast({
        title: "Error",
        description: "Facility name cannot be empty",
        variant: "destructive",
      });
      return;
    }

    const facilitiesArray = newFacilities
      .split(',')
      .map(facility => facility.trim())
      .filter(facility => facility.length > 0);

    if (facilitiesArray.length === 0) {
      return;
    }

    const facilityObjects = facilitiesArray.map(facilityName => ({
      accommodation_id: accommodationId,
      facility_name: facilityName,
    }));

    try {
      const { error } = await supabase
        .from("accommodation_facilities")
        .insert(facilityObjects);

      if (error) {
        throw error;
      } else {
        toast({
          title: "Success",
          description: `${facilitiesArray.length} facilities added successfully`,
        });
        setNewFacilities("");
        setIsAddDrawerOpen(false);
        onFacilityChange();
      }
    } catch (error) {
      console.error("Error adding facilities:", error);
      toast({
        title: "Error",
        description: "Failed to add facilities",
        variant: "destructive",
      });
    }
  };

  const handleEditFacility = async () => {
    if (!editingFacility || !editedFacilityName.trim()) {
      toast({
        title: "Error",
        description: "Facility name cannot be empty",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from("accommodation_facilities")
        .update({ facility_name: editedFacilityName.trim() })
        .eq("id", editingFacility.id);

      if (error) {
        if (error.code === "23505") { // Unique constraint violation
          toast({
            title: "Error",
            description: "This facility already exists for this accommodation",
            variant: "destructive",
          });
        } else {
          throw error;
        }
      } else {
        toast({
          title: "Success",
          description: "Facility updated successfully",
        });
        setIsEditDialogOpen(false);
        setEditingFacility(null);
        onFacilityChange();
      }
    } catch (error) {
      console.error("Error updating facility:", error);
      toast({
        title: "Error",
        description: "Failed to update facility",
        variant: "destructive",
      });
    }
  };

  const handleDeleteFacility = async (facilityId: string) => {
    try {
      const { error } = await supabase
        .from("accommodation_facilities")
        .delete()
        .eq("id", facilityId);

      if (error) {
        throw error;
      } else {
        toast({
          title: "Success",
          description: "Facility deleted successfully",
        });
        setDeletingFacilityId(null);
        onFacilityChange();
      }
    } catch (error) {
      console.error("Error deleting facility:", error);
      toast({
        title: "Error",
        description: "Failed to delete facility",
        variant: "destructive",
      });
    }
  };

  const getFacilityIcon = (facilityName: string) => {
    for (const [key, IconComponent] of Object.entries(facilityIcons)) {
      if (facilityName.toLowerCase().includes(key.toLowerCase())) {
        return <IconComponent className="h-4 w-4 mr-1" />;
      }
    }
    return null;
  };

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-muted-foreground">Facilities</h3>
        <div className="flex gap-2">
          <Sheet open={isAddDrawerOpen} onOpenChange={setIsAddDrawerOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[400px] sm:w-[540px]">
              <SheetHeader>
                <SheetTitle>Add Facilities</SheetTitle>
              </SheetHeader>
              <div className="py-6">
                <div className="space-y-2">
                  <Label htmlFor="facilities">Facilities</Label>
                  <Textarea
                    id="facilities"
                    value={newFacilities}
                    onChange={(e) => setNewFacilities(e.target.value)}
                    placeholder="WiFi, Pool, Gym, Restaurant, etc. (separate with commas)"
                    className="min-h-[100px]"
                  />
                  <p className="text-sm text-muted-foreground">
                    Example: WiFi, Pool, Restaurant, Parking
                  </p>
                </div>
                <div className="flex justify-end gap-2 mt-6">
                  <Button variant="outline" onClick={() => setIsAddDrawerOpen(false)}>Cancel</Button>
                  <Button onClick={handleAddFacilities}>Add Facilities</Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
          
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-1" />
                Manage
              </Button>
            </SheetTrigger>
            <SheetContent className="w-[400px] sm:w-[540px]">
              <SheetHeader>
                <SheetTitle>Manage Facilities</SheetTitle>
              </SheetHeader>
              <div className="py-6">
                {facilities && facilities.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Facility</TableHead>
                        <TableHead className="w-[100px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {facilities.map((facility) => (
                        <TableRow key={facility.id}>
                          <TableCell className="flex items-center">
                            {getFacilityIcon(facility.facility_name)}
                            {facility.facility_name}
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setEditingFacility(facility);
                                  setEditedFacilityName(facility.facility_name);
                                  setIsEditDialogOpen(true);
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-red-500 hover:text-red-700 hover:bg-red-100"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Facility</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete this facility? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDeleteFacility(facility.id)}
                                      className="bg-red-500 hover:bg-red-600"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">No facilities added yet</p>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
      
      {facilities && facilities.length > 0 ? (
        <div className="flex flex-wrap gap-2 mt-2">
          {facilities.map((facility) => (
            <div
              key={facility.id}
              className="flex items-center bg-white border rounded-md px-3 py-1 text-sm"
            >
              {getFacilityIcon(facility.facility_name)}
              <span>{facility.facility_name}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground italic">No facilities added yet</p>
      )}

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Facility</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-facility">Facility Name</Label>
              <Input
                id="edit-facility"
                value={editedFacilityName}
                onChange={(e) => setEditedFacilityName(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditDialogOpen(false);
                  setEditingFacility(null);
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleEditFacility}>Save</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
