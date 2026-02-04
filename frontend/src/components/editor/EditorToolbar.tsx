"use client";

import { CheckCircle2, Copy, Eraser, Play, Sparkles, XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type ExecutionStatus = "idle" | "running" | "success" | "error";

type EditorToolbarProps = {
  status: ExecutionStatus;
  onRun: () => void;
  onFormat: () => void;
  onCopy: () => void;
  onClear: () => void;
};

export function EditorToolbar({
  status,
  onRun,
  onFormat,
  onCopy,
  onClear,
}: EditorToolbarProps) {
  const statusLabel =
    status === "running"
      ? "Running"
      : status === "success"
        ? "Success"
        : status === "error"
          ? "Error"
          : "Idle";

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/60 bg-card/80 px-4 py-3">
      <div className="flex flex-wrap items-center gap-2">
        <Button onClick={onRun} className="gap-2">
          <Play className="h-4 w-4" />
          Run
          <span className="rounded-md border border-border/60 bg-background/60 px-2 py-0.5 text-[10px] text-muted-foreground">
            ⌘/Ctrl + Enter
          </span>
        </Button>
        <Button variant="outline" onClick={onFormat} className="gap-2">
          <Sparkles className="h-4 w-4" />
          Format SQL
        </Button>
        <Button variant="outline" onClick={onCopy} className="gap-2">
          <Copy className="h-4 w-4" />
          Copy
        </Button>
        <Button variant="outline" onClick={onClear} className="gap-2">
          <Eraser className="h-4 w-4" />
          Clear
        </Button>
      </div>

      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span
          className={cn(
            "inline-flex items-center gap-2 rounded-full border border-border/60 px-3 py-1 text-xs",
            status === "running" && "text-accent",
            status === "success" && "text-emerald-300",
            status === "error" && "text-red-300",
          )}
        >
          {status === "running" ? (
            <span className="h-2 w-2 animate-pulse rounded-full bg-accent" />
          ) : status === "success" ? (
            <CheckCircle2 className="h-3 w-3" />
          ) : status === "error" ? (
            <XCircle className="h-3 w-3" />
          ) : (
            <span className="h-2 w-2 rounded-full bg-muted" />
          )}
          {statusLabel}
        </span>
      </div>
    </div>
  );
}
