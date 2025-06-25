
import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { formatDistanceToNow } from 'date-fns';

interface Message {
  id: string;
  content: string;
  created_at: string;
  sender_id: string;
  read: boolean;
}

const MessageList = ({ tripId }: { tripId: string }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);

  const { data: fetchedMessages, refetch } = useQuery({
    queryKey: ['messages', tripId],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('trip_id', tripId)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user && !!tripId
  });

  useEffect(() => {
    if (fetchedMessages) {
      setMessages(fetchedMessages);
    }
  }, [fetchedMessages]);

  // Real-time subscription
  useEffect(() => {
    if (!tripId) return;

    const channel = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'messages',
          filter: `trip_id=eq.${tripId}`
        },
        (payload) => {
          setMessages((prevMessages) => [...prevMessages, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tripId]);

  if (!messages.length) {
    return <div className="flex-grow flex items-center justify-center text-gray-500">No messages yet</div>;
  }

  return (
    <div className="flex-grow overflow-y-auto space-y-3 p-4 bg-gray-50 rounded-lg">
      {messages.map((message) => (
        <div 
          key={message.id} 
          className={`flex ${message.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
        >
          <div 
            className={`max-w-[70%] p-3 rounded-lg ${
              message.sender_id === user?.id 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 text-black'
            }`}
          >
            <p>{message.content}</p>
            <span className="text-xs opacity-70 block mt-1">
              {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MessageList;
