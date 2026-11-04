import type { ReactNode } from "react";

/**
 * Two-column app shell. `min-w-0` on the content column is load-bearing: a flex
 * child otherwise refuses to shrink below its content, which makes any
 * `overflow-x-auto` on a wide table inert.
 */
export function DashboardShell({
  sidebar,
  topbar,
  children,
}: {
  sidebar: ReactNode;
  topbar: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex h-dvh bg-background text-foreground">
      {sidebar}
      <div className="flex min-w-0 flex-1 flex-col">
        {topbar}
        <main className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
