"use client";

import { useEffect, useState } from "react";
import { ErrorState } from "@/components/admin/ErrorState";
import { Loading } from "@/components/admin/Loading";
import {
  Card,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
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
          "/admin/monitoring/sessions",
        );
        setSessions(res.data.data?.activeSessions ?? null);
      } catch {
        setError(
          "Unable to load monitoring data from /admin/monitoring/sessions.",
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
      <h1 className="text-2xl font-semibold text-foreground">Monitoring</h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="gap-1.5 p-4 sm:p-5">
          <CardDescription className="text-xs font-medium uppercase tracking-wide">
            System Admin Sessions
          </CardDescription>
          <CardTitle className="text-2xl">
            {sessions.system.toLocaleString()}
          </CardTitle>
        </Card>
        <Card className="gap-1.5 p-4 sm:p-5">
          <CardDescription className="text-xs font-medium uppercase tracking-wide">
            Business User Sessions
          </CardDescription>
          <CardTitle className="text-2xl">
            {sessions.businessUsers.toLocaleString()}
          </CardTitle>
        </Card>
        <Card className="gap-1.5 p-4 sm:p-5">
          <CardDescription className="text-xs font-medium uppercase tracking-wide">
            Sub-user Sessions
          </CardDescription>
          <CardTitle className="text-2xl">
            {sessions.subUsers.toLocaleString()}
          </CardTitle>
        </Card>
        <Card className="gap-1.5 p-4 sm:p-5">
          <CardDescription className="text-xs font-medium uppercase tracking-wide">
            Total Active Sessions
          </CardDescription>
          <CardTitle className="text-2xl">
            {sessions.total.toLocaleString()}
          </CardTitle>
        </Card>
      </div>
    </div>
  );
}
