import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/lib/auth";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { X, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { syncService } from "@/lib/syncService";
import { offlineStorage } from "@/lib/offlineStorage";

interface PlannerTripFormProps {
  initialData?: any;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  onDelete?: () => void;
}

interface PlannerTripFormValues {
  title: string;
  description: string;
  column_id: string;
  links: { title: string; url: string }[];
  notes: { title: string; content: string }[];
  trip_id: string;
  departureDate: string | null;
  tags: { id: string; name: string }[];
}

export function PlannerTripForm({ initialData, onSubmit, onCancel, onDelete }: PlannerTripFormProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [creatingTag, setCreatingTag] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const form = useForm<PlannerTripFormValues>({
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      column_id: initialData?.column_id || "",
      links: initialData?.links || [],
      trip_id: initialData?.trip_id || "",
      departureDate: initialData?.departureDate || null,
      tags: initialData?.tags || [],
    },
    mode: "onChange",
  });

  // Fetch columns
  const { data: columns = [] } = useQuery({
    queryKey: ['planner-columns'],
    queryFn: async () => {
      if (!user) return [];
      
      // Try to get from offline storage first, then fallback to server
      try {
        const offlineColumns = await offlineStorage.getColumns(user.id);
        if (offlineColumns.length > 0) {
          return offlineColumns;
        }
      } catch (error) {
        console.log('No offline columns found, fetching from server');
      }

      const { data, error } = await supabase
        .from('planner_columns')
        .select('*')
        .eq('user_id', user.id)
        .order('position');
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Fetch trips for linkage
  const { data: trips = [] } = useQuery({
    queryKey: ['trips'],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('trips')
        .select('id, trip_name')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Fetch custom fields for the user
  const { data: customFields = [] } = useQuery({
    queryKey: ["planner-fields"],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("planner_fields")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at");
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Add state for custom field values
  const [customFieldValues, setCustomFieldValues] = useState<{ [fieldId: string]: any }>(
    () => {
      // If editing, prefill with initialData.customFieldValues if available
      if (initialData?.customFieldValues) return initialData.customFieldValues;
      return {};
    }
  );

  // Field arrays for links
  const {
    fields: linkFields,
    append: appendLink,
    remove: removeLink,
  } = useFieldArray({
    control: form.control,
    name: "links",
  });

  // Field arrays for notes
  const {
    fields: noteFields,
    append: appendNote,
    remove: removeNote,
  } = useFieldArray({
    control: form.control,
    name: "notes",
  });

  // Field arrays for tags
  const {
    fields: tagFields,
    append: appendTag,
    remove: removeTag,
  } = useFieldArray({
    control: form.control,
    name: "tags",
  });

  // Fetch tags
  const { data: availableTags = [] } = useQuery({
    queryKey: ['planner-tags'],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('planner_tags')
        .select('*')
        .eq('user_id', user.id)
        .order('name');
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const handleAddTag = async () => {
    if (!newTagName.trim() || !user) return;
    setCreatingTag(true);
    try {
      const { data, error } = await supabase
        .from('planner_tags')
        .insert([{ name: newTagName.trim(), user_id: user.id }])
        .select()
        .single();
      if (error) throw error;
      appendTag(data);
      setNewTagName("");
      queryClient.invalidateQueries({ queryKey: ['planner-tags'] });
    } catch (error) {
      console.error('Error creating tag:', error);
      toast({
        title: "Error",
        description: "Failed to create tag",
        variant: "destructive",
      });
    } finally {
      setCreatingTag(false);
    }
  };

  const handleRemoveTag = (tagId: string) => {
    removeTag(tagFields.findIndex(tag => tag.id === tagId));
  };

  const handleDelete = async () => {
    if (!initialData?.id) return;
    setIsDeleting(true);
    try {
      // Use sync service for deletion
      await syncService.deleteTripOptimistic(initialData.id);
      
      toast({
        title: "Success",
        description: "Trip deleted successfully",
      });

      queryClient.invalidateQueries({ queryKey: ['planner-trips'] });
      onDelete?.();
      navigate('/planner');
    } catch (error) {
      console.error('Error deleting trip:', error);
      toast({
        title: "Error",
        description: "Failed to delete trip",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  function renderCustomFieldInput(field: any) {
    const onChange = (val: any) => setCustomFieldValues(v => ({ ...v, [field.id]: val }));
    const value = customFieldValues[field.id] || '';

    switch (field.type) {
      case 'text':
        return (
          <Input
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder={field.placeholder || ''}
          />
        );
      case 'textarea':
        return (
          <Textarea
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder={field.placeholder || ''}
          />
        );
      case 'number':
        return (
          <Input
            type="number"
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder={field.placeholder || ''}
          />
        );
      case 'date':
        return (
          <Input
            type="date"
            value={value}
            onChange={e => onChange(e.target.value)}
          />
        );
      case 'checkbox':
        return (
          <input
            type="checkbox"
            checked={value}
            onChange={e => onChange(e.target.checked)}
            className="h-4 w-4"
          />
        );
      default:
        return null;
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(async (data) => {
          setIsSubmitting(true);
          try {
            let tripId = initialData?.id;
            let trip;

            if (!tripId) {
              // Create trip using sync service
              const tripData = {
                title: data.title,
                description: data.description,
                column_id: data.column_id,
                user_id: user.id,
                trip_id: data.trip_id || null,
                departureDate: data.departureDate || null,
              };

              // Use sync service for optimistic creation
              tripId = await syncService.createTripOptimistic(tripData);
              trip = { id: tripId };

              toast({
                title: "Trip Created",
                description: "Trip created successfully. It will sync when online.",
              });
            } else {
              // Update trip using sync service
              const updates = {
                title: data.title,
                description: data.description,
                column_id: data.column_id,
                trip_id: data.trip_id || null,
                departureDate: data.departureDate || null,
              };

              await syncService.updateTripOptimistic(tripId, updates);
              trip = { id: tripId };

              toast({
                title: "Trip Updated",
                description: "Trip updated successfully. It will sync when online.",
              });
            }

            // Note: Links, tags, and custom fields will need to be handled separately
            // For now, we'll focus on the core trip data
            // These can be added in a future iteration

            queryClient.invalidateQueries({ queryKey: ['planner-trips'] });
            setIsSubmitting(false);
            onSubmit({ ...data, id: tripId, trip });
          } catch (error) {
            console.error('Error saving trip:', error);
            setIsSubmitting(false);
            toast({
              title: 'Error',
              description: 'Failed to save trip',
              variant: 'destructive',
            });
          }
        })}
        className="space-y-6 mt-6 max-h-[calc(100vh-8rem)] overflow-y-auto pr-4"
      >
        <FormField
          control={form.control}
          name="title"
          rules={{ required: "Title is required" }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea {...field} className="min-h-[100px]" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="departureDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Departure Date</FormLabel>
              <FormControl>
                <Input type="date" {...field} value={field.value || ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* Column select */}
        <FormField
          control={form.control}
          name="column_id"
          rules={{ required: "Please select a status" }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {columns.map((column) => (
                    <SelectItem key={column.id} value={column.id}>
                      {column.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* Trip linkage select */}
        <FormField
          control={form.control}
          name="trip_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Linked Trip</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select trip to link" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {trips.map((trip) => (
                    <SelectItem key={trip.id} value={trip.id}>
                      {trip.trip_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Custom Fields */}
        {customFields.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Custom Fields</h3>
            {customFields.map((field) => (
              <div key={field.id} className="space-y-2">
                <Label>{field.title}</Label>
                {renderCustomFieldInput(field)}
              </div>
            ))}
          </div>
        )}

        {/* Links section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Links</h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => appendLink({ title: "", url: "" })}
            >
              Add Link
            </Button>
          </div>
          {linkFields.map((field, index) => (
            <div key={field.id} className="flex gap-2">
              <Input
                placeholder="Link title"
                value={field.title}
                onChange={(e) => {
                  const newLinks = [...linkFields];
                  newLinks[index].title = e.target.value;
                  form.setValue("links", newLinks);
                }}
              />
              <Input
                placeholder="URL"
                value={field.url}
                onChange={(e) => {
                  const newLinks = [...linkFields];
                  newLinks[index].url = e.target.value;
                  form.setValue("links", newLinks);
                }}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeLink(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>

        {/* Notes section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Notes</h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => appendNote({ title: "", content: "" })}
            >
              Add Note
            </Button>
          </div>
          {noteFields.map((field, index) => (
            <div key={field.id} className="space-y-2">
              <Input
                placeholder="Note title (optional)"
                value={field.title}
                onChange={(e) => {
                  const newNotes = [...noteFields];
                  newNotes[index].title = e.target.value;
                  form.setValue("notes", newNotes);
                }}
              />
              <Textarea
                placeholder="Note content"
                value={field.content}
                onChange={(e) => {
                  const newNotes = [...noteFields];
                  newNotes[index].content = e.target.value;
                  form.setValue("notes", newNotes);
                }}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeNote(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>

        {/* Tags section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Tags</h3>
            <div className="flex gap-2">
              <Input
                placeholder="New tag name"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                className="w-32"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddTag}
                disabled={creatingTag || !newTagName.trim()}
              >
                {creatingTag ? "Adding..." : "Add"}
              </Button>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {availableTags.map((tag) => (
              <Badge
                key={tag.id}
                variant={tagFields.some(t => t.id === tag.id) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => {
                  if (tagFields.some(t => t.id === tag.id)) {
                    handleRemoveTag(tag.id);
                  } else {
                    appendTag(tag);
                  }
                }}
              >
                {tag.name}
              </Badge>
            ))}
          </div>
          {tagFields.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <span className="text-sm text-muted-foreground">Selected:</span>
              {tagFields.map((tag) => (
                <Badge key={tag.id} variant="default">
                  {tag.name}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag.id)}
                    className="ml-1"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-2 justify-end sticky bottom-0 bg-gray-50 pt-4 border-t">
          {initialData?.id && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  type="button" 
                  variant="ghost"
                  disabled={isDeleting}
                >
                  {isDeleting ? "Deleting..." : "Delete Trip"}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the trip
                    and all associated data including links, notes, and tags.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete}>
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save"}
          </Button>
        </div>
      </form>
    </Form>
  );
} 