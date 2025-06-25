import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { DocumentDetails } from "./DocumentDetails";

type ImportType = "flight" | "accommodation" | "event" | "transport" | "cruise";

type ImportItem = {
  id: string;
  type: ImportType;
  name: string;
  date: string;
  details: string;
  source: string;
  created_at: string;
};

export function ImportTable() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<ImportType | "all">("all");
  const [selectedDocument, setSelectedDocument] = useState<ImportItem | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: imports = [], isLoading } = useQuery({
    queryKey: ['imports'],
    queryFn: async () => {
      try {
        const [flightsResponse, accommodationsResponse, eventsResponse, transportsResponse, cruisesResponse] = await Promise.all([
          supabase.from('import_flights').select('*').order('created_at', { ascending: false }),
          supabase.from('import_accommodation').select('*').order('created_at', { ascending: false }),
          supabase.from('import_event').select('*').order('created_at', { ascending: false }),
          supabase.from('import_transport').select('*').order('created_at', { ascending: false }),
          supabase.from('import_cruise').select('*').order('created_at', { ascending: false }),
        ]);

        if (flightsResponse.error) throw flightsResponse.error;
        if (accommodationsResponse.error) throw accommodationsResponse.error;
        if (eventsResponse.error) throw eventsResponse.error;
        if (transportsResponse.error) throw transportsResponse.error;
        if (cruisesResponse.error) throw cruisesResponse.error;

        const flights = (flightsResponse.data || []).map((item: any) => ({
          id: item.id,
          type: 'flight' as ImportType,
          name: `${item.flight_airline} ${item.flight_number} - ${item.flight_departure_city} to ${item.flight_arrival_city}`,
          date: item.flight_departure_date,
          details: `${item.flight_airline}, ${item.flight_number}`,
          source: item.source,
          created_at: item.created_at,
        }));

        const accommodations = (accommodationsResponse.data || []).map((item: any) => ({
          id: item.id,
          type: 'accommodation' as ImportType,
          name: item.accommodation_name || 'Unnamed Accommodation',
          date: item.accommodation_arrival_date,
          details: item.accommodation_confirmation_number || 'No confirmation number',
          source: item.source,
          created_at: item.created_at,
        }));

        const events = (eventsResponse.data || []).map((item: any) => ({
          id: item.id,
          type: 'event' as ImportType,
          name: item.event_name || 'Unnamed Event',
          date: item.event_start_date,
          details: item.event_location || 'No location',
          source: item.source,
          created_at: item.created_at,
        }));

        const transports = (transportsResponse.data || []).map((item: any) => ({
          id: item.id,
          type: 'transport' as ImportType,
          name: item.transport_name || 'Unnamed Transport',
          date: item.transport_pickup_date,
          details: `${item.transport_pickup_location || ''} to ${item.transport_dropoff_location || ''}`,
          source: item.source,
          created_at: item.created_at,
        }));

        const cruises = (cruisesResponse.data || []).map((item: any) => ({
          id: item.id,
          type: 'cruise' as ImportType,
          name: item.cruise_name || 'Unnamed Cruise',
          date: item.cruise_start_date,
          details: `${item.cruise_line} - ${item.cruise_ship_name}`,
          source: item.source,
          created_at: item.created_at,
        }));

        return [...flights, ...accommodations, ...events, ...transports, ...cruises];
      } catch (error) {
        console.error('Error fetching imports:', error);
        return [];
      }
    },
  });

  const filteredImports = imports.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.source.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === "all" || item.type === selectedType;
    return matchesSearch && matchesType;
  });

  const handleDelete = async (id: string, type: ImportType) => {
    // Map document type to correct table name (note 'flights' is plural)
    let tableName;
    if (type === 'flight') {
      tableName = 'import_flights';
    } else {
      tableName = `import_${type}`;
    }
    
    try {
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', id);
      
      if (error) {
        throw error;
      }
      
      queryClient.invalidateQueries({ queryKey: ['imports'] });
      
      toast({
        title: "Success",
        description: "Import deleted successfully",
      });
      
      return Promise.resolve();
    } catch (error) {
      console.error("Delete error:", error);
      toast({
        title: "Error",
        description: "Failed to delete import",
        variant: "destructive",
      });
      return Promise.reject(error);
    }
  };

  const handleRowClick = (item: ImportItem) => {
    console.log('Row clicked:', item);
    setSelectedDocument(item);
    console.log('selectedDocument set to:', item);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search imports..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={selectedType === "all" ? "default" : "outline"}
            onClick={() => setSelectedType("all")}
          >
            All ({imports.length})
          </Button>
          <Button
            variant={selectedType === "flight" ? "default" : "outline"}
            onClick={() => setSelectedType("flight")}
          >
            Flights ({imports.filter(i => i.type === "flight").length})
          </Button>
          <Button
            variant={selectedType === "accommodation" ? "default" : "outline"}
            onClick={() => setSelectedType("accommodation")}
          >
            Accommodation ({imports.filter(i => i.type === "accommodation").length})
          </Button>
          <Button
            variant={selectedType === "event" ? "default" : "outline"}
            onClick={() => setSelectedType("event")}
          >
            Events ({imports.filter(i => i.type === "event").length})
          </Button>
          <Button
            variant={selectedType === "transport" ? "default" : "outline"}
            onClick={() => setSelectedType("transport")}
          >
            Transport ({imports.filter(i => i.type === "transport").length})
          </Button>
          <Button
            variant={selectedType === "cruise" ? "default" : "outline"}
            onClick={() => setSelectedType("cruise")}
          >
            Cruises ({imports.filter(i => i.type === "cruise").length})
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Details</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Received</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">Loading imports...</TableCell>
              </TableRow>
            ) : filteredImports.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">No imports found</TableCell>
              </TableRow>
            ) : (
              filteredImports.map((item) => (
                <TableRow 
                  key={`${item.type}-${item.id}`}
                  onClick={() => handleRowClick(item)}
                  className="cursor-pointer hover:bg-muted/50"
                >
                  <TableCell className="capitalize">{item.type}</TableCell>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.date ? format(new Date(item.date), 'yyyy-MM-dd') : 'N/A'}</TableCell>
                  <TableCell>{item.details}</TableCell>
                  <TableCell>{item.source}</TableCell>
                  <TableCell>{format(new Date(item.created_at), 'yyyy-MM-dd HH:mm')}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <DocumentDetails 
        isOpen={!!selectedDocument}
        onClose={() => setSelectedDocument(null)}
        document={selectedDocument}
        onDelete={handleDelete}
      />
    </div>
  );
}
