"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type LineagePanelDetails =
  | {
      type: "table";
      name: string;
      rowCount: number;
      columns: string[];
    }
  | {
      type: "query";
      name: string;
      sql: string;
      durationMs: number;
    }
  | {
      type: "output";
      name: string;
      rowCount: number;
      columns: number;
    };

type LineagePanelProps = {
  details: LineagePanelDetails | null;
  onClose?: () => void;
};

export function LineagePanel({ details, onClose }: LineagePanelProps) {
  if (!details) {
    return (
      <Card className="flex h-full items-center justify-center border-border/60 bg-card/80 p-6 text-sm text-muted-foreground">
        Select a node to view lineage details.
      </Card>
    );
  }

  return (
    <Card className="flex h-full flex-col gap-4 border-border/60 bg-card/80 p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            {details.type} details
          </p>
          <h3 className="text-lg font-semibold text-foreground">
            {details.name}
          </h3>
        </div>
        {onClose ? (
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        ) : null}
      </div>

      {details.type === "table" ? (
        <div className="space-y-3 text-sm text-muted-foreground">
          <p>Rows: {details.rowCount.toLocaleString()}</p>
          <div>
            <p className="text-xs uppercase tracking-wide">Columns</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {details.columns.map((column) => (
                <span
                  key={column}
                  className={cn(
                    "rounded-md border border-border/60 px-2 py-1 text-xs text-foreground",
                  )}
                >
                  {column}
                </span>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      {details.type === "query" ? (
        <div className="space-y-3 text-sm text-muted-foreground">
          <p>Execution time: {(details.durationMs / 1000).toFixed(2)}s</p>
          <div>
            <p className="text-xs uppercase tracking-wide">SQL</p>
            <pre className="mt-2 whitespace-pre-wrap rounded-md border border-border/60 bg-background/60 p-3 text-xs text-foreground">
              {details.sql}
            </pre>
          </div>
        </div>
      ) : null}

      {details.type === "output" ? (
        <div className="space-y-3 text-sm text-muted-foreground">
          <p>Rows: {details.rowCount.toLocaleString()}</p>
          <p>Columns: {details.columns}</p>
        </div>
      ) : null}
    </Card>
  );
}
