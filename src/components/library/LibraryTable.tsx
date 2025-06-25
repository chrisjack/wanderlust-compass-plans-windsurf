import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Edit, Search, Trash2, FolderPlus } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { LibraryEditSheet } from "./LibraryEditSheet";
import { LibraryAddToTripDialog } from "./LibraryAddToTripDialog";
import { Tags } from "./Tags";

export function LibraryTable() {
  const [searchQuery, setSearchQuery] = useState("");
  const [editingDocument, setEditingDocument] = useState<any>(null);
  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  const { toast } = useToast();
  
  const { data: documents = [], refetch } = useQuery({
    queryKey: ['library-documents'],
    queryFn: async () => {
      const { data: documents, error } = await supabase
        .from('library')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return documents || [];
    },
  });

  const filteredDocuments = documents.filter(doc => 
    doc.document_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.document_type?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = async (docId: string) => {
    try {
      const { data: doc, error: fetchError } = await supabase
        .from('library')
        .select('library_document')
        .eq('id', docId)
        .single();

      if (fetchError) throw fetchError;

      if (doc?.library_document) {
        try {
          console.log("Attempting to delete file with URL:", doc.library_document);
          
          const url = new URL(doc.library_document);
          const pathSegments = url.pathname.split('/');
          
          if (pathSegments.indexOf('public') >= 0 && pathSegments.length > 1) {
            const bucketName = pathSegments[1];
            const filePath = pathSegments.slice(2).join('/');
            
            console.log("Extracted bucket:", bucketName);
            console.log("Extracted file path:", filePath);
            
            if (bucketName && filePath) {
              const { error: storageError } = await supabase.storage
                .from(bucketName)
                .remove([filePath]);
                
              if (storageError) {
                console.error("Failed to delete file from storage:", storageError);
              } else {
                console.log("File successfully deleted from storage");
              }
            }
          }
        } catch (urlError) {
          console.error("Error parsing document URL:", urlError);
        }
      }

      const { error: deleteError } = await supabase
        .from('library')
        .delete()
        .eq('id', docId);

      if (deleteError) throw deleteError;

      toast({
        title: "Document deleted",
        description: "The document has been successfully deleted.",
      });

      refetch();
    } catch (error) {
      console.error("Delete error:", error);
      toast({
        title: "Error",
        description: "Failed to delete document. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleRowClick = async (doc: any) => {
    if (!doc.library_document) {
      toast({
        title: "Error",
        description: "Document URL is missing.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const url = new URL(doc.library_document);
      console.log("Full document URL:", doc.library_document);
      
      // Check if this is already a signed URL (contains 'object/sign' and token)
      if (url.pathname.includes('/object/sign/') && url.searchParams.has('token')) {
        console.log("URL is already signed, opening directly");
        window.open(doc.library_document, '_blank');
        return;
      }

      // If not signed, extract path and create a signed URL
      const cleanPath = url.pathname
        .replace(/^\/storage\/v1\/object\/public\//, '')
        .replace(/^\//, '');
        
      const [bucketName, ...filePathParts] = cleanPath.split('/');
      const filePath = filePathParts.join('/');
      
      console.log("Extracted bucket:", bucketName);
      console.log("Extracted file path:", filePath);

      if (!bucketName || !filePath) {
        throw new Error("Invalid storage path");
      }

      const { data, error } = await supabase.storage
        .from(bucketName)
        .createSignedUrl(filePath, 60 * 60); // URL valid for 1 hour

      if (error) {
        console.error("Signed URL error:", error);
        throw error;
      }

      if (!data?.signedUrl) {
        throw new Error("No signed URL returned");
      }

      console.log("Successfully generated signed URL");
      window.open(data.signedUrl, '_blank');
    } catch (error) {
      console.error("Error accessing document:", error);
      toast({
        title: "Error",
        description: "Unable to access the document. Please check console for details.",
        variant: "destructive",
      });
    }
  };

  return (
    <div>
      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search documents..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Document Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Date Added</TableHead>
            <TableHead>Tags</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredDocuments.map((doc) => (
            <TableRow 
              key={doc.id} 
              className="cursor-pointer hover:bg-muted/50"
              onClick={(e) => {
                if ((e.target as HTMLElement).closest('.actions')) return;
                handleRowClick(doc);
              }}
            >
              <TableCell className="font-medium">{doc.document_name}</TableCell>
              <TableCell>{doc.document_type}</TableCell>
              <TableCell>{format(new Date(doc.created_at), 'MMM d, yyyy')}</TableCell>
              <TableCell><Tags tags={doc.library_tags} /></TableCell>
              <TableCell className="actions">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingDocument(doc);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete document</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this document? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => handleDelete(doc.id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedDocument(doc);
                    }}
                  >
                    <FolderPlus className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <LibraryEditSheet
        document={editingDocument}
        open={!!editingDocument}
        onOpenChange={(open) => !open && setEditingDocument(null)}
        onSuccess={refetch}
      />

      <LibraryAddToTripDialog
        document={selectedDocument}
        open={!!selectedDocument}
        onOpenChange={(open) => !open && setSelectedDocument(null)}
      />
    </div>
  );
}
