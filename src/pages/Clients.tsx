import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DashboardNav } from "@/components/DashboardNav";
import { TopNav } from "@/components/TopNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { ClientsTable } from "@/components/clients/ClientsTable";
import { ClientGrowthChart } from "@/components/clients/ClientGrowthChart";
import { ClientStatsCards } from "@/components/clients/ClientStatsCards";
import { ClientsSheet } from "@/components/clients/ClientsSheet";
import { TravelingClientsTable } from "@/components/clients/TravelingClientsTable";
import { TopClientsSection } from "@/components/clients/TopClientsSection";
import { supabase } from "@/integrations/supabase/client";
import { useTimeRange } from "@/components/TimeRangeSelect";

export default function Clients() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const { timeRange } = useTimeRange();
  
  const { data: clients = [] } = useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('name');
      
      if (error) {
        throw new Error(error.message);
      }
      
      return data || [];
    },
  });

  const { data: trips = [] } = useQuery({
    queryKey: ['trips'],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('trips')
        .select('*');
      
      if (error) {
        throw new Error(error.message);
      }
      
      return data || [];
    },
  });

  const activeTrips = trips.filter(trip => {
    const startDate = trip.trip_start_date ? new Date(trip.trip_start_date) : null;
    const endDate = trip.trip_end_date ? new Date(trip.trip_end_date) : null;
    const now = new Date();
    
    return startDate && endDate && startDate <= now && endDate >= now;
  });

  const upcomingTrips = trips.filter(trip => {
    const startDate = trip.trip_start_date ? new Date(trip.trip_start_date) : null;
    const now = new Date();
    
    return startDate && startDate > now;
  });

  const travelingClientIds = new Set();
  activeTrips.forEach(trip => {
    if (trip.client_id) {
      const clientIds = typeof trip.client_id === 'string' 
        ? [trip.client_id] 
        : Array.isArray(trip.client_id) 
          ? trip.client_id 
          : Object.keys(trip.client_id || {});
      
      clientIds.forEach(id => travelingClientIds.add(id));
    }
  });

  const travelingClients = clients.filter(client => 
    travelingClientIds.has(client.id)
  );

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <DashboardNav />
      <div className="lg:pl-64">
        <TopNav />
        <main className="p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-semibold text-gray-900">Clients</h1>
              <Button 
                className="bg-primary hover:bg-primary/90"
                onClick={() => setIsCreateOpen(true)}
              >
                <Plus className="mr-2 h-4 w-4" /> Add Client
              </Button>
            </div>
            
            <ClientStatsCards 
              totalClients={clients.length} 
              upcomingClients={travelingClients.length} 
            />
            
            <ClientGrowthChart clients={clients} timeRange={timeRange} />
            
            <TravelingClientsTable clients={travelingClients} />
            
            <TopClientsSection clients={clients} trips={trips} />
            
            <Card className="mt-6">
              <CardContent className="p-0">
                <ClientsTable clients={clients} />
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
      
      <ClientsSheet 
        open={isCreateOpen} 
        onOpenChange={setIsCreateOpen}
      />
    </div>
  );
}
