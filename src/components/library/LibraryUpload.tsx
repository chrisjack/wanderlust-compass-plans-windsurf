
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { Upload } from "lucide-react";

interface LibraryUploadProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LibraryUpload({ open, onOpenChange }: LibraryUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [documentName, setDocumentName] = useState("");
  const [documentType, setDocumentType] = useState("");
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleUpload = async () => {
    if (!file || !documentName || !documentType) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields and select a file.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      // Get the current user's ID
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        throw new Error("Unable to get user information");
      }

      // Upload file to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const bucketName = 'library';
      
      // First, directly check if we can access the bucket
      // This helps confirm if the bucket exists and permissions are correctly set
      const { data: bucketData, error: bucketCheckError } = await supabase.storage
        .from(bucketName)
        .list();
        
      if (bucketCheckError) {
        console.error("Bucket access error:", bucketCheckError);
        toast({
          title: "Storage Error",
          description: `Unable to access bucket '${bucketName}'. Please check if it exists and permissions are set correctly.`,
          variant: "destructive",
        });
        throw new Error(`Cannot access bucket '${bucketName}': ${bucketCheckError.message}`);
      }

      // Upload the file
      const { error: uploadError, data: uploadData } = await supabase.storage
        .from(bucketName)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        throw uploadError;
      }

      // Get the correct public URL - important to construct correctly
      const storageUrl = supabase.storage.from(bucketName).getPublicUrl(fileName);
      
      if (!storageUrl?.data?.publicUrl) {
        throw new Error("Failed to generate public URL for the uploaded file");
      }

      console.log("Generated public URL:", storageUrl.data.publicUrl);

      // Save document metadata to database
      const { error: dbError } = await supabase
        .from('library')
        .insert({
          document_name: documentName,
          document_type: documentType,
          library_document: storageUrl.data.publicUrl,
          user_id: user.id
        });

      if (dbError) {
        console.error("Database error:", dbError);
        throw dbError;
      }

      toast({
        title: "Success",
        description: "Document uploaded successfully",
      });

      // Reset form and close sheet
      setFile(null);
      setDocumentName("");
      setDocumentType("");
      onOpenChange(false);
      
      // Refresh the documents list
      queryClient.invalidateQueries({ queryKey: ['library-documents'] });
    } catch (error: any) {
      console.error("Upload failed:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to upload document. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <Button onClick={() => onOpenChange(true)}>
        <Upload className="mr-2 h-4 w-4" />
        Upload Document
      </Button>

      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>Upload Document</SheetTitle>
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
              <Label htmlFor="file">File</Label>
              <Input
                id="file"
                type="file"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
            </div>

            <Button 
              className="w-full" 
              onClick={handleUpload}
              disabled={uploading}
            >
              {uploading ? "Uploading..." : "Upload"}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
