"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowPathIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { useBusinessUser } from "@/components/business/BusinessGuard";
import type { SubscriptionStatus } from "@/lib/business-auth";
import {
  clearPendingPayment,
  createCheckout,
  fetchPaymentStatus,
  fetchPlans,
  paymentErrorMessage,
  readPendingPayment,
  savePendingPayment,
  type PaymentStatus,
  type Plan,
} from "@/lib/subscription-payments";

const TERMINAL_STATUSES: PaymentStatus[] = [
  "paid",
  "failed",
  "cancelled",
  "review",
];

const statusStyles: Record<SubscriptionStatus, string> = {
  active: "bg-emerald-500/10 text-emerald-400",
  expired: "bg-amber-500/10 text-amber-400",
  not_started: "bg-sky-500/10 text-sky-400",
  inactive: "bg-rose-500/10 text-rose-400",
};

type NoticeTone = "success" | "error" | "info";

interface Notice {
  tone: NoticeTone;
  text: string;
}

const noticeStyles: Record<NoticeTone, string> = {
  success: "text-emerald-300",
  error: "text-rose-300",
  info: "text-slate-300",
};

function formatDate(value?: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatStatus(status?: SubscriptionStatus) {
  if (!status) return "Unknown";
  return status.replace("_", " ");
}

function formatAmount(amount: number, currency: string) {
  const value = amount.toLocaleString("en-BD");
  return currency === "BDT" ? `৳${value}` : `${currency} ${value}`;
}

function paymentStatusMessage(status: PaymentStatus) {
  switch (status) {
    case "paid":
      return "Payment confirmed. Your subscription is active.";
    case "review":
      return "Your payment needs a quick manual review. Please contact support with your transaction ID.";
    case "cancelled":
      return "Payment cancelled. No money was charged.";
    case "failed":
      return "Payment failed. No subscription days were added — please try again.";
    default:
      return "We have not received confirmation for this payment yet. If you completed it, press \"Check activation status\" in a minute — confirmation can take a few minutes.";
  }
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function waitForPayment(tranId: string, popup: Window | null) {
  const timeoutAt = Date.now() + 5 * 60 * 1000;
  let last: PaymentStatus = "pending";
  let checksAfterClose = 0;

  while (Date.now() < timeoutAt) {
    await sleep(3000);

    try {
      const result = await fetchPaymentStatus(tranId);
      last = result.status;

      if (TERMINAL_STATUSES.includes(last)) {
        try {
          popup?.close();
        } catch {
          // The tab may already be closed; nothing to do.
        }
        return last;
      }
    } catch {
      // Temporary network problem: keep waiting until the timeout.
    }

    // The user closed the payment tab. Give the gateway a few more polls to
    // settle, then stop so the button is not locked for the full timeout.
    if (popup?.closed) {
      checksAfterClose += 1;
      if (checksAfterClose >= 3) return last;
    }
  }

  return last;
}

export default function BusinessSubscriptionPage() {
  const { subscription, refreshSubscription } = useBusinessUser();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [plansLoading, setPlansLoading] = useState(true);
  const [plansError, setPlansError] = useState<string | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [paying, setPaying] = useState(false);
  const [checking, setChecking] = useState(false);
  const [pendingTranId, setPendingTranId] = useState<string | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);
  const resumeAttempted = useRef(false);

  const status = subscription?.status;
  const isExpired = status === "expired";
  const endsSoon =
    status === "active" &&
    !subscription?.isTrial &&
    (subscription?.daysLeft ?? 99) <= 7;
  const selectedPlan =
    plans.find((plan) => plan.id === selectedPlanId) ?? null;

  useEffect(() => {
    let cancelled = false;

    async function loadPlans() {
      try {
        const { plans: loaded } = await fetchPlans();
        if (cancelled) return;
        setPlans(loaded);
        setSelectedPlanId((current) => current ?? loaded[0]?.id ?? null);
      } catch (error) {
        if (!cancelled) {
          setPlansError(
            paymentErrorMessage(
              error,
              "Could not load plans. Please try again.",
            ),
          );
        }
      } finally {
        if (!cancelled) setPlansLoading(false);
      }
    }

    loadPlans();

    return () => {
      cancelled = true;
    };
  }, []);

  // A payment may have been started before a reload or with the gateway tab
  // closed. Ask the server for the real status (it validates with EPS).
  useEffect(() => {
    if (resumeAttempted.current) return;
    resumeAttempted.current = true;

    const pending = readPendingPayment();
    if (!pending) return;

    const { tranId } = pending;
    setPendingTranId(tranId);

    async function resume() {
      try {
        const result = await fetchPaymentStatus(tranId);
        if (result.status === "paid") {
          await refreshSubscription();
          clearPendingPayment();
          setPendingTranId(null);
          setNotice({
            tone: "success",
            text: `Payment confirmed. Your subscription is active until ${formatDate(result.periodTo)}.`,
          });
        } else if (result.status !== "pending") {
          clearPendingPayment();
          setPendingTranId(null);
          setNotice({
            tone: result.status === "review" ? "info" : "error",
            text: paymentStatusMessage(result.status),
          });
        }
      } catch {
        // Offline or temporary error: keep the pending record for later.
      }
    }

    resume();
  }, [refreshSubscription]);

  async function payOnline() {
    if (!selectedPlan || paying) return;

    setPaying(true);
    setNotice(null);

    try {
      const checkout = await createCheckout(selectedPlan.id);
      savePendingPayment(checkout.tranId);
      setPendingTranId(checkout.tranId);

      const popup = window.open(
        checkout.paymentUrl,
        "eps_payment",
        "width=520,height=760",
      );

      if (!popup) {
        setNotice({
          tone: "error",
          text: "Your browser blocked the payment window. Allow pop-ups for this site, then press Pay again.",
        });
        return;
      }

      const result = await waitForPayment(checkout.tranId, popup);

      if (result === "paid") {
        await refreshSubscription();
        clearPendingPayment();
        setPendingTranId(null);
        setNotice({
          tone: "success",
          text: "Payment confirmed. Your subscription has been extended.",
        });
      } else if (result !== "pending") {
        clearPendingPayment();
        setPendingTranId(null);
        setNotice({
          tone: result === "review" ? "info" : "error",
          text: paymentStatusMessage(result),
        });
      } else {
        setNotice({
          tone: "info",
          text: paymentStatusMessage("pending"),
        });
      }
    } catch (error) {
      setNotice({
        tone: "error",
        text: paymentErrorMessage(
          error,
          "Could not start the payment. Please try again.",
        ),
      });
    } finally {
      setPaying(false);
    }
  }

  async function checkActivation() {
    setChecking(true);
    setNotice(null);

    try {
      if (pendingTranId) {
        const result = await fetchPaymentStatus(pendingTranId);

        if (result.status === "paid") {
          await refreshSubscription();
          clearPendingPayment();
          setPendingTranId(null);
          setNotice({
            tone: "success",
            text: `Payment confirmed. Your subscription is active until ${formatDate(result.periodTo)}.`,
          });
        } else {
          setNotice({
            tone: result.status === "review" ? "info" : "error",
            text: paymentStatusMessage(result.status),
          });
        }
        return;
      }

      const next = await refreshSubscription();
      if (next?.status === "active") {
        setNotice({
          tone: "success",
          text: `Your subscription is active until ${formatDate(next.activeUntil)}.`,
        });
      } else {
        setNotice({
          tone: "info",
          text: "We could not find an active subscription yet. If you have already paid, contact support with your transaction ID.",
        });
      }
    } catch (error) {
      setNotice({
        tone: "error",
        text: paymentErrorMessage(
          error,
          "Could not check your subscription right now. Please try again.",
        ),
      });
    } finally {
      setChecking(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-50">Subscription</h1>
        <p className="mt-1 text-sm text-slate-400">
          Your current plan, renewal date, and payment options.
        </p>
      </div>

      {(isExpired || endsSoon) && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-200">
          <ExclamationTriangleIcon className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />
          <p>
            {isExpired
              ? "Your subscription has expired. Pay below to keep creating invoices, recording payments, and syncing data."
              : `Your subscription ends on ${formatDate(subscription?.activeUntil)} (${subscription?.daysLeft} day(s) left). Pay now to avoid interruption.`}
          </p>
        </div>
      )}

      {notice && (
        <p role="status" className={`text-sm ${noticeStyles[notice.tone]}`}>
          {notice.text}
        </p>
      )}

      <section className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-slate-100">
            Current plan
          </h2>
          <div className="flex items-center gap-2">
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${
                status ? statusStyles[status] : "bg-slate-800 text-slate-300"
              }`}
            >
              {formatStatus(status)}
            </span>
            {subscription?.isTrial && (
              <span className="rounded-full bg-sky-500/10 px-2 py-0.5 text-xs text-sky-400">
                Trial
              </span>
            )}
          </div>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Plan
            </div>
            <div className="mt-1 text-sm text-slate-100">Premium</div>
          </div>
          <div>
            <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Period starts
            </div>
            <div className="mt-1 text-sm text-slate-100">
              {formatDate(subscription?.activeFrom)}
            </div>
          </div>
          <div>
            <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Period ends
            </div>
            <div className="mt-1 text-sm text-slate-100">
              {formatDate(subscription?.activeUntil)}
            </div>
          </div>
          <div>
            <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Days left
            </div>
            <div className="mt-1 text-sm text-slate-100">
              {status === "active"
                ? (subscription?.daysLeft ?? 0)
                : "—"}
            </div>
          </div>
        </div>

        <div className="mt-5 border-t border-slate-800 pt-4">
          <button
            type="button"
            onClick={checkActivation}
            disabled={checking}
            className="inline-flex items-center gap-2 rounded-md border border-slate-700 px-3 py-2 text-sm font-medium text-slate-200 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <ArrowPathIcon
              className={`h-4 w-4 ${checking ? "animate-spin" : ""}`}
            />
            {checking ? "Checking..." : "Check activation status"}
          </button>
          {pendingTranId && (
            <p className="mt-2 text-xs text-slate-500">
              Pending payment: {pendingTranId}
            </p>
          )}
        </div>
      </section>

      <section className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
        <h2 className="text-lg font-semibold text-slate-100">
          Choose a plan
        </h2>
        <p className="mt-1 text-sm text-slate-400">
          Pay securely with bKash, Nagad, card, or bank through EPS. If
          you pay before your current period ends, the new days are added after
          your current end date.
        </p>

        {plansLoading && (
          <p className="mt-4 text-sm text-slate-400">Loading plans...</p>
        )}

        {!plansLoading && plansError && (
          <div className="mt-4">
            <p className="text-sm text-rose-300">{plansError}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-3 rounded-md border border-slate-700 px-3 py-2 text-sm font-medium text-slate-200 hover:bg-slate-800"
            >
              Try again
            </button>
          </div>
        )}

        {!plansLoading && !plansError && plans.length === 0 && (
          <p className="mt-4 text-sm text-slate-400">
            No plans are available right now. Please try again later or contact
            support.
          </p>
        )}

        <div className="mt-4 space-y-3">
          {plans.map((plan) => {
            const active = plan.id === selectedPlanId;
            return (
              <label
                key={plan.id}
                className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition ${
                  active
                    ? "border-emerald-500 bg-emerald-500/5"
                    : "border-slate-800 bg-slate-950/40 hover:border-slate-700"
                }`}
              >
                <input
                  type="radio"
                  name="plan"
                  value={plan.id}
                  checked={active}
                  onChange={() => setSelectedPlanId(plan.id)}
                  className="sr-only"
                />
                <span
                  className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                    active ? "border-emerald-400" : "border-slate-600"
                  }`}
                  aria-hidden="true"
                >
                  {active && (
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  )}
                </span>
                <span className="flex-1">
                  <span className="block text-sm font-semibold text-slate-100">
                    {plan.name}
                  </span>
                  <span className="mt-0.5 block text-xs text-slate-400">
                    {plan.durationDays} days
                    {plan.description ? ` · ${plan.description}` : ""}
                  </span>
                </span>
                <span className="text-right">
                  <span className="block text-base font-bold text-slate-50">
                    {formatAmount(plan.amount, plan.currency)}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    {plan.currency}
                  </span>
                </span>
              </label>
            );
          })}
        </div>

        {selectedPlan && (
          <button
            type="button"
            onClick={payOnline}
            disabled={paying}
            className="mt-5 w-full rounded-md bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {paying
              ? "Waiting for payment confirmation..."
              : `Pay ${formatAmount(selectedPlan.amount, selectedPlan.currency)} online`}
          </button>
        )}

        <p className="mt-3 text-xs leading-5 text-slate-500">
          The secure EPS page opens in a new tab. Keep this tab open —
          we confirm the payment with our server automatically. If the tab
          closes early, press &quot;Check activation status&quot; above after
          paying.
        </p>
      </section>

    </div>
  );
}
