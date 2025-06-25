import { useState } from "react";
import { useForm } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
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
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";

interface Task {
  id?: string;
  title: string;
  description?: string | null;
  column_id: string;
  trip_id?: string | null;
  user_id?: string;
}

interface TaskFormProps {
  onClose: () => void;
  initialData?: Task | null;
}

export function TaskForm({ onClose, initialData }: TaskFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  const form = useForm({
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      column_id: initialData?.column_id || "",
      trip_id: initialData?.trip_id || "",
    },
  });

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

  const onSubmit = async (values: Task) => {
    if (!user) return;
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('planner_trips')
        .insert([{
          ...values,
          user_id: user.id,
        }]);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['planner-trips'] });
      toast({
        title: "Success",
        description: "Trip added successfully",
      });
      onClose();
    } catch (error) {
      console.error('Error adding trip:', error);
      toast({
        title: "Error",
        description: "Failed to add trip",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-6">
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
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="column_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
              >
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

        <FormField
          control={form.control}
          name="trip_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Trip</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select trip" />
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

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Adding..." : "Add Trip"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
