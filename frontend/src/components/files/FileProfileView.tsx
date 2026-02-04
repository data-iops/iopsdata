"use client";

import { Button } from "@/components/ui/button";
import { ColumnProfileCard, type ColumnProfile } from "@/components/files/ColumnProfileCard";
import { cn } from "@/lib/utils";

export type FileProfile = {
  id: string;
  name: string;
  rowCount: number;
  columnCount: number;
  columns: ColumnProfile[];
};

type FileProfileViewProps = {
  profile: FileProfile;
  onQueryFile: (file: FileProfile) => void;
};

export function FileProfileView({ profile, onQueryFile }: FileProfileViewProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-card/80 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">File profile</p>
          <h2 className="text-xl font-semibold text-foreground">{profile.name}</h2>
          <p className="mt-2 text-xs text-muted-foreground">
            {profile.rowCount.toLocaleString()} rows · {profile.columnCount} columns
          </p>
        </div>
        <Button onClick={() => onQueryFile(profile)}>Query this file</Button>
      </div>

      <div className={cn("grid gap-4 lg:grid-cols-2")}>
        {profile.columns.map((column) => (
          <ColumnProfileCard key={column.name} column={column} />
        ))}
      </div>
    </div>
  );
}
