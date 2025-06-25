import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlannerTrip, PlannerTag, PlannerTripLink, PlannerTripText } from "@/integrations/supabase/types";
import { Link as LinkIcon, FileText, Tag, Plus, Trash2 } from "lucide-react";

interface TaskDetailsProps {
  task: PlannerTrip;
  open: boolean;
  onClose: () => void;
  onDelete: () => void;
}

export function TaskDetails({ task, open, onClose, onDelete }: TaskDetailsProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || "");
  const [newLinkTitle, setNewLinkTitle] = useState("");
  const [newLinkUrl, setNewLinkUrl] = useState("");
  const [newText, setNewText] = useState("");

  const handleSave = async () => {
    const { error } = await supabase
      .from('planner_trips')
      .update({
        title,
        description,
        updated_at: new Date().toISOString()
      })
      .eq('id', task.id);

    if (error) {
      console.error('Error updating trip:', error);
      toast({
        title: "Error",
        description: "Failed to update trip",
        variant: "destructive",
      });
      return;
    }

    queryClient.invalidateQueries({ queryKey: ['planner-trips'] });
    toast({
      title: "Success",
      description: "Trip updated successfully",
    });
  };

  const handleAddLink = async () => {
    if (!newLinkTitle.trim() || !newLinkUrl.trim()) return;

    const { error } = await supabase
      .from('planner_trip_links')
      .insert([{
        trip_id: task.id,
        title: newLinkTitle,
        url: newLinkUrl
      }]);

    if (error) {
      console.error('Error adding link:', error);
      toast({
        title: "Error",
        description: "Failed to add link",
        variant: "destructive",
      });
      return;
    }

    queryClient.invalidateQueries({ queryKey: ['planner-trips'] });
    setNewLinkTitle("");
    setNewLinkUrl("");
    toast({
      title: "Success",
      description: "Link added successfully",
    });
  };

  const handleRemoveLink = async (linkId: string) => {
    const { error } = await supabase
      .from('planner_trip_links')
      .delete()
      .eq('id', linkId);

    if (error) {
      console.error('Error removing link:', error);
      toast({
        title: "Error",
        description: "Failed to remove link",
        variant: "destructive",
      });
      return;
    }

    queryClient.invalidateQueries({ queryKey: ['planner-trips'] });
    toast({
      title: "Success",
      description: "Link removed successfully",
    });
  };

  const handleAddText = async () => {
    if (!newText.trim()) return;

    const { error } = await supabase
      .from('planner_trip_texts')
      .insert([{
        trip_id: task.id,
        content: newText
      }]);

    if (error) {
      console.error('Error adding text:', error);
      toast({
        title: "Error",
        description: "Failed to add note",
        variant: "destructive",
      });
      return;
    }

    queryClient.invalidateQueries({ queryKey: ['planner-trips'] });
    setNewText("");
    toast({
      title: "Success",
      description: "Note added successfully",
    });
  };

  const handleRemoveText = async (textId: string) => {
    const { error } = await supabase
      .from('planner_trip_texts')
      .delete()
      .eq('id', textId);

    if (error) {
      console.error('Error removing text:', error);
      toast({
        title: "Error",
        description: "Failed to remove note",
        variant: "destructive",
      });
      return;
    }

    queryClient.invalidateQueries({ queryKey: ['planner-trips'] });
    toast({
      title: "Success",
      description: "Note removed successfully",
    });
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onClose}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Trip Details</SheetTitle>
          </SheetHeader>
          <div className="mt-6 space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onBlur={handleSave}
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  onBlur={handleSave}
                />
              </div>
            </div>

            <Tabs defaultValue="links">
              <TabsList>
                <TabsTrigger value="links">
                  <LinkIcon className="h-4 w-4 mr-2" />
                  Links
                </TabsTrigger>
                <TabsTrigger value="notes">
                  <FileText className="h-4 w-4 mr-2" />
                  Notes
                </TabsTrigger>
              </TabsList>

              <TabsContent value="links" className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Link title"
                    value={newLinkTitle}
                    onChange={(e) => setNewLinkTitle(e.target.value)}
                  />
                  <Input
                    placeholder="URL"
                    value={newLinkUrl}
                    onChange={(e) => setNewLinkUrl(e.target.value)}
                  />
                  <Button onClick={handleAddLink}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Link
                  </Button>
                </div>

                <div className="space-y-2">
                  {task.links?.map((link) => (
                    <div key={link.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div className="flex items-center gap-2">
                        <LinkIcon className="h-4 w-4" />
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {link.title}
                        </a>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveLink(link.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="notes" className="space-y-4">
                <div className="flex gap-2">
                  <Textarea
                    placeholder="New note"
                    value={newText}
                    onChange={(e) => setNewText(e.target.value)}
                  />
                  <Button onClick={handleAddText}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Note
                  </Button>
                </div>

                <div className="space-y-2">
                  {task.texts?.map((text) => (
                    <div key={text.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <p className="text-sm">{text.content}</p>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveText(text.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex justify-end">
              <Button
                variant="destructive"
                onClick={() => setIsDeleteDialogOpen(true)}
              >
                Delete Trip
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Trip</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete this trip? This action cannot be undone.</p>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                onDelete();
                setIsDeleteDialogOpen(false);
                onClose();
              }}
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
