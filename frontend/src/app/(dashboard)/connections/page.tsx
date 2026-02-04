"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { ConnectionCard, type ConnectionSummary } from "@/components/connections/ConnectionCard";
import { ConnectionDialog } from "@/components/connections/ConnectionDialog";
import type { ConnectionFormValues } from "@/components/connections/ConnectionForm";
import { useToast } from "@/components/ui/use-toast";

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
  const { toast } = useToast();

  const dialogMode = editingConnection ? "edit" : "create";

  const handleEdit = (connection: ConnectionSummary) => {
    setEditingConnection(connection);
    setDialogOpen(true);
  };

  const handleDelete = (connection: ConnectionSummary) => {
    setConnections((prev) => prev.filter((item) => item.id !== connection.id));
    toast({
      title: "Connection removed",
      description: `${connection.name} has been deleted.`,
    });
  };

  const handleSave = (values: ConnectionFormValues) => {
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

    setDialogOpen(false);
    setEditingConnection(undefined);
    toast({
      title: "Connection saved",
      description: "Credentials are encrypted before storage.",
    });
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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Connections</h1>
          <p className="text-sm text-muted-foreground">
            Manage database connections and credentials securely.
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingConnection(undefined);
            setDialogOpen(true);
          }}
        >
          Add connection
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {connections.map((connection) => (
          <ConnectionCard
            key={connection.id}
            connection={connection}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))}
      </div>

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
    </div>
  );
}
