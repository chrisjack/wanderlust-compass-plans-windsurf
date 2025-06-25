
import { useState } from "react";
import { X } from "lucide-react";
import { format } from "date-fns";
import { useQueryClient } from "@tanstack/react-query";
import { ParsedDocument } from "@/pages/Import";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import type { Database } from "@/integrations/supabase/types";

type TableName = keyof Database['public']['Tables'];

interface DocumentDetailsModalProps {
  document: ParsedDocument;
  isOpen: boolean;
  onClose: () => void;
}

export function DocumentDetailsModal({
  document,
  isOpen,
  onClose,
}: DocumentDetailsModalProps) {
  const [activeTab, setActiveTab] = useState("json");
  const [isImporting, setIsImporting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const importToTable = async (tableName: TableName) => {
    setIsImporting(true);
    try {
      const { error } = await supabase
        .from(tableName)
        .insert([document.parsedData]);

      if (error) throw error;

      toast({
        title: "Data imported successfully",
        description: `Data imported to ${tableName}`,
      });

      queryClient.invalidateQueries({ queryKey: ['imports'] });
      
    } catch (error: any) {
      toast({
        title: "Import failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  };

  const renderSummary = () => {
    const data = document.parsedData;
    let summary = [];

    if (document.documentType === 'flight' && data) {
      summary.push(<h3 key="title" className="text-lg font-medium mb-2">Flight Details</h3>);
      
      // Display flight information if available
      if (Array.isArray(data.flights)) {
        data.flights.forEach((flight: any, index: number) => {
          summary.push(
            <div key={`flight-${index}`} className="bg-gray-50 p-3 rounded-md mb-3">
              <p className="font-medium">{flight.airline || 'Unknown Airline'} {flight.flight_number || ''}</p>
              <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                <div>
                  <p className="text-gray-500">Departure</p>
                  <p>{flight.departure?.datetime || flight.date || 'N/A'}</p>
                  <p>{flight.departure?.airport || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-gray-500">Arrival</p>
                  <p>{flight.arrival?.datetime || 'N/A'}</p>
                  <p>{flight.arrival?.airport || 'N/A'}</p>
                </div>
              </div>
            </div>
          );
        });
      } else {
        summary.push(<p key="no-flights" className="text-gray-500">No detailed flight information available</p>);
      }
    } else if (document.documentType === 'accommodation' && data) {
      summary.push(<h3 key="title" className="text-lg font-medium mb-2">Accommodation Details</h3>);
      
      const hotelName = data.hotel_name || data.name || data.accommodation_name || 'Unknown Hotel';
      const checkIn = data.check_in_date || data.arrival_date || 'N/A';
      const checkOut = data.check_out_date || data.departure_date || 'N/A';
      
      summary.push(
        <div key="accommodation" className="bg-gray-50 p-3 rounded-md">
          <p className="font-medium">{hotelName}</p>
          <p className="text-sm">{data.address || 'Address not available'}</p>
          <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
            <div>
              <p className="text-gray-500">Check-in</p>
              <p>{checkIn}</p>
            </div>
            <div>
              <p className="text-gray-500">Check-out</p>
              <p>{checkOut}</p>
            </div>
          </div>
          {data.confirmation_number && (
            <p className="text-sm mt-2">Confirmation: {data.confirmation_number}</p>
          )}
        </div>
      );
    } else {
      summary.push(<p key="summary" className="text-gray-500">Summary not available for this document type</p>);
    }

    return <div className="space-y-4">{summary}</div>;
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
        <DialogHeader className="flex flex-row items-center justify-between">
          <div>
            <DialogTitle>{document.fileName}</DialogTitle>
            <DialogDescription>
              Document Type: <span className="capitalize">{document.documentType}</span>
            </DialogDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>
        
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <p className="text-sm font-medium text-gray-500">File Type</p>
            <p>{document.mimeType || "Unknown"}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Upload Date</p>
            <p>{format(new Date(document.uploadDate), 'yyyy-MM-dd HH:mm')}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">ID</p>
            <p className="truncate">{document.id}</p>
          </div>
        </div>
        
        <Separator />
        
        <Tabs 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="flex-1 flex flex-col mt-4"
        >
          <TabsList>
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="json">JSON Data</TabsTrigger>
            <TabsTrigger value="import">Import to Table</TabsTrigger>
          </TabsList>
          
          <TabsContent value="summary" className="flex-1 overflow-auto p-4">
            {renderSummary()}
          </TabsContent>
          
          <TabsContent value="json" className="flex-1 overflow-auto">
            <pre className="bg-gray-100 p-4 rounded-md overflow-auto h-full">
              {JSON.stringify(document.parsedData, null, 2)}
            </pre>
          </TabsContent>
          
          <TabsContent value="import" className="flex-1 overflow-auto p-4">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-2">Import Document Data</h3>
                <p className="text-gray-500 mb-4">
                  Select a destination table to import the parsed document data:
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button 
                    variant="outline" 
                    className={`h-24 flex flex-col items-center justify-center ${document.documentType === 'flight' ? 'border-blue-500 bg-blue-50' : ''}`}
                    onClick={() => importToTable('import_flights')}
                    disabled={isImporting}
                  >
                    <span className="font-bold">Flights</span>
                    <span className="text-sm text-gray-500 mt-1">Import as flight booking</span>
                    {document.documentType === 'flight' && (
                      <span className="text-xs text-blue-600 mt-1">Recommended</span>
                    )}
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className={`h-24 flex flex-col items-center justify-center ${document.documentType === 'accommodation' ? 'border-blue-500 bg-blue-50' : ''}`}
                    onClick={() => importToTable('import_accommodation')}
                    disabled={isImporting}
                  >
                    <span className="font-bold">Accommodation</span>
                    <span className="text-sm text-gray-500 mt-1">Import as hotel/lodging</span>
                    {document.documentType === 'accommodation' && (
                      <span className="text-xs text-blue-600 mt-1">Recommended</span>
                    )}
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className={`h-24 flex flex-col items-center justify-center ${document.documentType === 'event' ? 'border-blue-500 bg-blue-50' : ''}`}
                    onClick={() => importToTable('import_event')}
                    disabled={isImporting}
                  >
                    <span className="font-bold">Event</span>
                    <span className="text-sm text-gray-500 mt-1">Import as event/activity</span>
                    {document.documentType === 'event' && (
                      <span className="text-xs text-blue-600 mt-1">Recommended</span>
                    )}
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className={`h-24 flex flex-col items-center justify-center ${document.documentType === 'transport' ? 'border-blue-500 bg-blue-50' : ''}`}
                    onClick={() => importToTable('import_transport')}
                    disabled={isImporting}
                  >
                    <span className="font-bold">Transport</span>
                    <span className="text-sm text-gray-500 mt-1">Import as transportation</span>
                    {document.documentType === 'transport' && (
                      <span className="text-xs text-blue-600 mt-1">Recommended</span>
                    )}
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className={`h-24 flex flex-col items-center justify-center ${document.documentType === 'cruise' ? 'border-blue-500 bg-blue-50' : ''}`}
                    onClick={() => importToTable('import_cruise')}
                    disabled={isImporting}
                  >
                    <span className="font-bold">Cruise</span>
                    <span className="text-sm text-gray-500 mt-1">Import as cruise booking</span>
                    {document.documentType === 'cruise' && (
                      <span className="text-xs text-blue-600 mt-1">Recommended</span>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
