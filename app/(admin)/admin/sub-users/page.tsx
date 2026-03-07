"use client";

import { useEffect, useState } from "react";
import { Table } from "@/components/admin/Table";
import { ErrorState } from "@/components/admin/ErrorState";
import { Loading } from "@/components/admin/Loading";
import { useAdminUser } from "@/components/admin/AdminGuard";
import { api } from "@/lib/api-client";

interface BusinessUserRow {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  isActive: boolean;
  createdAt: string;
  activeFrom?: string | null;
  activeUntil?: string | null;
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
      activeFrom?: string | null;
      activeUntil?: string | null;
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
  const adminUser = useAdminUser();
  const [users, setUsers] = useState<BusinessUserRow[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<BusinessUserRow | null>(null);
  const [formIsActive, setFormIsActive] = useState<boolean>(true);
  const [formActiveFrom, setFormActiveFrom] = useState<string>("");
  const [formActiveUntil, setFormActiveUntil] = useState<string>("");
  const [saving, setSaving] = useState(false);

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
            activeFrom: user.activeFrom,
            activeUntil: user.activeUntil,
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

  function openEditModal(row: BusinessUserRow) {
    if (adminUser.role !== "superadmin") {
      setActionError("Only the superadmin can perform this action.");
      return;
    }

    setActionError(null);
    setEditingUser(row);
    setFormIsActive(row.isActive);
    setFormActiveFrom(row.activeFrom ? row.activeFrom.slice(0, 16) : "");
    setFormActiveUntil(row.activeUntil ? row.activeUntil.slice(0, 16) : "");
  }

  async function handleSave() {
    if (!editingUser) return;

    setSaving(true);
    setActionError(null);

    try {
      let payload:
        | { isActive: boolean }
        | { isActive: boolean; activeFrom: string; activeUntil: string };

      if (!formIsActive) {
        // Simple deactivate – window is cleared by backend.
        payload = { isActive: false };
      } else {
        const hasFrom = Boolean(formActiveFrom);
        const hasUntil = Boolean(formActiveUntil);

        if (hasFrom !== hasUntil) {
          setActionError(
            "Provide both Active From and Active Until, or leave both empty.",
          );
          setSaving(false);
          return;
        }

        if (hasFrom && hasUntil) {
          const fromIso = new Date(formActiveFrom).toISOString();
          const untilIso = new Date(formActiveUntil).toISOString();
          payload = {
            isActive: true,
            activeFrom: fromIso,
            activeUntil: untilIso,
          };
        } else {
          payload = { isActive: true };
        }
      }

      await api.patch(
        `/api/admin/business-users/${editingUser.id}/status`,
        payload,
      );

      setUsers((prev) =>
        prev
          ? prev.map((u) =>
              u.id === editingUser.id
                ? {
                    ...u,
                    isActive: formIsActive,
                    activeFrom: formIsActive && formActiveFrom
                      ? new Date(formActiveFrom).toISOString()
                      : null,
                    activeUntil: formIsActive && formActiveUntil
                      ? new Date(formActiveUntil).toISOString()
                      : null,
                  }
                : u,
            )
          : prev,
      );

      setEditingUser(null);
    } catch (e: unknown) {
      const message =
        e instanceof Error
          ? e.message
          : "Failed to update business user status. Please try again.";
      setActionError(message);
    } finally {
      setSaving(false);
    }
  }

  function closeModal() {
    if (saving) return;
    setEditingUser(null);
  }

  if (loading) {
    return <Loading />;
  }

  if (error || !users) {
    return <ErrorState message={error ?? "No business users found."} />;
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-slate-50">Business Users</h1>
      {actionError && <ErrorState message={actionError} />}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-md rounded-xl bg-slate-950 p-5 shadow-2xl border border-slate-800">
            <h2 className="mb-3 text-lg font-semibold text-slate-50">
              Edit Activation Window
            </h2>
            <p className="mb-3 text-xs text-slate-400">
              {editingUser.fullName} ({editingUser.email})
            </p>
            <div className="mb-4 flex items-center gap-2 text-sm text-slate-200">
              <input
                id="active-toggle"
                type="checkbox"
                className="h-4 w-4 rounded border-slate-700 bg-slate-900"
                checked={formIsActive}
                onChange={(e) => setFormIsActive(e.target.checked)}
              />
              <label htmlFor="active-toggle">Account is active</label>
            </div>
            <div className="mb-3 grid grid-cols-1 gap-3 text-xs sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-slate-400">
                  Active From
                  <input
                    type="datetime-local"
                    value={formActiveFrom}
                    onChange={(e) => setFormActiveFrom(e.target.value)}
                    disabled={!formIsActive}
                    className="mt-1 w-full rounded-md bg-slate-900 px-2 py-1 text-xs text-slate-100 outline-none ring-1 ring-slate-700 focus:ring-2 focus:ring-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
                  />
                </label>
              </div>
              <div>
                <label className="mb-1 block text-slate-400">
                  Active Until
                  <input
                    type="datetime-local"
                    value={formActiveUntil}
                    onChange={(e) => setFormActiveUntil(e.target.value)}
                    disabled={!formIsActive}
                    className="mt-1 w-full rounded-md bg-slate-900 px-2 py-1 text-xs text-slate-100 outline-none ring-1 ring-slate-700 focus:ring-2 focus:ring-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
                  />
                </label>
              </div>
            </div>
            <p className="mb-4 text-[11px] text-slate-500">
              Leave both dates empty to make the account active without a time
              limit. If you set one date, you must set the other as well.
            </p>
            <div className="flex justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                className="rounded-md border border-slate-700 px-3 py-1 text-slate-200 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="rounded-md bg-emerald-500 px-3 py-1 font-medium text-slate-950 hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
      <Table
        columns={[
          { key: "email", header: "Email" },
          { key: "fullName", header: "Name" },
          { key: "phone", header: "Phone" },
          {
            key: "activeFrom",
            header: "Active From",
            render: (row) => row.activeFrom ?? "-",
          },
          {
            key: "activeUntil",
            header: "Active Until",
            render: (row) => row.activeUntil ?? "-",
          },
          {
            key: "isActive",
            header: "Status",
            render: (row) => (row.isActive ? "Active" : "Inactive"),
          },
          {
            key: "actions",
            header: "Actions",
            render: (row) => {
              const disabled = adminUser.role !== "superadmin";
              const title =
                adminUser.role !== "superadmin"
                  ? "Only superadmin can change status"
                  : "";

              return (
                <button
                  type="button"
                  title={title}
                  disabled={disabled}
                  onClick={() => openEditModal(row)}
                  className={`rounded-md px-2 py-1 text-[11px] font-medium ${
                    disabled
                      ? "cursor-not-allowed border border-slate-800 text-slate-500"
                      : "border border-slate-700 bg-slate-900 text-slate-100 hover:bg-slate-800"
                  }`}
                >
                  Edit
                </button>
              );
            },
          },
        ]}
        data={users}
        emptyMessage="No business users found."
      />
    </div>
  );
}

