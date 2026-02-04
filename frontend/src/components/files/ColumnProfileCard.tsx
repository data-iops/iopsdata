"use client";

import { cn } from "@/lib/utils";

export type ColumnProfile = {
  name: string;
  type: string;
  nullPercentage: number;
  distinctCount: number;
  sampleValues: string[];
  min?: string;
  max?: string;
  mean?: string;
};

type ColumnProfileCardProps = {
  column: ColumnProfile;
};

export function ColumnProfileCard({ column }: ColumnProfileCardProps) {
  return (
    <div className="rounded-xl border border-border/60 bg-card/80 p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-foreground">{column.name}</p>
          <p className="text-xs text-muted-foreground">{column.type}</p>
        </div>
        <span className="rounded-full border border-border/60 px-2 py-1 text-[10px] uppercase tracking-wide text-muted-foreground">
          {column.type}
        </span>
      </div>

      <div className="mt-4 space-y-2 text-xs text-muted-foreground">
        <div className="flex items-center justify-between">
          <span>Nulls</span>
          <span>{column.nullPercentage}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={cn("h-full rounded-full bg-accent")}
            style={{ width: `${column.nullPercentage}%` }}
          />
        </div>
      </div>

      <div className="mt-4 text-xs text-muted-foreground">
        <p>Distinct values: {column.distinctCount}</p>
        <p className="mt-2">Samples:</p>
        <div className="mt-1 flex flex-wrap gap-2">
          {column.sampleValues.map((value) => (
            <span
              key={value}
              className="rounded-md border border-border/60 px-2 py-1"
            >
              {value}
            </span>
          ))}
        </div>
      </div>

      {column.min || column.max || column.mean ? (
        <div className="mt-4 grid gap-2 text-xs text-muted-foreground sm:grid-cols-3">
          {column.min ? <span>Min: {column.min}</span> : null}
          {column.max ? <span>Max: {column.max}</span> : null}
          {column.mean ? <span>Mean: {column.mean}</span> : null}
        </div>
      ) : null}
    </div>
  );
}
