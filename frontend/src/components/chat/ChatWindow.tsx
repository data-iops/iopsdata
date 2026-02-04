"use client";

import { useMemo, useState } from "react";

import { ChatHeader } from "@/components/chat/ChatHeader";
import { ChatInput } from "@/components/chat/ChatInput";
import { MessageList } from "@/components/chat/MessageList";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

import type { ChatMessageData } from "@/components/chat/ChatMessage";

const createMessage = (
  role: ChatMessageData["role"],
  content: string,
  sql?: string | null,
): ChatMessageData => ({
  id: crypto.randomUUID(),
  role,
  content,
  sql: sql ?? null,
  timestamp: new Date(),
});

type ChatWindowProps = {
  className?: string;
};

export function ChatWindow({ className }: ChatWindowProps) {
  const [messages, setMessages] = useState<ChatMessageData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const latestSql = useMemo(() => {
    const lastAssistant = [...messages].reverse().find((message) => message.sql);
    return lastAssistant?.sql ?? "-- SQL will appear here";
  }, [messages]);

  const handleSend = async (content: string) => {
    if (isLoading) return;
    const userMessage = createMessage("user", content);
    const assistantMessage = createMessage("assistant", "", null);

    setMessages((prev) => [...prev, userMessage, assistantMessage]);
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: content }),
      });

      if (!response.ok) {
        throw new Error("Failed to reach chat service");
      }

      const contentType = response.headers.get("content-type") ?? "";
      if (response.body && contentType.includes("text/event-stream")) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let accumulated = "";
        let sqlBlock: string | null = null;

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          const parts = buffer.split("\n\n");
          buffer = parts.pop() ?? "";

          parts.forEach((part) => {
            const lines = part
              .split("\n")
              .map((line) => line.replace(/^data:\s*/, "").trim())
              .filter(Boolean);

            lines.forEach((line) => {
              try {
                const payload = JSON.parse(line) as {
                  message?: string;
                  sql?: string;
                };
                if (payload.message) {
                  accumulated += payload.message;
                }
                if (payload.sql) {
                  sqlBlock = payload.sql;
                }
              } catch {
                accumulated += line;
              }
            });
          });

          setMessages((prev) =>
            prev.map((message) =>
              message.id === assistantMessage.id
                ? { ...message, content: accumulated, sql: sqlBlock }
                : message,
            ),
          );
        }
      } else if (response.body) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let accumulated = "";

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          accumulated += decoder.decode(value, { stream: true });
          setMessages((prev) =>
            prev.map((message) =>
              message.id === assistantMessage.id
                ? { ...message, content: accumulated }
                : message,
            ),
          );
        }
      } else {
        const data = (await response.json()) as {
          message?: string;
          sql?: string;
        };

        setMessages((prev) =>
          prev.map((message) =>
            message.id === assistantMessage.id
              ? {
                  ...message,
                  content: data.message ?? "",
                  sql: data.sql ?? null,
                }
              : message,
          ),
        );
      }
    } catch (error) {
      const description =
        error instanceof Error ? error.message : "Unexpected error";
      toast({
        title: "Chat request failed",
        description,
        variant: "destructive",
      });
      setMessages((prev) =>
        prev.filter((message) => message.id !== assistantMessage.id),
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleRunQuery = (sql: string) => {
    toast({
      title: "Query queued",
      description: sql.slice(0, 120),
    });
  };

  return (
    <div className={cn("flex h-full flex-col gap-6", className)}>
      <ChatHeader />

      <div className="grid flex-1 gap-4 lg:grid-cols-[2fr,1fr]">
        <Card className="flex h-full flex-col gap-4 border-border/60 bg-card/80 p-4">
          <MessageList
            messages={messages}
            isLoading={isLoading}
            onRunQuery={handleRunQuery}
          />
          <ChatInput onSend={handleSend} disabled={isLoading} />
        </Card>

        <Card className="flex h-full flex-col gap-4 border-border/60 bg-card/80 p-4">
          <div>
            <h3 className="text-sm font-semibold">SQL + Results</h3>
            <p className="text-xs text-muted-foreground">
              Generated SQL and query output will appear here.
            </p>
          </div>
          <pre className="flex-1 overflow-auto rounded-lg border border-border/60 bg-background/50 p-3 text-xs text-foreground">
            {latestSql}
          </pre>
          <div className="rounded-lg border border-dashed border-border/60 p-4 text-xs text-muted-foreground">
            Query results preview coming soon.
          </div>
        </Card>
      </div>
    </div>
  );
}
