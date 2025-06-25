
import React from 'react';
import { formatDistanceToNow } from 'date-fns';

interface MessageBubbleProps {
  content: string;
  created_at: string;
  isCurrentUser: boolean;
  read: boolean;
}

const MessageBubble = ({ content, created_at, isCurrentUser, read }: MessageBubbleProps) => {
  return (
    <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex flex-col max-w-[70%] ${isCurrentUser ? 'items-end' : 'items-start'}`}>
        <div
          className={`p-3 rounded-lg ${
            isCurrentUser
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted'
          }`}
        >
          {content}
        </div>
        <div className="flex items-center space-x-1 mt-1 text-xs text-muted-foreground">
          <span>
            {formatDistanceToNow(new Date(created_at), { addSuffix: true })}
          </span>
          {isCurrentUser && (
            <span>{read ? '• Read' : '• Sent'}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
