"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import axios from "axios";
import { DataTable } from "@/components/DataTable";
import { ErrorState } from "@/components/admin/ErrorState";
import { Loading } from "@/components/admin/Loading";
import { StatusAlert, SubscriptionStatusBadge } from "@/components/status";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input, nativeControlClass } from "@/components/ui/input";
import { api } from "@/lib/api-client";
import type { AdminRole } from "@/lib/auth";
import { toast } from "sonner";

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

export default function SystemUsersPage() {
  const [users, setUsers] = useState<SystemAdminRow[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
    setShowCreate(true);
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
      toast.success(
        `System admin ${formEmail} created. They can sign in at the normal login page.`,
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
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold text-foreground">
            System Admins
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Create additional superadmins or limited admin accounts.
          </p>
        </div>
        <Button onClick={openCreate}>Add system admin</Button>
      </div>

      <Dialog
        open={showCreate}
        onOpenChange={(open) => !open && !creating && setShowCreate(false)}
      >
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add system admin</DialogTitle>
            <DialogDescription>
              The new account signs in with the normal login page and completes
              an email one-time code.
            </DialogDescription>
          </DialogHeader>

          {formError && <StatusAlert tone="failed">{formError}</StatusAlert>}

          <form onSubmit={handleCreate} className="space-y-3">
            <div className="space-y-1.5">
              <label htmlFor="admin-full-name" className="text-sm text-foreground">
                Full name
              </label>
              <Input
                id="admin-full-name"
                type="text"
                value={formFullName}
                onChange={(event) => setFormFullName(event.target.value)}
                minLength={2}
                required
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="admin-email" className="text-sm text-foreground">
                Email
              </label>
              <Input
                id="admin-email"
                type="email"
                autoComplete="email"
                value={formEmail}
                onChange={(event) => setFormEmail(event.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="admin-password" className="text-sm text-foreground">
                Password
              </label>
              <Input
                id="admin-password"
                type="password"
                autoComplete="new-password"
                value={formPassword}
                onChange={(event) => setFormPassword(event.target.value)}
                minLength={8}
                required
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="admin-confirm" className="text-sm text-foreground">
                Confirm password
              </label>
              <Input
                id="admin-confirm"
                type="password"
                autoComplete="new-password"
                value={formConfirm}
                onChange={(event) => setFormConfirm(event.target.value)}
                minLength={8}
                required
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="admin-role" className="text-sm text-foreground">
                Role
              </label>
              <select
                id="admin-role"
                value={formRole}
                onChange={(event) =>
                  setFormRole(event.target.value as AdminRole)
                }
                className={nativeControlClass}
              >
                {roleOptions.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </div>
            <p className="text-xs text-muted-foreground">
              At least 8 characters with an uppercase letter, a lowercase letter
              and a number.
            </p>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCreate(false)}
                disabled={creating}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={creating}>
                {creating ? "Creating..." : "Create admin"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <DataTable
        columns={[
          { key: "email", header: "Email" },
          { key: "fullName", header: "Name", hideOnMobile: true },
          { key: "role", header: "Role" },
          {
            key: "isActive",
            header: "Status",
            render: (row) => (
              <SubscriptionStatusBadge
                status={row.isActive ? "active" : "inactive"}
              />
            ),
          },
        ]}
        data={users}
        emptyMessage="No system admins found."
      />
    </div>
  );
}
