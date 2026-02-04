"use client";

import { Database, Edit, Server, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn, formatDate } from "@/lib/utils";

export type ConnectionStatus = "connected" | "error";
export type ConnectionType = "postgres" | "mysql" | "supabase" | "duckdb";

export type ConnectionSummary = {
  id: string;
  name: string;
  type: ConnectionType;
  lastUsedAt?: Date | string;
  status: ConnectionStatus;
};

type ConnectionCardProps = {
  connection: ConnectionSummary;
  onEdit: (connection: ConnectionSummary) => void;
  onDelete: (connection: ConnectionSummary) => void;
};

const typeMap: Record<ConnectionType, { label: string; icon: typeof Database }> = {
  postgres: { label: "PostgreSQL", icon: Database },
  mysql: { label: "MySQL", icon: Server },
  supabase: { label: "Supabase", icon: Database },
  duckdb: { label: "DuckDB", icon: Database },
};

export function ConnectionCard({
  connection,
  onEdit,
  onDelete,
}: ConnectionCardProps) {
  const typeConfig = typeMap[connection.type];
  const Icon = typeConfig.icon;

  return (
    <Card className="border-border/60 bg-card/80">
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-border/60 bg-background/60">
            <Icon className="h-5 w-5 text-accent" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">
              {connection.name}
            </p>
            <p className="text-xs text-muted-foreground">{typeConfig.label}</p>
          </div>
        </div>
        <span
          className={cn(
            "rounded-full border px-2 py-1 text-xs",
            connection.status === "connected"
              ? "border-emerald-400/40 text-emerald-300"
              : "border-red-400/40 text-red-300",
          )}
        >
          {connection.status === "connected" ? "Connected" : "Error"}
        </span>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-xs text-muted-foreground">
          Last used{" "}
          {connection.lastUsedAt ? formatDate(connection.lastUsedAt) : "Never"}
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => onEdit(connection)}
          >
            <Edit className="h-3.5 w-3.5" />
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-2 text-red-300 hover:text-red-200"
            onClick={() => onDelete(connection)}
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
