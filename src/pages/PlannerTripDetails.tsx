import { useEffect, useState, useRef } from "react";
import { useParams, Navigate, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { PlannerTrip } from "@/integrations/supabase/types";
import { DashboardNav } from "@/components/DashboardNav";
import { TopNav } from "@/components/TopNav";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Pencil, Trash2, Check, X, FileText, Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase as supabaseClient } from '@/integrations/supabase/client';
import { PlannerTripForm } from "@/components/tasks/PlannerTripForm";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";

export default function PlannerTripDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [trip, setTrip] = useState<PlannerTrip | null>(null);
  const [clientName, setClientName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("notes");
  const [notes, setNotes] = useState<any[]>([]);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingNoteTitle, setEditingNoteTitle] = useState("");
  const [editingNoteContent, setEditingNoteContent] = useState("");
  const [editingNoteLink, setEditingNoteLink] = useState("");
  const [savingNoteId, setSavingNoteId] = useState<string | null>(null);
  const [deletingNoteId, setDeletingNoteId] = useState<string | null>(null);
  const [addingNote, setAddingNote] = useState(false);
  const [addNoteOpen, setAddNoteOpen] = useState(false);
  const [newNoteTitle, setNewNoteTitle] = useState("");
  const [newNoteContent, setNewNoteContent] = useState("");
  const [newNoteLink, setNewNoteLink] = useState("");
  const [newNoteFile, setNewNoteFile] = useState<File | null>(null);
  const [newNoteFileInputRef] = useState(useRef<HTMLInputElement | null>(null));
  const [selectedNote, setSelectedNote] = useState<any | null>(null);
  const [modalContent, setModalContent] = useState("");
  const [modalSaving, setModalSaving] = useState(false);
  const [modalDeleting, setModalDeleting] = useState(false);
  const editFormRef = useRef<HTMLFormElement | null>(null);
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [addNoteError, setAddNoteError] = useState<string | null>(null);
  const [fileUrlInput, setFileUrlInput] = useState("");
  const [fileUrlNameInput, setFileUrlNameInput] = useState("");
  const { toast } = useToast();

  const { data: timeline = [], isLoading: timelineLoading } = useQuery({
    queryKey: ['planner-trip-history', id],
    queryFn: async () => {
      if (!id) return [];
      const { data, error } = await supabase
        .from('planner_trip_history')
        .select(`*,
          column:planner_columns!planner_trip_history_column_id_fkey (title),
          previous:planner_columns!planner_trip_history_previous_column_id_fkey (title),
          user:profiles (full_name)
        `)
        .eq('trip_id', id)
        .order('moved_at', { ascending: true });
      console.log('Timeline query result:', { data, error, id });
      if (error) throw error;
      return data || [];
    },
    enabled: !!id,
  });

  const { data: files = [], isLoading: filesLoading } = useQuery({
    queryKey: ['planner-files', id],
    queryFn: async () => {
      if (!id) return [];
      const { data, error } = await supabase
        .from('planner_files')
        .select('*')
        .eq('trip_id', id);
      console.log('Minimal files query:', { data, error, id });
      if (error) throw error;
      // Attach uploader full_name like notes, using file.user
      if (data && data.length > 0) {
        const userIds = [...new Set(data.map(file => file.user))];
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, full_name')
          .in('id', userIds);
        const userMap: Record<string, string> = {};
        (profilesData || []).forEach(profile => {
          userMap[profile.id] = profile.full_name;
        });
        return data.map(file => ({
          ...file,
          full_name: userMap[file.user] || file.user || 'Unknown User'
        }));
      }
      return data || [];
    },
    enabled: !!id,
  });

  // Fetch custom field values for this trip
  const { data: customFieldsWithValues = [], isLoading: customFieldsLoading } = useQuery({
    queryKey: ["planner-trip-custom-fields", id],
    queryFn: async () => {
      if (!id || !user) return [];
      const { data, error } = await supabase
        .from('planner_trip_field_values')
        .select('*, field:planner_fields(*)')
        .eq('trip_id', id);
      if (error) throw error;
      // Only return those with a field (should always be true)
      return (data || []).filter((row: any) => row.field);
    },
    enabled: !!id && !!user,
  });

  useEffect(() => {
    async function fetchTrip() {
      setLoading(true);
      const { data, error } = await supabase
        .from('planner_trips')
        .select(`*,
          column:planner_columns (id, title),
          trips (id, trip_name, trip_start_date),
          links:planner_trip_links (id, title, url),
          texts:planner_trip_texts (id, content, updated_at, created_at),
          tags:planner_trip_tags (tag:planner_tags (id, name))
        `)
        .eq('id', id)
        .single();
      if (!error && data) {
        setTrip({
          ...data,
          links: data.links || [],
          texts: data.texts || [],
          tags: data.tags?.map((t: any) => t.tag) || [],
        });
        if (data.client_id) {
          const { data: client, error: clientError } = await supabase
            .from('clients')
            .select('name')
            .eq('id', data.client_id)
            .single();
          if (!clientError && client) {
            setClientName(client.name);
          } else {
            setClientName(null);
          }
        } else {
          setClientName(null);
        }
        // Fetch notes from planner_notes
        const { data: notesData, error: notesError } = await supabase
          .from('planner_notes')
          .select('*')
          .eq('trip_id', id)
          .order('updated_at', { ascending: false });
        if (!notesError && notesData && notesData.length > 0) {
          const userIds = [...new Set(notesData.map(note => note.user_id))];
          const { data: profilesData } = await supabase
            .from('profiles')
            .select('id, full_name')
            .in('id', userIds);
          const userMap: Record<string, string> = {};
          (profilesData || []).forEach(profile => {
            userMap[profile.id] = profile.full_name;
          });
          setNotes(notesData.map(note => ({
            ...note,
            full_name: userMap[note.user_id] || 'Unknown User'
          })));
        } else {
          setNotes([]);
        }
      }
      setLoading(false);
    }
    if (id) fetchTrip();
  }, [id]);

  // Click outside to cancel editing
  useEffect(() => {
    if (!editingNoteId) return;
    function handleClickOutside(event: MouseEvent) {
      if (editFormRef.current && !editFormRef.current.contains(event.target as Node)) {
        cancelEditNote();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [editingNoteId]);

  // Add note
  async function handleAddNote(e: React.FormEvent) {
    e.preventDefault();
    if (!newNoteTitle.trim() && !newNoteContent.trim() && !newNoteLink.trim() && !newNoteFile) return;
    setAddingNote(true);
    setAddNoteError(null);

    let fileUrl = newNoteLink;
    if (newNoteFile) {
      const filePath = `${id}/notes/${Date.now()}_${newNoteFile.name}`;
      const { error: uploadError } = await supabaseClient.storage.from('plannerfiles').upload(filePath, newNoteFile);
      if (uploadError) {
        setFileError('Failed to upload file.');
        setAddingNote(false);
        return;
      }
      const { data: publicUrlData } = supabaseClient.storage.from('plannerfiles').getPublicUrl(filePath);
      fileUrl = publicUrlData?.publicUrl;
    }

    // Insert note
    const { data, error } = await supabase
      .from('planner_notes')
      .insert([{ trip_id: id, title: newNoteTitle, content: newNoteContent, link: fileUrl, user_id: user.id }])
      .select()
      .single();
    console.log('Add note result:', { data, error });
    setAddingNote(false);
    if (!error && data) {
      // Fetch user's full_name from profiles
      let fullName = user.email || 'You';
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', user.id)
          .single();
        if (profile && profile.full_name) {
          fullName = profile.full_name;
        }
      } catch (e) {}
      setNotes([{ ...data, full_name: fullName }, ...notes]);
      setNewNoteTitle("");
      setNewNoteContent("");
      setNewNoteLink("");
      setNewNoteFile(null);
      if (newNoteFileInputRef.current) newNoteFileInputRef.current.value = '';
      setAddNoteOpen(false);
    } else {
      setAddNoteError(error?.message || 'Failed to add note.');
    }
  }

  // Edit note
  function startEditNote(note: any) {
    setEditingNoteId(note.id);
    setEditingNoteTitle(note.title || "");
    setEditingNoteContent(note.content || "");
    setEditingNoteLink(note.link || "");
    setNewNoteFile(null);
  }
  function cancelEditNote() {
    setEditingNoteId(null);
    setEditingNoteTitle("");
    setEditingNoteContent("");
    setEditingNoteLink("");
  }
  async function saveEditNote(note: any) {
    setSavingNoteId(note.id);
    if (!editingNoteTitle.trim() && !editingNoteContent.trim() && !editingNoteLink.trim() && !newNoteFile) {
      setSavingNoteId(null);
      return;
    }

    let fileUrl = editingNoteLink;
    if (newNoteFile) {
      const filePath = `${id}/notes/${Date.now()}_${newNoteFile.name}`;
      const { error: uploadError } = await supabaseClient.storage.from('plannerfiles').upload(filePath, newNoteFile);
      if (uploadError) {
        setFileError('Failed to upload file.');
        setSavingNoteId(null);
        return;
      }
      const { data: publicUrlData } = supabaseClient.storage.from('plannerfiles').getPublicUrl(filePath);
      fileUrl = publicUrlData?.publicUrl;
    }

    const { data, error } = await supabase
      .from('planner_notes')
      .update({ title: editingNoteTitle, content: editingNoteContent, link: fileUrl })
      .eq('id', note.id)
      .select()
      .single();
    setSavingNoteId(null);
    if (!error && data) {
      setNotes(notes.map(n => n.id === note.id ? { ...data, full_name: n.full_name } : n));
      setEditingNoteId(null);
      setEditingNoteTitle("");
      setEditingNoteContent("");
      setEditingNoteLink("");
      setNewNoteFile(null);
    }
  }

  // Delete note
  async function deleteNote(note: any) {
    setDeletingNoteId(note.id);
    await supabase.from('planner_notes').delete().eq('id', note.id);
    setNotes(notes.filter(n => n.id !== note.id));
    setDeletingNoteId(null);
    cancelEditNote();
  }

  // Delete note with confirmation
  async function deleteNoteWithConfirmation(note: any) {
    if (window.confirm('Are you sure you want to delete this note? This action cannot be undone.')) {
      await deleteNote(note);
    }
  }

  // Modal edit/save/delete
  function openNoteModal(note: any) {
    setSelectedNote(note);
    setModalContent(note.content);
  }
  function closeNoteModal() {
    setSelectedNote(null);
    setModalContent("");
    setModalSaving(false);
    setModalDeleting(false);
  }
  async function saveModalNote() {
    if (!selectedNote) return;
    setModalSaving(true);
    const { data, error } = await supabase
      .from('planner_notes')
      .update({ content: modalContent })
      .eq('id', selectedNote.id)
      .select()
      .single();
    setModalSaving(false);
    if (!error && data) {
      setNotes(notes.map(n => n.id === selectedNote.id ? data : n));
      closeNoteModal();
    }
  }
  async function deleteModalNote() {
    if (!selectedNote) return;
    setModalDeleting(true);
    await supabase.from('planner_notes').delete().eq('id', selectedNote.id);
    setNotes(notes.filter(n => n.id !== selectedNote.id));
    setModalDeleting(false);
    closeNoteModal();
  }

  // Upload file handler
  async function handleFileUpload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFileError(null);
    // If file is selected, upload file
    if (fileInputRef.current?.files?.[0] && id) {
      setUploadingFile(true);
      const file = fileInputRef.current.files[0];
      const filePath = `${id}/${Date.now()}_${file.name}`;
      // Upload to Supabase Storage
      const { error: uploadError } = await supabaseClient.storage.from('plannerfiles').upload(filePath, file);
      if (uploadError) {
        setFileError('Failed to upload file.');
        setUploadingFile(false);
        return;
      }
      // Get public URL
      const { data: publicUrlData } = supabaseClient.storage.from('plannerfiles').getPublicUrl(filePath);
      const fileUrl = publicUrlData?.publicUrl;
      // Insert into planner_files table
      const { error: insertError } = await supabase
        .from('planner_files')
        .insert({
          trip_id: id,
          file_name: file.name,
          file_url: fileUrl,
          user_id: user.id,
        });
      setUploadingFile(false);
      if (insertError) {
        setFileError('Failed to save file record.');
        return;
      }
      queryClient.invalidateQueries({ queryKey: ['planner-files', id] });
      if (fileInputRef.current) fileInputRef.current.value = '';
    } else if (fileUrlInput.trim() && fileUrlNameInput.trim() && id) {
      // If URL is provided, insert as file
      setUploadingFile(true);
      const { error: insertError } = await supabase
        .from('planner_files')
        .insert({
          trip_id: id,
          file_name: fileUrlNameInput,
          file_url: fileUrlInput,
          user_id: user.id,
        });
      setUploadingFile(false);
      if (insertError) {
        setFileError('Failed to save file record.');
        return;
      }
      setFileUrlInput("");
      setFileUrlNameInput("");
      queryClient.invalidateQueries({ queryKey: ['planner-files', id] });
    }
  }

  // Delete file handler
  async function handleDeleteFile(file: any) {
    if (!window.confirm('Delete this file?')) return;
    // Remove from storage
    const filePath = file.file_url.split('/plannerfiles/')[1];
    if (filePath) {
      await supabaseClient.storage.from('plannerfiles').remove([filePath]);
    }
    // Remove from table
    await supabase
      .from('planner_files')
      .delete()
      .eq('id', file.id);
    queryClient.invalidateQueries({ queryKey: ['planner-files', id] });
  }

  if (authLoading || loading) {
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

  if (!trip) return <div className="p-8">Trip not found.</div>;

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <DashboardNav />
      <div className="lg:pl-64">
        <TopNav />
        <main className="p-6 pl-[100px]">
          <div className="space-y-6">
            <Button
              variant="ghost"
              className="mb-4 flex items-center gap-2"
              onClick={() => navigate('/planner')}
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Planner
            </Button>
            <div className="flex flex-col md:flex-row gap-8 w-full">
              {/* Left column: Trip details */}
              <div className="bg-white border rounded-xl shadow-sm p-6 flex-shrink-0 flex-grow-0" style={{ flexBasis: '35%', minWidth: 280, maxWidth: 500, height: 'fit-content', alignSelf: 'flex-start', position: 'relative' }}>
                <div>
                  <Button variant="outline" size="sm" className="absolute top-4 right-4 z-10" onClick={() => setIsEditOpen(true)}>
                    Edit
                  </Button>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 pr-16">
                      <h2 className="text-xl font-bold">{trip.title}</h2>
                    </div>
                  </div>
                  <p className="text-gray-700 mb-4">{trip.description}</p>
                  <div className="flex items-center gap-3 mb-4">
                    {trip.trips?.id ? (
                      <Link
                        to={`/trips/${trip.trips.id}`}
                        className="font-semibold text-sm text-[#7C3AED] hover:underline transition-colors"
                      >
                        {trip.trips.trip_name || trip.title}
                      </Link>
                    ) : (
                      <span className="font-semibold text-sm">{trip.trips?.trip_name || trip.title}</span>
                    )}
                    {trip.departureDate && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>{
                          new Date(trip.departureDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
                        }</span>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {clientName && (
                      <Badge variant="secondary" className="text-sm px-3 py-1 bg-gray-100 text-gray-700 border border-gray-200">{clientName}</Badge>
                    )}
                  </div>
                  <Separator />
                  <div className="space-y-2 mt-4">
                    {trip.column?.title && (
                      <div className="mb-4">
                        <Badge variant="secondary" className="text-sm px-3 py-1 bg-gray-100 text-gray-700 border border-gray-200">
                          {trip.column.title}
                        </Badge>
                      </div>
                    )}
                    <div>
                      <span className="font-medium">Tags:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {trip.tags?.length > 0 ? trip.tags.map(tag => (
                          <Badge
                            key={tag.id}
                            className="bg-gray-200 text-gray-700"
                          >
                            {tag.name}
                          </Badge>
                        )) : <span>-</span>}
                      </div>
                    </div>
                    <div>
                      <span className="font-medium">Links:</span>
                      <ul className="list-disc ml-6">
                        {trip.links?.map(link => (
                          <li key={link.id}><a href={link.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{link.title}</a></li>
                        )) || <li>-</li>}
                      </ul>
                    </div>
                    {/* Custom Fields under Links */}
                    {customFieldsLoading ? (
                      <div className="text-xs text-gray-400 mt-2">Loading fields...</div>
                    ) : customFieldsWithValues.length > 0 && (
                      <div className="mt-4">
                        <span className="font-medium">Other Fields:</span>
                        <ul className="ml-6 mt-1 space-y-1">
                          {customFieldsWithValues.map(({ field, value, id }) => (
                            <li key={id} className="flex gap-2 items-center">
                              <span className="font-semibold text-xs">{field.title}:</span>
                              <span className="text-xs">
                                {field.type === 'checkbox'
                                  ? (value === 'true' ? 'Yes' : 'No')
                                  : field.type === 'date' && value
                                    ? new Date(value).toLocaleDateString()
                                    : value || <span className="text-gray-400">-</span>}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
                <div className="mt-8 text-xs text-gray-500">
                  Last Updated: {trip.updated_at ? new Date(trip.updated_at).toLocaleString() : '-'}
                </div>
                {/* Edit Trip Sidedraw */}
                <Sheet open={isEditOpen} onOpenChange={setIsEditOpen}>
                  <SheetContent className="w-[30%]">
                    <SheetHeader>
                      <SheetTitle>Edit Trip</SheetTitle>
                    </SheetHeader>
                    {trip && (
                      <PlannerTripForm
                        initialData={{
                          ...trip,
                          links: trip.links || [],
                          notes: trip.texts?.map((t: any) => ({ title: '', content: t.content })) || [],
                          trip_id: trip.trips?.id || trip.trip_id || "",
                          customFieldValues: Object.fromEntries(
                            (customFieldsWithValues || []).map(({ field, value }) => [field.id, value])
                          ),
                        }}
                        onCancel={() => setIsEditOpen(false)}
                        onSubmit={async (data) => {
                          try {
                            // Update the trip - include departureDate field
                            const updateData: any = {
                              title: data.title,
                              description: data.description,
                              column_id: data.column_id,
                              departureDate: data.departureDate || null,
                            };
                            
                            // Only include trip_id if it's not empty
                            if (data.trip_id && data.trip_id.trim() !== '') {
                              updateData.trip_id = data.trip_id;
                            } else {
                              updateData.trip_id = null;
                            }

                            const { error: updateError } = await supabase
                              .from('planner_trips')
                              .update(updateData)
                              .eq('id', trip.id);

                            if (updateError) {
                              console.error('Error updating trip:', updateError);
                              throw updateError;
                            }

                            // Update links: remove all, then add
                            await supabase.from('planner_trip_links').delete().eq('trip_id', trip.id);
                            if (data.links?.length) {
                              await supabase.from('planner_trip_links').insert(
                                data.links.filter((l: any) => l.title && l.url).map((l: any) => ({ trip_id: trip.id, title: l.title, url: l.url }))
                              );
                            }
                            // Update notes: remove all, then add
                            await supabase.from('planner_trip_texts').delete().eq('trip_id', trip.id);
                            if (data.notes?.length) {
                              await supabase.from('planner_trip_texts').insert(
                                data.notes.filter((n: any) => n.content).map((n: any) => ({ trip_id: trip.id, content: n.content }))
                              );
                            }
                            // Update tags: remove all, then add
                            await supabase.from('planner_trip_tags').delete().eq('trip_id', trip.id);
                            if (data.tags?.length) {
                              await supabase.from('planner_trip_tags').insert(
                                data.tags.map((tag: any) => ({ trip_id: trip.id, tag_id: tag.id }))
                              );
                            }
                            setIsEditOpen(false);
                            setLoading(true);
                            // Refetch trip
                            const { data: updated, error } = await supabase
                              .from('planner_trips')
                              .select(`*,
                                column:planner_columns (id, title),
                                trips (trip_name, trip_start_date, id),
                                links:planner_trip_links (id, title, url),
                                texts:planner_trip_texts (id, content, updated_at, created_at),
                                tags:planner_trip_tags (tag:planner_tags (id, name))
                              `)
                              .eq('id', trip.id)
                              .single();
                            if (!error && updated) {
                              setTrip({
                                ...updated,
                                links: updated.links || [],
                                texts: updated.texts || [],
                                tags: updated.tags?.map((t: any) => t.tag) || [],
                              });
                            }
                            setLoading(false);
                            // Invalidate custom field values query to refresh the UI
                            queryClient.invalidateQueries({ queryKey: ["planner-trip-custom-fields", trip.id] });
                            toast({
                              title: "Success",
                              description: "Trip updated successfully",
                            });
                          } catch (error) {
                            console.error('Error in form submission:', error);
                            toast({
                              title: "Error",
                              description: "Failed to update trip. Please try again.",
                              variant: "destructive",
                            });
                          }
                        }}
                      />
                    )}
                  </SheetContent>
                </Sheet>
              </div>
              {/* Right column: Tabs */}
              <div className="bg-white border rounded-xl shadow-sm p-6 flex-1" style={{ flexBasis: '65%' }}>
                <Tabs value={tab} onValueChange={setTab} defaultValue="notes">
                  <TabsList className="mb-8 gap-4">
                    <TabsTrigger value="timeline">Timeline</TabsTrigger>
                    <TabsTrigger value="notes">Notes</TabsTrigger>
                    <TabsTrigger value="files">Files</TabsTrigger>
                  </TabsList>
                  <TabsContent value="timeline">
                    <div className="relative pl-8">
                      {timelineLoading ? (
                        <div className="text-gray-400 text-sm">Loading timeline...</div>
                      ) : timeline.length === 0 ? (
                        <div className="text-gray-400 text-sm">No timeline history yet.</div>
                      ) : (
                        <>
                          {/* Vertical line */}
                          <div className="absolute top-0 left-3 w-0.5 h-full bg-[#7C3AED]" style={{ zIndex: 0 }} />
                          <ul className="space-y-8">
                            {timeline.map((entry, idx) => (
                              <li key={entry.id} className="relative flex items-start">
                                {/* Dot */}
                                <span className="absolute left-[-0.5rem] top-2 w-3 h-3 rounded-full bg-[#7C3AED] border-2 border-white shadow" style={{ zIndex: 1 }} />
                                <div className="ml-6">
                                  <div className="flex items-end gap-2 mb-1">
                                    <span className="font-bold text-base">{entry.previous?.title || 'Unknown'}</span>
                                    <span className="mx-1 text-gray-400 text-base">→</span>
                                    <span className="font-bold text-base">{entry.column?.title || 'Unknown'}</span>
                                  </div>
                                  <div className="text-sm text-gray-600">
                                    by {entry.user?.full_name || 'Unknown User'}{entry.moved_at && (
                                      <> on {new Date(entry.moved_at).toLocaleString()}</>
                                    )}
                                  </div>
                                </div>
                              </li>
                            ))}
                          </ul>
                        </>
                      )}
                    </div>
                  </TabsContent>
                  <TabsContent value="notes">
                    {!addNoteOpen ? (
                      <Button className="mb-6" onClick={() => setAddNoteOpen(true)}>
                        Add a new note...
                      </Button>
                    ) : (
                      <form onSubmit={handleAddNote} className="mb-6 space-y-4 bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700">Title</label>
                          <Input
                            placeholder="Title"
                            value={newNoteTitle}
                            onChange={e => setNewNoteTitle(e.target.value)}
                            disabled={addingNote}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700">Content</label>
                          <Textarea
                            value={newNoteContent}
                            onChange={e => setNewNoteContent(e.target.value)}
                            placeholder="Enter your note content here..."
                            className="min-h-[150px] resize-none"
                            disabled={addingNote}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700">Attachment</label>
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-gray-700">Upload File</label>
                              <div className="flex gap-2">
                                <input
                                  ref={newNoteFileInputRef}
                                  type="file"
                                  className="block w-full text-sm text-gray-500
                                    file:mr-4 file:py-2 file:px-4
                                    file:rounded-md file:border-0
                                    file:text-sm file:font-medium
                                    file:bg-blue-50 file:text-blue-700
                                    hover:file:bg-blue-100"
                                  onChange={e => setNewNoteFile(e.target.files?.[0] || null)}
                                  disabled={addingNote}
                                />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-gray-700">Or Enter URL</label>
                              <div className="flex gap-2">
                                <Input
                                  type="url"
                                  placeholder="https://..."
                                  value={newNoteLink}
                                  onChange={e => setNewNoteLink(e.target.value)}
                                  disabled={addingNote}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                        {addNoteError && <div className="text-red-500 text-sm">{addNoteError}</div>}
                        <div className="flex gap-2 justify-end pt-4 border-t">
                          <Button type="button" variant="outline" onClick={() => { setAddNoteOpen(false); setNewNoteTitle(""); setNewNoteContent(""); setNewNoteLink(""); setNewNoteFile(null); setAddNoteError(null); }}>
                            Cancel
                          </Button>
                          <Button type="submit" disabled={addingNote || (!newNoteTitle.trim() && !newNoteContent.trim() && !newNoteLink.trim() && !newNoteFile)}>
                            Save Note
                          </Button>
                        </div>
                      </form>
                    )}
                    <div className="space-y-4">
                      {notes.length === 0 && <div className="text-gray-400 text-sm">No notes yet.</div>}
                      {notes.map(note => (
                        editingNoteId === note.id ? (
                          <form
                            key={note.id}
                            ref={editFormRef}
                            className="bg-white border-2 border-[#E9D8FD] rounded-lg p-6 shadow-sm"
                            onSubmit={e => { e.preventDefault(); saveEditNote(note); }}
                          >
                            <div className="space-y-4">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-sm" style={{ color: '#7C3AED' }}>{note.full_name || "Unknown User"}</span>
                                <span className="text-xs text-gray-400">{note.updated_at ? new Date(note.updated_at).toLocaleString() : note.created_at ? new Date(note.created_at).toLocaleString() : ''}</span>
                              </div>
                              <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Title</label>
                                <Input
                                  type="text"
                                  placeholder="Title"
                                  value={editingNoteTitle}
                                  onChange={e => setEditingNoteTitle(e.target.value)}
                                  disabled={savingNoteId === note.id}
                                />
                              </div>
                              <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Content</label>
                                <Textarea
                                  value={editingNoteContent}
                                  onChange={e => setEditingNoteContent(e.target.value)}
                                  placeholder="Enter your note content here..."
                                  className="min-h-[150px] resize-none"
                                  disabled={savingNoteId === note.id}
                                />
                              </div>
                              <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Attachment</label>
                                <div className="space-y-4">
                                  <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Upload File</label>
                                    <div className="flex gap-2">
                                      <input
                                        type="file"
                                        className="block w-full text-sm text-gray-500
                                          file:mr-4 file:py-2 file:px-4
                                          file:rounded-md file:border-0
                                          file:text-sm file:font-medium
                                          file:bg-blue-50 file:text-blue-700
                                          hover:file:bg-blue-100"
                                        onChange={e => setNewNoteFile(e.target.files?.[0] || null)}
                                        disabled={savingNoteId === note.id}
                                      />
                                    </div>
                                  </div>
                                  <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Or Enter URL</label>
                                    <div className="flex gap-2">
                                      <Input
                                        type="url"
                                        placeholder="https://..."
                                        value={editingNoteLink}
                                        onChange={e => setEditingNoteLink(e.target.value)}
                                        disabled={savingNoteId === note.id}
                                      />
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="flex gap-2 justify-end pt-4 border-t">
                                <Button type="button" variant="destructive" onClick={() => deleteNoteWithConfirmation(note)} disabled={deletingNoteId === note.id}>
                                  Delete Note
                                </Button>
                                <Button type="submit" disabled={savingNoteId === note.id || (!editingNoteTitle.trim() && !editingNoteContent.trim() && !editingNoteLink.trim() && !newNoteFile)}>
                                  Save Changes
                                </Button>
                              </div>
                            </div>
                          </form>
                        ) : (
                          <div key={note.id} className="bg-white border-2 border-[#E9D8FD] rounded-lg p-6 shadow-sm hover:bg-gray-50 transition cursor-pointer" onClick={() => startEditNote(note)}>
                            <div className="flex items-center gap-2 mb-4">
                              <span className="font-medium text-sm" style={{ color: '#7C3AED' }}>{note.full_name || "Unknown User"}</span>
                              <span className="text-xs text-gray-400">{note.updated_at ? new Date(note.updated_at).toLocaleString() : note.created_at ? new Date(note.created_at).toLocaleDateString() : ''}</span>
                            </div>
                            {note.title && (<div className="font-bold text-base mb-2">{note.title}</div>)}
                            <div className="text-sm text-gray-800 whitespace-pre-line mb-2">{note.content}</div>
                            {note.link && (
                              <div className="text-sm">
                                <a href={note.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
                                  </svg>
                                  {note.link}
                                </a>
                              </div>
                            )}
                          </div>
                        )
                      ))}
                    </div>
                  </TabsContent>
                  <TabsContent value="files">
                    <div className="mb-6">
                      <form onSubmit={handleFileUpload} className="space-y-4 bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700">Upload Method</label>
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-gray-700">Upload File</label>
                              <div className="flex gap-2">
                                <input
                                  ref={fileInputRef}
                                  type="file"
                                  className="block w-full text-sm text-gray-500
                                    file:mr-4 file:py-2 file:px-4
                                    file:rounded-md file:border-0
                                    file:text-sm file:font-medium
                                    file:bg-blue-50 file:text-blue-700
                                    hover:file:bg-blue-100"
                                  disabled={uploadingFile}
                                />
                                <Button type="submit" disabled={uploadingFile}>
                                  Upload
                                </Button>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-gray-700">Or Enter URL</label>
                              <div className="flex flex-col gap-2">
                                <Input
                                  type="text"
                                  placeholder="File Name"
                                  value={fileUrlNameInput}
                                  onChange={e => setFileUrlNameInput(e.target.value)}
                                  disabled={uploadingFile}
                                />
                                <Input
                                  type="url"
                                  placeholder="https://..."
                                  value={fileUrlInput}
                                  onChange={e => setFileUrlInput(e.target.value)}
                                  disabled={uploadingFile}
                                />
                                <Button type="submit" disabled={uploadingFile || !fileUrlInput.trim() || !fileUrlNameInput.trim()}>
                                  Add URL
                                </Button>
                              </div>
                            </div>
                          </div>
                          {fileError && <span className="text-red-500 text-xs">{fileError}</span>}
                        </div>
                      </form>
                    </div>
                    <div className="space-y-4">
                      {filesLoading ? (
                        <div className="text-gray-400 text-sm">Loading files...</div>
                      ) : files.length === 0 ? (
                        <div className="text-gray-400 text-sm">No files yet.</div>
                      ) : (
                        files.map((file: any) => (
                          <div
                            key={file.id}
                            className="flex items-center bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:bg-gray-50 transition"
                          >
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <FileText className="h-5 w-5 text-gray-400 flex-shrink-0" />
                              <div className="flex flex-col min-w-0">
                                <span className="font-medium text-blue-700 truncate">{file.name || file.file_name || 'Untitled File'}</span>
                                <span className="text-xs text-gray-500">
                                  Uploaded by {file.full_name || file.user || 'Unknown'}{file.created_at ? ` on ${new Date(file.created_at).toLocaleString()}` : ''}
                                </span>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => window.open(file.file_url, '_blank', 'noopener,noreferrer')}
                              >
                                View
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDeleteFile(file)}
                              >
                                Delete
                              </Button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
} 