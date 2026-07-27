"use client";

import { useEffect, useState } from "react";
import { ErrorState } from "@/components/admin/ErrorState";
import { Loading } from "@/components/admin/Loading";
import { api } from "@/lib/api-client";

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
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get<SettingsResponse>("/api/admin/settings");
        setSettings(res.data.data?.settings ?? null);
      } catch {
        setError("Unable to load system settings from /api/admin/settings.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

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
    </div>
  );
}