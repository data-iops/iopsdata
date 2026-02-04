"use client";

import { Database, FileCode2, Layers } from "lucide-react";

import { cn } from "@/lib/utils";

export type LineageNodeType = "table" | "query" | "output";

export type LineageNodeData = {
  label: string;
  type: LineageNodeType;
  meta?: string;
  onExpand?: () => void;
};

type LineageNodeProps = {
  data: LineageNodeData;
  selected?: boolean;
};

const typeStyles: Record<LineageNodeType, string> = {
  table: "border-blue-500/60",
  query: "border-purple-500/60",
  output: "border-emerald-500/60",
};

const typeIcons: Record<LineageNodeType, typeof Database> = {
  table: Database,
  query: FileCode2,
  output: Layers,
};

export function LineageNode({ data, selected }: LineageNodeProps) {
  const Icon = typeIcons[data.type];

  return (
    <button
      type="button"
      onClick={data.onExpand}
      className={cn(
        "w-56 rounded-xl border bg-card/80 px-4 py-3 text-left shadow-sm transition",
        typeStyles[data.type],
        selected && "ring-2 ring-accent",
      )}
    >
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-accent" />
        <span className="text-sm font-semibold text-foreground">{data.label}</span>
      </div>
      {data.meta ? (
        <p className="mt-2 text-xs text-muted-foreground">{data.meta}</p>
      ) : null}
      <p className="mt-2 text-[11px] uppercase tracking-wide text-muted-foreground">
        Click to expand
      </p>
    </button>
  );
}
