
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { Navigate } from "react-router-dom";
import { DashboardNav } from "@/components/DashboardNav";
import { TopNav } from "@/components/TopNav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ProfileForm } from "@/components/ProfileForm";
import { ProfileView } from "@/components/ProfileView";
import { AgentInviteForm } from "@/components/AgentInviteForm";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

export default function Profile() {
  const { user, loading } = useAuth();
  const [isEditing, setIsEditing] = useState(false);

  const { data: profile, refetch, isLoading: profileLoading } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id
  });

  if (loading || profileLoading) {
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

  const handleUpdateComplete = () => {
    setIsEditing(false);
    refetch();
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <DashboardNav />
      <div className="lg:pl-64">
        <TopNav />
        <main className="p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Profile Settings</h1>
              <p className="text-gray-500">Manage your account details and preferences.</p>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Your profile information and preferences.</CardDescription>
              </CardHeader>
              <CardContent>
                <ProfileView profile={profile} onEdit={() => setIsEditing(true)} />
              </CardContent>
            </Card>

            {profile?.admin && (
              <Card>
                <CardHeader>
                  <CardTitle>Invite Agents</CardTitle>
                  <CardDescription>Invite new agents to join your organization.</CardDescription>
                </CardHeader>
                <CardContent>
                  <AgentInviteForm />
                </CardContent>
              </Card>
            )}

            <Sheet open={isEditing} onOpenChange={setIsEditing}>
              <SheetContent className="overflow-y-auto w-full sm:max-w-xl">
                <SheetHeader>
                  <SheetTitle>Edit Profile</SheetTitle>
                </SheetHeader>
                <div className="mt-6">
                  <ProfileForm profile={profile} onUpdate={handleUpdateComplete} />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </main>
      </div>
    </div>
  );
}
