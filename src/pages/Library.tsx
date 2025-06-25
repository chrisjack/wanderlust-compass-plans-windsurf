
import { useState } from "react";
import { DashboardNav } from "@/components/DashboardNav";
import { TopNav } from "@/components/TopNav";
import { LibraryTable } from "@/components/library/LibraryTable";
import { LibraryUpload } from "@/components/library/LibraryUpload";
import { WikiVoyageSearch } from "@/components/library/WikiVoyageSearch";
import { Card, CardContent } from "@/components/ui/card";
import { Toaster } from "@/components/ui/toaster";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Library() {
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <DashboardNav />
      <div className="lg:pl-64">
        <TopNav />
        <main className="p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-semibold text-gray-900">Library</h1>
              <LibraryUpload 
                open={isUploadOpen} 
                onOpenChange={setIsUploadOpen}
              />
            </div>
            
            <Tabs defaultValue="documents" className="w-full">
              <TabsList>
                <TabsTrigger value="documents">My Documents</TabsTrigger>
                <TabsTrigger value="wikivoyage">WikiVoyage</TabsTrigger>
              </TabsList>
              
              <TabsContent value="documents">
                <Card>
                  <CardContent className="p-0">
                    <LibraryTable />
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="wikivoyage">
                <Card>
                  <CardContent className="p-6">
                    <WikiVoyageSearch />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
      <Toaster />
    </div>
  );
}
