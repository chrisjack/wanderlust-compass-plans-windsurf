
import React from 'react';

interface ChatHeaderProps {
  otherUserName: string;
}

const ChatHeader = ({ otherUserName }: ChatHeaderProps) => {
  return (
    <div className="p-4 border-b">
      <h3 className="font-medium">{otherUserName || 'Unknown User'}</h3>
    </div>
  );
};

export default ChatHeader;
