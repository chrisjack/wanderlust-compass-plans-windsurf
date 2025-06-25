
import React, { useRef, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { ScrollArea } from '@/components/ui/scroll-area';
import MessageInput from './MessageInput';
import { useMessages } from '@/hooks/useMessages';
import MessageBubble from './MessageBubble';
import ChatHeader from './ChatHeader';
import { supabase } from '@/integrations/supabase/client';

interface Profile {
  id: string;
  full_name: string;
}

const ChatWindow = ({ chatId }: { chatId: string | null }) => {
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { messages, isLoading } = useMessages(chatId);
  const [profiles, setProfiles] = React.useState<Map<string, Profile>>(new Map());

  // Fetch profiles when chat ID changes
  useEffect(() => {
    const fetchProfiles = async () => {
      if (!chatId) return;
      
      const userIds = chatId.split('-');
      if (userIds.length !== 2) return;

      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', userIds);

      if (profilesData) {
        const profilesMap = new Map<string, Profile>();
        profilesData.forEach(profile => {
          profilesMap.set(profile.id, profile);
        });
        setProfiles(profilesMap);
      }
    };

    fetchProfiles();
  }, [chatId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Handle send message
  const handleSendMessage = async (content: string) => {
    if (!chatId || !user?.id || !content.trim()) return;
    
    const userIds = chatId.split('-');
    if (userIds.length !== 2) return;
    
    const otherUserId = userIds[0] === user.id ? userIds[1] : userIds[0];
    
    try {
      await supabase.from('messages').insert({
        content,
        sender_id: user.id,
        reciever_id: otherUserId,
        read: false
      });
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  if (!chatId) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground p-4 text-center">
        <div>
          <p className="mb-2">Select a conversation to start chatting</p>
          <p className="text-sm">Or create a new chat using the button on the left</p>
        </div>
      </div>
    );
  }

  // Extract other user's info for the header
  const userIds = chatId.split('-');
  const otherUserId = userIds.length === 2 
    ? (userIds[0] === user?.id ? userIds[1] : userIds[0])
    : null;
  const otherUser = otherUserId ? profiles.get(otherUserId) : null;

  return (
    <div className="flex flex-col h-full">
      {otherUser && <ChatHeader otherUserName={otherUser.full_name} />}

      {isLoading ? (
        <div className="flex items-center justify-center flex-grow p-4">
          Loading messages...
        </div>
      ) : (
        <ScrollArea className="flex-grow p-4">
          <div className="space-y-4">
            {messages && messages.length > 0 ? (
              messages.map((message) => (
                <MessageBubble
                  key={message.id}
                  content={message.content}
                  created_at={message.created_at}
                  isCurrentUser={message.sender_id === user?.id}
                  read={message.read}
                />
              ))
            ) : (
              <div className="flex items-center justify-center p-4 text-muted-foreground">
                No messages yet. Start the conversation!
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      )}

      <div className="p-4 border-t">
        <MessageInput onSendMessage={handleSendMessage} />
      </div>
    </div>
  );
};

export default ChatWindow;
