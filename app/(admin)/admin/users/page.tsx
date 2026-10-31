"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import axios from "axios";
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

type ApiErrorData = {
  message?: string;
  errors?: { msg?: string }[];
};

const roleOptions: AdminRole[] = ["superadmin", "admin", "manager"];

const inputClassName =
  "mt-1 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/25";

export default function SystemUsersPage() {
  const [users, setUsers] = useState<SystemAdminRow[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [formFullName, setFormFullName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [formConfirm, setFormConfirm] = useState("");
  const [formRole, setFormRole] = useState<AdminRole>("superadmin");
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await api.get<SystemAdminsResponse>("/admin/system-admins");
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
      setError("Unable to load system admins from /admin/system-admins.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function openCreate() {
    setFormFullName("");
    setFormEmail("");
    setFormPassword("");
    setFormConfirm("");
    setFormRole("superadmin");
    setFormError(null);
    setNotice(null);
    setShowCreate(true);
  }

  function closeCreate() {
    if (creating) return;
    setShowCreate(false);
  }

  async function handleCreate(event: FormEvent) {
    event.preventDefault();
    setFormError(null);

    if (formPassword !== formConfirm) {
      setFormError("Password and confirmation do not match.");
      return;
    }

    setCreating(true);

    try {
      await api.post("/admin/system-admins", {
        fullName: formFullName,
        email: formEmail,
        password: formPassword,
        role: formRole,
      });
      setShowCreate(false);
      setNotice(
        `System admin ${formEmail} created successfully. They can sign in at the normal login page.`,
      );
      await load();
    } catch (err) {
      const data = axios.isAxiosError(err)
        ? (err.response?.data as ApiErrorData | undefined)
        : undefined;
      const detail = data?.errors?.[0]?.msg;
      setFormError(
        detail ?? data?.message ?? "Could not create the system admin.",
      );
    } finally {
      setCreating(false);
    }
  }

  if (loading && !users) {
    return <Loading />;
  }

  if (error || !users) {
    return <ErrorState message={error ?? "No system admins found."} />;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-50">
            System Admins
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Create additional superadmins or limited admin accounts.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="rounded-md bg-emerald-500 px-3 py-2 text-sm font-medium text-slate-950 transition hover:bg-emerald-400"
        >
          Add system admin
        </button>
      </div>

      {notice && (
        <p
          role="status"
          className="rounded-md border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200"
        >
          {notice}
        </p>
      )}

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-md rounded-xl border border-slate-800 bg-slate-950 p-5 shadow-2xl">
            <h2 className="text-lg font-semibold text-slate-50">
              Add system admin
            </h2>
            <p className="mt-1 text-xs text-slate-400">
              The new account signs in with the normal login page and completes
              an email one-time code.
            </p>

            {formError && (
              <p
                role="alert"
                className="mt-3 rounded-md border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-sm text-rose-200"
              >
                {formError}
              </p>
            )}

            <form onSubmit={handleCreate} className="mt-4 space-y-3">
              <label className="block text-sm text-slate-300">
                Full name
                <input
                  type="text"
                  value={formFullName}
                  onChange={(event) => setFormFullName(event.target.value)}
                  minLength={2}
                  required
                  className={inputClassName}
                />
              </label>
              <label className="block text-sm text-slate-300">
                Email
                <input
                  type="email"
                  autoComplete="email"
                  value={formEmail}
                  onChange={(event) => setFormEmail(event.target.value)}
                  required
                  className={inputClassName}
                />
              </label>
              <label className="block text-sm text-slate-300">
                Password
                <input
                  type="password"
                  autoComplete="new-password"
                  value={formPassword}
                  onChange={(event) => setFormPassword(event.target.value)}
                  minLength={8}
                  required
                  className={inputClassName}
                />
              </label>
              <label className="block text-sm text-slate-300">
                Confirm password
                <input
                  type="password"
                  autoComplete="new-password"
                  value={formConfirm}
                  onChange={(event) => setFormConfirm(event.target.value)}
                  minLength={8}
                  required
                  className={inputClassName}
                />
              </label>
              <label className="block text-sm text-slate-300">
                Role
                <select
                  value={formRole}
                  onChange={(event) =>
                    setFormRole(event.target.value as AdminRole)
                  }
                  className={inputClassName}
                >
                  {roleOptions.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </label>
              <p className="text-xs text-slate-500">
                At least 8 characters with an uppercase letter, a lowercase
                letter and a number.
              </p>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeCreate}
                  disabled={creating}
                  className="rounded-md border border-slate-700 px-3 py-2 text-sm text-slate-200 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="rounded-md bg-emerald-500 px-3 py-2 text-sm font-medium text-slate-950 hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {creating ? "Creating..." : "Create admin"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
