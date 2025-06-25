
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Conversation {
  id: string;
  otherUserName: string;
  lastMessage: string;
  lastMessageTime: string;
  tripName?: string;
  unread: boolean;
}

export const useConversations = (userId: string | undefined) => {
  const { data: conversations, isLoading, error, refetch } = useQuery({
    queryKey: ['conversations', userId],
    queryFn: async () => {
      if (!userId) return [];

      try {
        console.log('Fetching conversations for user:', userId);

        const { data: messages, error: messagesError } = await supabase
          .from('messages')
          .select('*')
          .or(`sender_id.eq.${userId},reciever_id.eq.${userId}`)
          .order('created_at', { ascending: false });

        if (messagesError) {
          console.error('Error fetching messages:', messagesError);
          throw messagesError;
        }

        if (!messages || messages.length === 0) {
          console.log('No messages found');
          return [];
        }

        console.log('Messages found:', messages.length);

        const userIds = new Set<string>();
        messages.forEach(message => {
          if (message.sender_id !== userId) userIds.add(message.sender_id);
          if (message.reciever_id !== userId) userIds.add(message.reciever_id);
        });

        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, full_name')
          .in('id', Array.from(userIds));

        if (profilesError) {
          console.error('Error fetching profiles:', profilesError);
          throw profilesError;
        }

        const userNames = new Map<string, string>();
        profiles?.forEach(profile => {
          userNames.set(profile.id, profile.full_name || 'Unknown User');
        });

        const tripIds = new Set<string>();
        messages.forEach(message => {
          if (message.trip_id) tripIds.add(message.trip_id);
        });

        let tripNames = new Map<string, string>();
        
        if (tripIds.size > 0) {
          const { data: trips, error: tripsError } = await supabase
            .from('trips')
            .select('id, trip_name')
            .in('id', Array.from(tripIds));

          if (tripsError) {
            console.error('Error fetching trips:', tripsError);
          } else if (trips) {
            tripNames = new Map(trips.map(trip => [trip.id, trip.trip_name]));
          }
        }

        const conversationsMap = new Map<string, Conversation>();
        
        messages.forEach(message => {
          const otherUserId = message.sender_id === userId 
            ? message.reciever_id 
            : message.sender_id;
          
          const chatId = [userId, otherUserId].sort().join('-');
          
          if (!conversationsMap.has(chatId)) {
            conversationsMap.set(chatId, {
              id: chatId,
              otherUserName: userNames.get(otherUserId) || 'Unknown User',
              lastMessage: message.content || '',
              lastMessageTime: message.created_at,
              unread: message.reciever_id === userId && !message.read,
              tripName: message.trip_id ? tripNames.get(message.trip_id) : undefined
            });
          } else {
            const existing = conversationsMap.get(chatId)!;
            if (new Date(message.created_at) > new Date(existing.lastMessageTime)) {
              existing.lastMessage = message.content || '';
              existing.lastMessageTime = message.created_at;
              existing.unread = message.reciever_id === userId && !message.read;
              conversationsMap.set(chatId, existing);
            }
          }
        });

        return Array.from(conversationsMap.values())
          .sort((a, b) => new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime());
      } catch (error) {
        console.error('Error in conversation query:', error);
        throw error;
      }
    },
    enabled: !!userId,
  });

  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel('messages_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `or(sender_id.eq.${userId},reciever_id.eq.${userId})`,
        },
        () => {
          console.log('Message change detected, refetching conversations');
          refetch();
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, refetch]);

  if (error) {
    toast.error("Failed to load conversations");
    console.error("Error fetching conversations:", error);
  }

  return { conversations, isLoading, error };
};
