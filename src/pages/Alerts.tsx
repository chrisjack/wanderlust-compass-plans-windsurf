
import { useAuth } from "@/lib/auth";
import { DashboardNav } from "@/components/DashboardNav";
import { TopNav } from "@/components/TopNav";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AlertList } from "@/components/alerts/AlertList";
import { Navigate } from "react-router-dom";

export default function Alerts() {
  const { user, loading } = useAuth();

  const { data: alerts, isLoading: alertsLoading } = useQuery({
    queryKey: ['alerts', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('alerts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id
  });

  if (loading || alertsLoading) {
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

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <DashboardNav />
      <div className="lg:pl-64">
        <TopNav />
        <main className="p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Alerts</h1>
              <p className="text-gray-500">View and manage your notifications</p>
            </div>
            <AlertList alerts={alerts || []} />
          </div>
        </main>
      </div>
    </div>
  );
}
