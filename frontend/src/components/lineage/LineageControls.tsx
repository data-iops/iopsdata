"use client";

import { Download, Maximize2, Minus, Plus, Square } from "lucide-react";

import { Button } from "@/components/ui/button";

export type LineageControlsProps = {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitView: () => void;
  onToggleMiniMap: () => void;
  onExport: () => void;
  minimapEnabled: boolean;
};

export function LineageControls({
  onZoomIn,
  onZoomOut,
  onFitView,
  onToggleMiniMap,
  onExport,
  minimapEnabled,
}: LineageControlsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border/60 bg-card/80 px-3 py-2">
      <Button variant="outline" size="icon" onClick={onZoomIn}>
        <Plus className="h-4 w-4" />
      </Button>
      <Button variant="outline" size="icon" onClick={onZoomOut}>
        <Minus className="h-4 w-4" />
      </Button>
      <Button variant="outline" size="icon" onClick={onFitView}>
        <Maximize2 className="h-4 w-4" />
      </Button>
      <Button variant="outline" size="sm" onClick={onToggleMiniMap} className="gap-2">
        <Square className="h-3.5 w-3.5" />
        {minimapEnabled ? "Hide minimap" : "Show minimap"}
      </Button>
      <Button variant="outline" size="sm" onClick={onExport} className="gap-2">
        <Download className="h-3.5 w-3.5" />
        Export PNG
      </Button>
    </div>
  );
}
