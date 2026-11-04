"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ClockIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MobileNavSheet } from "@/components/layout/MobileNavSheet";
import { BusinessNav } from "./BusinessSidebar";
import { clearSession } from "@/lib/session";
import { useBusinessUser } from "./BusinessGuard";

export function BusinessTopbar() {
  const router = useRouter();
  const { user, subscription } = useBusinessUser();
  const expired = subscription?.status === "expired";
  const needsRenewal =
    expired ||
    (subscription?.status === "active" &&
      !subscription.isTrial &&
      subscription.daysLeft <= 7);

  function handleLogout() {
    clearSession("business");
    router.push("/login");
  }

  return (
    <header className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 border-b border-border bg-background px-4 py-3 sm:px-6">
      <div className="flex min-w-0 items-center gap-2">
        <MobileNavSheet label="Business">
          <BusinessNav />
        </MobileNavSheet>
        <span className="truncate text-sm font-medium text-foreground">
          Business Dashboard
        </span>
        <Badge variant="secondary" className="shrink-0">
          BUSINESS
        </Badge>
      </div>
      <div className="flex min-w-0 items-center gap-3 text-xs text-muted-foreground">
        {needsRenewal && (
          <Badge
            asChild
            variant="outline"
            className={
              expired
                ? "border-indigo-600/20 bg-indigo-50 text-indigo-700"
                : "border-sky-600/20 bg-sky-50 text-sky-700"
            }
          >
            <Link href="/business/subscription">
              {expired ? (
                <ExclamationCircleIcon />
              ) : (
                <ClockIcon />
              )}
              <span className="sm:hidden">
                {expired
                  ? "Expired — pay now"
                  : `${subscription?.daysLeft} day(s) left`}
              </span>
              <span className="hidden sm:inline">
                {expired
                  ? "Subscription expired — pay now"
                  : `Renew in ${subscription?.daysLeft} day(s)`}
              </span>
            </Link>
          </Badge>
        )}
        <span className="max-w-[10rem] truncate">{user.fullName || user.email}</span>
        <Button variant="outline" size="xs" onClick={handleLogout}>
          Log out
        </Button>
      </div>
    </header>
  );
}
