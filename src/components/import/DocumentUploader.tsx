
import { useState } from "react";
import { CloudUpload, Loader2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";

export function DocumentUploader() {
  const [isUploading, setIsUploading] = useState(false);
  const [processingStage, setProcessingStage] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [travelArea, setTravelArea] = useState<string>("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleTravelAreaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTravelArea(e.target.value);
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
    if (!travelArea) {
      toast({
        title: "No travel area selected",
        description: "Please select a travel area (Flights, Accommodation, etc.)",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    setProcessingStage("Uploading document...");
    setProgress(10);

    try {
      // Prepare FormData for file upload
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('travelArea', travelArea);

      setProcessingStage("Uploading and parsing...");
      setProgress(30);

      const response = await fetch('http://localhost:3001/api/import', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to process document');
      }
      const parsedData = await response.json();

      setProgress(70);
      setProcessingStage("Saving document...");

      // Save the parsed data to the database
      // (You may want to adapt this to your import tables in the future)
      const { error: insertError } = await supabase
        .from('parsed_documents')
        .insert({
          file_name: selectedFile.name,
          document_type: travelArea,
          mime_type: selectedFile.type,
          parsed_data: parsedData || {}
        });

      if (insertError) throw insertError;

      setProgress(100);
      queryClient.invalidateQueries({ queryKey: ['parsed-documents'] });

      toast({
        title: "Document processed successfully",
        description: `Document parsed and saved successfully`,
      });

      setSelectedFile(null);
      const fileInput = document.getElementById('file-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      
    } catch (error: any) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description: error.message || "There was an error processing your document",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setProcessingStage(null);
      setTimeout(() => setProgress(0), 1000);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Document</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <CloudUpload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Upload Travel Document</h3>
            <p className="text-sm text-muted-foreground">
              Upload booking confirmations, receipts, or itineraries
            </p>
            <div className="mt-4 bg-blue-50 rounded-lg p-3 flex items-start gap-2 text-left">
              <p className="text-sm text-blue-700">
                We use ChatGPT to analyze your travel documents and extract key information
              </p>
            </div>
            <select
              className="mt-2 w-full border rounded p-2"
              value={travelArea}
              onChange={handleTravelAreaChange}
              disabled={isUploading}
            >
              <option value="">Select Travel Area</option>
              <option value="flights">Flights</option>
              <option value="accommodation">Accommodation</option>
              <option value="event">Event</option>
              <option value="transport">Transport</option>
              <option value="cruise">Cruise</option>
            </select>
            <Input
              id="file-upload"
              type="file"
              className="mt-2"
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.txt,.eml,.png,.jpg,.jpeg"
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
          className="w-full mt-4" 
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
          <Progress value={progress} className="h-2 mt-4" />
        )}
      </CardContent>
    </Card>
  );
}
