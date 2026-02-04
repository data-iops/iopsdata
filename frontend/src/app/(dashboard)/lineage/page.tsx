"use client";

import { useMemo, useState } from "react";

import { LineageGraph, type LineageScope } from "@/components/lineage/LineageGraph";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

const scopeOptions: { label: string; value: LineageScope }[] = [
  { label: "Current session", value: "session" },
  { label: "All queries for connection", value: "connection" },
  { label: "Impact analysis", value: "impact" },
];

const connectionOptions = [
  { label: "Primary Warehouse", value: "primary" },
  { label: "Growth Metrics", value: "growth" },
  { label: "Legacy MySQL", value: "legacy" },
];

export default function LineagePage() {
  const [scope, setScope] = useState<LineageScope>("session");
  const [connection, setConnection] = useState(connectionOptions[0].value);
  const [startDate, setStartDate] = useState("2024-10-01");
  const [endDate, setEndDate] = useState("2024-10-31");

  const title = useMemo(() => {
    const scopeLabel = scopeOptions.find((option) => option.value === scope)?.label;
    return scopeLabel ?? "Lineage";
  }, [scope]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Lineage</h1>
        <p className="text-sm text-muted-foreground">
          Explore data flow across tables, queries, and outputs.
        </p>
      </div>

      <Card className="space-y-4 border-border/60 bg-card/80 p-4">
        <div className="flex flex-wrap gap-4">
          <div className="min-w-[200px]">
            <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Scope
            </label>
            <Select value={scope} onValueChange={(value) => setScope(value as LineageScope)}>
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Select scope" />
              </SelectTrigger>
              <SelectContent>
                {scopeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="min-w-[200px]">
            <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Connection
            </label>
            <Select value={connection} onValueChange={setConnection}>
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Select connection" />
              </SelectTrigger>
              <SelectContent>
                {connectionOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Date range
            </label>
            <div className="mt-2 flex flex-wrap gap-2">
              <Input
                type="date"
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
              />
              <Input
                type="date"
                value={endDate}
                onChange={(event) => setEndDate(event.target.value)}
              />
            </div>
          </div>
        </div>
      </Card>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold">{title}</h2>
        <LineageGraph scope={scope} />
      </div>
    </div>
  );
}
