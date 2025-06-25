
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { DashboardNav } from "@/components/DashboardNav";
import { TopNav } from "@/components/TopNav";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ClientAvatar } from "@/components/clients/ClientAvatar";
import { supabase } from "@/integrations/supabase/client";
import { ClientsSheet } from "@/components/clients/ClientsSheet";
import { useToast } from "@/hooks/use-toast";
import { Edit, Trash2, Calendar, ChevronLeft } from "lucide-react";
import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function ClientDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const { toast } = useToast();

  const { data: client, isLoading } = useQuery({
    queryKey: ['client', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    },
  });

  const { data: trips } = useQuery({
    queryKey: ['client-trips', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('trips')
        .select('*')
        .contains('client_id', [id]);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!id,
  });

  const handleDelete = async () => {
    try {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast({
        title: "Client deleted",
        description: "The client has been deleted successfully",
      });
      
      navigate('/clients');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete the client",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!client) {
    return <div>Client not found</div>;
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <DashboardNav />
      <div className="lg:pl-64">
        <TopNav />
        <main className="p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={() => navigate('/clients')}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <h1 className="text-2xl font-semibold text-gray-900">Client Details</h1>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  variant="outline"
                  onClick={() => setIsEditOpen(true)}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Button>
                <Button 
                  variant="destructive"
                  onClick={handleDelete}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </div>
            </div>

            <Card className="p-6">
              <div className="flex items-center space-x-4 mb-6">
                <ClientAvatar name={client.name} size="lg" />
                <div>
                  <h2 className="text-xl font-semibold">{client.name}</h2>
                  <p className="text-gray-500">{client.organisation || 'No Organisation'}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium mb-2">Contact Information</h3>
                  <div className="space-y-2">
                    <p><span className="text-gray-500">Email:</span> {client.email || 'Not provided'}</p>
                    <p><span className="text-gray-500">Phone:</span> {client.phone || 'Not provided'}</p>
                    <p><span className="text-gray-500">Address:</span> {client.address || 'Not provided'}</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Client Details</h3>
                  <div className="space-y-2">
                    <p><span className="text-gray-500">Status:</span> {client.status || 'Not set'}</p>
                    <p><span className="text-gray-500">Total Trips:</span> {client.trips || 0}</p>
                  </div>
                </div>
              </div>
            </Card>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">Client Trips</h2>
              <Card>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Trip Name</TableHead>
                      <TableHead>Destination</TableHead>
                      <TableHead>Dates</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {trips && trips.length > 0 ? (
                      trips.map((trip) => (
                        <TableRow 
                          key={trip.id}
                          className="cursor-pointer hover:bg-gray-50"
                          onClick={() => navigate(`/trips/${trip.id}`)}
                        >
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-gray-500" />
                              {trip.trip_name}
                            </div>
                          </TableCell>
                          <TableCell>{trip.trip_destination}</TableCell>
                          <TableCell>
                            {trip.trip_start_date && new Date(trip.trip_start_date).toLocaleDateString()}
                            {trip.trip_end_date && ` to ${new Date(trip.trip_end_date).toLocaleDateString()}`}
                          </TableCell>
                          <TableCell>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              trip.trip_status === 'active' 
                                ? 'bg-green-100 text-green-800'
                                : trip.trip_status === 'completed'
                                ? 'bg-gray-100 text-gray-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {trip.trip_status || 'Draft'}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-gray-500 py-4">
                          No trips found for this client
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </Card>
            </div>
          </div>
        </main>
      </div>

      <ClientsSheet
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        initialData={client}
      />
    </div>
  );
}
