"use client";

import { useEffect, useState } from "react";
import { StatsCards } from "@/components/admin/StatsCards";
import { ErrorState } from "@/components/admin/ErrorState";
import { Loading } from "@/components/admin/Loading";
import { api } from "@/lib/api-client";

type OverviewStats = {
  totalBusinessUsers: number;
  totalSubUsers: number;
  totalSystemAdmins: number;
  totalInvoices: number;
  totalPayments: number;
  totalExpenses: number;
};

type OverviewResponse = {
  success: boolean;
  data?: {
    stats: OverviewStats;
  };
};

export default function AdminOverviewPage() {
  const [statsData, setStatsData] = useState<OverviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get<OverviewResponse>(
          "/api/admin/metrics/overview",
        );
        setStatsData(res.data.data?.stats ?? null);
      } catch {
        setError(
          "Unable to load overview metrics from /api/admin/metrics/overview.",
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

  if (error || !statsData) {
    return <ErrorState message={error ?? "No metrics available."} />;
  }

  const stats = [
    {
      label: "Business Users",
      value: statsData.totalBusinessUsers,
    },
    {
      label: "Sub-users",
      value: statsData.totalSubUsers,
    },
    {
      label: "System Admins",
      value: statsData.totalSystemAdmins,
    },
    {
      label: "Total Invoices",
      value: statsData.totalInvoices,
    },
    {
      label: "Total Payments",
      value: statsData.totalPayments,
    },
    {
      label: "Total Expenses",
      value: statsData.totalExpenses,
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-slate-50">System Overview</h1>
      <StatsCards stats={stats} />
    </div>
  );
}
