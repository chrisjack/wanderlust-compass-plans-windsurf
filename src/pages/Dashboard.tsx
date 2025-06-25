import { useAuth } from "@/lib/auth";
import { Navigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardNav } from "@/components/DashboardNav";
import { TopNav } from "@/components/TopNav";
import { DashboardStats } from "@/components/DashboardStats";
import { TimeRangeSelect } from "@/components/TimeRangeSelect";
import { RecentBookings } from "@/components/RecentBookings";

export default function Dashboard() {
  const {
    user,
    loading
  } = useAuth();

  if (loading) {
    return <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-lg font-medium">Loading...</h2>
          <p className="text-gray-500">Please wait</p>
        </div>
      </div>;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const displayName = user?.user_metadata?.full_name || 
                      user?.email?.split('@')[0] || 
                      'User';

  return <div className="min-h-screen bg-[#FAFAFA]">
      <DashboardNav />
      <div className="lg:pl-64">
        <TopNav />
        <main className="p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">Welcome back, {displayName}</h1>
                <p className="text-gray-500">Here's what's happening.</p>
              </div>
              <TimeRangeSelect />
            </div>
            
            <DashboardStats />
            
            <RecentBookings />
          </div>
        </main>
      </div>
    </div>;
}
