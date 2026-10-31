"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { getActiveHref } from "@/lib/nav";
import { useBusinessUser } from "./BusinessGuard";

const links = [
  { href: "/business", label: "Dashboard" },
  { href: "/business/subscription", label: "Subscription" },
  { href: "/business/profile", label: "Profile" },
];

export function BusinessSidebar() {
  const pathname = usePathname();
  const { user } = useBusinessUser();
  const activeHref = getActiveHref(
    pathname,
    links.map((link) => link.href),
  );

  return (
    <aside className="flex w-64 flex-col border-r border-slate-800 bg-slate-950/80">
      <div className="p-4 text-sm font-semibold text-slate-100">
        Invoice SaaS
        <div className="mt-1 text-xs text-slate-400">
          {user.fullName || user.email} · BUSINESS
        </div>
      </div>
      <nav className="flex-1 space-y-1 px-2">
        {links.map((link) => {
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
        <Link
          href="/"
          className="text-xs text-slate-400 hover:text-slate-200"
        >
          ← Back to website
        </Link>
      </div>
    </aside>
  );
}
