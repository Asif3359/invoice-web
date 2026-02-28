"use client";

import { useEffect, useState } from "react";
import { Table } from "@/components/admin/Table";
import { ErrorState } from "@/components/admin/ErrorState";
import { Loading } from "@/components/admin/Loading";
import { api } from "@/lib/api-client";

interface BusinessUserRow {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  isActive: boolean;
  createdAt: string;
}

type BusinessUsersResponse = {
  success: boolean;
  data?: {
    users: {
      _id: string;
      email: string;
      fullName: string;
      phone?: string;
      emailVerified: boolean;
      isActive: boolean;
      createdAt: string;
    }[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      pages: number;
    };
  };
};

export default function BusinessUsersPage() {
  const [users, setUsers] = useState<BusinessUserRow[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get<BusinessUsersResponse>(
          "/api/admin/business-users",
          {
            params: { page: 1, limit: 20 },
          },
        );
        const rawUsers = res.data.data?.users ?? [];
        setUsers(
          rawUsers.map((user) => ({
            id: user._id,
            email: user.email,
            fullName: user.fullName,
            phone: user.phone,
            isActive: user.isActive,
            createdAt: user.createdAt,
          })),
        );
      } catch {
        setError("Unable to load business users from /api/admin/business-users.");
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
    return <ErrorState message={error ?? "No business users found."} />;
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-slate-50">Business Users</h1>
      <Table
        columns={[
          { key: "email", header: "Email" },
          { key: "fullName", header: "Name" },
          { key: "phone", header: "Phone" },
          {
            key: "isActive",
            header: "Status",
            render: (row) => (row.isActive ? "Active" : "Inactive"),
          },
        ]}
        data={users}
        emptyMessage="No business users found."
      />
    </div>
  );
}

