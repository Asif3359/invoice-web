"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { ErrorState } from "@/components/admin/ErrorState";
import { Loading } from "@/components/admin/Loading";
import { api } from "@/lib/api-client";
import { clearSession } from "@/lib/session";

// ─── Extract the nested type ────────────────────────────────────────────────
type AppSettings = {
  appName: string;
  allowNewRegistrations: boolean;
  maintenanceMode: boolean;
  maxSubUsersPerBusiness: number;
  supportEmail: string;
};

type SettingsResponse = {
  success: boolean;
  data?: {
    settings: AppSettings;
  };
};

export default function SettingsPage() {
  const router = useRouter();
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get<SettingsResponse>("/admin/settings");
        setSettings(res.data.data?.settings ?? null);
      } catch {
        setError("Unable to load system settings from /admin/settings.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleChangePassword(event: FormEvent) {
    event.preventDefault();
    setPasswordError(null);

    if (newPassword !== confirmPassword) {
      setPasswordError("New password and confirmation do not match.");
      return;
    }

    setSavingPassword(true);

    try {
      await api.post("/admin/auth/change-password", {
        currentPassword,
        newPassword,
      });
      clearSession("admin");
      router.replace("/login?notice=password-changed");
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? (err.response?.data as { message?: string } | undefined)?.message
        : undefined;
      setPasswordError(
        message ?? "Could not change your password. Please try again.",
      );
    } finally {
      setSavingPassword(false);
    }
  }

  if (loading) {
    return <Loading />;
  }

  if (error || !settings) {
    return <ErrorState message={error ?? "No system settings available."} />;
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-slate-50">Settings</h1>
      <dl className="space-y-2 text-sm text-slate-200">
        <div className="flex justify-between">
          <dt className="text-slate-400">App Name</dt>
          <dd className="font-medium text-slate-100">{settings.appName}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-slate-400">Allow New Registrations</dt>
          <dd className="font-medium text-slate-100">
            {settings.allowNewRegistrations ? "Enabled" : "Disabled"}
          </dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-slate-400">Maintenance Mode</dt>
          <dd className="font-medium text-slate-100">
            {settings.maintenanceMode ? "On" : "Off"}
          </dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-slate-400">Max Sub-users per Business</dt>
          <dd className="font-medium text-slate-100">
            {settings.maxSubUsersPerBusiness}
          </dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-slate-400">Support Email</dt>
          <dd className="font-medium text-slate-100">
            {settings.supportEmail}
          </dd>
        </div>
      </dl>

      <section className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
        <h2 className="text-lg font-semibold text-slate-100">
          Account security
        </h2>
        <p className="mt-2 text-sm text-slate-400">
          Change the password for your system admin account. You will be signed
          out and asked to sign in again.
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
          className="mt-4 grid gap-3 sm:grid-cols-3"
        >
          <label className="text-sm text-slate-300">
            Current password
            <input
              type="password"
              autoComplete="current-password"
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              required
              className="mt-1 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/25"
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
              className="mt-1 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/25"
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
              className="mt-1 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/25"
            />
          </label>
          <div className="sm:col-span-3">
            <p className="text-xs text-slate-500">
              At least 8 characters with an uppercase letter, a lowercase letter
              and a number.
            </p>
            <button
              type="submit"
              disabled={savingPassword}
              className="mt-3 rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {savingPassword ? "Changing password..." : "Change password"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
