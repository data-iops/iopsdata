"use client";

import { useState } from "react";

import { ResultsTable, type TableRow } from "@/components/editor/ResultsTable";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const tabs = ["Results", "Messages", "Stats"] as const;

export type QueryStats = {
  rows: number;
  durationMs: number;
  costEstimate?: string;
};

type ResultsPanelProps = {
  data: TableRow[];
  messages: string[];
  stats: QueryStats;
};

export function ResultsPanel({ data, messages, stats }: ResultsPanelProps) {
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>("Results");

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <Button
            key={tab}
            variant="outline"
            size="sm"
            onClick={() => setActiveTab(tab)}
            className={cn(
              "rounded-full",
              activeTab === tab && "border-accent text-foreground",
            )}
          >
            {tab}
          </Button>
        ))}
      </div>

      <div className="flex-1 rounded-xl border border-border/60 bg-card/80 p-4">
        {activeTab === "Results" ? (
          <ResultsTable data={data} />
        ) : null}
        {activeTab === "Messages" ? (
          <div className="space-y-2 text-sm text-muted-foreground">
            {messages.length ? (
              messages.map((message, index) => (
                <p key={index}>{message}</p>
              ))
            ) : (
              <p>No warnings or errors.</p>
            )}
          </div>
        ) : null}
        {activeTab === "Stats" ? (
          <div className="grid gap-4 text-sm text-muted-foreground sm:grid-cols-3">
            <div>
              <p className="text-xs uppercase tracking-wide">Rows returned</p>
              <p className="text-lg font-semibold text-foreground">
                {stats.rows.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide">Execution time</p>
              <p className="text-lg font-semibold text-foreground">
                {(stats.durationMs / 1000).toFixed(2)}s
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide">Cost estimate</p>
              <p className="text-lg font-semibold text-foreground">
                {stats.costEstimate ?? "—"}
              </p>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
