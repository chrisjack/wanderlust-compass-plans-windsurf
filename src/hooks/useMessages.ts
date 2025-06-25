
import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth';

interface Message {
  id: string;
  content: string;
  sender_id: string;
  reciever_id: string;
  created_at: string;
  read: boolean;
}

export const useMessages = (chatId: string | null) => {
  const { user } = useAuth();

  const { data: messages, isLoading, error, refetch } = useQuery({
    queryKey: ['messages', chatId],
    queryFn: async () => {
      if (!chatId || !user?.id) return [];
      
      try {
        console.log('Fetching messages for chat:', chatId);
        
        const userIds = chatId.split('-');
        
        if (userIds.length !== 2) {
          console.error('Invalid chatId format:', chatId);
          return [];
        }
        
        const otherUserId = userIds[0] === user.id ? userIds[1] : userIds[0];
        
        const { data: messages, error: messagesError } = await supabase
          .from('messages')
          .select('*')
          .or(`and(sender_id.eq.${user.id},reciever_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},reciever_id.eq.${user.id})`)
          .order('created_at', { ascending: true });

        if (messagesError) throw messagesError;
        
        // Mark messages as read
        const unreadMessages = messages?.filter(
          msg => msg.reciever_id === user.id && !msg.read
        ) || [];
        
        if (unreadMessages.length > 0) {
          const unreadIds = unreadMessages.map(msg => msg.id);
          await supabase
            .from('messages')
            .update({ read: true })
            .in('id', unreadIds);
        }

        return messages || [];
      } catch (error) {
        console.error("Error in chat query:", error);
        throw error;
      }
    },
    enabled: !!chatId && !!user?.id,
  });

  // Set up real-time subscription
  useEffect(() => {
    if (!chatId || !user?.id) return;

    const userIds = chatId.split('-');
    if (userIds.length !== 2) return;

    const otherUserId = userIds[0] === user.id ? userIds[1] : userIds[0];

    const channel = supabase
      .channel('chat_messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `or(and(sender_id.eq.${user.id},reciever_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},reciever_id.eq.${user.id}))`,
        },
        () => {
          console.log('New message received, refetching');
          refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [chatId, user?.id, refetch]);

  if (error) {
    toast.error('Failed to load messages');
    console.error('Error loading messages:', error);
  }

  return { messages, isLoading, error };
};
