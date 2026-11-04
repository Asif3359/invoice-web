"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowPathIcon } from "@heroicons/react/24/outline";
import { useBusinessUser } from "@/components/business/BusinessGuard";
import {
  StatusAlert,
  SubscriptionStatusBadge,
  TrialBadge,
} from "@/components/status";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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

type NoticeTone = "success" | "error" | "info";

interface Notice {
  tone: NoticeTone;
  text: string;
}

function formatDate(value?: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
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

/**
 * The gateway tab normally ends on a payment result page, which closes itself.
 * Close it here only when it is still parked on the bank (or our own older
 * screens), so no window is left hanging.
 */
function closeUnlessResultPage(popup: Window | null) {
  if (!popup || popup.closed) return;

  try {
    if (popup.location.pathname.startsWith("/business/payment/")) return;
  } catch {
    // Still on the gateway origin: the path cannot be read.
  }

  try {
    popup.close();
  } catch {
    // The tab may already be closed; nothing to do.
  }
}

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
        closeUnlessResultPage(popup);
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
        <h1 className="text-2xl font-semibold text-foreground">Subscription</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Your current plan, renewal date, and payment options.
        </p>
      </div>

      {(isExpired || endsSoon) && (
        <StatusAlert tone="failed">
          {isExpired
            ? "Your subscription has expired. Pay below to keep creating invoices, recording payments, and syncing data."
            : `Your subscription ends on ${formatDate(subscription?.activeUntil)} (${subscription?.daysLeft} day(s) left). Pay now to avoid interruption.`}
        </StatusAlert>
      )}

      {notice && (
        <StatusAlert tone={notice.tone === "error" ? "failed" : notice.tone}>
          {notice.text}
        </StatusAlert>
      )}

      <Card className="gap-4 py-5 sm:py-6">
        <CardHeader className="px-4 sm:px-6">
          <CardTitle className="text-lg">Current plan</CardTitle>
          <CardAction className="flex items-center gap-2">
            <SubscriptionStatusBadge status={status} />
            {subscription?.isTrial && <TrialBadge />}
          </CardAction>
        </CardHeader>

        <CardContent className="grid gap-4 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
          <div>
            <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Plan
            </div>
            <div className="mt-1 text-sm text-foreground">Premium</div>
          </div>
          <div>
            <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Period starts
            </div>
            <div className="mt-1 text-sm text-foreground">
              {formatDate(subscription?.activeFrom)}
            </div>
          </div>
          <div>
            <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Period ends
            </div>
            <div className="mt-1 text-sm text-foreground">
              {formatDate(subscription?.activeUntil)}
            </div>
          </div>
          <div>
            <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Days left
            </div>
            <div className="mt-1 text-sm text-foreground">
              {status === "active"
                ? (subscription?.daysLeft ?? 0)
                : "—"}
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex-col items-start gap-2 border-t border-border px-4 sm:px-6">
          <Button variant="outline" onClick={checkActivation} disabled={checking}>
            <ArrowPathIcon
              className={`h-4 w-4 ${checking ? "animate-spin" : ""}`}
            />
            {checking ? "Checking..." : "Check activation status"}
          </Button>
          {pendingTranId && (
            <p className="text-xs text-muted-foreground">
              Pending payment: {pendingTranId}
            </p>
          )}
        </CardFooter>
      </Card>

      <Card className="gap-4 py-5 sm:py-6">
        <CardHeader className="px-4 sm:px-6">
          <CardTitle className="text-lg">Choose a plan</CardTitle>
          <CardDescription>
            Pay securely with bKash, Nagad, card, or bank through EPS. If
            you pay before your current period ends, the new days are added after
            your current end date.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 px-4 sm:px-6">
          {plansLoading && (
            <p className="text-sm text-muted-foreground">Loading plans...</p>
          )}

          {!plansLoading && plansError && (
            <div className="space-y-3">
              <StatusAlert tone="failed">{plansError}</StatusAlert>
              <Button variant="outline" onClick={() => window.location.reload()}>
                Try again
              </Button>
            </div>
          )}

          {!plansLoading && !plansError && plans.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No plans are available right now. Please try again later or contact
              support.
            </p>
          )}

          <div className="space-y-3">
            {plans.map((plan) => {
              const active = plan.id === selectedPlanId;
              return (
                <label
                  key={plan.id}
                  className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition ${
                    active
                      ? "border-primary bg-primary/5"
                      : "border-border bg-muted/40 hover:border-input"
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
                      active ? "border-primary" : "border-input"
                    }`}
                    aria-hidden="true"
                  >
                    {active && (
                      <span className="h-2 w-2 rounded-full bg-primary" />
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-foreground">
                      {plan.name}
                    </span>
                    <span className="mt-0.5 block text-xs text-muted-foreground">
                      {plan.durationDays} days
                      {plan.description ? ` · ${plan.description}` : ""}
                    </span>
                  </span>
                  <span className="shrink-0 text-right">
                    <span className="block text-base font-bold text-foreground">
                      {formatAmount(plan.amount, plan.currency)}
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      {plan.currency}
                    </span>
                  </span>
                </label>
              );
            })}
          </div>

          {selectedPlan && (
            <div className="flex flex-wrap gap-3">
              <Button
                className="w-full"
                onClick={payOnline}
                disabled={paying}
              >
                {paying
                  ? "Waiting for payment confirmation..."
                  : `Pay ${formatAmount(selectedPlan.amount, selectedPlan.currency)} online`}
              </Button>
            </div>
          )}

          <p className="text-xs leading-5 text-muted-foreground">
            The secure EPS page opens in a new tab. Keep this tab open —
            we confirm the payment with our server automatically. If the tab
            closes early, press &quot;Check activation status&quot; above after
            paying.
          </p>
        </CardContent>
      </Card>

    </div>
  );
}
