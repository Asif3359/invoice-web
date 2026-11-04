"use client";

import { useEffect, useState } from "react";
import { DataTable } from "@/components/DataTable";
import { ErrorState } from "@/components/admin/ErrorState";
import { Loading } from "@/components/admin/Loading";
import { useAdminUser } from "@/components/admin/AdminGuard";
import {
  PaymentStatusBadge,
  StatusAlert,
  SubscriptionStatusBadge,
} from "@/components/status";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api-client";
import type { PaymentStatus } from "@/lib/subscription-payments";
import { toast } from "sonner";

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

interface AdminPayment {
  _id: string;
  tranId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  planSnapshot?: { name?: string; durationDays?: number };
  paidAt?: string | null;
  periodFrom?: string | null;
  periodTo?: string | null;
  createdAt: string;
}

type BusinessPaymentsResponse = {
  success: boolean;
  data?: {
    payments: AdminPayment[];
  };
};

type PaymentRow = AdminPayment & { id: string };

function formatPaymentDate(value?: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatPaymentAmount(amount: number, currency: string) {
  const value = Number(amount ?? 0).toLocaleString("en-BD");
  return currency === "BDT" ? `৳${value}` : `${currency} ${value}`;
}

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
  const [paymentUser, setPaymentUser] = useState<BusinessUserRow | null>(null);
  const [payments, setPayments] = useState<PaymentRow[] | null>(null);
  const [paymentsLoading, setPaymentsLoading] = useState(false);
  const [paymentsError, setPaymentsError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get<BusinessUsersResponse>(
          "/admin/business-users",
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
        setError("Unable to load business users from /admin/business-users.");
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
        `/admin/business-users/${editingUser.id}/status`,
        payload,
      );

      setUsers((prev) =>
        prev
          ? prev.map((u) =>
              u.id === editingUser.id
                ? {
                    ...u,
                    isActive: formIsActive,
                    activeFrom:
                      formIsActive && formActiveFrom
                        ? new Date(formActiveFrom).toISOString()
                        : null,
                    activeUntil:
                      formIsActive && formActiveUntil
                        ? new Date(formActiveUntil).toISOString()
                        : null,
                  }
                : u,
            )
          : prev,
      );

      setEditingUser(null);
      toast.success("Activation updated");
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

  async function openPayments(row: BusinessUserRow) {
    setPaymentUser(row);
    setPayments(null);
    setPaymentsError(null);
    setPaymentsLoading(true);

    try {
      const res = await api.get<BusinessPaymentsResponse>(
        `/admin/business-users/${row.id}/payments`,
      );
      setPayments(
        (res.data.data?.payments ?? []).map((payment) => ({
          ...payment,
          id: payment._id,
        })),
      );
    } catch {
      setPaymentsError(
        "Unable to load this user's payment history. Please try again.",
      );
    } finally {
      setPaymentsLoading(false);
    }
  }

  function closePayments() {
    setPaymentUser(null);
    setPayments(null);
    setPaymentsError(null);
  }

  if (loading) {
    return <Loading />;
  }

  if (error || !users) {
    return <ErrorState message={error ?? "No business users found."} />;
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-foreground">Business Users</h1>
      {actionError && (
        <StatusAlert tone="failed">{actionError}</StatusAlert>
      )}

      <Dialog
        open={Boolean(editingUser)}
        onOpenChange={(open) => !open && closeModal()}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Activation Window</DialogTitle>
            <DialogDescription>
              {editingUser?.fullName} ({editingUser?.email})
            </DialogDescription>
          </DialogHeader>

          <label className="flex items-center gap-2 text-sm text-foreground">
            <input
              type="checkbox"
              className="size-4 shrink-0 accent-primary"
              checked={formIsActive}
              onChange={(e) => setFormIsActive(e.target.checked)}
            />
            Account is active
          </label>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label
                htmlFor="active-from"
                className="text-xs text-muted-foreground"
              >
                Active From
              </label>
              <Input
                id="active-from"
                type="datetime-local"
                value={formActiveFrom}
                onChange={(e) => setFormActiveFrom(e.target.value)}
                disabled={!formIsActive}
              />
            </div>
            <div className="space-y-1.5">
              <label
                htmlFor="active-until"
                className="text-xs text-muted-foreground"
              >
                Active Until
              </label>
              <Input
                id="active-until"
                type="datetime-local"
                value={formActiveUntil}
                onChange={(e) => setFormActiveUntil(e.target.value)}
                disabled={!formIsActive}
              />
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            Leave both dates empty to make the account active without a time
            limit. If you set one date, you must set the other as well.
          </p>

          <DialogFooter>
            <Button variant="outline" onClick={closeModal} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(paymentUser)}
        onOpenChange={(open) => !open && closePayments()}
      >
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Payment history</DialogTitle>
            <DialogDescription>
              {paymentUser?.fullName} ({paymentUser?.email})
            </DialogDescription>
          </DialogHeader>

          {paymentsLoading && (
            <div className="space-y-2">
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-9 w-full" />
            </div>
          )}

          {paymentsError && (
            <StatusAlert tone="failed">{paymentsError}</StatusAlert>
          )}

          {!paymentsLoading && !paymentsError && payments && (
            <DataTable
              columns={[
                {
                  key: "date",
                  header: "Date",
                  render: (row) =>
                    formatPaymentDate(row.paidAt ?? row.createdAt),
                },
                {
                  key: "plan",
                  header: "Plan",
                  render: (row) => row.planSnapshot?.name ?? "—",
                },
                {
                  key: "amount",
                  header: "Amount",
                  render: (row) =>
                    formatPaymentAmount(row.amount, row.currency),
                },
                {
                  key: "status",
                  header: "Status",
                  render: (row) => <PaymentStatusBadge status={row.status} />,
                },
                {
                  key: "period",
                  header: "Period",
                  hideOnMobile: true,
                  render: (row) =>
                    row.periodFrom && row.periodTo
                      ? `${formatPaymentDate(row.periodFrom)} – ${formatPaymentDate(row.periodTo)}`
                      : "—",
                },
                {
                  key: "tranId",
                  header: "Transaction",
                  hideOnMobile: true,
                  render: (row) => (
                    <span className="font-mono text-xs">{row.tranId}</span>
                  ),
                },
              ]}
              data={payments}
              emptyMessage="This user has no subscription payments yet."
            />
          )}
        </DialogContent>
      </Dialog>

      <DataTable
        columns={[
          { key: "email", header: "Email" },
          { key: "fullName", header: "Name", hideOnMobile: true },
          { key: "phone", header: "Phone", hideOnMobile: true },
          {
            key: "activeFrom",
            header: "Active From",
            hideOnMobile: true,
            render: (row) => formatPaymentDate(row.activeFrom),
          },
          {
            key: "activeUntil",
            header: "Active Until",
            hideOnMobile: true,
            render: (row) => formatPaymentDate(row.activeUntil),
          },
          {
            key: "isActive",
            header: "Status",
            render: (row) => (
              <SubscriptionStatusBadge
                status={row.isActive ? "active" : "inactive"}
                title={
                  row.isActive
                    ? undefined
                    : "Account deactivated by admin"
                }
              />
            ),
          },
          {
            key: "actions",
            header: "Actions",
            render: (row) => {
              const disabled = adminUser.role !== "superadmin";

              return (
                <div className="flex shrink-0 gap-1">
                  <Button
                    variant="outline"
                    size="xs"
                    onClick={() => openPayments(row)}
                  >
                    Payments
                  </Button>
                  <Button
                    variant="outline"
                    size="xs"
                    title={
                      disabled ? "Only superadmin can change status" : undefined
                    }
                    disabled={disabled}
                    onClick={() => openEditModal(row)}
                  >
                    Edit
                  </Button>
                </div>
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
