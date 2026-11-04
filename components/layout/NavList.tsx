"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { getActiveHref, sidebarLinkClass } from "@/lib/nav";

export type NavLink = { href: string; label: string };

/**
 * Sidebar body, rendered inside the desktop `<aside>` and inside the mobile
 * drawer. The wrappers supply the brand text and the (role-filtered) links.
 */
export function NavList({
  title,
  meta,
  links,
}: {
  title: string;
  meta: string;
  links: NavLink[];
}) {
  const pathname = usePathname();
  const activeHref = getActiveHref(
    pathname,
    links.map((link) => link.href),
  );

  return (
    <>
      <div className="p-4 text-sm font-semibold text-foreground">
        {title}
        <div className="mt-1 truncate text-xs text-muted-foreground">{meta}</div>
      </div>
      <nav className="flex-1 space-y-1 px-2">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={sidebarLinkClass(link.href === activeHref)}
          >
            {link.label}
          </Link>
        ))}
      </nav>
      <div className="border-t border-border p-4">
        <Link
          href="/"
          className="text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          ← Back to website
        </Link>
      </div>
    </>
  );
}
