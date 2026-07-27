"use client";

import { useEffect, useState } from "react";
import { ErrorState } from "@/components/admin/ErrorState";
import { Loading } from "@/components/admin/Loading";
import { api } from "@/lib/api-client";

// ─── Extract the nested type ────────────────────────────────────────────────
type ActiveSessions = {
  system: number;
  businessUsers: number;
  subUsers: number;
  total: number;
};

type MonitoringSessionsResponse = {
  success: boolean;
  data?: {
    activeSessions: ActiveSessions;
  };
};

export default function MonitoringPage() {
  const [sessions, setSessions] = useState<ActiveSessions | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get<MonitoringSessionsResponse>(
          "/api/admin/monitoring/sessions",
        );
        setSessions(res.data.data?.activeSessions ?? null);
      } catch {
        setError(
          "Unable to load monitoring data from /api/admin/monitoring/sessions.",
        );
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return <Loading />;
  }

  if (error || !sessions) {
    return <ErrorState message={error ?? "No monitoring data available."} />;
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-slate-50">Monitoring</h1>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 text-sm text-slate-200">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            System Admin Sessions
          </div>
          <div className="mt-2 text-2xl font-semibold">
            {sessions.system.toLocaleString()}
          </div>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 text-sm text-slate-200">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Business User Sessions
          </div>
          <div className="mt-2 text-2xl font-semibold">
            {sessions.businessUsers.toLocaleString()}
          </div>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 text-sm text-slate-200">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Sub-user Sessions
          </div>
          <div className="mt-2 text-2xl font-semibold">
            {sessions.subUsers.toLocaleString()}
          </div>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 text-sm text-slate-200">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Total Active Sessions
          </div>
          <div className="mt-2 text-2xl font-semibold">
            {sessions.total.toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
}