"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bars3Icon,
  ChevronDownIcon,
  PowerIcon,
} from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { clearSession, getInitials } from "@/lib/session";
import { useIsMounted, useStoredSession } from "@/lib/use-session";

/** Every marketing link is a section on the home page. */
const NAV_LINKS = [
  { href: "/#features", label: "Features" },
  { href: "/#pricing", label: "Pricing" },
  { href: "/#contact", label: "Contact" },
];

function marketingLinkClass() {
  return "text-sm font-medium text-muted-foreground transition-colors hover:text-foreground";
}

function Wordmark() {
  return (
    <>
      <span className="text-xl font-bold text-primary">Invento</span>
      <span className="text-xl font-light text-muted-foreground">manager</span>
    </>
  );
}

function AccountMenu({
  displayName,
  roleLabel,
  dashboardHref,
  profileHref,
  onLogout,
}: {
  displayName: string;
  roleLabel: string;
  dashboardHref: string;
  profileHref: string | null;
  onLogout: () => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-2 rounded-full border border-input bg-background py-1 pl-1 pr-2 text-sm text-foreground shadow-xs transition hover:border-primary hover:bg-accent/40"
        >
          <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">
            {getInitials(displayName)}
          </span>
          <span className="hidden max-w-[10rem] truncate sm:block">
            {displayName}
          </span>
          <ChevronDownIcon className="size-4 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-(--radix-dropdown-menu-trigger-width) min-w-56"
      >
        <DropdownMenuLabel className="font-normal">
          <p className="truncate text-sm font-medium text-foreground">
            {displayName}
          </p>
          <p className="text-xs text-muted-foreground">{roleLabel}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href={dashboardHref}>Dashboard</Link>
          </DropdownMenuItem>
          {profileHref && (
            <DropdownMenuItem asChild>
              <Link href={profileHref}>Profile</Link>
            </DropdownMenuItem>
          )}
          <DropdownMenuItem variant="destructive" onSelect={onLogout}>
            <PowerIcon />
            Log out
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function Header() {
  const router = useRouter();
  const session = useStoredSession();
  const mounted = useIsMounted();

  function handleLogout() {
    if (session) {
      clearSession(session.kind);
    }
    router.push("/");
  }

  const displayName =
    session?.user?.fullName || session?.user?.email || "Account";
  const dashboardHref = session?.kind === "admin" ? "/admin" : "/business";
  const profileHref = session?.kind === "business" ? "/business/profile" : null;
  const roleLabel =
    session?.kind === "admin"
      ? session.user?.role
        ? session.user.role.toUpperCase()
        : "System admin"
      : "Business account";

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur-sm supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0 md:hidden"
                aria-label="Open menu"
              >
                <Bars3Icon className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[80%] max-w-xs">
              <SheetHeader>
                <SheetTitle className="text-left text-lg">
                  <Wordmark />
                </SheetTitle>
                <SheetDescription className="sr-only">
                  Site navigation
                </SheetDescription>
              </SheetHeader>
              <nav className="flex flex-col gap-3 px-4">
                {NAV_LINKS.map((link) => (
                  <SheetClose asChild key={link.href}>
                    <Link
                      href={link.href}
                      className={marketingLinkClass()}
                    >
                      {link.label}
                    </Link>
                  </SheetClose>
                ))}
              </nav>
              <div className="mt-auto border-t border-border p-4">
                {mounted && session ? (
                  <div className="flex flex-col">
                    <p className="truncate text-sm font-medium text-foreground">
                      {displayName}
                    </p>
                    <p className="pb-2 text-xs text-muted-foreground">
                      {roleLabel}
                    </p>
                    <SheetClose asChild>
                      <Link
                        href={dashboardHref}
                        className="rounded-md px-3 py-2 text-sm text-foreground hover:bg-accent hover:text-accent-foreground"
                      >
                        Dashboard
                      </Link>
                    </SheetClose>
                    {profileHref && (
                      <SheetClose asChild>
                        <Link
                          href={profileHref}
                          className="rounded-md px-3 py-2 text-sm text-foreground hover:bg-accent hover:text-accent-foreground"
                        >
                          Profile
                        </Link>
                      </SheetClose>
                    )}
                    <SheetClose asChild>
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="rounded-md px-3 py-2 text-left text-sm text-destructive hover:bg-destructive/10"
                      >
                        Log out
                      </button>
                    </SheetClose>
                  </div>
                ) : (
                  <SheetClose asChild>
                    <Button asChild className="w-full">
                      <Link href="/login">Login</Link>
                    </Button>
                  </SheetClose>
                )}
              </div>
            </SheetContent>
          </Sheet>

          <Link
            href="/"
            className="flex min-w-0 items-center gap-2"
            aria-label="Invento Manager home"
          >
            <Wordmark />
          </Link>
        </div>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`${marketingLinkClass()} relative after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-full after:origin-left after:scale-x-0 after:rounded-full after:bg-primary after:transition-transform after:duration-200 after:content-[""] hover:after:scale-x-100`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-3">
          {!mounted ? (
            <div
              className="h-9 w-24 animate-pulse rounded-full bg-muted"
              aria-hidden="true"
            />
          ) : session ? (
            <AccountMenu
              displayName={displayName}
              roleLabel={roleLabel}
              dashboardHref={dashboardHref}
              profileHref={profileHref}
              onLogout={handleLogout}
            />
          ) : (
            <Button asChild size="sm">
              <Link href="/login">Login</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
