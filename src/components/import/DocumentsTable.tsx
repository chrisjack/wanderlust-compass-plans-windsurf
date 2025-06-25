
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Search, Trash2 } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ParsedDocument } from "@/pages/Import";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface DocumentsTableProps {
  onSelectDocument: (document: ParsedDocument) => void;
}

export function DocumentsTable({ onSelectDocument }: DocumentsTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  const { data: documents = [], isLoading, refetch } = useQuery({
    queryKey: ['parsed-documents'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('parsed_documents')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data.map((doc: any) => ({
        id: doc.id,
        fileName: doc.file_name,
        uploadDate: doc.created_at,
        documentType: doc.document_type,
        parsedData: doc.parsed_data,
        mimeType: doc.mime_type
      })) as ParsedDocument[];
    },
  });

  const filteredDocuments = documents.filter(doc => 
    doc.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.documentType.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDeleteDocument = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    try {
      const { error } = await supabase
        .from('parsed_documents')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast({
        title: "Document deleted",
        description: "Document was successfully deleted",
      });
      
      refetch();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to delete document: " + error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>File Name</TableHead>
              <TableHead>Document Type</TableHead>
              <TableHead>Upload Date</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8">Loading documents...</TableCell>
              </TableRow>
            ) : filteredDocuments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8">No documents found</TableCell>
              </TableRow>
            ) : (
              filteredDocuments.map((doc) => (
                <TableRow 
                  key={doc.id} 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => onSelectDocument(doc)}
                >
                  <TableCell>{doc.fileName}</TableCell>
                  <TableCell className="capitalize">{doc.documentType}</TableCell>
                  <TableCell>{format(new Date(doc.uploadDate), 'yyyy-MM-dd HH:mm')}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => handleDeleteDocument(doc.id, e)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
