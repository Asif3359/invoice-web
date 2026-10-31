"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { clearSession } from "@/lib/session";
import { useBusinessUser } from "./BusinessGuard";

export function BusinessTopbar() {
  const router = useRouter();
  const { user, subscription } = useBusinessUser();
  const needsRenewal =
    subscription?.status === "expired" ||
    (subscription?.status === "active" &&
      !subscription.isTrial &&
      subscription.daysLeft <= 7);

  function handleLogout() {
    clearSession("business");
    router.push("/login");
  }

  return (
    <header className="flex items-center justify-between border-b border-slate-800 bg-slate-950/60 px-6 py-3">
      <div className="text-sm font-medium text-slate-100">
        Business Dashboard
        <span className="ml-2 rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs text-emerald-400">
          BUSINESS
        </span>
      </div>
      <div className="flex items-center gap-3 text-xs text-slate-300">
        {needsRenewal && (
          <Link
            href="/business/subscription"
            className="rounded-full bg-amber-500/10 px-2 py-1 text-[11px] font-medium text-amber-400 transition hover:bg-amber-500/20"
          >
            {subscription?.status === "expired"
              ? "Subscription expired — pay now"
              : `Renew in ${subscription?.daysLeft} day(s)`}
          </Link>
        )}
        <span>{user.fullName || user.email}</span>
        <button
          type="button"
          onClick={handleLogout}
          className="rounded-md border border-slate-700 px-2 py-1 text-[11px] font-medium text-slate-200 hover:bg-slate-800"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
