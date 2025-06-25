import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { Upload, FileText, CheckCircle, AlertCircle } from "lucide-react";

interface CSVImportFormProps {
  onClose: () => void;
}

interface CSVRow {
  title: string;
  departureDate: string;
  column: string;
}

export function CSVImportForm({ onClose }: CSVImportFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [preview, setPreview] = useState<CSVRow[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Function to parse and format dates
  const parseDate = (dateString: string): string | null => {
    if (!dateString || dateString.trim() === '') return null;
    
    const trimmed = dateString.trim();
    
    // Try different date formats
    const dateFormats = [
      // DD/MM/YY
      /^(\d{1,2})\/(\d{1,2})\/(\d{2})$/,
      // DD/MM/YYYY
      /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/,
      // MM/DD/YY
      /^(\d{1,2})\/(\d{1,2})\/(\d{2})$/,
      // MM/DD/YYYY
      /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/,
      // YYYY-MM-DD (ISO format)
      /^(\d{4})-(\d{1,2})-(\d{1,2})$/,
      // DD-MM-YYYY
      /^(\d{1,2})-(\d{1,2})-(\d{4})$/,
      // MM-DD-YYYY
      /^(\d{1,2})-(\d{1,2})-(\d{4})$/,
    ];

    for (const format of dateFormats) {
      const match = trimmed.match(format);
      if (match) {
        const [, first, second, third] = match;
        
        // Determine if it's DD/MM or MM/DD format based on the values
        let day, month, year;
        
        if (third.length === 2) {
          // YY format
          year = parseInt(third) < 50 ? 2000 + parseInt(third) : 1900 + parseInt(third);
          // Assume DD/MM format for DD/MM/YY
          day = parseInt(first);
          month = parseInt(second);
        } else {
          // YYYY format
          year = parseInt(third);
          // Assume DD/MM format for DD/MM/YYYY
          day = parseInt(first);
          month = parseInt(second);
        }
        
        // Validate day and month
        if (day > 31 || month > 12) {
          // Try MM/DD format instead
          day = parseInt(second);
          month = parseInt(first);
        }
        
        if (day >= 1 && day <= 31 && month >= 1 && month <= 12) {
          const date = new Date(year, month - 1, day);
          if (!isNaN(date.getTime())) {
            return date.toISOString().split('T')[0]; // Return YYYY-MM-DD format
          }
        }
      }
    }
    
    // If no format matches, try to parse with Date constructor
    const parsedDate = new Date(trimmed);
    if (!isNaN(parsedDate.getTime())) {
      return parsedDate.toISOString().split('T')[0];
    }
    
    return null;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === "text/csv") {
      setFile(selectedFile);
      parseCSV(selectedFile);
    } else {
      toast({
        title: "Invalid file",
        description: "Please select a valid CSV file",
        variant: "destructive",
      });
    }
  };

  const parseCSV = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n');
      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
      
      // Validate headers
      const requiredHeaders = ['title', 'departureDate', 'column'];
      const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
      
      if (missingHeaders.length > 0) {
        toast({
          title: "Invalid CSV format",
          description: `Missing required headers: ${missingHeaders.join(', ')}`,
          variant: "destructive",
        });
        return;
      }

      const data: CSVRow[] = [];
      const uniqueColumns = new Set<string>();

      for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim()) {
          const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
          if (values.length >= 3) {
            data.push({
              title: values[headers.indexOf('title')],
              departureDate: values[headers.indexOf('departureDate')],
              column: values[headers.indexOf('column')],
            });
            uniqueColumns.add(values[headers.indexOf('column')]);
          }
        }
      }

      setPreview(data.slice(0, 5)); // Show first 5 rows as preview
      setColumns(Array.from(uniqueColumns));
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (!file || !user) return;
    
    setIsProcessing(true);
    try {
      const text = await file.text();
      const lines = text.split('\n');
      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
      
      // Get existing columns
      const { data: existingColumns } = await supabase
        .from('planner_columns')
        .select('id, title')
        .eq('user_id', user.id);

      const columnMap = new Map<string, string>();
      
      // Create new columns if they don't exist
      for (const columnName of columns) {
        const existingColumn = existingColumns?.find(c => c.title === columnName);
        if (existingColumn) {
          columnMap.set(columnName, existingColumn.id);
        } else {
          const { data: newColumn } = await supabase
            .from('planner_columns')
            .insert({
              title: columnName,
              user_id: user.id,
              position: (existingColumns?.length || 0) + 1,
            })
            .select()
            .single();
          
          if (newColumn) {
            columnMap.set(columnName, newColumn.id);
          }
        }
      }

      // Import trips
      const tripsToInsert = [];
      for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim()) {
          const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
          if (values.length >= 3) {
            const title = values[headers.indexOf('title')];
            const departureDateString = values[headers.indexOf('departureDate')];
            const columnName = values[headers.indexOf('column')];
            const columnId = columnMap.get(columnName);

            // Parse and format the date
            const departureDate = parseDate(departureDateString);

            if (title && columnId) {
              tripsToInsert.push({
                title,
                departureDate,
                column_id: columnId,
                user_id: user.id,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              });
            }
          }
        }
      }

      if (tripsToInsert.length > 0) {
        const { error } = await supabase
          .from('planner_trips')
          .insert(tripsToInsert);

        if (error) throw error;

        toast({
          title: "Import successful",
          description: `Imported ${tripsToInsert.length} trips`,
        });

        queryClient.invalidateQueries({ queryKey: ['planner-trips'] });
        queryClient.invalidateQueries({ queryKey: ['planner-columns'] });
        onClose();
      }
    } catch (error) {
      console.error('Import error:', error);
      toast({
        title: "Import failed",
        description: "Failed to import trips. Please check your CSV format and date formats.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="csv-file">Select CSV File</Label>
          <Input
            id="csv-file"
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            disabled={isProcessing}
          />
          <p className="text-sm text-muted-foreground mt-1">
            CSV must have headers: title, departureDate, column
          </p>
          <p className="text-sm text-muted-foreground">
            Supported date formats: DD/MM/YY, DD/MM/YYYY, MM/DD/YY, MM/DD/YYYY, YYYY-MM-DD
          </p>
        </div>

        {file && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                File Preview
              </CardTitle>
              <CardDescription>
                Showing first 5 rows of {preview.length} total rows
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {preview.map((row, index) => (
                  <div key={index} className="flex items-center gap-4 p-2 bg-muted rounded">
                    <div className="flex-1">
                      <div className="font-medium">{row.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {row.departureDate} • {row.column}
                      </div>
                    </div>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {columns.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Columns to Create</CardTitle>
              <CardDescription>
                {columns.length} unique column{columns.length !== 1 ? 's' : ''} found
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {columns.map((column) => (
                  <div key={column} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                    {column}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="flex gap-2 justify-end">
        <Button variant="outline" onClick={onClose} disabled={isProcessing}>
          Cancel
        </Button>
        <Button
          onClick={handleImport}
          disabled={!file || isProcessing}
        >
          {isProcessing ? (
            <>
              <Upload className="h-4 w-4 mr-2 animate-spin" />
              Importing...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Import Trips
            </>
          )}
        </Button>
      </div>
    </div>
  );
} 