"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  CheckIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
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
  "Secure EPS checkout",
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
          <Skeleton key={index} className="h-80 w-full rounded-3xl" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="mx-auto mt-12 max-w-xl items-center gap-0 p-6 text-center">
        <ExclamationTriangleIcon className="mx-auto size-8 text-primary" />
        <p className="mt-3 text-sm text-muted-foreground">{error}</p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-4"
          onClick={load}
        >
          Try again
        </Button>
      </Card>
    );
  }

  if (!plans || plans.length === 0) {
    return (
      <Card className="mx-auto mt-12 max-w-xl p-6 text-center text-sm text-muted-foreground">
        No plans are available right now. Please check back soon or contact
        support.
      </Card>
    );
  }

  const bestId = bestValueId(plans);

  return (
    <div className="mt-12 grid gap-6 md:grid-cols-3">
      {plans.map((plan) => {
        const savings = savingsPercent(plan, plans);
        const isBest = plan.id === bestId;

        return (
          <Card
            key={plan.id}
            className={
              isBest
                ? "relative gap-0 overflow-hidden rounded-3xl p-6 shadow-lg shadow-primary/10 transition duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/15"
                : "relative gap-0 overflow-hidden rounded-3xl p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-primary/40 hover:shadow-md"
            }
          >
            {isBest && (
              <>
                <div className="absolute inset-x-0 top-0 h-1 bg-primary" />
                <Badge className="absolute top-4 right-4">Best value</Badge>
              </>
            )}

            <div>
              <h2 className="text-xl font-bold text-foreground">{plan.name}</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {plan.description || `${plan.durationDays} days of full access`}
              </p>
            </div>

            <div className="mt-6">
              <div className="flex items-end gap-2">
                <span className="text-4xl font-extrabold tracking-tight text-foreground">
                  {formatAmount(plan.amount, plan.currency)}
                </span>
                <span className="mb-1 text-sm text-muted-foreground">
                  / {plan.durationDays} days
                </span>
              </div>
              <p className="mt-2 text-sm text-primary">
                About{" "}
                {formatAmount(Math.round(pricePerMonth(plan)), plan.currency)}{" "}
                per month
              </p>
              {savings > 0 && (
                <Badge variant="secondary" className="mt-2">
                  Save {savings}% vs monthly
                </Badge>
              )}
            </div>

            <ul className="mt-6 flex-1 space-y-3 text-sm text-foreground/80">
              {features.map((feature) => (
                <li key={feature} className="flex items-start gap-2.5">
                  <CheckIcon className="mt-0.5 size-4 shrink-0 text-primary" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <Button
              asChild
              size="lg"
              variant={isBest ? "default" : "outline"}
              className="mt-6 w-full"
            >
              <Link href="/register?next=/business/subscription">
                Choose {plan.name}
              </Link>
            </Button>
          </Card>
        );
      })}
    </div>
  );
}
