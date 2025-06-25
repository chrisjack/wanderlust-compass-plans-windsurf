
import { useState } from "react";
import { CloudUpload, Mail, Info, Sparkles, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export function ImportUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [processingStage, setProcessingStage] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { toast } = useToast();
  const form = useForm();
  const queryClient = useQueryClient();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast({
        title: "No file selected",
        description: "Please select a file to upload",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    setProcessingStage("Reading document...");
    setProgress(10);

    try {
      // Read the file content
      const fileContent = await selectedFile.text();
      let mimeType = selectedFile.type;
      if (!mimeType && selectedFile.name.endsWith('.txt')) {
        mimeType = 'text/plain';
      }
      
      setProcessingStage("Analyzing with ChatGPT...");
      setProgress(30);

      // Call the Supabase Edge Function to parse the document
      const { data, error } = await supabase.functions.invoke('parse-travel-document', {
        body: {
          document: {
            docType: mimeType,
            content: fileContent,
            mimeType: mimeType,
            fileName: selectedFile.name
          }
        }
      });

      if (error) throw error;

      setProgress(70);
      
      if (data.success) {
        const { tableName, extractedData, docType } = data;
        
        setProcessingStage("Saving to database...");
        
        // Save the extracted data to the database
        const { error: dbError } = await supabase
          .from(tableName)
          .insert([extractedData]);

        if (dbError) throw dbError;

        setProgress(100);
        
        // Refresh the imports list
        queryClient.invalidateQueries({ queryKey: ['imports'] });

        toast({
          title: "Document processed successfully",
          description: `Document identified as ${docType} and imported`,
        });

        // Reset the file input field and the selected file
        setSelectedFile(null);
        const fileInput = document.getElementById('file-upload') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      } else {
        throw new Error(data.error || 'Failed to process document');
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description: error.message || "There was an error processing your document",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setProcessingStage(null);
      setTimeout(() => setProgress(0), 1000); // Reset progress after a delay
    }
  };

  return (
    <Card className="mb-8">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Add New Import</CardTitle>
          <Badge variant="outline" className="flex items-center gap-1 bg-blue-50 text-blue-700 border-blue-200">
            <Sparkles className="h-3 w-3" />
            ChatGPT Powered
          </Badge>
        </div>
        <CardDescription>
          Upload documents or forward emails to import travel information
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="upload">
          <TabsList className="mb-4">
            <TabsTrigger value="upload">Upload Document</TabsTrigger>
            <TabsTrigger value="email">Email Forwarding</TabsTrigger>
          </TabsList>
          
          <TabsContent value="upload" className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <CloudUpload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Upload Document</h3>
                <p className="text-sm text-muted-foreground">
                  Upload booking confirmations, receipts, or itineraries
                </p>
                <div className="mt-4 bg-blue-50 rounded-lg p-3 flex items-start gap-2 text-left">
                  <Sparkles className="h-4 w-4 text-blue-500 mt-1" />
                  <p className="text-sm text-blue-700">
                    We use ChatGPT to analyze your travel documents and automatically extract key information
                  </p>
                </div>
                <Input
                  id="file-upload"
                  type="file"
                  className="mt-2"
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.txt,.eml"
                  disabled={isUploading}
                />
                {selectedFile && (
                  <p className="text-sm text-blue-500">
                    Selected: {selectedFile.name}
                  </p>
                )}
              </div>
            </div>

            <Button 
              className="w-full" 
              onClick={handleUpload} 
              disabled={!selectedFile || isUploading}
            >
              {isUploading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {processingStage || "Processing..."}
                </span>
              ) : (
                "Upload and Parse"
              )}
            </Button>
            
            {isUploading && progress > 0 && (
              <Progress value={progress} className="h-2" />
            )}
          </TabsContent>
          
          <TabsContent value="email" className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg flex items-start gap-3">
              <Info className="h-5 w-5 text-blue-500 mt-0.5" />
              <div>
                <h4 className="font-semibold text-blue-700">Forward your travel emails</h4>
                <p className="text-sm text-blue-600 mt-1">
                  Forward booking confirmations, receipts and itineraries to the email address below.
                  We'll automatically parse the information and add it to your imports.
                </p>
              </div>
            </div>

            <div className="border rounded-lg p-4">
              <Form {...form}>
                <FormField
                  name="email"
                  render={() => (
                    <FormItem>
                      <FormLabel>Your dedicated import email</FormLabel>
                      <div className="flex gap-2">
                        <FormControl>
                          <Input 
                            readOnly 
                            value="import-user123@travelbookings.app"
                            className="bg-gray-50"
                          />
                        </FormControl>
                        <Button 
                          variant="outline"
                          onClick={() => {
                            navigator.clipboard.writeText("import-user123@travelbookings.app");
                            toast({
                              title: "Email copied",
                              description: "The email address has been copied to your clipboard",
                            });
                          }}
                        >
                          Copy
                        </Button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </Form>

              <div className="mt-4 space-y-2">
                <h4 className="text-sm font-medium">Supported email providers:</h4>
                <ul className="text-sm text-gray-500 list-disc pl-5">
                  <li>Gmail</li>
                  <li>Outlook</li>
                  <li>Apple Mail</li>
                  <li>Yahoo Mail</li>
                </ul>
              </div>
            </div>

            <div className="flex items-center gap-2 mt-2">
              <Mail className="h-4 w-4 text-gray-500" />
              <p className="text-sm text-gray-500">
                Emails are typically processed within 5 minutes of being received
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="bg-gray-50 text-sm text-gray-500 rounded-b-lg flex items-center justify-between">
        <span>We support parsing from most major travel providers including airlines, hotels, and booking services</span>
        <Badge variant="outline" className="flex items-center gap-1">
          <Sparkles className="h-3 w-3" />
          ChatGPT Enhanced
        </Badge>
      </CardFooter>
    </Card>
  );
}
