import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Trash2, Edit, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const FIELD_TYPES = [
  { value: "text", label: "Text" },
  { value: "number", label: "Number" },
  { value: "date", label: "Date" },
  { value: "currency", label: "Currency" },
  { value: "email", label: "Email" },
  { value: "phone", label: "Phone" },
  { value: "url", label: "URL" },
  { value: "checkbox", label: "Checkbox" },
];

export function PlannerFieldsDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [newTitle, setNewTitle] = useState("");
  const [newType, setNewType] = useState("text");
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editType, setEditType] = useState("text");
  const [isUpdating, setIsUpdating] = useState(false);

  // Fetch fields
  const { data: fields = [], isLoading, isError } = useQuery({
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

  // Add field
  const addField = useMutation({
    mutationFn: async () => {
      setIsAdding(true);
      const { error } = await supabase
        .from("planner_fields")
        .insert({
          user_id: user.id,
          title: newTitle.trim(),
          type: newType,
        });
      setIsAdding(false);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["planner-fields"] });
      setNewTitle("");
      setNewType("text");
      toast({ title: "Field added" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to add field", variant: "destructive" });
    },
  });

  // Delete field
  const deleteField = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("planner_fields")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["planner-fields"] });
      toast({ title: "Field deleted" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete field", variant: "destructive" });
    },
  });

  // Update field
  const updateField = useMutation({
    mutationFn: async ({ id, title, type }: { id: string; title: string; type: string }) => {
      setIsUpdating(true);
      const { error } = await supabase
        .from("planner_fields")
        .update({ title, type, updated_at: new Date().toISOString() })
        .eq("id", id);
      setIsUpdating(false);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["planner-fields"] });
      setEditingId(null);
      setEditTitle("");
      setEditType("text");
      toast({ title: "Field updated" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update field", variant: "destructive" });
    },
  });

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-[30%]">
        <SheetHeader>
          <SheetTitle>Customize Fields</SheetTitle>
        </SheetHeader>
        <div className="mt-6 space-y-6">
          <form
            onSubmit={e => {
              e.preventDefault();
              if (!newTitle.trim()) return;
              addField.mutate();
            }}
            className="flex gap-2"
          >
            <Input
              placeholder="Field title"
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              disabled={isAdding}
            />
            <Select value={newType} onValueChange={setNewType}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FIELD_TYPES.map(ft => (
                  <SelectItem key={ft.value} value={ft.value}>{ft.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button type="submit" disabled={isAdding || !newTitle.trim()}>
              Add
            </Button>
          </form>

          <div>
            <h3 className="font-semibold mb-2">Your Fields</h3>
            {isLoading ? (
              <div className="text-gray-400 text-sm">Loading...</div>
            ) : isError ? (
              <div className="text-red-500 text-sm">Error loading fields</div>
            ) : fields.length === 0 ? (
              <div className="text-gray-400 text-sm">No custom fields yet.</div>
            ) : (
              <ul className="space-y-2">
                {fields.map((field: any) => (
                  <li key={field.id} className="flex items-center justify-between bg-gray-50 border rounded px-3 py-2">
                    {editingId === field.id ? (
                      <>
                        <div className="flex items-center gap-2">
                          <Input
                            value={editTitle}
                            onChange={e => setEditTitle(e.target.value)}
                            className="w-32"
                            disabled={isUpdating}
                          />
                          <Select value={editType} onValueChange={setEditType}>
                            <SelectTrigger className="w-28">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {FIELD_TYPES.map(ft => (
                                <SelectItem key={ft.value} value={ft.value}>{ft.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => updateField.mutate({ id: field.id, title: editTitle.trim(), type: editType })}
                            className="h-8 w-8"
                            disabled={isUpdating || !editTitle.trim()}
                          >
                            <Check className="h-4 w-4 text-green-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => { setEditingId(null); setEditTitle(""); setEditType("text"); }}
                            className="h-8 w-8"
                            disabled={isUpdating}
                          >
                            <X className="h-4 w-4 text-gray-500" />
                          </Button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <span className="font-medium">{field.title}</span>
                          <span className="ml-2 text-xs text-gray-500">[{field.type}]</span>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => { setEditingId(field.id); setEditTitle(field.title); setEditType(field.type); }}
                            className="h-8 w-8"
                          >
                            <Edit className="h-4 w-4 text-muted-foreground" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteField.mutate(field.id)}
                            className="h-8 w-8"
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
} 