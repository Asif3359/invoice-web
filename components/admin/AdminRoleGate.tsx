"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAdminUser } from "./AdminGuard";
import type { AdminRole } from "@/lib/auth";

/**
 * Route-level role rules for the system admin dashboard.
 *
 * The sidebar hides links a role cannot use, and this gate blocks direct URL
 * access as a second line of defence. The backend still enforces every rule.
 */
const routeRoles: { prefix: string; roles: AdminRole[] }[] = [
  { prefix: "/admin/users", roles: ["superadmin"] },
  { prefix: "/admin/settings", roles: ["superadmin"] },
  { prefix: "/admin/permissions", roles: ["superadmin", "admin"] },
];

export function AdminRoleGate({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const user = useAdminUser();

  if (user.role === "superadmin") {
    return <>{children}</>;
  }

  const rule = routeRoles.find(
    (entry) =>
      pathname === entry.prefix || pathname.startsWith(`${entry.prefix}/`),
  );

  if (rule && !rule.roles.includes(user.role)) {
    return (
      <div className="rounded-xl border border-amber-900/60 bg-amber-950/30 p-6">
        <h1 className="text-lg font-semibold text-amber-100">Access denied</h1>
        <p className="mt-2 text-sm text-amber-200/80">
          Your role ({user.role}) does not have permission to view this page.
        </p>
        <Link
          href="/admin"
          className="mt-4 inline-block rounded-md bg-amber-500 px-3 py-2 text-sm font-medium text-slate-950 hover:bg-amber-400"
        >
          Back to overview
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}
