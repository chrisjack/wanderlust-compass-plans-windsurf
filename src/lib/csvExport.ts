import { supabase } from '@/integrations/supabase/client';

export interface PlannerTripExportData {
  tripTitle: string;
  departureDate: string | null;
  description: string | null;
  status: string | null;
  linkedTrip: string | null;
  notes: string[];
  links: { title: string; url: string }[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export async function exportPlannerDataToCSV(userId: string): Promise<string> {
  try {
    // Fetch all planner trips with related data
    const { data: trips, error: tripsError } = await supabase
      .from('planner_trips')
      .select(`
        *,
        column:planner_columns (title),
        trips (trip_name),
        links:planner_trip_links (title, url),
        texts:planner_trip_texts (content),
        tags:planner_trip_tags (tag:planner_tags (name)),
        notes:planner_notes (title, content)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (tripsError) {
      throw new Error(`Failed to fetch trips: ${tripsError.message}`);
    }

    if (!trips || trips.length === 0) {
      throw new Error('No planner data found to export');
    }

    // Transform data for CSV export
    const exportData: PlannerTripExportData[] = trips.map(trip => ({
      tripTitle: trip.title || '',
      departureDate: trip.departureDate || null,
      description: trip.description || null,
      status: trip.column?.title || null,
      linkedTrip: trip.trips?.trip_name || null,
      notes: [
        // Include texts from planner_trip_texts
        ...(trip.texts?.map((text: any) => text.content).filter(Boolean) || []),
        // Include notes from planner_notes
        ...(trip.notes?.map((note: any) => 
          note.title ? `${note.title}: ${note.content}` : note.content
        ).filter(Boolean) || [])
      ],
      links: trip.links?.map((link: any) => ({
        title: link.title || '',
        url: link.url || ''
      })) || [],
      tags: trip.tags?.map((tag: any) => tag.tag?.name).filter(Boolean) || [],
      createdAt: trip.created_at || '',
      updatedAt: trip.updated_at || ''
    }));

    // Generate CSV content
    const csvContent = generateCSVContent(exportData);
    
    return csvContent;
  } catch (error) {
    console.error('Error exporting planner data:', error);
    throw error;
  }
}

function generateCSVContent(data: PlannerTripExportData[]): string {
  // Define CSV headers
  const headers = [
    'Trip Title',
    'Departure Date',
    'Description',
    'Status',
    'Linked Trip',
    'Notes',
    'Links',
    'Tags',
    'Created At',
    'Updated At'
  ];

  // Create CSV rows
  const rows = data.map(trip => [
    escapeCSVField(trip.tripTitle),
    escapeCSVField(trip.departureDate || ''),
    escapeCSVField(trip.description || ''),
    escapeCSVField(trip.status || ''),
    escapeCSVField(trip.linkedTrip || ''),
    escapeCSVField(trip.notes.join(' | ')),
    escapeCSVField(trip.links.map(link => `${link.title}: ${link.url}`).join(' | ')),
    escapeCSVField(trip.tags.join(', ')),
    escapeCSVField(trip.createdAt),
    escapeCSVField(trip.updatedAt)
  ]);

  // Combine headers and rows
  const csvRows = [headers, ...rows];
  
  // Convert to CSV string
  return csvRows.map(row => row.join(',')).join('\n');
}

function escapeCSVField(field: string): string {
  // If field contains comma, quote, or newline, wrap in quotes and escape internal quotes
  if (field.includes(',') || field.includes('"') || field.includes('\n') || field.includes('\r')) {
    return `"${field.replace(/"/g, '""')}"`;
  }
  return field;
}

export function downloadCSV(csvContent: string, filename: string = 'planner-export.csv'): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
} 