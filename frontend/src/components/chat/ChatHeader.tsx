"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";


type ChatHeaderProps = {
  initialTitle?: string;
  connectionName?: string;
  onNewConversation?: () => void;
  onTitleChange?: (title: string) => void;
};

export function ChatHeader({
  initialTitle = "Untitled conversation",
  connectionName = "Primary warehouse",
  onNewConversation,
  onTitleChange,
}: ChatHeaderProps) {
  const [title, setTitle] = useState(initialTitle);

  const handleTitleChange = (value: string) => {
    setTitle(value);
    onTitleChange?.(value);
  };

  return (
    <div className="flex flex-col gap-3 border-b border-border pb-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-col gap-2">
        <Input
          value={title}
          onChange={(event) => handleTitleChange(event.target.value)}
          className="h-9 max-w-xs border-border bg-card/80 text-lg font-semibold"
        />
        <span className="inline-flex w-fit items-center rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">
          {connectionName}
        </span>
      </div>
      <Button variant="outline" onClick={onNewConversation} className="gap-2">
        <Plus className="h-4 w-4" />
        New conversation
      </Button>
    </div>
  );
}
