import { DashboardNav } from "@/components/DashboardNav";
import { TopNav } from "@/components/TopNav";
import { TaskBoard } from "@/components/tasks/TaskBoard";
import { useAuth } from "@/lib/auth";
import { Navigate } from "react-router-dom";

export default function Planner() {
  const { user, loading } = useAuth();

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

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <DashboardNav />
      <div className="lg:pl-64">
        <TopNav />
        <div className="p-4 pl-[100px]">
          <div className="space-y-6">
            <TaskBoard />
          </div>
        </div>
      </div>
    </div>
  );
}
