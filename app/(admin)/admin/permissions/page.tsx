"use client";

import { useEffect, useState } from "react";
import { ErrorState } from "@/components/admin/ErrorState";
import { Loading } from "@/components/admin/Loading";
import { Table } from "@/components/admin/Table";
import { api } from "@/lib/api-client";

interface PermissionRow {
  id: string;
  email: string;
  fullName: string;
  role: string;
  isActive: boolean;
  ownerEmail: string;
}

type PermissionsResponse = {
  success: boolean;
  data?: {
    subUsers: {
      _id: string;
      email: string;
      fullName: string;
      role: string;
      isActive: boolean;
      permissions: Record<string, Record<string, boolean>>;
      parentUserId: {
        _id: string;
        email: string;
        fullName: string;
      };
    }[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      pages: number;
    };
  };
};

export default function PermissionsPage() {
  const [rows, setRows] = useState<PermissionRow[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get<PermissionsResponse>(
          "/api/admin/permissions",
          {
            params: { page: 1, limit: 20 },
          },
        );
        const subUsers = res.data.data?.subUsers ?? [];
        setRows(
          subUsers.map((su) => ({
            id: su._id,
            email: su.email,
            fullName: su.fullName,
            role: su.role,
            isActive: su.isActive,
            ownerEmail: su.parentUserId.email,
          })),
        );
      } catch {
        setError(
          "Unable to load sub-user permissions from /api/admin/permissions.",
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

  if (error || !rows) {
    return <ErrorState message={error ?? "No sub-user permissions found."} />;
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-slate-50">
        Sub-user Permissions
      </h1>
      <Table
        columns={[
          { key: "email", header: "Sub-user Email" },
          { key: "fullName", header: "Name" },
          { key: "role", header: "Role" },
          { key: "ownerEmail", header: "Business Owner" },
          {
            key: "isActive",
            header: "Status",
            render: (row) => (row.isActive ? "Active" : "Inactive"),
          },
        ]}
        data={rows}
        emptyMessage="No sub-user permissions found."
      />
    </div>
  );
}

