"use client";

import { useCallback, useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ChatInputProps = {
  onSend: (message: string) => void;
  disabled?: boolean;
};

export function ChatInput({ onSend, disabled = false }: ChatInputProps) {
  const [value, setValue] = useState("");

  const handleSubmit = useCallback(() => {
    if (!value.trim()) return;
    onSend(value.trim());
    setValue("");
  }, [onSend, value]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
      event.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="space-y-3">
      <textarea
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Ask your data anything..."
        className={cn(
          "min-h-[96px] w-full resize-none rounded-xl border border-border bg-card/80 p-4 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2",
          disabled && "cursor-not-allowed opacity-60",
        )}
        disabled={disabled}
      />
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Press ⌘/Ctrl + Enter to send.</span>
        <Button onClick={handleSubmit} disabled={disabled || !value.trim()}>
          Send
        </Button>
      </div>
    </div>
  );
}
