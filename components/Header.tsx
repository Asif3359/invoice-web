"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { clearSession, getInitials } from "@/lib/session";
import { useIsMounted, useStoredSession } from "@/lib/use-session";

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const session = useStoredSession();
  const mounted = useIsMounted();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const isActive = (path: string) => pathname === path;

  useEffect(() => {
    if (!menuOpen) return;

    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [menuOpen]);

  function handleLogout() {
    if (session) {
      clearSession(session.kind);
    }
    setMenuOpen(false);
    router.push("/");
  }

  const displayName =
    session?.user?.fullName || session?.user?.email || "Account";
  const dashboardHref = session?.kind === "admin" ? "/admin" : "/business";
  const profileHref =
    session?.kind === "business" ? "/business/profile" : null;
  const roleLabel =
    session?.kind === "admin"
      ? session.user?.role
        ? session.user.role.toUpperCase()
        : "System admin"
      : "Business account";

  return (
    <header className="relative z-50 border-b border-slate-800 bg-slate-950/80 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold text-emerald-500">Invoice</span>
            <span className="text-xl font-light text-slate-300">SaaS</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden items-center gap-8 md:flex">
            <Link
              href="/features"
              className={`text-sm font-medium transition-colors ${
                isActive("/features")
                  ? "text-emerald-400"
                  : "text-slate-400 hover:text-slate-100"
              }`}
            >
              Features
            </Link>
            <Link
              href="/pricing"
              className={`text-sm font-medium transition-colors ${
                isActive("/pricing")
                  ? "text-emerald-400"
                  : "text-slate-400 hover:text-slate-100"
              }`}
            >
              Pricing
            </Link>
            <Link
              href="/contact"
              className={`text-sm font-medium transition-colors ${
                isActive("/contact")
                  ? "text-emerald-400"
                  : "text-slate-400 hover:text-slate-100"
              }`}
            >
              Contact
            </Link>
          </nav>

          {/* Account actions */}
          <div className="flex items-center gap-3">
            {!mounted ? (
              <div
                className="h-9 w-24 animate-pulse rounded-full bg-slate-800"
                aria-hidden="true"
              />
            ) : session ? (
              <div className="relative z-50" ref={menuRef}>
                <button
                  type="button"
                  onClick={() => setMenuOpen((open) => !open)}
                  aria-expanded={menuOpen}
                  aria-haspopup="menu"
                  className="flex items-center gap-2 rounded-full border border-slate-700/80 bg-slate-900/70 py-1 pl-1 pr-2 text-sm text-slate-200 transition hover:border-slate-500 hover:bg-slate-800/80"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 text-[11px] font-bold text-slate-950">
                    {getInitials(displayName)}
                  </span>
                  <span className="hidden max-w-[10rem] truncate sm:block">
                    {displayName}
                  </span>
                  <ChevronDownIcon
                    className={`h-4 w-4 text-slate-400 transition-transform ${
                      menuOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {menuOpen && (
                  <div
                    role="menu"
                    className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-xl border border-slate-800 bg-slate-900/95 p-1 shadow-2xl shadow-black/50 backdrop-blur-xl"
                  >
                    <div className="px-3 py-2">
                      <p className="truncate text-sm font-medium text-slate-100">
                        {displayName}
                      </p>
                      <p className="text-xs text-slate-500">{roleLabel}</p>
                    </div>
                    <div className="my-1 h-px bg-slate-800" />
                    <Link
                      href={dashboardHref}
                      role="menuitem"
                      onClick={() => setMenuOpen(false)}
                      className="block rounded-lg px-3 py-2 text-sm text-slate-300 transition hover:bg-slate-800 hover:text-slate-50"
                    >
                      Dashboard
                    </Link>
                    {profileHref && (
                      <Link
                        href={profileHref}
                        role="menuitem"
                        onClick={() => setMenuOpen(false)}
                        className="block rounded-lg px-3 py-2 text-sm text-slate-300 transition hover:bg-slate-800 hover:text-slate-50"
                      >
                        Profile
                      </Link>
                    )}
                    <button
                      type="button"
                      role="menuitem"
                      onClick={handleLogout}
                      className="mt-1 block w-full rounded-lg px-3 py-2 text-left text-sm text-rose-300 transition hover:bg-rose-500/10 hover:text-rose-200"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-500"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
