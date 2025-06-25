import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { RealtimeChannel } from "@supabase/supabase-js";

interface MessageWindowProps {
  threadId: string;
}

interface Message {
  id: string;
  content: string;
  created_at: string;
  sender_id: string;
  reciever_id: string;
  trip_id: string;
}

interface ThreadInfo {
  senderName: string;
  receiverName: string;
  tripName: string;
}

export function MessageWindow({ threadId }: MessageWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [threadInfo, setThreadInfo] = useState<ThreadInfo | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const userId = localStorage.getItem('user_id') || '';

  // Fetch thread info
  useEffect(() => {
    const fetchThreadInfo = async () => {
      if (!threadId) return;
      
      try {
        // Get the first message to get sender and receiver IDs
        const { data: messageData } = await supabase
          .from('messages')
          .select('sender_id, reciever_id, trip_id')
          .eq('trip_id', threadId)
          .limit(1)
          .single();

        if (messageData) {
          // Fetch profiles and trip info
          const [profilesResponse, tripResponse] = await Promise.all([
            supabase
              .from('profiles')
              .select('id, full_name')
              .in('id', [messageData.sender_id, messageData.reciever_id]),
            supabase
              .from('trips')
              .select('trip_name')
              .eq('id', messageData.trip_id)
              .single()
          ]);

          const profiles = new Map();
          profilesResponse.data?.forEach(profile => {
            profiles.set(profile.id, profile.full_name);
          });

          setThreadInfo({
            senderName: profiles.get(messageData.sender_id) || 'Unknown',
            receiverName: profiles.get(messageData.reciever_id) || 'Unknown',
            tripName: tripResponse.data?.trip_name || 'Unknown Trip'
          });
        }
      } catch (error) {
        console.error('Error fetching thread info:', error);
      }
    };

    fetchThreadInfo();
  }, [threadId]);

  const fetchMessages = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('trip_id', threadId)
      .order('created_at', { ascending: true });

    if (!error && data) {
      setMessages(data);
      // Mark messages as read
      const unreadMessages = data.filter(msg => 
        msg.reciever_id === userId && !msg.read
      );
      if (unreadMessages.length > 0) {
        await supabase
          .from('messages')
          .update({ read: true })
          .eq('trip_id', threadId)
          .eq('reciever_id', userId);
      }
    }
    setLoading(false);
  };

  // Initial fetch
  useEffect(() => {
    fetchMessages();
  }, [threadId]);

  // Set up real-time subscription
  useEffect(() => {
    let subscription: RealtimeChannel;

    const setupSubscription = async () => {
      subscription = supabase
        .channel(`messages-${threadId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'messages',
            filter: `trip_id=eq.${threadId}`,
          },
          async (payload) => {
            if (payload.eventType === 'INSERT') {
              const newMessage = payload.new as Message;
              setMessages(prev => [...prev, newMessage]);
              // Mark message as read if we're the receiver
              if (newMessage.reciever_id === userId) {
                await supabase
                  .from('messages')
                  .update({ read: true })
                  .eq('id', newMessage.id);
              }
            }
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
  }, [threadId, userId]);

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || sending) return;

    setSending(true);
    const newMessage = {
      content: input.trim(),
      trip_id: threadId,
      sender_id: userId,
      reciever_id: messages[0]?.sender_id === userId ? messages[0]?.reciever_id : messages[0]?.sender_id,
      created_at: new Date().toISOString(),
      read: false,
    };

    const { error } = await supabase
      .from('messages')
      .insert(newMessage);

    if (!error) {
      setInput("");
    }
    setSending(false);
  };

  return (
    <div className="flex flex-col h-full">
      {threadInfo && (
        <div className="border-b px-4 py-3">
          <div className="font-medium">{threadInfo.senderName} → {threadInfo.receiverName}</div>
          <div className="text-sm text-muted-foreground">{threadInfo.tripName}</div>
        </div>
      )}
      <div className="flex-1 overflow-y-auto p-6">
        {loading ? (
          <div className="text-muted-foreground">Loading...</div>
        ) : messages.length === 0 ? (
          <div className="text-muted-foreground">No messages yet</div>
        ) : (
          <div className="space-y-4">
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`max-w-[70%] px-4 py-2 rounded-lg ${
                  msg.sender_id === userId 
                    ? 'bg-blue-100 ml-auto text-right' 
                    : 'bg-muted'
                }`}
              >
                <div>{msg.content}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {new Date(msg.created_at).toLocaleString()}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
      <form className="border-t p-4 flex gap-2" onSubmit={handleSend}>
        <input
          className="w-full border rounded px-3 py-2"
          placeholder="Type a message..."
          value={input}
          onChange={e => setInput(e.target.value)}
          disabled={sending}
        />
        <button 
          type="submit" 
          className={`px-4 py-2 rounded text-white ${
            sending ? 'bg-blue-300' : 'bg-blue-500 hover:bg-blue-600'
          }`}
          disabled={sending}
        >
          {sending ? 'Sending...' : 'Send'}
        </button>
      </form>
    </div>
  );
} 