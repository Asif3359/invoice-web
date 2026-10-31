"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { CheckIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import {
  fetchPublicPlans,
  paymentErrorMessage,
  type Plan,
} from "@/lib/subscription-payments";

const features = [
  "Unlimited invoices and clients",
  "Inventory, expenses and reports",
  "Multi-user team access",
  "Payment history and subscription controls",
  "Secure SSLCommerz checkout",
];

function formatAmount(amount: number, currency: string) {
  const value = Number(amount ?? 0).toLocaleString("en-BD");
  return currency === "BDT" ? `৳${value}` : `${currency} ${value}`;
}

function pricePerMonth(plan: Plan) {
  const months = plan.durationDays / 30;
  return months > 0 ? plan.amount / months : plan.amount;
}

function savingsPercent(plan: Plan, plans: Plan[]) {
  const monthly = plans
    .filter((item) => item.durationDays <= 31)
    .sort((a, b) => a.durationDays - b.durationDays)[0];
  if (!monthly || plan.id === monthly.id) return 0;

  const monthlyPerDay = monthly.amount / monthly.durationDays;
  const planPerDay = plan.amount / plan.durationDays;
  if (!monthlyPerDay || planPerDay >= monthlyPerDay) return 0;

  return Math.round((1 - planPerDay / monthlyPerDay) * 100);
}

function bestValueId(plans: Plan[]) {
  if (plans.length < 2) return null;
  return plans.reduce((best, plan) =>
    plan.amount / plan.durationDays < best.amount / best.durationDays
      ? plan
      : best,
  ).id;
}

export function PricingCards() {
  const [plans, setPlans] = useState<Plan[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      setPlans(await fetchPublicPlans());
    } catch (err) {
      setError(paymentErrorMessage(err, "Could not load plans right now."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {[0, 1, 2].map((index) => (
          <div
            key={index}
            className="h-80 animate-pulse rounded-3xl border border-slate-800 bg-slate-900/60"
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto mt-12 max-w-xl rounded-2xl border border-amber-500/30 bg-amber-500/10 p-6 text-center">
        <ExclamationTriangleIcon className="mx-auto h-8 w-8 text-amber-400" />
        <p className="mt-3 text-sm text-amber-200">{error}</p>
        <button
          type="button"
          onClick={load}
          className="mt-4 rounded-lg border border-amber-500/40 px-4 py-2 text-sm font-medium text-amber-100 hover:bg-amber-500/10"
        >
          Try again
        </button>
      </div>
    );
  }

  if (!plans || plans.length === 0) {
    return (
      <div className="mx-auto mt-12 max-w-xl rounded-2xl border border-slate-800 bg-slate-900/60 p-6 text-center text-sm text-slate-400">
        No plans are available right now. Please check back soon or contact
        support.
      </div>
    );
  }

  const bestId = bestValueId(plans);

  return (
    <div className="mt-12 grid gap-6 md:grid-cols-3">
      {plans.map((plan) => {
        const savings = savingsPercent(plan, plans);
        const isBest = plan.id === bestId;

        return (
          <div
            key={plan.id}
            className={`relative flex flex-col overflow-hidden rounded-3xl border bg-slate-900 p-6 shadow-xl ${
              isBest
                ? "border-emerald-500/60 shadow-emerald-950/40"
                : "border-slate-800 shadow-black/20"
            }`}
          >
            {isBest && (
              <>
                <div className="absolute inset-x-0 top-0 h-1 bg-emerald-500" />
                <span className="absolute right-4 top-4 rounded-full bg-emerald-500/15 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-emerald-300">
                  Best value
                </span>
              </>
            )}

            <div>
              <h2 className="text-xl font-bold text-white">{plan.name}</h2>
              <p className="mt-1 text-sm text-slate-400">
                {plan.description || `${plan.durationDays} days of full access`}
              </p>
            </div>

            <div className="mt-6">
              <div className="flex items-end gap-2">
                <span className="text-4xl font-extrabold tracking-tight text-white">
                  {formatAmount(plan.amount, plan.currency)}
                </span>
                <span className="mb-1 text-sm text-slate-400">
                  / {plan.durationDays} days
                </span>
              </div>
              <p className="mt-2 text-sm text-emerald-400">
                About {formatAmount(Math.round(pricePerMonth(plan)), plan.currency)}{" "}
                per month
              </p>
              {savings > 0 && (
                <span className="mt-2 inline-block rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-300">
                  Save {savings}% vs monthly
                </span>
              )}
            </div>

            <ul className="mt-6 flex-1 space-y-3 text-sm text-slate-300">
              {features.map((feature) => (
                <li key={feature} className="flex items-start gap-2.5">
                  <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <Link
              href="/login?next=/business/subscription"
              className={`mt-6 flex w-full items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold transition ${
                isBest
                  ? "bg-emerald-600 text-white shadow-lg shadow-emerald-900/20 hover:bg-emerald-500"
                  : "border border-slate-700 bg-slate-950/40 text-slate-100 hover:border-emerald-500/50 hover:text-emerald-300"
              }`}
            >
              Choose {plan.name}
            </Link>
          </div>
        );
      })}
    </div>
  );
}
