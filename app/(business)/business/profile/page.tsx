"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useBusinessUser } from "@/components/business/BusinessGuard";
import { PaymentHistory } from "@/components/business/PaymentHistory";
import { businessApi } from "@/lib/business-api";
import { clearSession } from "@/lib/session";
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

function getErrorMessage(err: unknown, fallback: string) {
  if (axios.isAxiosError(err)) {
    const message = (err.response?.data as { message?: string } | undefined)
      ?.message;
    if (message) return message;
  }
  return err instanceof Error ? err.message : fallback;
}

const inputClassName =
  "mt-1 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/25";

export default function BusinessProfilePage() {
  const router = useRouter();
  const { user, subscription } = useBusinessUser();
  const status = subscription?.status;

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  async function handleChangePassword(event: FormEvent) {
    event.preventDefault();
    setPasswordError(null);

    if (newPassword !== confirmPassword) {
      setPasswordError("New password and confirmation do not match.");
      return;
    }

    setSaving(true);

    try {
      await businessApi.post("/auth/change-password", {
        currentPassword,
        newPassword,
      });
      clearSession("business");
      router.replace("/login?notice=password-changed");
    } catch (err) {
      setPasswordError(
        getErrorMessage(
          err,
          "Could not change your password. Please try again.",
        ),
      );
    } finally {
      setSaving(false);
    }
  }

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

      <PaymentHistory />

      <section className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
        <h2 className="text-lg font-semibold text-slate-100">
          Account security
        </h2>
        <p className="mt-2 text-sm text-slate-400">
          Change your password below. For your security you will be signed out
          and asked to sign in again.
        </p>

        {passwordError && (
          <p
            role="alert"
            className="mt-3 rounded-md border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-sm text-rose-200"
          >
            {passwordError}
          </p>
        )}

        <form
          onSubmit={handleChangePassword}
          className="mt-4 grid gap-4 sm:grid-cols-3"
        >
          <label className="text-sm text-slate-300">
            Current password
            <input
              type="password"
              autoComplete="current-password"
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              required
              className={inputClassName}
            />
          </label>
          <label className="text-sm text-slate-300">
            New password
            <input
              type="password"
              autoComplete="new-password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              minLength={8}
              required
              className={inputClassName}
            />
          </label>
          <label className="text-sm text-slate-300">
            Confirm new password
            <input
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              minLength={8}
              required
              className={inputClassName}
            />
          </label>
          <div className="sm:col-span-3">
            <p className="text-xs text-slate-500">
              At least 8 characters with an uppercase letter, a lowercase letter
              and a number.
            </p>
            <button
              type="submit"
              disabled={saving}
              className="mt-3 rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Changing password..." : "Change password"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
