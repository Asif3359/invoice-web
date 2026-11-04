"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import {
  ArrowRightIcon,
  CheckCircleIcon,
  ClipboardDocumentIcon,
  CheckIcon,
  ClockIcon,
  ExclamationCircleIcon,
  HomeIcon,
  ShieldCheckIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import { AuthShell, AuthSplash } from "@/components/auth/AuthShell";
import { useBusinessUser } from "@/components/business/BusinessGuard";
import { Button } from "@/components/ui/button";
import {
  clearPendingPayment,
  fetchPaymentStatus,
  readPendingPayment,
  type PaymentStatus,
} from "@/lib/subscription-payments";

type ResultKind = "success" | "cancel";

type ViewState = "loading" | "unknown" | "paid" | "cancelled" | "pending";

const REDIRECT_SECONDS = 15;
const POLL_INTERVAL_MS = 3000;
const POLL_LIMIT = 10;

function formatDate(value?: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatAmount(amount?: number, currency = "BDT") {
  if (typeof amount !== "number") return "—";
  const value = amount.toLocaleString("en-BD");
  return currency === "BDT" ? `৳${value}` : `${currency} ${value}`;
}

/** The gateway hands the browser back in a named popup, not the main tab. */
function isPaymentPopup() {
  if (typeof window === "undefined") return false;
  if (window.name === "eps_payment") return true;
  return Boolean(window.opener && window.opener !== window);
}

function viewFor(status: PaymentStatus): ViewState {
  if (status === "paid") return "paid";
  if (status === "pending") return "pending";
  return "cancelled";
}

function CopyTranId({ tranId }: { tranId: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(tranId);
    } catch {
      // Clipboard API needs a secure context; fall back to a temporary field.
      const field = document.createElement("textarea");
      field.value = tranId;
      field.setAttribute("readonly", "");
      field.style.position = "fixed";
      field.style.opacity = "0";
      document.body.appendChild(field);
      field.select();
      document.execCommand("copy");
      document.body.removeChild(field);
    }

    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-muted px-3 py-2.5">
      <div className="min-w-0">
        <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
          Transaction ID
        </p>
        <p className="truncate font-mono text-xs text-foreground">{tranId}</p>
      </div>
      <Button
        type="button"
        variant="outline"
        size="xs"
        onClick={handleCopy}
        aria-label="Copy transaction ID"
        className="shrink-0 gap-1.5"
      >
        {copied ? (
          <CheckIcon className="size-3.5" />
        ) : (
          <ClipboardDocumentIcon className="size-3.5" />
        )}
        {copied ? "Copied" : "Copy"}
      </Button>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}

const views: Record<
  Exclude<ViewState, "loading" | "unknown">,
  {
    eyebrow: string;
    title: string;
    description: string;
    icon: typeof CheckCircleIcon;
    accent: string;
    ring: string;
  }
> = {
  paid: {
    eyebrow: "Payment received",
    title: "Subscription activated",
    description: "Your payment was confirmed by the bank and your plan is live.",
    icon: CheckCircleIcon,
    accent: "text-blue-700",
    ring: "border-blue-600/20 bg-blue-50",
  },
  cancelled: {
    eyebrow: "No charge made",
    title: "Payment not completed",
    description:
      "The payment was cancelled or could not be confirmed. Nothing was deducted from your account.",
    icon: XCircleIcon,
    accent: "text-indigo-700",
    ring: "border-indigo-600/20 bg-indigo-50",
  },
  pending: {
    eyebrow: "Awaiting bank confirmation",
    title: "Verifying your payment",
    description:
      "The bank is still confirming this transaction. This usually settles within a few minutes.",
    icon: ClockIcon,
    accent: "text-sky-700",
    ring: "border-sky-600/20 bg-sky-50",
  },
};

function PaymentResultInner({ kind }: { kind: ResultKind }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshSubscription } = useBusinessUser();

  const tranId =
    searchParams.get("tran_id") || searchParams.get("tranId") || "";

  // A link without a reference can fall back to the payment started in this
  // browser, which is kept in localStorage across reloads.
  const reference = tranId || readPendingPayment()?.tranId || "";

  const [view, setView] = useState<ViewState>("loading");
  const [detail, setDetail] = useState<{
    amount?: number;
    currency?: string;
    planName?: string;
    periodTo?: string | null;
    status?: PaymentStatus;
  }>({});
  const [secondsLeft, setSecondsLeft] = useState(REDIRECT_SECONDS);
  const [autoRedirect, setAutoRedirect] = useState(true);

  const popup = isPaymentPopup();

  // The URL only carries the reference. The real outcome always comes from
  // the server, so a shared or hand-typed link can never fake a receipt.
  const check = useCallback(async () => {
    try {
      const result = await fetchPaymentStatus(reference);
      setDetail({
        amount: result.amount,
        currency: result.currency,
        planName: result.plan?.name,
        periodTo: result.periodTo,
        status: result.status,
      });
      setView(viewFor(result.status));

      if (result.status === "paid") {
        clearPendingPayment();
        await refreshSubscription();
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        setView("unknown");
        return;
      }

      // An unreachable confirmation is not a failure: keep the payment open
      // rather than telling the user it did not go through.
      setView(kind === "success" ? "pending" : "cancelled");
    }
  }, [reference, kind, refreshSubscription]);

  useEffect(() => {
    if (!reference) return;

    // Deferred so the first state update lands outside the effect body, and
    // cancelled on cleanup so a StrictMode remount reschedules instead of
    // dropping the check.
    const timer = setTimeout(check, 0);
    return () => clearTimeout(timer);
  }, [reference, check]);

  // Keep polling while the bank is still settling.
  useEffect(() => {
    if (view !== "pending") return;

    let attempts = 0;
    const timer = setInterval(async () => {
      attempts += 1;
      if (attempts > POLL_LIMIT) {
        clearInterval(timer);
        return;
      }
      await check();
    }, POLL_INTERVAL_MS);

    return () => clearInterval(timer);
  }, [view, check]);

  // Both outcomes return to the dashboard on their own.
  useEffect(() => {
    if (!autoRedirect) return;
    if (view !== "paid" && view !== "cancelled") return;

    if (secondsLeft <= 0) {
      if (popup) {
        window.close();
        router.replace("/business");
      } else {
        router.replace("/business");
      }
      return;
    }

    const timer = setTimeout(() => setSecondsLeft((value) => value - 1), 1000);
    return () => clearTimeout(timer);
  }, [autoRedirect, view, secondsLeft, popup, router]);

  const current =
    view === "loading" || view === "unknown" ? null : views[view];

  return (
    <AuthShell>
      {reference && view === "loading" ? (
        <div className="flex flex-col items-center gap-3 py-10 text-sm text-muted-foreground">
          <span className="size-8 animate-spin rounded-full border-2 border-border border-t-primary" />
          Checking your payment...
        </div>
      ) : !reference || view === "unknown" ? (
        <>
          <div className="mt-6">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
              Payment not found
            </p>
            <h1 className="mt-3 text-2xl font-semibold tracking-tight text-foreground">
              We could not find this payment
            </h1>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              This link has no transaction reference, or the payment does not
              belong to your account. Open your subscription page to check
              your plan or start a new payment.
            </p>
          </div>

          <div className="mt-6 space-y-3">
            <Button asChild size="lg" className="w-full gap-2">
              <Link href="/business/subscription">
                Go to subscription
                <ArrowRightIcon className="size-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="w-full gap-2">
              <Link href="/business">
                <HomeIcon className="size-4" />
                Back to dashboard
              </Link>
            </Button>
          </div>
        </>
      ) : current ? (
        <>
          <div className="mt-6 flex items-center justify-center">
            <span
              className={`flex size-16 items-center justify-center rounded-2xl border ${current.ring}`}
            >
              <current.icon
                className={`size-8 ${current.accent}`}
                aria-hidden="true"
              />
            </span>
          </div>

          <div className="mt-5 text-center">
            <p
              className={`text-xs font-medium uppercase tracking-[0.2em] ${current.accent}`}
            >
              {current.eyebrow}
            </p>
            <h1 className="mt-3 text-2xl font-semibold tracking-tight text-foreground">
              {current.title}
            </h1>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {current.description}
            </p>
          </div>

          <div className="mt-6 space-y-3 rounded-2xl border border-border bg-muted/70 p-4">
            {detail.planName && (
              <DetailRow label="Plan" value={detail.planName} />
            )}
            <DetailRow
              label="Amount"
              value={formatAmount(detail.amount, detail.currency)}
            />
            {view === "paid" && (
              <DetailRow
                label="Valid until"
                value={formatDate(detail.periodTo)}
              />
            )}
            {view === "cancelled" && detail.status && (
              <DetailRow
                label="Status"
                value={detail.status === "review" ? "Under review" : "Not paid"}
              />
            )}
          </div>

          {reference && (
            <div className="mt-4">
              <CopyTranId tranId={reference} />
            </div>
          )}

          {view === "pending" ? (
            <div className="mt-6 space-y-3">
              <Button size="lg" className="w-full" onClick={check}>
                Check status again
              </Button>
              <Button asChild variant="outline" size="lg" className="w-full">
                <Link href="/business/subscription">Back to subscription</Link>
              </Button>
            </div>
          ) : (
            <div className="mt-6 space-y-3">
              <Button asChild size="lg" className="w-full gap-2">
                <Link href="/business">
                  <HomeIcon className="size-4" />
                  {view === "paid" ? "Go to dashboard" : "Back to dashboard"}
                </Link>
              </Button>

              {view === "cancelled" && (
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="w-full gap-2"
                >
                  <Link href="/business/subscription">
                    Try payment again
                    <ArrowRightIcon className="size-4" />
                  </Link>
                </Button>
              )}
            </div>
          )}

          {(view === "paid" || view === "cancelled") && (
            <div className="mt-5 flex items-center justify-center gap-3 text-xs text-muted-foreground">
              {autoRedirect ? (
                <>
                  <span>
                    {popup
                      ? `Closing in ${secondsLeft}s`
                      : `Returning to dashboard in ${secondsLeft}s`}
                  </span>
                  <Button
                    type="button"
                    variant="link"
                    onClick={() => setAutoRedirect(false)}
                    className="h-auto p-0 text-xs text-foreground underline-offset-2 hover:underline"
                  >
                    Stay
                  </Button>
                </>
              ) : (
                <span>Automatic redirect paused</span>
              )}
            </div>
          )}

          <div className="mt-6 flex items-center gap-3 text-[11px] text-muted-foreground">
            <span className="h-px flex-1 bg-border" />
            <span className="flex items-center gap-1.5">
              <ShieldCheckIcon className="size-3.5 text-primary" />
              Verified with the bank
            </span>
            <span className="h-px flex-1 bg-border" />
          </div>

          {view === "cancelled" && (
            <p className="mt-4 flex items-start gap-2 text-[11px] leading-5 text-muted-foreground">
              <ExclamationCircleIcon className="mt-0.5 size-3.5 shrink-0 text-indigo-600" />
              Money already deducted? Keep this transaction ID and contact
              support — payments are reconciled automatically.
            </p>
          )}
        </>
      ) : null}
    </AuthShell>
  );
}

export function PaymentResult({ kind }: { kind: ResultKind }) {
  return (
    <Suspense fallback={<AuthSplash />}>
      <PaymentResultInner kind={kind} />
    </Suspense>
  );
}
