interface Column<T> {
  key: keyof T | string;
  header: string;
  render?: (row: T) => React.ReactNode;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  emptyMessage?: string;
}

export function Table<T extends { id?: string | number }>({
  columns,
  data,
  emptyMessage = "No data available",
}: TableProps<T>) {
  if (!data.length) {
    return (
      <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-6 text-sm text-slate-400">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950/40">
      <table className="min-w-full divide-y divide-slate-800 text-sm">
        <thead className="bg-slate-950/80">
          <tr>
            {columns.map((column) => (
              <th
                key={String(column.key)}
                className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-400"
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800">
          {data.map((row, idx) => (
            <tr key={(row.id as string | number | undefined) ?? idx}>
              {columns.map((column) => (
                <td
                  key={String(column.key)}
                  className="whitespace-nowrap px-4 py-3 text-xs text-slate-100"
                >
                  {column.render
                    ? column.render(row)
                    : // @ts-expect-error index access
                      (row[column.key] as React.ReactNode)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

