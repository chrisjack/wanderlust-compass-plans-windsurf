import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { RealtimeChannel } from "@supabase/supabase-js";
import { useAuth } from "@/lib/auth";
import { formatDistanceToNow } from "date-fns";
import { NewChatDialog } from "./NewChatDialog";

interface MessageThreadListProps {
  selectedThreadId: string | null;
  onSelectThread: (threadId: string) => void;
  initialTripId?: string | null;
}

interface Thread {
  id: string;
  senderName: string;
  receiverName: string;
  tripName: string;
  lastMessage: string;
  lastMessageTime: string;
  unread: boolean;
}

interface Profile {
  id: string;
  full_name: string;
}

interface Trip {
  id: string;
  name: string;
}

export function MessageThreadList({ selectedThreadId, onSelectThread, initialTripId }: MessageThreadListProps) {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const userId = user?.id || '';
  const [showNewChatDialog, setShowNewChatDialog] = useState(false);

  // Function to fetch and process threads
  const fetchAndProcessThreads = async () => {
    if (!userId) {
      console.error('No user ID available');
      return;
    }

    setLoading(true);
    console.log('Fetching threads for user:', userId);
    
    try {
      const { data: messages, error } = await supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${userId},reciever_id.eq.${userId}`)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching messages:', error);
        setThreads([]);
        setLoading(false);
        return;
      }

      console.log('Fetched messages:', messages);

      if (!messages || messages.length === 0) {
        setThreads([]);
        setLoading(false);
        return;
      }

      // Get unique user IDs and trip IDs
      const userIds = new Set<string>();
      const tripIds = new Set<string>();
      messages.forEach(msg => {
        userIds.add(msg.sender_id);
        userIds.add(msg.reciever_id);
        tripIds.add(msg.trip_id);
      });

      // Fetch profiles and trips in parallel
      const [profilesResponse, tripsResponse] = await Promise.all([
        supabase.from('profiles').select('id, full_name').in('id', Array.from(userIds)),
        supabase.from('trips').select('id, trip_name').in('id', Array.from(tripIds))
      ]);

      const profiles = new Map<string, Profile>();
      profilesResponse.data?.forEach(profile => {
        profiles.set(profile.id, profile);
      });

      const trips = new Map<string, Trip>();
      tripsResponse.data?.forEach(trip => {
        trips.set(trip.id, { id: trip.id, name: trip.trip_name });
      });

      // Process messages into threads
      const threadMap = new Map<string, Thread>();
      for (const msg of messages) {
        const threadId = msg.trip_id;
        if (!threadMap.has(threadId)) {
          const senderProfile = profiles.get(msg.sender_id);
          const receiverProfile = profiles.get(msg.reciever_id);
          const trip = trips.get(msg.trip_id);

          threadMap.set(threadId, {
            id: threadId,
            senderName: senderProfile?.full_name || 'Unknown',
            receiverName: receiverProfile?.full_name || 'Unknown',
            tripName: trip?.name || 'Unknown Trip',
            lastMessage: msg.content,
            lastMessageTime: msg.created_at,
            unread: !msg.read && msg.reciever_id === userId,
          });
        }
      }

      const threadsArr = Array.from(threadMap.values());
      console.log('Processed threads:', threadsArr);
      
      setThreads(threadsArr);
    } catch (error) {
      console.error('Error in fetchAndProcessThreads:', error);
      setThreads([]);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    if (userId) {
      fetchAndProcessThreads();
    }
  }, [userId]);

  // Handle initial trip ID
  useEffect(() => {
    if (initialTripId) {
      // Check if there's already a thread for this trip
      const existingThread = threads.find(thread => thread.id === initialTripId);
      if (existingThread) {
        onSelectThread(existingThread.id);
      } else {
        // If no thread exists, open the new chat dialog
        setShowNewChatDialog(true);
      }
    }
  }, [initialTripId, threads]);

  // Set up real-time subscription
  useEffect(() => {
    if (!userId) return;

    let subscription: RealtimeChannel;

    const setupSubscription = async () => {
      subscription = supabase
        .channel('messages-channel')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'messages',
            filter: `or(sender_id.eq.${userId},reciever_id.eq.${userId})`,
          },
          async () => {
            console.log('Message change detected, refetching threads');
            await fetchAndProcessThreads();
          }
        )
        .subscribe();
    };

    setupSubscription();

    return () => {
      if (subscription) {
        supabase.removeChannel(subscription);
      }
    };
  }, [userId]);

  // Mark messages as read when thread is selected
  useEffect(() => {
    if (selectedThreadId) {
      const updateReadStatus = async () => {
        await supabase
          .from('messages')
          .update({ read: true })
          .eq('trip_id', selectedThreadId)
          .eq('reciever_id', userId);
        
        // Update local state to remove unread badge
        setThreads(prev => 
          prev.map(thread => 
            thread.id === selectedThreadId 
              ? { ...thread, unread: false }
              : thread
          )
        );
      };
      updateReadStatus();
    }
  }, [selectedThreadId, userId]);

  if (!userId) {
    return (
      <div className="flex flex-col h-full">
        <div className="p-4 border-b">
          <span className="font-semibold text-lg">Messages</span>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-muted-foreground">Please sign in to view messages</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b flex items-center justify-between">
        <span className="font-semibold text-lg">Messages</span>
        <NewChatDialog 
          onChatCreated={fetchAndProcessThreads} 
          initialTripId={initialTripId}
          open={showNewChatDialog}
          onOpenChange={setShowNewChatDialog}
        />
      </div>
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-4 text-muted-foreground">Loading...</div>
        ) : threads.length === 0 ? (
          <div className="p-4 text-muted-foreground">No conversations</div>
        ) : (
          threads.map(thread => (
            <div
              key={thread.id}
              className={`p-4 cursor-pointer hover:bg-muted/40 flex flex-col gap-1 ${
                selectedThreadId === thread.id ? 'bg-muted' : ''
              }`}
              onClick={() => onSelectThread(thread.id)}
            >
              <div className="flex items-center justify-between">
                <div className="font-semibold text-base">
                  {thread.senderName} → {thread.receiverName}
                </div>
                {thread.unread && <span className="w-2 h-2 rounded-full bg-red-500" />}
              </div>
              <div className="text-sm text-muted-foreground">
                {thread.tripName}
              </div>
              <div className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(thread.lastMessageTime), { addSuffix: true })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
} 