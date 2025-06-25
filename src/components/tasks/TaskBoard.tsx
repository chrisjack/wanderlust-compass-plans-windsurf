import { useState, useCallback, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TaskColumn } from "./TaskColumn";
import { PlannerTripForm } from "./PlannerTripForm";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Settings2, Plus, Upload, GripVertical } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { ColumnManagementDrawer } from "./ColumnManagementDrawer";
import { Input } from "@/components/ui/input";
import { DndContext, DragEndEvent, DragOverEvent, PointerSensor, useSensor, useSensors, DragStartEvent } from "@dnd-kit/core";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { CSVImportForm } from "./CSVImportForm";
import { SortableContext, horizontalListSortingStrategy } from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { PlannerFieldsDrawer } from "./PlannerFieldsDrawer";

interface SortableColumnProps {
  column: any;
  children: React.ReactNode;
  onAddTask: () => void;
  search: string;
}

function SortableColumn({ column, children, onAddTask, search }: SortableColumnProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: column.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`w-[300px] flex-shrink-0 ${isDragging ? 'opacity-50' : ''}`}
    >
      <div className="flex items-center gap-2 mb-2">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab hover:cursor-grabbing p-1 rounded"
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </div>
        <h3 className="font-semibold text-lg">{column.title}</h3>
      </div>
      {children}
    </div>
  );
}

export function TaskBoard() {
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isFieldsOpen, setIsFieldsOpen] = useState(false);
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const { data: columns = [] } = useQuery({
    queryKey: ['planner-columns'],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('planner_columns')
        .select('*')
        .eq('user_id', user.id)
        .order('position');
      
      if (error) {
        console.error('Error fetching columns:', error);
        throw error;
      }

      console.log('Fetched columns:', data);
      return data;
    },
    enabled: !!user,
  });

  const updateColumnOrder = useMutation({
    mutationFn: async (columnUpdates: { id: string; position: number }[]) => {
      const updates = columnUpdates.map(update => 
        supabase
          .from('planner_columns')
          .update({ position: update.position })
          .eq('id', update.id)
      );
      
      await Promise.all(updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['planner-columns'] });
    },
  });

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    
    if (!over || active.id === over.id) return;

    // Check if this is a column drag (columns have a specific pattern or we can check the active element)
    const isColumnDrag = columns.some(col => col.id === active.id);
    
    if (isColumnDrag) {
      // Handle column reordering
      const activeIndex = columns.findIndex(col => col.id === active.id);
      const overIndex = columns.findIndex(col => col.id === over.id);

      if (activeIndex !== -1 && overIndex !== -1) {
        const newColumns = [...columns];
        const [movedColumn] = newColumns.splice(activeIndex, 1);
        newColumns.splice(overIndex, 0, movedColumn);

        // Update positions in database
        const columnUpdates = newColumns.map((col, index) => ({
          id: col.id,
          position: index + 1,
        }));

        try {
          await updateColumnOrder.mutateAsync(columnUpdates);
          toast({
            title: "Column order updated",
            description: "Columns have been reordered successfully",
          });
        } catch (error) {
          console.error('Error updating column order:', error);
          toast({
            title: "Error",
            description: "Failed to update column order",
            variant: "destructive",
          });
        }
      }
    } else {
      // Handle task dragging
      console.log('Task DragEnd:', { activeId: active.id, overId: over?.id });

      // Fetch the current trip to get the previous column_id
      const { data: tripData, error: fetchError } = await supabase
        .from('planner_trips')
        .select('column_id')
        .eq('id', active.id)
        .single();

      if (fetchError) {
        console.error('Error fetching trip:', fetchError);
        toast({
          title: "Error",
          description: "Failed to move trip (fetch)",
          variant: "destructive",
        });
        return;
      }

      const previousColumnId = tripData?.column_id;
      const newColumnId = over.id;

      // Only update if the column actually changed
      if (previousColumnId === newColumnId) return;

      const { error } = await supabase
        .from('planner_trips')
        .update({ column_id: newColumnId })
        .eq('id', active.id);

      if (error) {
        console.error('Error updating trip column:', error);
        toast({
          title: "Error",
          description: "Failed to move trip",
          variant: "destructive",
        });
        return;
      }

      // Insert into planner_trip_history
      const { error: historyError } = await supabase
        .from('planner_trip_history')
        .insert([
          {
            trip_id: active.id,
            column_id: newColumnId,
            previous_column_id: previousColumnId,
            user_id: user?.id,
          }
        ]);
      if (historyError) {
        console.error('Error inserting trip history:', historyError);
      }

      // Invalidate all planner-trips queries so UI updates
      queryClient.invalidateQueries({ queryKey: ['planner-trips'] });
      // Invalidate the timeline query for this trip so the timeline tab updates
      queryClient.invalidateQueries({ queryKey: ['planner-trip-history', active.id] });
    }
  };

  const updateTaskColumn = useMutation({
    mutationFn: async ({ taskId, newColumnId }: { taskId: string; newColumnId: string }) => {
      const { error } = await supabase
        .from('planner_trips')
        .update({ column_id: newColumnId })
        .eq('id', taskId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['planner-trips'] });
    },
  });

  return (
    <div className="h-full flex flex-col">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold">Trip Planner</h2>
          <Input
            className="w-64"
            placeholder="Search trips, clients, or tags..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setIsSettingsOpen(true)}
          >
            <Settings2 className="h-4 w-4 mr-2" />
            Customize Columns
          </Button>
          <Button
            variant="outline"
            onClick={() => setIsFieldsOpen(true)}
          >
            <Settings2 className="h-4 w-4 mr-2" />
            Customize Fields
          </Button>
          <Button
            variant="outline"
            onClick={() => setIsImportOpen(true)}
          >
            <Upload className="h-4 w-4 mr-2" />
            Import CSV
          </Button>
          <Button
            onClick={() => setIsTaskFormOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Trip
          </Button>
        </div>
      </div>

      {columns.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">No columns found. Add your first column to get started.</p>
            <Button onClick={() => setIsSettingsOpen(true)}>
              Add Column
            </Button>
          </div>
        </div>
      ) : (
        <DndContext 
          sensors={sensors} 
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="overflow-x-auto pb-4">
            <SortableContext 
              items={columns.map(col => col.id)} 
              strategy={horizontalListSortingStrategy}
            >
              <div className="flex gap-6 min-w-max">
                {columns.map((column) => (
                  <SortableColumn 
                    key={column.id} 
                    column={column}
                    onAddTask={() => setIsTaskFormOpen(true)}
                    search={search}
                  >
                    <TaskColumn 
                      column={column} 
                      onAddTask={() => setIsTaskFormOpen(true)}
                      search={search}
                    />
                  </SortableColumn>
                ))}
                <div className="w-[300px] flex-shrink-0">
                  <Button
                    variant="outline"
                    className="w-full h-32 border-dashed border-2 border-gray-300 flex flex-col items-center justify-center"
                    onClick={() => setIsSettingsOpen(true)}
                  >
                    <Plus className="h-6 w-6 mb-2" />
                    Add Column
                  </Button>
                </div>
              </div>
            </SortableContext>
          </div>
        </DndContext>
      )}

      <Sheet open={isTaskFormOpen} onOpenChange={setIsTaskFormOpen}>
        <SheetContent className="w-[30%]">
          <SheetHeader>
            <SheetTitle>Add New Trip</SheetTitle>
          </SheetHeader>
          <PlannerTripForm 
            onCancel={() => setIsTaskFormOpen(false)}
            onDelete={() => setIsTaskFormOpen(false)}
            onSubmit={async (data) => {
              // Create the trip
              const { data: trip, error } = await supabase
                .from('planner_trips')
                .insert({
                  title: data.title,
                  description: data.description,
                  column_id: data.column_id,
                  user_id: user.id,
                  departureDate: data.departureDate,
                })
                .select()
                .single();
              if (error) return;
              // Add links
              if (data.links?.length) {
                await supabase.from('planner_trip_links').insert(
                  data.links.filter((l: any) => l.title && l.url).map((l: any) => ({ trip_id: trip.id, title: l.title, url: l.url }))
                );
              }
              // Add notes
              if (data.notes?.length) {
                await supabase.from('planner_trip_texts').insert(
                  data.notes.filter((n: any) => n.content).map((n: any) => ({ trip_id: trip.id, content: n.content }))
                );
              }
              // Add tags
              if (data.tags?.length) {
                await supabase.from('planner_trip_tags').insert(
                  data.tags.map((tag: any) => ({ trip_id: trip.id, tag_id: tag.id }))
                );
              }
              queryClient.invalidateQueries({ queryKey: ['planner-trips'] });
              setIsTaskFormOpen(false);
            }}
          />
        </SheetContent>
      </Sheet>

      <ColumnManagementDrawer 
        open={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />

      <Sheet open={isImportOpen} onOpenChange={setIsImportOpen}>
        <SheetContent className="w-[40%]">
          <SheetHeader>
            <SheetTitle>Import Trips from CSV</SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            <CSVImportForm onClose={() => setIsImportOpen(false)} />
          </div>
        </SheetContent>
      </Sheet>

      <PlannerFieldsDrawer open={isFieldsOpen} onClose={() => setIsFieldsOpen(false)} />
    </div>
  );
}
