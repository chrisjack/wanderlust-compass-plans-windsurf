import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { MessageThreadList } from '@/components/messages/MessageThreadList';
import { MessageWindow } from '@/components/messages/MessageWindow';
import { DashboardNav } from '@/components/DashboardNav';
import { TopNav } from '@/components/TopNav';
import { useSearchParams } from "react-router-dom";
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';

const Messages = () => {
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const tripId = searchParams.get('trip');

  const handleBack = () => {
    setSelectedThreadId(null);
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <DashboardNav />
      <div className="lg:pl-64">
        <TopNav />
        <div className="container mx-auto p-4 h-[calc(100vh-4rem)]">
          <div className="flex items-center gap-4 mb-4">
            {selectedThreadId && (
              <Button 
                variant="ghost" 
                className="md:hidden" 
                onClick={handleBack}
              >
                <ChevronLeft className="h-5 w-5 mr-1" />
                Back
              </Button>
            )}
            <h1 className="text-2xl font-bold">Messages</h1>
          </div>
          <div className="flex flex-col md:grid md:grid-cols-3 gap-4 h-[90%]">
            {/* Left panel - Threads List */}
            <Card className={`p-0 overflow-hidden h-full flex flex-col ${
              selectedThreadId ? 'hidden md:block' : 'block'
            }`}>
              <MessageThreadList 
                selectedThreadId={selectedThreadId}
                onSelectThread={setSelectedThreadId}
                initialTripId={tripId}
              />
            </Card>

            {/* Right panel - Message Window */}
            <Card className={`p-0 overflow-hidden h-full flex flex-col ${
              selectedThreadId ? 'block' : 'hidden md:block'
            } md:col-span-2`}>
              {selectedThreadId ? (
                <MessageWindow threadId={selectedThreadId} />
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground p-4 text-center">
                  <div>
                    <p className="mb-2">Select a conversation to start chatting</p>
                    <p className="text-sm">Or create a new chat using the button on the left</p>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;
