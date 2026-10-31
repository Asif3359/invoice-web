"use client";

import { useBusinessUser } from "@/components/business/BusinessGuard";
import type { SubscriptionStatus } from "@/lib/business-auth";

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

export default function BusinessProfilePage() {
  const { user, subscription } = useBusinessUser();
  const status = subscription?.status;

  const details = [
    { label: "Full name", value: user.fullName || "Not provided" },
    { label: "Email", value: user.email },
    { label: "Phone", value: user.phone || "Not provided" },
    {
      label: "Email verified",
      value: user.emailVerified ? "Yes" : "No",
    },
    {
      label: "Account status",
      value: user.isActive ? "Active" : "Inactive",
    },
    { label: "Member since", value: formatDate(user.createdAt) },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-50">Profile</h1>
        <p className="mt-1 text-sm text-slate-400">
          Your business account details and subscription information.
        </p>
      </div>

      <section className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
        <h2 className="text-lg font-semibold text-slate-100">
          Account details
        </h2>
        <dl className="mt-4 grid gap-4 sm:grid-cols-2">
          {details.map((detail) => (
            <div key={detail.label}>
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
                {detail.label}
              </dt>
              <dd className="mt-1 text-sm text-slate-100">{detail.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
        <h2 className="text-lg font-semibold text-slate-100">Subscription</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Status
            </div>
            <div className="mt-1">
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${
                  status ? statusStyles[status] : "bg-slate-800 text-slate-300"
                }`}
              >
                {formatStatus(status)}
              </span>
            </div>
          </div>
          <div>
            <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Plan type
            </div>
            <div className="mt-1 text-sm text-slate-100">
              {subscription?.isTrial ? "Free trial" : "Paid subscription"}
            </div>
          </div>
          <div>
            <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Period starts
            </div>
            <div className="mt-1 text-sm text-slate-100">
              {formatDate(subscription?.activeFrom)}
            </div>
          </div>
          <div>
            <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Period ends
            </div>
            <div className="mt-1 text-sm text-slate-100">
              {formatDate(subscription?.activeUntil)}
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
        <h2 className="text-lg font-semibold text-slate-100">
          Security &amp; preferences
        </h2>
        <p className="mt-2 text-sm text-slate-400">
          Password changes and business profile editing will be available in the
          next version. Contact support if you need to update your account
          details now.
        </p>
        <button
          type="button"
          disabled
          className="mt-4 cursor-not-allowed rounded-md border border-slate-700 px-3 py-2 text-sm font-medium text-slate-500"
        >
          Change password (coming soon)
        </button>
      </section>
    </div>
  );
}
