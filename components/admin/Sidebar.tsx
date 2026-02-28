"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAdminUser } from "./AdminGuard";

const links = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/users", label: "System Users" },
  { href: "/admin/sub-users", label: "Business Users" },
  { href: "/admin/permissions", label: "Permissions" },
  { href: "/admin/monitoring", label: "Monitoring" },
  { href: "/admin/settings", label: "Settings" },
];

export function Sidebar() {
  const pathname = usePathname();
  const user = useAdminUser();
  const displayRole = (user.role ?? "admin").toUpperCase();

  return (
    <aside className="flex w-64 flex-col border-r border-slate-800 bg-slate-950/80">
      <div className="p-4 text-sm font-semibold text-slate-100">
        Invoice System Admin
        <div className="mt-1 text-xs text-slate-400">
          {user.fullName || user.email} · {displayRole}
        </div>
      </div>
      <nav className="flex-1 space-y-1 px-2">
        {links.map((link) => {
          const active = pathname === link.href;
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
    </aside>
  );
}

