"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { getActiveHref } from "@/lib/nav";
import { useAdminUser } from "./AdminGuard";
import type { AdminRole } from "@/lib/auth";

type NavLink = {
  href: string;
  label: string;
  /** Roles allowed to see this link. Omit to allow every admin role. */
  roles?: AdminRole[];
};

const links: NavLink[] = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/users", label: "System Users", roles: ["superadmin"] },
  { href: "/admin/sub-users", label: "Business Users" },
  {
    href: "/admin/permissions",
    label: "Permissions",
    roles: ["superadmin", "admin"],
  },
  { href: "/admin/monitoring", label: "Monitoring" },
  { href: "/admin/settings", label: "Settings", roles: ["superadmin"] },
];

export function Sidebar() {
  const pathname = usePathname();
  const user = useAdminUser();
  const displayRole = (user.role ?? "admin").toUpperCase();
  const visibleLinks = links.filter(
    (link) => !link.roles || link.roles.includes(user.role),
  );
  const activeHref = getActiveHref(
    pathname,
    visibleLinks.map((link) => link.href),
  );

  return (
    <aside className="flex w-64 flex-col border-r border-slate-800 bg-slate-950/80">
      <div className="p-4 text-sm font-semibold text-slate-100">
        Invoice System Admin
        <div className="mt-1 text-xs text-slate-400">
          {user.fullName || user.email} · {displayRole}
        </div>
      </div>
      <nav className="flex-1 space-y-1 px-2">
        {visibleLinks.map((link) => {
          const active = link.href === activeHref;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`block rounded-md px-3 py-2 text-sm ${
                active
                  ? "bg-emerald-500 text-slate-950"
                  : "text-slate-300 hover:bg-slate-900 hover:text-slate-50"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-slate-800 p-4">
        <Link href="/" className="text-xs text-slate-400 hover:text-slate-200">
          ← Back to website
        </Link>
      </div>
    </aside>
  );
}
