"use client";

import Link from "next/link";
import { useBusinessUser } from "@/components/business/BusinessGuard";
import type { SubscriptionStatus } from "@/lib/business-auth";

const modules = [
  {
    title: "Invoices",
    description: "Create, send, and track customer invoices.",
  },
  {
    title: "Payments",
    description: "Record payments and monitor outstanding balances.",
  },
  {
    title: "Expenses",
    description: "Track business spending and categorise costs.",
  },
  {
    title: "Products & Inventory",
    description: "Manage products, stock levels, and warehouses.",
  },
  {
    title: "Customers",
    description: "Keep your customer and associate records in one place.",
  },
  {
    title: "Reports",
    description: "Understand revenue, expenses, and business performance.",
  },
];

const statusStyles: Record<SubscriptionStatus, string> = {
  active: "bg-emerald-500/10 text-emerald-400",
  expired: "bg-amber-500/10 text-amber-400",
  not_started: "bg-sky-500/10 text-sky-400",
  inactive: "bg-rose-500/10 text-rose-400",
};

function formatDate(value?: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatStatus(status?: SubscriptionStatus) {
  if (!status) return "Unknown";
  return status.replace("_", " ");
}

export default function BusinessDashboardPage() {
  const { user, subscription } = useBusinessUser();
  const status = subscription?.status;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-50">
          Welcome back{user.fullName ? `, ${user.fullName}` : ""}
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          This is your business workspace. Management modules will be enabled in
          the next version.
        </p>
      </div>

      {status === "expired" && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-200">
          <p>
            Your subscription has expired. Renew to keep creating invoices,
            recording payments, and syncing data.
          </p>
          <Link
            href="/business/subscription"
            className="rounded-md bg-amber-500 px-3 py-2 text-xs font-semibold text-slate-950 transition hover:bg-amber-400"
          >
            Pay now
          </Link>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
          <div className="text-xs font-medium text-slate-400">
            Subscription Status
          </div>
          <div className="mt-2 flex items-center gap-2">
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${
                status
                  ? statusStyles[status]
                  : "bg-slate-800 text-slate-300"
              }`}
            >
              {formatStatus(status)}
            </span>
            {subscription?.isTrial && (
              <span className="rounded-full bg-sky-500/10 px-2 py-0.5 text-xs text-sky-400">
                Trial
              </span>
            )}
          </div>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
          <div className="text-xs font-medium text-slate-400">
            Current Period Ends
          </div>
          <div className="mt-2 text-lg font-semibold text-slate-50">
            {formatDate(subscription?.activeUntil)}
          </div>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
          <div className="text-xs font-medium text-slate-400">
            Days Remaining
          </div>
          <div className="mt-2 text-lg font-semibold text-slate-50">
            {subscription?.status === "active"
              ? subscription.daysLeft
              : "—"}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-emerald-900/50 bg-emerald-950/20 p-4 text-sm text-emerald-200">
        Your account is ready. Invoicing, payments, expenses, inventory, and
        reporting will be added to this dashboard in the next version.
      </div>

      <section>
        <h2 className="text-lg font-semibold text-slate-100">Modules</h2>
        <div className="mt-3 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {modules.map((module) => (
            <div
              key={module.title}
              className="rounded-xl border border-slate-800 bg-slate-950/60 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-sm font-semibold text-slate-100">
                  {module.title}
                </h3>
                <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-400">
                  Coming soon
                </span>
              </div>
              <p className="mt-2 text-sm text-slate-400">
                {module.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
        <h2 className="text-lg font-semibold text-slate-100">Quick links</h2>
        <div className="mt-3 flex flex-wrap gap-3 text-sm">
          <Link
            href="/business/profile"
            className="rounded-md bg-emerald-500 px-3 py-2 font-medium text-slate-950 hover:bg-emerald-400"
          >
            View profile
          </Link>
          <Link
            href="/business/subscription"
            className="rounded-md border border-slate-700 px-3 py-2 font-medium text-slate-200 hover:bg-slate-800"
          >
            Renew subscription
          </Link>
          <Link
            href="/pricing"
            className="rounded-md border border-slate-700 px-3 py-2 font-medium text-slate-200 hover:bg-slate-800"
          >
            View plans
          </Link>
          <Link
            href="/contact"
            className="rounded-md border border-slate-700 px-3 py-2 font-medium text-slate-200 hover:bg-slate-800"
          >
            Contact support
          </Link>
        </div>
      </section>
    </div>
  );
}
