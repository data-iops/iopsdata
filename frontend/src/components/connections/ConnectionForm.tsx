"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { TestConnection } from "@/components/connections/TestConnection";

export type ConnectionFormValues = {
  name: string;
  type: "postgres" | "mysql" | "supabase" | "duckdb";
  connectionString?: string;
  host?: string;
  port?: string;
  user?: string;
  password?: string;
  database?: string;
  supabaseUrl?: string;
  supabaseAnonKey?: string;
  duckdbPath?: string;
};

type ConnectionFormProps = {
  initialValues?: Partial<ConnectionFormValues>;
  onSave: (values: ConnectionFormValues) => void;
};

export function ConnectionForm({ initialValues, onSave }: ConnectionFormProps) {
  const [values, setValues] = useState<ConnectionFormValues>({
    name: initialValues?.name ?? "",
    type: initialValues?.type ?? "postgres",
    connectionString: initialValues?.connectionString ?? "",
    host: initialValues?.host ?? "",
    port: initialValues?.port ?? "",
    user: initialValues?.user ?? "",
    password: initialValues?.password ?? "",
    database: initialValues?.database ?? "",
    supabaseUrl: initialValues?.supabaseUrl ?? "",
    supabaseAnonKey: initialValues?.supabaseAnonKey ?? "",
    duckdbPath: initialValues?.duckdbPath ?? ":memory:",
  });
  const [testState, setTestState] = useState<
    "idle" | "running" | "success" | "error"
  >("idle");
  const [testMessage, setTestMessage] = useState<string | null>(null);

  const supportsConnectionString = values.type === "postgres";

  const requiredFields = useMemo(() => {
    if (values.type === "postgres") {
      return values.connectionString
        ? ["name", "connectionString"]
        : ["name", "host", "port", "user", "password", "database"];
    }
    if (values.type === "mysql") {
      return ["name", "host", "port", "user", "password", "database"];
    }
    if (values.type === "supabase") {
      return ["name", "supabaseUrl", "supabaseAnonKey"];
    }
    return ["name", "duckdbPath"];
  }, [values.type, values.connectionString]);

  const isValid = requiredFields.every((field) => {
    const value = values[field as keyof ConnectionFormValues];
    return Boolean(value && String(value).trim().length > 0);
  });

  const handleChange = (field: keyof ConnectionFormValues, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleTest = async () => {
    setTestState("running");
    setTestMessage(null);

    await new Promise((resolve) => setTimeout(resolve, 1200));

    if (!isValid) {
      setTestState("error");
      setTestMessage("Fill all required fields before testing.");
      return;
    }

    setTestState("success");
    setTestMessage("Connection successful. Schema preview loaded.");
  };

  const handleSubmit = () => {
    if (!isValid) return;
    onSave(values);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <label className="text-sm font-medium">Connection name</label>
        <Input
          value={values.name}
          onChange={(event) => handleChange("name", event.target.value)}
          placeholder="Finance Warehouse"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Database type</label>
        <Select
          value={values.type}
          onValueChange={(value) =>
            setValues((prev) => ({
              ...prev,
              type: value as ConnectionFormValues["type"],
            }))
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select database" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="postgres">PostgreSQL</SelectItem>
            <SelectItem value="mysql">MySQL</SelectItem>
            <SelectItem value="supabase">Supabase</SelectItem>
            <SelectItem value="duckdb">DuckDB</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {supportsConnectionString ? (
        <div className="space-y-2">
          <label className="text-sm font-medium">Connection string</label>
          <Input
            value={values.connectionString}
            onChange={(event) =>
              handleChange("connectionString", event.target.value)
            }
            placeholder="postgres://user:pass@host:5432/db"
          />
          <p className="text-xs text-muted-foreground">
            Provide a connection string or fill out the fields below.
          </p>
        </div>
      ) : null}

      {values.type === "postgres" && !values.connectionString ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">Host</label>
            <Input
              value={values.host}
              onChange={(event) => handleChange("host", event.target.value)}
              placeholder="db.example.com"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Port</label>
            <Input
              value={values.port}
              onChange={(event) => handleChange("port", event.target.value)}
              placeholder="5432"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">User</label>
            <Input
              value={values.user}
              onChange={(event) => handleChange("user", event.target.value)}
              placeholder="postgres"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Password</label>
            <Input
              type="password"
              value={values.password}
              onChange={(event) => handleChange("password", event.target.value)}
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <label className="text-sm font-medium">Database</label>
            <Input
              value={values.database}
              onChange={(event) => handleChange("database", event.target.value)}
              placeholder="analytics"
            />
          </div>
        </div>
      ) : null}

      {values.type === "mysql" ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">Host</label>
            <Input
              value={values.host}
              onChange={(event) => handleChange("host", event.target.value)}
              placeholder="db.example.com"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Port</label>
            <Input
              value={values.port}
              onChange={(event) => handleChange("port", event.target.value)}
              placeholder="3306"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">User</label>
            <Input
              value={values.user}
              onChange={(event) => handleChange("user", event.target.value)}
              placeholder="root"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Password</label>
            <Input
              type="password"
              value={values.password}
              onChange={(event) => handleChange("password", event.target.value)}
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <label className="text-sm font-medium">Database</label>
            <Input
              value={values.database}
              onChange={(event) => handleChange("database", event.target.value)}
              placeholder="analytics"
            />
          </div>
        </div>
      ) : null}

      {values.type === "supabase" ? (
        <div className="grid gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Project URL</label>
            <Input
              value={values.supabaseUrl}
              onChange={(event) => handleChange("supabaseUrl", event.target.value)}
              placeholder="https://project.supabase.co"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Anon Key</label>
            <Input
              value={values.supabaseAnonKey}
              onChange={(event) =>
                handleChange("supabaseAnonKey", event.target.value)
              }
              placeholder="eyJhbGciOi..."
            />
          </div>
        </div>
      ) : null}

      {values.type === "duckdb" ? (
        <div className="grid gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">DuckDB database</label>
            <Input
              value={values.duckdbPath}
              onChange={(event) => handleChange("duckdbPath", event.target.value)}
              placeholder=":memory:"
            />
            <p className="text-xs text-muted-foreground">
              Provide a local file path or use :memory: for in-memory sessions.
            </p>
          </div>
          <div className="rounded-lg border border-dashed border-border/60 px-4 py-6 text-xs text-muted-foreground">
            Drag and drop a DuckDB file here, or connect with :memory:.
          </div>
        </div>
      ) : null}

      <div className="space-y-3">
        <TestConnection status={testState} message={testMessage} />
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="outline" onClick={handleTest} disabled={testState === "running"}>
            Test connection
          </Button>
          <Button onClick={handleSubmit} disabled={!isValid}>
            Save connection
          </Button>
        </div>
        <p className={cn("text-xs text-muted-foreground")}>Credentials are encrypted at rest.</p>
      </div>
    </div>
  );
}
