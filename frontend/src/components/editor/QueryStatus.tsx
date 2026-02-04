"use client";

import { CheckCircle2, Loader2, XCircle } from "lucide-react";

import { cn } from "@/lib/utils";

export type QueryStatusState = "running" | "success" | "error" | "idle";

type QueryStatusProps = {
  status: QueryStatusState;
  rowCount?: number;
  durationMs?: number;
  errorMessage?: string;
};

export function QueryStatus({
  status,
  rowCount,
  durationMs,
  errorMessage,
}: QueryStatusProps) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-3 rounded-xl border border-border/60 bg-card/80 px-4 py-3 text-sm",
        status === "error" && "border-red-500/40",
      )}
    >
      {status === "running" ? (
        <Loader2 className="h-4 w-4 animate-spin text-accent" />
      ) : status === "success" ? (
        <CheckCircle2 className="h-4 w-4 text-emerald-300" />
      ) : status === "error" ? (
        <XCircle className="h-4 w-4 text-red-300" />
      ) : (
        <span className="h-2 w-2 rounded-full bg-muted" />
      )}
      <span className="font-medium text-foreground">
        {status === "running"
          ? "Running"
          : status === "success"
            ? "Completed"
            : status === "error"
              ? "Failed"
              : "Idle"}
      </span>
      {typeof rowCount === "number" ? (
        <span className="text-xs text-muted-foreground">
          {rowCount.toLocaleString()} rows
        </span>
      ) : null}
      {typeof durationMs === "number" ? (
        <span className="text-xs text-muted-foreground">
          {(durationMs / 1000).toFixed(2)}s
        </span>
      ) : null}
      {status === "error" && errorMessage ? (
        <span className="text-xs text-red-200">{errorMessage}</span>
      ) : null}
    </div>
  );
}
