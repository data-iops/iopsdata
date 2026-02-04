"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { ConnectionCard, type ConnectionSummary } from "@/components/connections/ConnectionCard";
import { ConnectionDialog } from "@/components/connections/ConnectionDialog";
import type { ConnectionFormValues } from "@/components/connections/ConnectionForm";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { ToastAction } from "@/components/ui/toast";
import { useFeedbackToast } from "@/components/feedback/ToastNotifications";
import { createAppError, type AppError } from "@/lib/errors";

const initialConnections: ConnectionSummary[] = [
  {
    id: "1",
    name: "Primary Warehouse",
    type: "postgres",
    status: "connected",
    lastUsedAt: new Date(),
  },
  {
    id: "2",
    name: "Growth Metrics",
    type: "supabase",
    status: "connected",
    lastUsedAt: new Date(Date.now() - 1000 * 60 * 60 * 6),
  },
  {
    id: "3",
    name: "Legacy MySQL",
    type: "mysql",
    status: "error",
    lastUsedAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
  },
];

export default function ConnectionsPage() {
  const [connections, setConnections] = useState(initialConnections);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingConnection, setEditingConnection] = useState<
    ConnectionSummary | undefined
  >(undefined);
  const [pendingDelete, setPendingDelete] = useState<ConnectionSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<AppError | null>(null);
  const searchParams = useSearchParams();
  const { notifySuccess, notifyError, toast } = useFeedbackToast();

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

  const dialogMode = editingConnection ? "edit" : "create";

  const handleEdit = (connection: ConnectionSummary) => {
    setEditingConnection(connection);
    setDialogOpen(true);
  };

  const handleDelete = (connection: ConnectionSummary) => {
    setPendingDelete(connection);
  };

  const confirmDelete = () => {
    if (!pendingDelete) return;
    const previous = connections;
    setConnections((prev) => prev.filter((item) => item.id !== pendingDelete.id));
    toast({
      title: "Connection removed",
      description: `${pendingDelete.name} has been deleted.`,
      action: (
        <ToastAction altText="Undo deletion" onClick={() => setConnections(previous)}>
          Undo
        </ToastAction>
      ),
    });
    setPendingDelete(null);
  };

  const handleSave = (values: ConnectionFormValues) => {
    try {
      if (editingConnection) {
        setConnections((prev) =>
          prev.map((item) =>
            item.id === editingConnection.id
              ? {
                  ...item,
                  name: values.name,
                  type: values.type,
                }
              : item,
          ),
        );
      } else {
        setConnections((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            name: values.name,
            type: values.type,
            status: "connected",
            lastUsedAt: new Date(),
          },
        ]);
      }

      notifySuccess({
        title: "Connection saved",
        description: "Credentials are encrypted before storage.",
      });
    } catch (err) {
      notifyError(err, { title: "Save failed" });
    }

    setDialogOpen(false);
    setEditingConnection(undefined);
  };

  const initialValues = useMemo(() => {
    if (!editingConnection) return undefined;
    return {
      name: editingConnection.name,
      type: editingConnection.type,
    };
  }, [editingConnection]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Connections"
        description="Manage database connections and credentials securely."
        actions={
          <Button
            onClick={() => {
              setEditingConnection(undefined);
              setDialogOpen(true);
            }}
          >
            Add connection
          </Button>
        }
      />

      {error ? (
        <ErrorMessage error={error} onRetry={hydrate} />
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={`connection-skeleton-${index}`}
                  className="rounded-xl border border-border/60 bg-card/80 p-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <LoadingSkeleton className="h-10 w-10 rounded-full" />
                      <div className="space-y-2">
                        <LoadingSkeleton className="h-4 w-32" />
                        <LoadingSkeleton className="h-3 w-20" />
                      </div>
                    </div>
                    <LoadingSkeleton className="h-5 w-16 rounded-full" />
                  </div>
                  <div className="mt-4 space-y-2">
                    <LoadingSkeleton className="h-3 w-28" />
                    <div className="flex gap-2">
                      <LoadingSkeleton className="h-8 w-20" />
                      <LoadingSkeleton className="h-8 w-20" />
                    </div>
                  </div>
                </div>
              ))
            ) : connections.length === 0 ? (
              <EmptyState
                title="No connections yet"
                description="Add a database connection to start querying data."
                className="md:col-span-2 xl:col-span-3"
                action={
                  <Button
                    onClick={() => {
                      setEditingConnection(undefined);
                      setDialogOpen(true);
                    }}
                  >
                    Add connection
                  </Button>
                }
              />
            ) : (
              connections.map((connection) => (
                <ConnectionCard
                  key={connection.id}
                  connection={connection}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))
            )}
          </div>
          {!isLoading && connections.length > 0 ? (
            <p className="text-xs text-muted-foreground">
              Tip: rotate credentials every 90 days to keep your workspace secure.
            </p>
          ) : null}
        </>
      )}

      <ConnectionDialog
        open={dialogOpen}
        mode={dialogMode}
        initialValues={initialValues}
        onClose={() => {
          setDialogOpen(false);
          setEditingConnection(undefined);
        }}
        onSave={handleSave}
      />

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(nextOpen) => setPendingDelete(nextOpen ? pendingDelete : null)}
        title={`Delete ${pendingDelete?.name ?? "connection"}?`}
        description="This will remove credentials and disconnect workflows."
        confirmLabel="Delete connection"
        isDestructive
        onConfirm={confirmDelete}
      />
    </div>
  );
}
