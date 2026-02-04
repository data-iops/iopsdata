import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export type DataTableColumn<T> = {
  key: string;
  header: ReactNode;
  cell?: (row: T) => ReactNode;
  className?: string;
};

export type DataTableProps<T> = {
  caption?: string;
  columns: Array<DataTableColumn<T>>;
  data: T[];
  getRowKey: (row: T, index: number) => string;
  className?: string;
};

export function DataTable<T>({
  caption,
  columns,
  data,
  getRowKey,
  className,
}: DataTableProps<T>) {
  return (
    <div className={cn("overflow-hidden rounded-xl border border-border/60", className)}>
      <table className="w-full text-left text-sm">
        {caption ? <caption className="sr-only">{caption}</caption> : null}
        <thead className="bg-card/80 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                className={cn("px-4 py-3", column.className)}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border/40">
          {data.map((row, index) => (
            <tr key={getRowKey(row, index)} className="transition-colors hover:bg-muted/40">
              {columns.map((column) => (
                <td key={column.key} className={cn("px-4 py-3", column.className)}>
                  {column.cell ? column.cell(row) : (row as Record<string, ReactNode>)[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
