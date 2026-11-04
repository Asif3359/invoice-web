"use client";

import { NavList, type NavLink } from "@/components/layout/NavList";
import { useAdminUser } from "./AdminGuard";
import type { AdminRole } from "@/lib/auth";

type RoledLink = NavLink & {
  /** Roles allowed to see this link. Omit to allow every admin role. */
  roles?: AdminRole[];
};

const links: RoledLink[] = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/users", label: "System Users", roles: ["superadmin"] },
  { href: "/admin/sub-users", label: "Business Users" },
  {
    href: "/admin/permissions",
    label: "Permissions",
    roles: ["superadmin", "admin"],
  },
  {
    href: "/admin/video-tutorials",
    label: "Help Videos",
    roles: ["superadmin", "admin"],
  },
  { href: "/admin/monitoring", label: "Monitoring" },
  { href: "/admin/settings", label: "Settings", roles: ["superadmin"] },
];

export function visibleAdminLinks(role: AdminRole | undefined): NavLink[] {
  return links.filter((link) => !link.roles || (role && link.roles.includes(role)));
}

/** Sidebar body — shared by the desktop aside and the mobile drawer. */
export function AdminNav() {
  const user = useAdminUser();
  const displayRole = (user.role ?? "admin").toUpperCase();

  return (
    <NavList
      title="Invoice System Admin"
      meta={`${user.fullName || user.email} · ${displayRole}`}
      links={visibleAdminLinks(user.role)}
    />
  );
}

export function Sidebar() {
  return (
    <aside className="hidden w-64 shrink-0 flex-col overflow-y-auto border-r border-border bg-background lg:flex">
      <AdminNav />
    </aside>
  );
}
