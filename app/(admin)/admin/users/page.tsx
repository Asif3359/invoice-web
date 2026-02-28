"use client";

import { useEffect, useState } from "react";
import { Table } from "@/components/admin/Table";
import { ErrorState } from "@/components/admin/ErrorState";
import { Loading } from "@/components/admin/Loading";
import { api } from "@/lib/api-client";
import type { AdminRole } from "@/lib/auth";

interface SystemAdminRow {
  id: string;
  email: string;
  fullName?: string;
  role: AdminRole;
  isActive: boolean;
  lastLoginAt?: string;
}

type SystemAdminsResponse = {
  success: boolean;
  data?: {
    admins: {
      _id: string;
      email: string;
      fullName?: string;
      role: AdminRole;
      isActive: boolean;
      lastLoginAt?: string;
    }[];
  };
};

export default function SystemUsersPage() {
  const [users, setUsers] = useState<SystemAdminRow[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get<SystemAdminsResponse>(
          "/api/admin/system-admins",
        );
        const admins = res.data.data?.admins ?? [];
        setUsers(
          admins.map((admin) => ({
            id: admin._id,
            email: admin.email,
            fullName: admin.fullName,
            role: admin.role,
            isActive: admin.isActive,
            lastLoginAt: admin.lastLoginAt,
          })),
        );
      } catch {
        setError("Unable to load system admins from /api/admin/system-admins.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return <Loading />;
  }

  if (error || !users) {
    return <ErrorState message={error ?? "No system admins found."} />;
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-slate-50">System Admins</h1>
      <Table
        columns={[
          { key: "email", header: "Email" },
          { key: "fullName", header: "Name" },
          { key: "role", header: "Role" },
          {
            key: "isActive",
            header: "Status",
            render: (row) => (row.isActive ? "Active" : "Inactive"),
          },
        ]}
        data={users}
        emptyMessage="No system admins found."
      />
    </div>
  );
}

