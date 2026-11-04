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
import { useBusinessUser } from "@/components/business/BusinessGuard";
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
    <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-2.5">
      <div className="min-w-0">
        <p className="text-[11px] uppercase tracking-wider text-slate-500">
          Transaction ID
        </p>
        <p className="truncate font-mono text-xs text-slate-200">{tranId}</p>
      </div>
      <button
        type="button"
        onClick={handleCopy}
        aria-label="Copy transaction ID"
        className={`flex shrink-0 items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition ${
          copied
            ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
            : "border-slate-700 bg-slate-900 text-slate-300 hover:border-slate-500 hover:text-slate-100"
        }`}
      >
        {copied ? (
          <CheckIcon className="h-3.5 w-3.5" />
        ) : (
          <ClipboardDocumentIcon className="h-3.5 w-3.5" />
        )}
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="text-slate-400">{label}</span>
      <span className="font-medium text-slate-100">{value}</span>
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
    accent: "text-emerald-400",
    ring: "border-emerald-500/20 bg-emerald-500/10",
  },
  cancelled: {
    eyebrow: "No charge made",
    title: "Payment not completed",
    description:
      "The payment was cancelled or could not be confirmed. Nothing was deducted from your account.",
    icon: XCircleIcon,
    accent: "text-amber-400",
    ring: "border-amber-500/20 bg-amber-500/10",
  },
  pending: {
    eyebrow: "Awaiting bank confirmation",
    title: "Verifying your payment",
    description:
      "The bank is still confirming this transaction. This usually settles within a few minutes.",
    icon: ClockIcon,
    accent: "text-sky-400",
    ring: "border-sky-500/20 bg-sky-500/10",
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
    <div className="relative min-h-screen overflow-hidden bg-slate-950">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -left-40 -top-40 h-[32rem] w-[32rem] rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute -right-40 top-1/3 h-[32rem] w-[32rem] rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(148,163,184,0.07)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.07)_1px,transparent_1px)] bg-[size:56px_56px]" />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/20 via-slate-950/60 to-slate-950" />
      </div>

      <div className="relative mx-auto flex min-h-screen w-full max-w-md items-center px-4 py-10 sm:px-6">
        <div className="w-full rounded-3xl border border-slate-800/80 bg-slate-900/70 p-6 shadow-2xl shadow-black/40 backdrop-blur-xl sm:p-8">
          {reference && view === "loading" ? (
            <div className="flex flex-col items-center gap-3 py-10 text-sm text-slate-400">
              <span className="h-8 w-8 animate-spin rounded-full border-2 border-slate-700 border-t-emerald-400" />
              Checking your payment...
            </div>
          ) : !reference || view === "unknown" ? (
            <>
              <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-slate-400">
                <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                Payment not found
              </div>
              <h1 className="mt-3 text-2xl font-semibold tracking-tight text-slate-50">
                We could not find this payment
              </h1>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                This link has no transaction reference, or the payment does not
                belong to your account. Open your subscription page to check
                your plan or start a new payment.
              </p>
              <div className="mt-6 space-y-3">
                <Link
                  href="/business/subscription"
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-4 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/20 transition hover:from-emerald-400 hover:to-cyan-400"
                >
                  Go to subscription
                  <ArrowRightIcon className="h-4 w-4" />
                </Link>
                <Link
                  href="/business"
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-700 px-4 py-3 text-sm font-medium text-slate-300 transition hover:border-slate-500 hover:text-slate-100"
                >
                  <HomeIcon className="h-4 w-4" />
                  Back to dashboard
                </Link>
              </div>
            </>
          ) : current ? (
            <>
                <div className="flex items-center justify-center">
                  <span
                    className={`flex h-16 w-16 items-center justify-center rounded-2xl border ${current.ring}`}
                  >
                    <current.icon
                      className={`h-8 w-8 ${current.accent}`}
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
                  <h1 className="mt-3 text-2xl font-semibold tracking-tight text-slate-50">
                    {current.title}
                  </h1>
                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    {current.description}
                  </p>
                </div>

                <div className="mt-6 space-y-3 rounded-2xl border border-slate-800 bg-slate-950/40 p-4">
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
                    <button
                      type="button"
                      onClick={check}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-4 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/20 transition hover:from-emerald-400 hover:to-cyan-400"
                    >
                      Check status again
                    </button>
                    <Link
                      href="/business/subscription"
                      className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-700 px-4 py-3 text-sm font-medium text-slate-300 transition hover:border-slate-500 hover:text-slate-100"
                    >
                      Back to subscription
                    </Link>
                  </div>
                ) : (
                  <div className="mt-6 space-y-3">
                    <Link
                      href="/business"
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-4 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/20 transition hover:from-emerald-400 hover:to-cyan-400"
                    >
                      <HomeIcon className="h-4 w-4" />
                      {view === "paid"
                        ? "Go to dashboard"
                        : "Back to dashboard"}
                    </Link>

                    {view === "cancelled" && (
                      <Link
                        href="/business/subscription"
                        className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-700 px-4 py-3 text-sm font-medium text-slate-300 transition hover:border-emerald-500/50 hover:text-emerald-300"
                      >
                        Try payment again
                        <ArrowRightIcon className="h-4 w-4" />
                      </Link>
                    )}
                  </div>
                )}

                {(view === "paid" || view === "cancelled") && (
                  <div className="mt-5 flex items-center justify-center gap-3 text-xs text-slate-500">
                    {autoRedirect ? (
                      <>
                        <span>
                          {popup
                            ? `Closing in ${secondsLeft}s`
                            : `Returning to dashboard in ${secondsLeft}s`}
                        </span>
                        <button
                          type="button"
                          onClick={() => setAutoRedirect(false)}
                          className="font-medium text-slate-400 underline-offset-2 transition hover:text-emerald-400 hover:underline"
                        >
                          Stay
                        </button>
                      </>
                    ) : (
                      <span>Automatic redirect paused</span>
                    )}
                  </div>
                )}

                <div className="mt-6 flex items-center gap-3 text-[11px] text-slate-500">
                  <span className="h-px flex-1 bg-slate-800" />
                  <span className="flex items-center gap-1.5">
                    <ShieldCheckIcon className="h-3.5 w-3.5 text-emerald-500" />
                    Verified with the bank
                  </span>
                  <span className="h-px flex-1 bg-slate-800" />
                </div>

                {view === "cancelled" && (
                  <p className="mt-4 flex items-start gap-2 text-[11px] leading-5 text-slate-500">
                    <ExclamationCircleIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-500" />
                    Money already deducted? Keep this transaction ID and contact
                    support — payments are reconciled automatically.
                  </p>
                )}
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function PaymentResult({ kind }: { kind: ResultKind }) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-slate-950">
          <div className="flex flex-col items-center gap-3 text-sm text-slate-400">
            <span className="h-8 w-8 animate-spin rounded-full border-2 border-slate-700 border-t-emerald-400" />
            Loading...
          </div>
        </div>
      }
    >
      <PaymentResultInner kind={kind} />
    </Suspense>
  );
}
