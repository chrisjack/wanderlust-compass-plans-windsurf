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
  });

  // Fetch columns
  const { data: columns = [] } = useQuery({
    queryKey: ['planner-columns'],
    queryFn: async () => {
      if (!user) return [];
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

  const handleAddTag = async () => {
    if (!newTagName.trim()) return;
    setCreatingTag(true);
    try {
      // Create new tag
      const { data: tag, error } = await supabase
        .from('planner_tags')
        .insert({ 
          name: newTagName.trim()
        })
        .select()
        .single();
      
      if (error) {
        console.error('Error creating tag:', error);
        toast({
          title: "Error",
          description: "Failed to create tag",
          variant: "destructive",
        });
        return;
      }

      if (!tag) {
        throw new Error('No tag data returned');
      }

      // Add to form
      const currentTags = form.getValues('tags') || [];
      form.setValue('tags', [...currentTags, tag]);
      setNewTagName("");
      
      // Invalidate queries to refresh the UI
      queryClient.invalidateQueries({ queryKey: ['planner-tags'] });
      
      toast({
        title: "Success",
        description: "Tag added successfully",
      });
    } catch (error) {
      console.error('Error in handleAddTag:', error);
      toast({
        title: "Error",
        description: "Failed to add tag",
        variant: "destructive",
      });
    } finally {
      setCreatingTag(false);
    }
  };

  const handleRemoveTag = (tagId: string) => {
    const currentTags = form.getValues('tags') || [];
    form.setValue('tags', currentTags.filter(tag => tag.id !== tagId));
  };

  const handleDelete = async () => {
    if (!initialData?.id) return;
    setIsDeleting(true);
    try {
      // Delete related records first
      await supabase.from('planner_trip_links').delete().eq('trip_id', initialData.id);
      await supabase.from('planner_trip_texts').delete().eq('trip_id', initialData.id);
      await supabase.from('planner_trip_tags').delete().eq('trip_id', initialData.id);
      await supabase.from('planner_trip_history').delete().eq('trip_id', initialData.id);
      
      // Delete the trip
      const { error } = await supabase
        .from('planner_trips')
        .delete()
        .eq('id', initialData.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Trip deleted successfully",
      });

      queryClient.invalidateQueries({ queryKey: ['planner-trips'] });
      onDelete?.();
      navigate('/planner'); // Navigate back to the planner page
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

  // Helper to render the right input for each field type
  function renderCustomFieldInput(field: any) {
    const value = customFieldValues[field.id] ?? "";
    const onChange = (val: any) => setCustomFieldValues(v => ({ ...v, [field.id]: val }));
    switch (field.type) {
      case "text":
      case "email":
      case "phone":
      case "url":
      case "currency":
        return (
          <Input
            type={field.type === "currency" ? "number" : field.type}
            value={value}
            onChange={e => onChange(e.target.value)}
          />
        );
      case "number":
        return (
          <Input
            type="number"
            value={value}
            onChange={e => onChange(e.target.value)}
          />
        );
      case "date":
        return (
          <Input
            type="date"
            value={value}
            onChange={e => onChange(e.target.value)}
          />
        );
      case "checkbox":
        return (
          <input
            type="checkbox"
            checked={!!value}
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
              // Create trip
              const { data: tripData, error } = await supabase
                .from('planner_trips')
                .insert({
                  title: data.title,
                  description: data.description,
                  column_id: data.column_id,
                  user_id: user.id,
                  departureDate: data.departureDate,
                  trip_id: data.trip_id,
                })
                .select()
                .single();
              if (error) throw error;
              tripId = tripData.id;
              trip = tripData;
            } else {
              // Update trip
              const { error } = await supabase
                .from('planner_trips')
                .update({
                  title: data.title,
                  description: data.description,
                  column_id: data.column_id,
                  departureDate: data.departureDate,
                  trip_id: data.trip_id,
                })
                .eq('id', tripId);
              if (error) throw error;
              trip = { id: tripId };
            }

            // Save custom field values
            const customFieldOps = Object.entries(customFieldValues || {}).map(async ([fieldId, value]) => {
              // Upsert: if value exists for this trip/field, update; else insert
              const { data: existing, error: fetchError } = await supabase
                .from('planner_trip_field_values')
                .select('id')
                .eq('trip_id', tripId)
                .eq('field_id', fieldId)
                .single();
              if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;
              if (existing) {
                // Update
                const { error } = await supabase
                  .from('planner_trip_field_values')
                  .update({ value: value?.toString() ?? null, updated_at: new Date().toISOString() })
                  .eq('id', existing.id);
                if (error) throw error;
              } else {
                // Insert
                const { error } = await supabase
                  .from('planner_trip_field_values')
                  .insert({
                    trip_id: tripId,
                    field_id: fieldId,
                    value: value?.toString() ?? null,
                  });
                if (error) throw error;
              }
            });
            await Promise.all(customFieldOps);

            // Add links
            if (data.links?.length) {
              await supabase.from('planner_trip_links').insert(
                data.links.filter((l: any) => l.title && l.url).map((l: any) => ({ trip_id: tripId, title: l.title, url: l.url }))
              );
            }
            // Add tags: first delete all, then insert
            await supabase.from('planner_trip_tags').delete().eq('trip_id', tripId);
            if (data.tags?.length) {
              await supabase.from('planner_trip_tags').insert(
                data.tags.map((tag: any) => ({ trip_id: tripId, tag_id: tag.id }))
              );
            }
            queryClient.invalidateQueries({ queryKey: ['planner-trips'] });
            setIsSubmitting(false);
            onSubmit(data);
          } catch (error) {
            setIsSubmitting(false);
            toast({
              title: 'Error',
              description: 'Failed to save trip or custom fields',
              variant: 'destructive',
            });
          }
        })}
        className="space-y-6 mt-6 max-h-[calc(100vh-8rem)] overflow-y-auto pr-4"
      >
        <FormField
          control={form.control}
          name="title"
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
        {/* Column select */}
        <FormField
          control={form.control}
          name="column_id"
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
        {/* Tags section */}
        <FormItem>
          <FormLabel>Tags</FormLabel>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Enter tag name"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                disabled={creatingTag}
              />
              <Button
                type="button"
                onClick={handleAddTag}
                disabled={creatingTag || !newTagName.trim()}
              >
                Add Tag
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {form.watch('tags')?.map((tag) => (
                <Badge
                  key={tag.id}
                  variant="secondary"
                  className="flex items-center gap-1 px-3 py-1"
                >
                  {tag.name}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag.id)}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        </FormItem>
        {/* Links dynamic fields */}
        <FormItem>
          <FormLabel>Links</FormLabel>
          <div className="space-y-4">
            {linkFields.map((field, idx) => (
              <div key={field.id} className="space-y-2 p-4 border rounded-md">
                <div className="space-y-2">
                  <div>
                    <label className="text-sm font-medium">Title</label>
                    <Input
                      placeholder="Enter link title"
                      {...form.register(`links.${idx}.title`)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">URL</label>
                    <Input
                      placeholder="Enter URL"
                      {...form.register(`links.${idx}.url`)}
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button type="button" variant="destructive" size="sm" onClick={() => removeLink(idx)}>
                    Remove Link
                  </Button>
                </div>
              </div>
            ))}
            <Button type="button" size="sm" className="w-full" onClick={() => appendLink({ title: "", url: "" })}>
              Add Link
            </Button>
          </div>
        </FormItem>
        {/* Custom Fields */}
        {customFields.length > 0 && (
          <div className="space-y-4">
            <h4 className="font-semibold">Custom Fields</h4>
            {customFields.map((field: any) => (
              <FormItem key={field.id}>
                <FormLabel>{field.title}</FormLabel>
                <FormControl>
                  {renderCustomFieldInput(field)}
                </FormControl>
              </FormItem>
            ))}
          </div>
        )}
        <div className="flex gap-2 justify-end sticky bottom-0 bg-white pt-4 border-t">
          {initialData?.id && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  type="button" 
                  variant="destructive"
                  disabled={isDeleting}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
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
            Save
          </Button>
        </div>
      </form>
    </Form>
  );
} 