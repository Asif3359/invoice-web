import type { ReactNode } from "react";
import {
  Table as ScrollableTable,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type DataColumn<T> = {
  key: keyof T | string;
  header: string;
  render?: (row: T) => ReactNode;
  /** Left out of the table below `sm`; mobile cards always show every column. */
  hideOnMobile?: boolean;
};

function cellContent<T>(column: DataColumn<T>, row: T): ReactNode {
  return column.render
    ? column.render(row)
    : (row as Record<string, ReactNode>)[column.key as string];
}

export function DataTable<T extends { id?: string | number; _id?: string }>({
  columns,
  data,
  emptyMessage = "No data available",
  className,
}: {
  columns: DataColumn<T>[];
  data: T[];
  emptyMessage?: string;
  className?: string;
}) {
  if (!data.length) {
    return (
      <Card className={cn("py-4", className)}>
        <CardContent className="text-sm text-muted-foreground">
          {emptyMessage}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn("min-w-0", className)}>
      <ul className="space-y-3 sm:hidden">
        {data.map((row, idx) => (
          <li key={row.id ?? row._id ?? idx}>
            <Card className="gap-0 py-0">
              <CardContent className="divide-y divide-border px-4 py-1">
                {columns.map((column) => (
                  <div
                    key={String(column.key)}
                    className="flex items-start justify-between gap-4 py-2.5"
                  >
                    <span className="shrink-0 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                      {column.header}
                    </span>
                    <span className="min-w-0 break-words text-right text-sm">
                      {cellContent(column, row)}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </li>
        ))}
      </ul>

      <div className="hidden overflow-hidden rounded-xl border bg-card sm:block">
        <ScrollableTable className="min-w-full">
          <TableHeader className="bg-muted/50">
            <TableRow>
              {columns
                .filter((column) => !column.hideOnMobile)
                .map((column) => (
                  <TableHead
                    key={String(column.key)}
                    className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground"
                  >
                    {column.header}
                  </TableHead>
                ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row, idx) => (
              <TableRow key={row.id ?? row._id ?? idx}>
                {columns
                  .filter((column) => !column.hideOnMobile)
                  .map((column) => (
                    <TableCell
                      key={String(column.key)}
                      className="px-4 py-3 text-sm"
                    >
                      {cellContent(column, row)}
                    </TableCell>
                  ))}
              </TableRow>
            ))}
          </TableBody>
        </ScrollableTable>
      </div>
    </div>
  );
}
