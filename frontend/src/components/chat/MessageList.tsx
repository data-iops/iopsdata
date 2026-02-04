"use client";

import { useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";

import { ChatMessage, type ChatMessageData } from "@/components/chat/ChatMessage";


type MessageListProps = {
  messages: ChatMessageData[];
  isLoading: boolean;
  onRunQuery?: (sql: string) => void;
};

export function MessageList({ messages, isLoading, onRunQuery }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  if (messages.length === 0 && !isLoading) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
        Start by asking a question.
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col gap-6 overflow-y-auto pr-2">
      {messages.map((message) => (
        <ChatMessage key={message.id} message={message} onRunQuery={onRunQuery} />
      ))}
      {isLoading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Thinking...
        </div>
      ) : null}
      <div ref={bottomRef} />
    </div>
  );
}
