"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { FileUploadZone } from "@/components/files/FileUploadZone";
import { FileList, type FileSummary } from "@/components/files/FileList";
import { FileProfileView, type FileProfile } from "@/components/files/FileProfileView";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { PageHeader } from "@/components/common/PageHeader";
import { useFeedbackToast } from "@/components/feedback/ToastNotifications";
import { createAppError, type AppError } from "@/lib/errors";

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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<AppError | null>(null);
  const { notifyInfo, notifySuccess } = useFeedbackToast();
  const router = useRouter();
  const searchParams = useSearchParams();

  const errorType = searchParams.get("error");

  const hydrate = useCallback(() => {
    setIsLoading(true);
    setError(null);
    const timer = setTimeout(() => {
      if (errorType === "network") {
        setError(createAppError("network"));
      } else if (errorType === "auth") {
        setError(createAppError("auth"));
      } else if (errorType === "invalid") {
        setError(createAppError("validation"));
      }
      setIsLoading(false);
    }, 600);

    return () => clearTimeout(timer);
  }, [errorType]);

  useEffect(() => hydrate(), [hydrate]);

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
    notifyInfo({
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
    notifySuccess({
      title: "Conversation created",
      description: `${file.name} is ready for querying.`,
    });
    router.push(`/?file=${file.id}`);
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Files"
        description="Upload datasets and inspect profiles before running queries."
      />

      {error ? (
        <ErrorMessage error={error} onRetry={hydrate} />
      ) : (
        <>
          <Card className="space-y-6 border-border/60 bg-card/80 p-6">
            {isLoading ? (
              <div className="space-y-4">
                <LoadingSkeleton className="h-32 w-full rounded-2xl" />
                <LoadingSkeleton className="h-4 w-40" />
                <LoadingSkeleton className="h-2 w-full" />
              </div>
            ) : (
              <>
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
              </>
            )}
          </Card>

          <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Uploaded files</h2>
              {isLoading ? (
                <div className="space-y-2 rounded-xl border border-border/60 p-4">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <LoadingSkeleton key={`file-row-${index}`} className="h-10 w-full" />
                  ))}
                </div>
              ) : files.length === 0 ? (
                <EmptyState
                  title="No files uploaded"
                  description="Drop files here or use the upload button to get started."
                />
              ) : (
                <FileList files={files} onSelect={setSelectedFile} />
              )}
            </div>
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">File profile</h2>
              {isLoading ? (
                <div className="space-y-3 rounded-xl border border-border/60 p-4">
                  <LoadingSkeleton className="h-5 w-40" />
                  <LoadingSkeleton className="h-24 w-full" />
                  <LoadingSkeleton className="h-24 w-full" />
                </div>
              ) : profile ? (
                <FileProfileView profile={profile} onQueryFile={handleQueryFile} />
              ) : (
                <EmptyState
                  title="No file selected"
                  description="Choose a file from the list to see its profile."
                />
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
