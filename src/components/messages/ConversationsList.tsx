
import React, { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import ConversationItem from './ConversationItem';
import { useConversations } from '@/hooks/useConversations';

interface ConversationsListProps {
  selectedChatId: string | null;
  onSelectChat: (chatId: string) => void;
}

const ConversationsList = ({ selectedChatId, onSelectChat }: ConversationsListProps) => {
  const { user } = useAuth();
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);
  const { conversations, isLoading } = useConversations(user?.id);

  return (
    <>
      <div className="p-4 border-b flex justify-between items-center">
        <h2 className="font-semibold">Conversations</h2>
        <Dialog open={isNewChatOpen} onOpenChange={setIsNewChatOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              New Chat
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Start New Chat</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <p>Coming soon: Select a client or trip to start a chat</p>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <ScrollArea className="flex-grow">
        <div className="p-2">
          {isLoading ? (
            <div className="flex items-center justify-center p-8 text-muted-foreground">
              Loading conversations...
            </div>
          ) : conversations && conversations.length > 0 ? (
            <div className="space-y-2">
              {conversations.map((conversation) => (
                <ConversationItem
                  key={conversation.id}
                  {...conversation}
                  isSelected={selectedChatId === conversation.id}
                  onSelect={onSelectChat}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
              <p>No conversations yet</p>
              <p className="text-sm mt-2">Start a new chat to begin messaging</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </>
  );
};

export default ConversationsList;
