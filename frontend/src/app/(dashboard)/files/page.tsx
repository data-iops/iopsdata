"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { FileUploadZone } from "@/components/files/FileUploadZone";
import { FileList, type FileSummary } from "@/components/files/FileList";
import { FileProfileView, type FileProfile } from "@/components/files/FileProfileView";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";

const mockFiles: FileSummary[] = [
  {
    id: "file-1",
    name: "customer_orders.csv",
    size: "14.2 MB",
    uploadedAt: new Date(Date.now() - 1000 * 60 * 30),
  },
  {
    id: "file-2",
    name: "events.parquet",
    size: "32.8 MB",
    uploadedAt: new Date(Date.now() - 1000 * 60 * 60 * 5),
  },
  {
    id: "file-3",
    name: "pipeline_runs.json",
    size: "4.5 MB",
    uploadedAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
  },
];

const mockProfile: FileProfile = {
  id: "file-1",
  name: "customer_orders.csv",
  rowCount: 18423,
  columnCount: 12,
  columns: [
    {
      name: "order_id",
      type: "integer",
      nullPercentage: 0,
      distinctCount: 18423,
      sampleValues: ["1001", "1002", "1003"],
      min: "1001",
      max: "20132",
      mean: "13221",
    },
    {
      name: "customer_name",
      type: "string",
      nullPercentage: 2,
      distinctCount: 6200,
      sampleValues: ["Harper", "Jules", "Avery"],
    },
    {
      name: "total",
      type: "float",
      nullPercentage: 0,
      distinctCount: 1320,
      sampleValues: ["124.50", "80.20", "299.99"],
      min: "12.20",
      max: "948.00",
      mean: "210.10",
    },
    {
      name: "region",
      type: "string",
      nullPercentage: 5,
      distinctCount: 8,
      sampleValues: ["NA", "EMEA", "APAC"],
    },
  ],
};

export default function FilesPage() {
  const [files, setFiles] = useState<FileSummary[]>(mockFiles);
  const [selectedFile, setSelectedFile] = useState<FileSummary | null>(mockFiles[0]);
  const { toast } = useToast();
  const router = useRouter();

  const usage = useMemo(() => {
    const used = files.length * 12.5;
    const total = 250;
    const percent = Math.min(100, Math.round((used / total) * 100));
    return { used, total, percent };
  }, [files.length]);

  const handleUpload = (uploaded: File[]) => {
    const newFiles = uploaded.map((file) => ({
      id: crypto.randomUUID(),
      name: file.name,
      size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
      uploadedAt: new Date(),
    }));
    setFiles((prev) => [...newFiles, ...prev]);
    toast({
      title: "Upload started",
      description: `${uploaded.length} file(s) added to the queue.`,
    });
  };

  const profile = useMemo(() => {
    if (!selectedFile) return null;
    return {
      ...mockProfile,
      id: selectedFile.id,
      name: selectedFile.name,
    } satisfies FileProfile;
  }, [selectedFile]);

  const handleQueryFile = (file: FileProfile) => {
    toast({
      title: "Conversation created",
      description: `${file.name} is ready for querying.`,
    });
    router.push(`/dashboard?file=${file.id}`);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Files</h1>
        <p className="text-sm text-muted-foreground">
          Upload datasets and inspect profiles before running queries.
        </p>
      </div>

      <Card className="space-y-6 border-border/60 bg-card/80 p-6">
        <FileUploadZone onUpload={handleUpload} />
        <div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Storage usage</span>
            <span>
              {usage.used.toFixed(1)} MB / {usage.total} MB
            </span>
          </div>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-secondary"
              style={{ width: `${usage.percent}%` }}
            />
          </div>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Uploaded files</h2>
          <FileList files={files} onSelect={setSelectedFile} />
        </div>
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">File profile</h2>
          {profile ? (
            <FileProfileView profile={profile} onQueryFile={handleQueryFile} />
          ) : (
            <p className="text-sm text-muted-foreground">Select a file to view its profile.</p>
          )}
        </div>
      </div>
    </div>
  );
}
