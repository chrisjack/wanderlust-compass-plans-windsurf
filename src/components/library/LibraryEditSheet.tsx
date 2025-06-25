import { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface LibraryEditSheetProps {
  document: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function LibraryEditSheet({ document, open, onOpenChange, onSuccess }: LibraryEditSheetProps) {
  const [documentName, setDocumentName] = useState("");
  const [documentType, setDocumentType] = useState("");
  const [documentTags, setDocumentTags] = useState("");
  const [updating, setUpdating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (document) {
      setDocumentName(document.document_name || "");
      setDocumentType(document.document_type || "");
      setDocumentTags(document.library_tags || "");
    }
  }, [document]);

  const handleUpdate = async () => {
    if (!document) return;

    setUpdating(true);
    try {
      const cleanedTags = documentTags
        .split(',')
        .map(tag => tag.trim())
        .filter(Boolean)
        .join(', ');

      const { error } = await supabase
        .from('library')
        .update({
          document_name: documentName,
          document_type: documentType,
          library_tags: cleanedTags,
        })
        .eq('id', document.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Document updated successfully",
      });

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update document. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Edit Document</SheetTitle>
        </SheetHeader>
        
        <div className="mt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="documentName">Document Name</Label>
            <Input
              id="documentName"
              value={documentName}
              onChange={(e) => setDocumentName(e.target.value)}
              placeholder="Enter document name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="documentType">Document Type</Label>
            <Input
              id="documentType"
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value)}
              placeholder="Enter document type"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="documentTags">Tags</Label>
            <Input
              id="documentTags"
              value={documentTags}
              onChange={(e) => setDocumentTags(e.target.value)}
              placeholder="Enter tags (comma-separated)"
            />
            <p className="text-sm text-muted-foreground">
              Separate multiple tags with commas
            </p>
          </div>

          <Button 
            className="w-full" 
            onClick={handleUpdate}
            disabled={updating}
          >
            {updating ? "Updating..." : "Update"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
