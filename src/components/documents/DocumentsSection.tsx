import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Check, File, Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format, isValid } from "date-fns";

interface DocumentsSectionProps {
  documents?: any[];
  title?: string;
  onDocumentSelect: (document: any) => Promise<void>;
}

export function DocumentsSection({ documents = [], title = "Documents", onDocumentSelect }: DocumentsSectionProps) {
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDocIds, setSelectedDocIds] = useState<string[]>(
    Array.isArray(documents) ? documents.map((doc: any) => doc.id) : []
  );

  const { data: libraryDocuments = [] } = useQuery({
    queryKey: ['library-documents'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('library')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  const filteredDocuments = Array.isArray(libraryDocuments) ? libraryDocuments.filter(doc => {
    if (!doc) return false;
    const searchLower = searchQuery.toLowerCase();
    const nameMatch = doc.document_name?.toLowerCase().includes(searchLower);
    const typeMatch = doc.document_type?.toLowerCase().includes(searchLower);
    const tagsMatch = doc.library_tags?.toLowerCase().includes(searchLower);
    return nameMatch || typeMatch || tagsMatch;
  }) : [];

  const handleDocumentSelect = async (document: any) => {
    if (!document) return;
    await onDocumentSelect(document);
    setSelectedDocIds(prev => [...prev, document.id]);
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return isValid(date) ? format(date, "MMM d, yyyy") : '';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-semibold">{title}</h2>
          <Sheet open={isLibraryOpen} onOpenChange={setIsLibraryOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Document
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Select Documents</SheetTitle>
              </SheetHeader>
              <ScrollArea className="h-[calc(100vh-8rem)]">
                <div className="mt-6">
                  <div className="relative mb-4">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search documents..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <div className="space-y-4">
                    {filteredDocuments.length > 0 ? (
                      filteredDocuments.map((document) => (
                        <div
                          key={`library-${document.id}`}
                          className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 cursor-pointer"
                          onClick={() => handleDocumentSelect(document)}
                        >
                          <div className="flex items-center space-x-4">
                            <File className="h-5 w-5 text-muted-foreground" />
                            <div>
                              <p className="text-sm font-medium">{document.document_name}</p>
                              <p className="text-xs text-muted-foreground">
                                {formatDate(document.created_at)}
                              </p>
                            </div>
                          </div>
                          {selectedDocIds.includes(document.id) && (
                            <Check className="h-5 w-5 text-primary" />
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="text-center text-muted-foreground py-4">
                        No documents found
                      </div>
                    )}
                  </div>
                </div>
              </ScrollArea>
            </SheetContent>
          </Sheet>
        </div>
      </div>
      <div className="space-y-4">
        {Array.isArray(documents) && documents.length > 0 ? (
          documents.map((document) => (
            <div
              key={`selected-${document.id}`}
              className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50"
            >
              <div className="flex items-center space-x-4">
                <File className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{document.document_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(document.created_at)}
                  </p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-muted-foreground py-4">
            No documents added yet
          </div>
        )}
      </div>
    </div>
  );
}
