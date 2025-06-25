import { useState } from "react";
import { MessageThreadList } from "@/components/messages/MessageThreadList";
import { MessageWindow } from "@/components/messages/MessageWindow";

export default function MessagesPage() {
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);

  return (
    <div className="flex h-[calc(100vh-64px)]">
      {/* Left column: threads list */}
      <div className="w-full max-w-xs border-r bg-card flex flex-col">
        <MessageThreadList 
          selectedThreadId={selectedThreadId} 
          onSelectThread={setSelectedThreadId} 
        />
      </div>
      {/* Right column: message window */}
      <div className="flex-1 flex flex-col">
        {selectedThreadId ? (
          <MessageWindow threadId={selectedThreadId} />
        ) : (
          <div className="flex flex-1 items-center justify-center text-muted-foreground">
            Select a conversation to view messages
          </div>
        )}
      </div>
    </div>
  );
} 