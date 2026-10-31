"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowPathIcon } from "@heroicons/react/24/outline";
import {
  fetchMyPayments,
  paymentErrorMessage,
  type PaymentRecord,
  type PaymentStatus,
} from "@/lib/subscription-payments";

const statusStyles: Record<PaymentStatus, string> = {
  pending: "bg-amber-500/10 text-amber-300",
  paid: "bg-emerald-500/10 text-emerald-300",
  failed: "bg-rose-500/10 text-rose-300",
  cancelled: "bg-slate-700/40 text-slate-300",
  review: "bg-sky-500/10 text-sky-300",
};

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

export function PaymentHistory({ showHeading = true }: { showHeading?: boolean }) {
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
    <section className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {showHeading ? (
          <h2 className="text-lg font-semibold text-slate-100">
            Payment history
          </h2>
        ) : (
          <span />
        )}
        <button
          type="button"
          onClick={load}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-md border border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-200 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <ArrowPathIcon
            className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
          />
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {loading && !payments && (
        <p className="mt-4 text-sm text-slate-400">
          Loading payment history...
        </p>
      )}

      {error && (
        <div className="mt-4 text-sm">
          <p className="text-rose-300">{error}</p>
          <button
            type="button"
            onClick={load}
            className="mt-3 rounded-md border border-slate-700 px-3 py-2 text-xs font-medium text-slate-200 hover:bg-slate-800"
          >
            Try again
          </button>
        </div>
      )}

      {!error && payments && payments.length === 0 && (
        <p className="mt-4 text-sm text-slate-400">
          No payments yet. Your subscription payments will appear here.
        </p>
      )}

      {!error && payments && payments.length > 0 && (
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-800 text-sm">
            <thead>
              <tr>
                {[
                  "Date",
                  "Plan",
                  "Amount",
                  "Status",
                  "Period",
                  "Transaction",
                ].map((header) => (
                  <th
                    key={header}
                    className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wide text-slate-500"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {payments.map((payment) => (
                <tr key={payment._id}>
                  <td className="whitespace-nowrap px-3 py-3 text-xs text-slate-200">
                    {formatDate(payment.paidAt ?? payment.createdAt)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 text-xs text-slate-100">
                    {payment.planSnapshot?.name ?? "—"}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 text-xs font-medium text-slate-50">
                    {formatAmount(payment.amount, payment.currency)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-medium capitalize ${
                        statusStyles[payment.status] ??
                        "bg-slate-800 text-slate-300"
                      }`}
                    >
                      {payment.status}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 text-xs text-slate-400">
                    {payment.periodFrom && payment.periodTo
                      ? `${formatDate(payment.periodFrom)} – ${formatDate(
                          payment.periodTo,
                        )}`
                      : "—"}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    <span className="font-mono text-[11px] text-slate-400">
                      {payment.tranId}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
