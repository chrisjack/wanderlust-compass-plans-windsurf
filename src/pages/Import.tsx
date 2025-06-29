import { useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { OpenAI } from 'openai';
import * as pdfjsLib from 'pdfjs-dist';
import { DocumentDetails } from '@/components/import/DocumentDetails';
import { format } from "date-fns";
import { DashboardNav } from "@/components/DashboardNav";
import { TopNav } from "@/components/TopNav";
import { useAuth } from "@/lib/auth";
import { Navigate } from "react-router-dom";
import { Checkbox } from "@/components/ui/checkbox";
import { AddToTripModal } from "@/components/import/AddToTripModal";
import { Input } from "@/components/ui/input";
import { X, Search, Upload } from "lucide-react";
import { EmailImportSection } from "@/components/import/EmailImportSection";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Initialize PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

// Types for our parsed data
interface FlightData {
  airline: string;
  flight_number: string;
  departure_city: string;
  departure_date: string;
  departure_time: string;
  departure_terminal: string;
  arrival_city: string;
  arrival_date: string;
  arrival_time: string;
  arrival_terminal: string;
}

interface AccommodationData {
  name: string;
  address: string;
  arrival_date: string;
  departure_date: string;
  check_in_time: string;
  check_out_time: string;
  confirmation_number: string;
}

interface EventData {
  name: string;
  address: string;
  start_date: string;
  start_time: string;
  confirmation_number: string;
}

interface TransportData {
  provider: string;
  reservation_number: string;
  start_date: string;
  start_time: string;
  pick_up_location: string;
  arrival_location: string;
}

interface CruiseData {
  start_date: string;
  end_date: string;
  confirmation_number: string;
  cruise_line: string;
  ship_name: string;
  cruise_name: string;
  boarding_time: string;
  departure_date: string;
  departure_port: string;
  arrival_port: string;
  arrival_date: string;
}

export default function ImportPage() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('flights');
  const [isProcessing, setIsProcessing] = useState(false);
  const [parsedData, setParsedData] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDocument, setSelectedDocument] = useState<any | null>(null);
  const [selectedFlights, setSelectedFlights] = useState<any[]>([]);
  const [isAddToTripOpen, setIsAddToTripOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showUpload, setShowUpload] = useState(false);

  // Fetch existing imports when component mounts
  useEffect(() => {
    fetchExistingImports();
  }, [activeTab]);

  const fetchExistingImports = async () => {
    try {
      const tableName = `import_${activeTab}`;
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching imports:', error);
        return;
      }

      // Transform the data to match the UI format
      const transformedData = data.map(item => ({
        ...item,
        id: item.id,
        type: activeTab,
        name: item.flight_airline || 'Unnamed Document',
        date: item.flight_departure_date || '',
        details: `${item.flight_airline || ''} ${item.flight_number || ''}`.trim(),
        source: item.source,
        created_at: item.created_at
      }));

      setParsedData(transformedData);
    } catch (error) {
      console.error('Error in fetchExistingImports:', error);
    }
  };

  useEffect(() => {
    console.log('ImportPage mounted');
    try {
      // Check if environment variables are loaded
      if (!import.meta.env.VITE_OPENAI_API_KEY) {
        console.error('OpenAI API key is missing');
        setError('OpenAI API key is not configured');
      }
      if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
        console.error('Supabase credentials are missing');
        setError('Supabase credentials are not configured');
      }
      setIsLoading(false);
    } catch (err) {
      console.error('Error in useEffect:', err);
      setError('Failed to initialize page');
      setIsLoading(false);
    }
  }, []);

  const onDrop = async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    setIsProcessing(true);
    setError(null);
    const file = acceptedFiles[0];

    try {
      console.log('Starting document processing...');
      
      // Convert PDF to text using pdf.js
      console.log('Converting PDF to text...');
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      
      let extractedText = '';
      
      // Process each page
      for (let i = 1; i <= pdf.numPages; i++) {
        console.log(`Processing page ${i} of ${pdf.numPages}...`);
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item: any) => item.str).join(' ');
        extractedText += pageText + '\n';
      }
      
      console.log('Extracted text:', extractedText.substring(0, 100) + '...');
      
      // Initialize OpenAI with GPT-3.5-turbo
      console.log('Initializing OpenAI...');
      const openai = new OpenAI({
        apiKey: import.meta.env.VITE_OPENAI_API_KEY,
        dangerouslyAllowBrowser: true
      });

      // Create a prompt based on the active tab
      console.log('Creating prompt for:', activeTab);
      const prompt = createPromptForTab(activeTab, extractedText);

      // Call OpenAI to parse the data
      console.log('Calling OpenAI API...');
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a travel document parser. Extract ALL flight information from the provided text. If multiple flights are found, return them all. If a field is not found, return null for that field. Return the data in JSON format."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" }
      });

      console.log('OpenAI response:', response.choices[0].message.content);
      const parsedResult = JSON.parse(response.choices[0].message.content);
      
      // Handle multiple flights
      const flights = parsedResult.flights || [parsedResult];
      console.log('Processing flights:', flights);

      // Save each flight to Supabase
      const savedFlights = await Promise.all(
        flights.map(flight => saveToSupabase(activeTab, flight))
      );

      // Update UI with all saved flights
      setParsedData(prev => [...prev, ...savedFlights]);
      toast.success(`Successfully processed ${savedFlights.length} flight(s)!`);
    } catch (error) {
      console.error('Detailed error:', error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to process document';
      setError(errorMessage);
      toast.error(`Error: ${errorMessage}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    multiple: false
  });

  const createPromptForTab = (tab: string, text: string) => {
    const basePrompt = `Extract the following information from this travel document text: ${text}\n\n`;
    
    switch (tab) {
      case 'flights':
        return basePrompt + `Extract ALL flight information and return it as an array of JSON objects. Each flight should have these exact fields:
        {
          "airline": "airline name",
          "flight_number": "flight number",
          "departure_city": "departure city with airport code in parentheses if available",
          "departure_date": "departure date in YYYY-MM-DD format",
          "departure_time": "departure time in HH:MM format",
          "departure_terminal": "departure terminal",
          "arrival_city": "arrival city with airport code in parentheses if available",
          "arrival_date": "arrival date in YYYY-MM-DD format",
          "arrival_time": "arrival time in HH:MM format",
          "arrival_terminal": "arrival terminal",
          "confirmation_number": "booking or confirmation number if available",
          "notes": "any additional notes or information"
        }
        If a field is not found in the text, return an empty string for that field.
        Return the data in this format: { "flights": [...array of flight objects...] }`;
      case 'accommodation':
        return basePrompt + `Extract accommodation information and return it as a JSON object with these exact fields:
        {
          "name": "hotel or accommodation name",
          "address": "full address including city and country",
          "arrival_date": "check-in date in YYYY-MM-DD format",
          "departure_date": "check-out date in YYYY-MM-DD format",
          "check_in_time": "check-in time in HH:MM format",
          "check_out_time": "check-out time in HH:MM format",
          "confirmation_number": "booking or confirmation number if available",
          "notes": "any additional notes or information"
        }
        If a field is not found in the text, return an empty string for that field.`;
      case 'event':
        return basePrompt + `Extract event information and return it as a JSON object with these exact fields:
        {
          "name": "event name or description",
          "address": "venue address including city and country",
          "start_date": "event date in YYYY-MM-DD format",
          "start_time": "event start time in HH:MM format",
          "confirmation_number": "booking or confirmation number if available",
          "notes": "any additional notes or information"
        }
        If a field is not found in the text, return an empty string for that field.`;
      case 'transport':
        return basePrompt + `Extract transport information and return it as a JSON object with these exact fields:
        {
          "provider": "transport company or service name",
          "reservation_number": "booking or confirmation number",
          "start_date": "pickup date in YYYY-MM-DD format",
          "start_time": "pickup time in HH:MM format",
          "pickup_location": "pickup address or location",
          "arrival_location": "drop-off address or location",
          "notes": "any additional notes or information"
        }
        If a field is not found in the text, return an empty string for that field.`;
      case 'cruise':
        return basePrompt + `Extract cruise information and return it as a JSON object with these exact fields:
        {
          "start_date": "cruise start date in YYYY-MM-DD format",
          "end_date": "cruise end date in YYYY-MM-DD format",
          "confirmation_number": "booking or confirmation number",
          "cruise_line": "name of the cruise line",
          "ship_name": "name of the ship",
          "cruise_name": "name or description of the cruise",
          "boarding_time": "boarding time in HH:MM format",
          "departure_date": "departure date in YYYY-MM-DD format",
          "departure_port": "departure port name and city",
          "arrival_port": "arrival port name and city",
          "arrival_date": "arrival date in YYYY-MM-DD format",
          "notes": "any additional notes or information"
        }
        If a field is not found in the text, return an empty string for that field.`;
      default:
        return basePrompt;
    }
  };

  const saveToSupabase = async (tab: string, data: any) => {
    try {
      const tableName = `import_${tab}`;
      console.log('Saving to table:', tableName);
      console.log('Raw data from OpenAI:', data);
      
      // Get the current user
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      
      if (!userData.user) {
        throw new Error('No authenticated user found');
      }

      // Transform the data based on the tab type
      let transformedData: any = {
        source: 'pdf_import',
        created_at: new Date().toISOString()
      };

      switch (tab) {
        case 'flights':
          transformedData = {
            ...transformedData,
            flight_airline: data.airline || '',
            flight_number: data.flight_number || '',
            flight_departure_city: data.departure_city || '',
            flight_departure_terminal: data.departure_terminal?.replace('Terminal:', '').trim() || '',
            flight_departure_date: data.departure_date || '',
            flight_departure_time: data.departure_time || '',
            flight_departure_airport_code: (data.departure_city?.match(/\(([^)]+)\)/)?.[1] || ''),
            flight_arrival_city: data.arrival_city || '',
            flight_arrival_terminal: data.arrival_terminal?.replace('Terminal:', '').trim() || '',
            flight_arrival_date: data.arrival_date || '',
            flight_arrival_time: data.arrival_time || '',
            flight_arrival_airport_code: (data.arrival_city?.match(/\(([^)]+)\)/)?.[1] || ''),
            flight_confirmation_number: data.confirmation_number || '',
            flight_notes: data.notes || ''
          };
          break;
        case 'cruise':
          transformedData = {
            ...transformedData,
            cruise_name: data.cruise_name || '',
            cruise_line: data.cruise_line || '',
            cruise_ship_name: data.ship_name || '',
            cruise_departure_port: data.departure_port || '',
            cruise_arrival_port: data.arrival_port || '',
            cruise_start_date: data.departure_date || '',
            cruise_end_date: data.arrival_date || '',
            cruise_boarding_time: data.boarding_time || null,
            cruise_booking_number: data.confirmation_number || '',
            cruise_notes: data.notes || ''
          };
          break;
        case 'accommodation':
          transformedData = {
            ...transformedData,
            accommodation_name: data.name || '',
            accommodation_address: data.address || '',
            accommodation_arrival_date: data.arrival_date || '',
            accommodation_departure_date: data.departure_date || '',
            accommodation_checkin_time: data.check_in_time || '',
            accommodation_checkout_time: data.check_out_time || '',
            accommodation_confirmation_number: data.confirmation_number || '',
            accommodation_notes: data.notes || ''
          };
          break;
        case 'events':
          transformedData = {
            ...transformedData,
            event_name: data.name || '',
            event_address: data.address || '',
            event_start_date: data.start_date || '',
            event_start_time: data.start_time || '',
            event_confirmation_number: data.confirmation_number || '',
            event_notes: data.notes || ''
          };
          break;
        case 'transport':
          transformedData = {
            ...transformedData,
            transport_provider: data.provider || '',
            transport_reservation_number: data.reservation_number || '',
            transport_start_date: data.start_date || '',
            transport_start_time: data.start_time || '',
            transport_pickup_location: data.pick_up_location || '',
            transport_dropoff_location: data.arrival_location || '',
            transport_notes: data.notes || ''
          };
          break;
        default:
          throw new Error(`Unsupported tab type: ${tab}`);
      }

      console.log('Transformed data:', transformedData);

      // Now insert the data and return the inserted record
      const { data: insertedData, error: insertError } = await supabase
        .from(tableName)
        .insert([transformedData])
        .select()
        .single();

      if (insertError) {
        console.error('Insert error:', insertError);
        throw insertError;
      }

      console.log('Data saved successfully:', insertedData);
      
      // Return the data in a format that matches what the UI expects
      const uiData = {
        ...insertedData,
        id: insertedData.id,
        type: tab,
        name: getDisplayName(tab, insertedData),
        date: getDisplayDate(tab, insertedData),
        details: getDisplayDetails(tab, insertedData),
        source: insertedData.source,
        created_at: insertedData.created_at
      };

      return uiData;
    } catch (error) {
      console.error('Error in saveToSupabase:', error);
      throw error;
    }
  };

  const getDisplayName = (tab: string, data: any) => {
    switch (tab) {
      case 'flights':
        return data.flight_airline || 'Unnamed Flight';
      case 'cruises':
        return data.cruise_name || 'Unnamed Cruise';
      case 'accommodation':
        return data.accommodation_name || 'Unnamed Accommodation';
      case 'events':
        return data.event_name || 'Unnamed Event';
      case 'transport':
        return data.transport_provider || 'Unnamed Transport';
      default:
        return 'Unnamed Document';
    }
  };

  const getDisplayDate = (tab: string, data: any) => {
    switch (tab) {
      case 'flights':
        return data.flight_departure_date || '';
      case 'cruises':
        return data.cruise_departure_date || '';
      case 'accommodation':
        return data.accommodation_arrival_date || '';
      case 'events':
        return data.event_start_date || '';
      case 'transport':
        return data.transport_start_date || '';
      default:
        return '';
    }
  };

  const getDisplayDetails = (tab: string, data: any) => {
    switch (tab) {
      case 'flights':
        return `${data.flight_airline || ''} ${data.flight_number || ''}`.trim();
      case 'cruises':
        return `${data.cruise_line || ''} ${data.cruise_ship_name || ''}`.trim();
      case 'accommodation':
        return data.accommodation_name || '';
      case 'events':
        return data.event_name || '';
      case 'transport':
        return data.transport_provider || '';
      default:
        return '';
    }
  };

  const handleRowClick = (item: any) => {
    console.log('Row clicked:', item);
    
    // Check if we have a valid id
    if (!item.id) {
      console.error('No id found for document:', item);
      toast.error("Could not open document details: missing document ID");
      return;
    }

    // Transform the data to match the Document type based on the active tab
    const documentData = (() => {
      if (activeTab === 'flights') {
        return {
          id: item.id,
          type: 'flights',
          name: item.flight_airline || 'Unnamed Document',
          created_at: item.created_at || new Date().toISOString(),
          airline: item.flight_airline || '',
          flight_number: item.flight_number || '',
          confirmation_number: item.flight_confirmation_number || '',
          departure_airport: item.flight_departure_city || '',
          departure_terminal: item.flight_departure_terminal || '',
          departure_date: item.flight_departure_date || '',
          departure_time: item.flight_departure_time || '',
          arrival_airport: item.flight_arrival_city || '',
          arrival_terminal: item.flight_arrival_terminal || '',
          arrival_date: item.flight_arrival_date || '',
          arrival_time: item.flight_arrival_time || '',
          notes: item.flight_notes || '',
          raw_text: item.raw_text || ''
        };
      } else if (activeTab === 'cruise') {
        return {
          id: item.id,
          type: 'cruise',
          name: item.cruise_name || 'Unnamed Cruise',
          created_at: item.created_at || new Date().toISOString(),
          cruise_name: item.cruise_name || '',
          cruise_line: item.cruise_line || '',
          cruise_ship_name: item.cruise_ship_name || '',
          cruise_departure_port: item.cruise_departure_port || '',
          cruise_arrival_port: item.cruise_arrival_port || '',
          cruise_start_date: item.cruise_start_date || '',
          cruise_end_date: item.cruise_end_date || '',
          cruise_boarding_time: item.cruise_boarding_time || '',
          cruise_booking_number: item.cruise_booking_number || '',
          cruise_notes: item.cruise_notes || '',
          raw_text: item.raw_text || ''
        };
      } else {
        return {
          id: item.id,
          type: activeTab,
          name: getDisplayName(activeTab, item) || 'Unnamed Document',
          created_at: item.created_at || new Date().toISOString(),
          ...item
        };
      }
    })();

    console.log('Transformed document data:', documentData);
    setSelectedDocument(documentData);
  };

  const handleDelete = async (id: string, type: string) => {
    try {
      const tableName = type === 'flight' ? 'import_flights' : `import_${type}`;
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', id);

      if (error) throw error;

      setParsedData(prev => prev.filter(item => item.id !== id));
      setSelectedDocument(null);
      toast.success('Document deleted successfully');
    } catch (error) {
      console.error('Error deleting document:', error);
      toast.error('Failed to delete document');
    }
  };

  // Add handler for checkbox selection
  const handleCheckboxChange = (checked: boolean, flight: any) => {
    if (checked) {
      setSelectedFlights(prev => [...prev, flight]);
    } else {
      setSelectedFlights(prev => prev.filter(f => f.id !== flight.id));
    }
  };

  const filteredData = parsedData.filter(data => {
    if (!searchQuery) return true;
    
    const searchLower = searchQuery.toLowerCase();
    return (
      (data.flight_airline || '').toLowerCase().includes(searchLower) ||
      (data.flight_number || '').toLowerCase().includes(searchLower) ||
      (data.flight_departure_city || '').toLowerCase().includes(searchLower) ||
      (data.flight_arrival_city || '').toLowerCase().includes(searchLower)
    );
  });

  // Update the renderImportsTable function
  const renderImportsTable = () => (
    <div className="mt-8">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Recent Imports</h3>
          {selectedFlights.length > 0 && (
            <Button onClick={() => setIsAddToTripOpen(true)}>
              Add {selectedFlights.length} flight{selectedFlights.length !== 1 ? 's' : ''} to Trip
            </Button>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <Input
            placeholder={`Search by ${activeTab === 'flights' ? 'airline, flight number, departure or arrival city' : 
                        activeTab === 'cruise' ? 'cruise name, ship name, or ports' : 
                        'name or details'}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-sm"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              onClick={() => setSearchQuery('')}
              className="px-2"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={filteredData.length > 0 && selectedFlights.length === filteredData.length}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedFlights(filteredData);
                    } else {
                      setSelectedFlights([]);
                    }
                  }}
                />
              </TableHead>
              {activeTab === 'flights' ? (
                <>
                  <TableHead>Airline</TableHead>
                  <TableHead>Flight Number</TableHead>
                  <TableHead>Departure</TableHead>
                  <TableHead>Arrival</TableHead>
                </>
              ) : activeTab === 'cruise' ? (
                <>
                  <TableHead>Name</TableHead>
                  <TableHead>Ship Name</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                </>
              ) : (
                <>
                  <TableHead>Name</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>Date</TableHead>
                </>
              )}
              <TableHead>Uploaded</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.map((data, index) => (
              <TableRow 
                key={data.id || index}
                className="cursor-pointer hover:bg-muted/50"
              >
                <TableCell>
                  <Checkbox
                    checked={selectedFlights.some(f => f.id === data.id)}
                    onCheckedChange={(checked) => handleCheckboxChange(checked as boolean, data)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </TableCell>
                {activeTab === 'flights' ? (
                  <>
                    <TableCell onClick={() => handleRowClick(data)}>{data.flight_airline || '-'}</TableCell>
                    <TableCell onClick={() => handleRowClick(data)}>{data.flight_number || '-'}</TableCell>
                    <TableCell onClick={() => handleRowClick(data)}>
                      <div>{data.flight_departure_city || '-'}</div>
                      <div className="text-sm text-muted-foreground">
                        {data.flight_departure_date} {data.flight_departure_time}
                      </div>
                    </TableCell>
                    <TableCell onClick={() => handleRowClick(data)}>
                      <div>{data.flight_arrival_city || '-'}</div>
                      <div className="text-sm text-muted-foreground">
                        {data.flight_arrival_date} {data.flight_arrival_time}
                      </div>
                    </TableCell>
                  </>
                ) : activeTab === 'cruise' ? (
                  <>
                    <TableCell onClick={() => handleRowClick(data)}>{data.cruise_name || '-'}</TableCell>
                    <TableCell onClick={() => handleRowClick(data)}>{data.cruise_ship_name || '-'}</TableCell>
                    <TableCell onClick={() => handleRowClick(data)}>
                      <div>{data.cruise_start_date || '-'}</div>
                      <div className="text-sm text-muted-foreground">
                        {data.cruise_boarding_time || ''}
                      </div>
                    </TableCell>
                    <TableCell onClick={() => handleRowClick(data)}>{data.cruise_end_date || '-'}</TableCell>
                  </>
                ) : (
                  <>
                    <TableCell onClick={() => handleRowClick(data)}>{getDisplayName(activeTab, data) || '-'}</TableCell>
                    <TableCell onClick={() => handleRowClick(data)}>{getDisplayDetails(activeTab, data) || '-'}</TableCell>
                    <TableCell onClick={() => handleRowClick(data)}>{getDisplayDate(activeTab, data) || '-'}</TableCell>
                  </>
                )}
                <TableCell onClick={() => handleRowClick(data)}>
                  <div className="text-sm text-muted-foreground">
                    {format(new Date(data.created_at), 'MMM d, yyyy')}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {format(new Date(data.created_at), 'HH:mm')}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCheckboxChange(true, data);
                        setIsAddToTripOpen(true);
                      }}
                    >
                      Add to Trip
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(data.id, activeTab);
                      }}
                    >
                      Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-lg font-medium">Loading...</h2>
          <p className="text-gray-500">Please wait</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="flex items-center justify-center p-8">
            <p className="text-red-500">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  console.log('Rendering ImportPage UI');
  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <DashboardNav />
      <div className="lg:pl-64">
        <TopNav />
        <main className="p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">Import Documents</h1>
                <p className="text-gray-500">Upload and process your travel documents</p>
              </div>
            </div>

            <EmailImportSection />

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Upload className="h-4 w-4" />
                  Upload
                </CardTitle>
                <CardDescription className="text-xs">
                  Upload travel documents to automatically extract and import their details.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <div className="block md:hidden mb-4">
                    <Select value={activeTab} onValueChange={setActiveTab}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="flights">Flights</SelectItem>
                        <SelectItem value="accommodation">Accommodation</SelectItem>
                        <SelectItem value="event">Events</SelectItem>
                        <SelectItem value="transport">Transport</SelectItem>
                        <SelectItem value="cruise">Cruise</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <TabsList className="hidden md:grid w-full grid-cols-5">
                    <TabsTrigger value="flights">Flights</TabsTrigger>
                    <TabsTrigger value="accommodation">Accommodation</TabsTrigger>
                    <TabsTrigger value="event">Events</TabsTrigger>
                    <TabsTrigger value="transport">Transport</TabsTrigger>
                    <TabsTrigger value="cruise">Cruise</TabsTrigger>
                  </TabsList>

                  <TabsContent value={activeTab}>
                    <div
                      {...getRootProps()}
                      className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer ${
                        isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
                      }`}
                    >
                      <input {...getInputProps()} />
                      {isProcessing ? (
                        <p>Processing document...</p>
                      ) : isDragActive ? (
                        <p>Drop the PDF here...</p>
                      ) : (
                        <p>Drag & drop a PDF here, or click to select one</p>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>

                {parsedData.length > 0 && renderImportsTable()}
              </CardContent>
            </Card>
          </div>
        </main>

        <DocumentDetails 
          isOpen={!!selectedDocument}
          onClose={() => setSelectedDocument(null)}
          document={selectedDocument}
          onDelete={handleDelete}
        />

        <AddToTripModal
          isOpen={isAddToTripOpen}
          onClose={() => {
            setIsAddToTripOpen(false);
            setSelectedFlights([]);
          }}
          selectedFlights={selectedFlights}
        />
      </div>
    </div>
  );
}