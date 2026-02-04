"use client";

import { CheckCircle2, Loader2, XCircle } from "lucide-react";

import { cn } from "@/lib/utils";

export type TestConnectionStatus = "idle" | "running" | "success" | "error";

type TestConnectionProps = {
  status: TestConnectionStatus;
  message: string | null;
};

export function TestConnection({ status, message }: TestConnectionProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-2 rounded-lg border border-border/60 bg-card/70 px-4 py-3 text-xs",
        status === "error" && "border-red-500/40",
        status === "success" && "border-emerald-500/40",
      )}
    >
      <div className="flex items-center gap-2 text-sm">
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
            ? "Testing connection"
            : status === "success"
              ? "Connection healthy"
              : status === "error"
                ? "Connection failed"
                : "Connection not tested"}
        </span>
      </div>
      {message ? <p className="text-muted-foreground">{message}</p> : null}
      {status === "success" ? (
        <div className="rounded-md border border-border/60 bg-background/40 p-3 text-[11px] text-muted-foreground">
          <p className="font-semibold text-foreground">Schema preview</p>
          <ul className="mt-2 space-y-1">
            <li>public.orders (128 columns)</li>
            <li>public.customers (42 columns)</li>
            <li>analytics.events (91 columns)</li>
          </ul>
        </div>
      ) : null}
    </div>
  );
}
