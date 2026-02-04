"use client";

import { useCallback, useRef, useState } from "react";
import { CloudUpload } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const supportedFormats = ["CSV", "Excel", "Parquet", "JSON"];

export type FileUploadZoneProps = {
  onUpload: (files: File[]) => void;
};

export function FileUploadZone({ onUpload }: FileUploadZoneProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return;
      onUpload(Array.from(files));
      setProgress(30);
      const timer = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(timer);
            return 100;
          }
          return prev + 20;
        });
      }, 200);
    },
    [onUpload],
  );

  return (
    <div className="space-y-4">
      <div
        className={cn(
          "flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border/60 bg-card/60 px-6 py-10 text-center transition-colors",
          isDragging && "border-accent bg-accent/10",
        )}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setIsDragging(false);
          handleFiles(event.dataTransfer.files);
        }}
      >
        <CloudUpload className="h-8 w-8 text-accent" />
        <div>
          <p className="text-sm font-medium">Drag and drop files to upload</p>
          <p className="text-xs text-muted-foreground">
            or click to browse. Supported formats: {supportedFormats.join(", ")}
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => inputRef.current?.click()}
        >
          Browse files
        </Button>
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          multiple
          accept=".csv,.json,.parquet,.xlsx"
          onChange={(event) => handleFiles(event.target.files)}
        />
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Max file size: 50MB</span>
        <span>{progress}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-accent transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
