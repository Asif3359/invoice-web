"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
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
  { prefix: "/admin/video-tutorials", roles: ["superadmin", "admin"] },
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
      <div className="rounded-xl border border-border bg-card p-4 shadow-sm sm:p-6">
        <h1 className="text-lg font-semibold text-card-foreground">
          Access denied
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Your role ({user.role}) does not have permission to view this page.
        </p>
        <Button asChild className="mt-4 w-full sm:w-auto">
          <Link href="/admin">Back to overview</Link>
        </Button>
      </div>
    );
  }

  return <>{children}</>;
}
