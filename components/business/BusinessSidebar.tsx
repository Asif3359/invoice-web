"use client";

import { NavList, type NavLink } from "@/components/layout/NavList";
import { useBusinessUser } from "./BusinessGuard";

const links: NavLink[] = [
  { href: "/business", label: "Dashboard" },
  { href: "/business/subscription", label: "Subscription" },
  { href: "/business/payments", label: "Payment History" },
  { href: "/business/profile", label: "Profile" },
  { href: "/business/security", label: "Security" },
];

/** Sidebar body — shared by the desktop aside and the mobile drawer. */
export function BusinessNav() {
  const { user } = useBusinessUser();

  return (
    <NavList
      title="Invento Manager"
      meta={`${user.fullName || user.email} · BUSINESS`}
      links={links}
    />
  );
}

export function BusinessSidebar() {
  return (
    <aside className="hidden w-64 shrink-0 flex-col overflow-y-auto border-r border-border bg-background lg:flex">
      <BusinessNav />
    </aside>
  );
}
