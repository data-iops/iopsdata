"use client";

import { useState } from "react";
import { Copy, Play } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn, formatDate } from "@/lib/utils";

export type ChatMessageData = {
  id: string;
  role: "user" | "assistant";
  content: string;
  sql?: string | null;
  timestamp: Date;
};

type ChatMessageProps = {
  message: ChatMessageData;
  onRunQuery?: (sql: string) => void;
};

export function ChatMessage({ message, onRunQuery }: ChatMessageProps) {
  const [copied, setCopied] = useState(false);

  const isUser = message.role === "user";

  const handleCopy = async () => {
    if (!message.sql) return;
    await navigator.clipboard.writeText(message.sql);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className={cn("flex flex-col gap-3", isUser && "items-end")}>
      <div
        className={cn(
          "max-w-[80%] rounded-2xl border border-border/60 px-4 py-3 text-sm shadow-sm",
          isUser
            ? "bg-accent/20 text-foreground"
            : "bg-card/80 text-foreground",
        )}
      >
        <p className="whitespace-pre-line">{message.content}</p>
      </div>
      {message.sql ? (
        <div className="w-full max-w-[80%] rounded-2xl border border-border bg-background/60 p-4 text-xs text-muted-foreground">
          <div className="mb-3 flex items-center justify-between text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            <span>SQL</span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={handleCopy}
              >
                <Copy className="mr-1 h-3 w-3" />
                {copied ? "Copied" : "Copy"}
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={() => onRunQuery?.(message.sql ?? "")}
              >
                <Play className="mr-1 h-3 w-3" />
                Run Query
              </Button>
            </div>
          </div>
          <pre className="whitespace-pre-wrap text-[13px] text-foreground">
            {message.sql}
          </pre>
        </div>
      ) : null}
      <span className="text-xs text-muted-foreground">
        {formatDate(message.timestamp)}
      </span>
    </div>
  );
}
