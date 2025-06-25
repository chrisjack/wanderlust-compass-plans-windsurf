
import React from 'react';
import { formatDistanceToNow } from 'date-fns';

interface ConversationItemProps {
  id: string;
  otherUserName: string;
  lastMessage: string;
  lastMessageTime: string;
  tripName?: string;
  unread: boolean;
  isSelected: boolean;
  onSelect: (chatId: string) => void;
}

const ConversationItem = ({
  id,
  otherUserName,
  lastMessage,
  lastMessageTime,
  tripName,
  unread,
  isSelected,
  onSelect,
}: ConversationItemProps) => {
  return (
    <div
      onClick={() => onSelect(id)}
      className={`
        p-3 rounded-lg cursor-pointer hover:bg-accent transition-colors
        ${unread ? 'font-medium' : ''}
        ${isSelected ? 'bg-accent/70' : ''}
      `}
    >
      <div className="flex justify-between items-start">
        <div className="font-medium">{otherUserName}</div>
        <div className="text-xs text-muted-foreground">
          {formatDistanceToNow(new Date(lastMessageTime), { addSuffix: true })}
        </div>
      </div>
      
      <div className="text-sm text-muted-foreground truncate mt-1">
        {lastMessage}
      </div>
      
      {tripName && (
        <div className="mt-1 text-xs px-2 py-1 bg-primary/10 rounded-full inline-block">
          {tripName}
        </div>
      )}
      
      {unread && (
        <div className="w-2 h-2 rounded-full bg-primary mt-1 ml-1"></div>
      )}
    </div>
  );
};

export default ConversationItem;
