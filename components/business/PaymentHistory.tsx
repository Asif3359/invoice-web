"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowPathIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loading } from "@/components/admin/Loading";
import { PaymentStatusBadge, StatusAlert } from "@/components/status";
import {
  fetchMyPayments,
  paymentErrorMessage,
  type PaymentRecord,
} from "@/lib/subscription-payments";

function formatDate(value?: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatAmount(amount: number, currency: string) {
  const value = Number(amount ?? 0).toLocaleString("en-BD");
  return currency === "BDT" ? `৳${value}` : `${currency} ${value}`;
}

export function PaymentHistory({
  showHeading = true,
}: {
  showHeading?: boolean;
}) {
  const [payments, setPayments] = useState<PaymentRecord[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      setPayments(await fetchMyPayments());
    } catch (err) {
      setError(paymentErrorMessage(err, "Could not load payment history."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <Card className="gap-0 py-0">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-4 sm:px-6">
        <CardTitle className={showHeading ? undefined : "sr-only"}>
          Payment history
        </CardTitle>
        <Button variant="outline" size="sm" onClick={load} disabled={loading}>
          <ArrowPathIcon className={loading ? "animate-spin" : undefined} />
          {loading ? "Refreshing…" : "Refresh"}
        </Button>
      </div>

      <CardContent className="space-y-4 px-4 py-4 sm:px-6 sm:py-5">
        {loading && !payments && <Loading />}

        {error && (
          <div className="space-y-3">
            <StatusAlert tone="failed">{error}</StatusAlert>
            <Button variant="outline" size="sm" onClick={load}>
              Try again
            </Button>
          </div>
        )}

        {!error && payments?.length === 0 && (
          <p className="py-4 text-sm text-muted-foreground">
            No payments yet. Your subscription payments will appear here.
          </p>
        )}

        {!error && payments && payments.length > 0 && (
          <>
            <ul className="space-y-3 sm:hidden">
              {payments.map((payment) => (
                <li
                  key={payment._id}
                  className="rounded-xl border border-border bg-card p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-card-foreground">
                        {payment.planSnapshot?.name ?? "—"}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {formatDate(payment.paidAt ?? payment.createdAt)}
                      </p>
                    </div>
                    <PaymentStatusBadge
                      status={payment.status}
                      className="shrink-0"
                    />
                  </div>
                  <dl className="mt-3 space-y-1.5 text-xs">
                    <div className="flex justify-between gap-4">
                      <dt className="text-muted-foreground">Amount</dt>
                      <dd className="font-medium">
                        {formatAmount(payment.amount, payment.currency)}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="shrink-0 text-muted-foreground">Period</dt>
                      <dd className="min-w-0 break-words text-right">
                        {payment.periodFrom && payment.periodTo
                          ? `${formatDate(payment.periodFrom)} – ${formatDate(
                              payment.periodTo,
                            )}`
                          : "—"}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="shrink-0 text-muted-foreground">
                        Transaction
                      </dt>
                      <dd className="min-w-0 break-all text-right font-mono text-[11px] text-muted-foreground">
                        {payment.tranId}
                      </dd>
                    </div>
                  </dl>
                </li>
              ))}
            </ul>

            <div className="hidden overflow-x-auto sm:block">
              <Table className="min-w-[46rem]">
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Transaction</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((payment) => (
                    <TableRow key={payment._id}>
                      <TableCell className="text-xs">
                        {formatDate(payment.paidAt ?? payment.createdAt)}
                      </TableCell>
                      <TableCell className="text-xs font-medium">
                        {payment.planSnapshot?.name ?? "—"}
                      </TableCell>
                      <TableCell className="text-xs font-medium">
                        {formatAmount(payment.amount, payment.currency)}
                      </TableCell>
                      <TableCell>
                        <PaymentStatusBadge status={payment.status} />
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                        {payment.periodFrom && payment.periodTo
                          ? `${formatDate(payment.periodFrom)} – ${formatDate(
                              payment.periodTo,
                            )}`
                          : "—"}
                      </TableCell>
                      <TableCell className="font-mono text-[11px] text-muted-foreground">
                        {payment.tranId}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
