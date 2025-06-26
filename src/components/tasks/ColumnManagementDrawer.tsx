import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, GripVertical, Edit, Check, X } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DndContext, DragEndEvent, PointerSensor, useSensor, useSensors, DragStartEvent } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface ColumnManagementDrawerProps {
  open: boolean;
  onClose: () => void;
}

interface SortableColumnItemProps {
  column: any;
  onDelete: (id: string) => void;
  onUpdateTitle: (id: string, newTitle: string) => void;
}

function SortableColumnItem({ column, onDelete, onUpdateTitle }: SortableColumnItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(column.title);
  
  // Check if this is the Archive column
  const isArchiveColumn = column.title === 'Archive';
  
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

  const handleSaveTitle = () => {
    if (editTitle.trim() && editTitle !== column.title) {
      onUpdateTitle(column.id, editTitle.trim());
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditTitle(column.title);
    setIsEditing(false);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center justify-between p-3 bg-white border rounded-lg ${isDragging ? 'opacity-50 shadow-lg' : ''}`}
    >
      <div className="flex items-center gap-3 flex-1">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab hover:cursor-grabbing p-1 rounded"
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </div>
        
        {isEditing ? (
          <div className="flex items-center gap-2 flex-1">
            <Input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSaveTitle();
                } else if (e.key === 'Escape') {
                  handleCancelEdit();
                }
              }}
              autoFocus
              className="flex-1"
            />
            <Button
              size="sm"
              variant="ghost"
              onClick={handleSaveTitle}
              className="h-8 w-8 p-0"
            >
              <Check className="h-4 w-4 text-green-600" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleCancelEdit}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4 text-gray-500" />
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2 flex-1">
            <span className={`text-sm font-medium flex-1 ${isArchiveColumn ? 'text-gray-500' : ''}`}>
              {column.title}
              {isArchiveColumn && <span className="text-xs text-gray-400 ml-2">(System)</span>}
            </span>
            {!isArchiveColumn && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsEditing(true)}
                className="h-8 w-8 p-0"
              >
                <Edit className="h-4 w-4 text-muted-foreground" />
              </Button>
            )}
          </div>
        )}
      </div>
      
      {!isArchiveColumn && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(column.id)}
          className="h-8 w-8"
        >
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      )}
    </div>
  );
}

export function ColumnManagementDrawer({ open, onClose }: ColumnManagementDrawerProps) {
  const [newColumnName, setNewColumnName] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
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
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const addColumn = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase
        .from('planner_columns')
        .insert([{
          title: newColumnName,
          position: columns.length,
          user_id: user.id
        }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['planner-columns'] });
      setNewColumnName("");
      toast({
        title: "Success",
        description: "Column added successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add column",
        variant: "destructive",
      });
    },
  });

  const deleteColumn = useMutation({
    mutationFn: async (columnId: string) => {
      const { error } = await supabase
        .from('planner_columns')
        .delete()
        .eq('id', columnId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['planner-columns'] });
      toast({
        title: "Success",
        description: "Column deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete column",
        variant: "destructive",
      });
    },
  });

  const updateColumnTitle = useMutation({
    mutationFn: async ({ columnId, newTitle }: { columnId: string; newTitle: string }) => {
      const { error } = await supabase
        .from('planner_columns')
        .update({ title: newTitle })
        .eq('id', columnId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['planner-columns'] });
      toast({
        title: "Success",
        description: "Column title updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update column title",
        variant: "destructive",
      });
    },
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

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || active.id === over.id) return;

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
  };

  const handleAddColumn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newColumnName.trim()) return;
    addColumn.mutate();
  };

  const handleUpdateTitle = (columnId: string, newTitle: string) => {
    updateColumnTitle.mutate({ columnId, newTitle });
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Customize Columns</SheetTitle>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-8rem)]">
          <div className="mt-6 space-y-6">
            <form onSubmit={handleAddColumn} className="flex gap-2">
              <Input
                value={newColumnName}
                onChange={(e) => setNewColumnName(e.target.value)}
                placeholder="New column name"
              />
              <Button type="submit" disabled={!newColumnName.trim()}>
                <Plus className="h-4 w-4 mr-2" />
                Add
              </Button>
            </form>

            <div className="space-y-3">
              <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
                <SortableContext 
                  items={columns.map(col => col.id)} 
                  strategy={verticalListSortingStrategy}
                >
                  {columns.map((column) => (
                    <SortableColumnItem
                      key={column.id}
                      column={column}
                      onDelete={deleteColumn.mutate}
                      onUpdateTitle={handleUpdateTitle}
                    />
                  ))}
                </SortableContext>
              </DndContext>
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
