"use client";

import { FileText, MoreHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn, formatDate } from "@/lib/utils";

export type FileSummary = {
  id: string;
  name: string;
  size: string;
  uploadedAt: Date | string;
};

type FileListProps = {
  files: FileSummary[];
  onSelect: (file: FileSummary) => void;
};

export function FileList({ files, onSelect }: FileListProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-border/60">
      <div className="grid grid-cols-[2fr_1fr_1fr_auto] gap-4 border-b border-border/60 bg-card/80 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        <span>Name</span>
        <span>Size</span>
        <span>Uploaded</span>
        <span>Actions</span>
      </div>
      <div className="divide-y divide-border/40">
        {files.map((file) => (
          <button
            key={file.id}
            type="button"
            className={cn(
              "grid w-full grid-cols-[2fr_1fr_1fr_auto] items-center gap-4 px-4 py-3 text-left text-sm transition-colors hover:bg-muted/40",
            )}
            onClick={() => onSelect(file)}
          >
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-accent" />
              <span className="font-medium text-foreground">{file.name}</span>
            </div>
            <span className="text-xs text-muted-foreground">{file.size}</span>
            <span className="text-xs text-muted-foreground">
              {formatDate(file.uploadedAt)}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              aria-label={`Open actions for ${file.name}`}
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </button>
        ))}
      </div>
    </div>
  );
}
