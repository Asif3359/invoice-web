"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  ArrowPathIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";
import { useBusinessUser } from "@/components/business/BusinessGuard";
import {
  StatusAlert,
  SubscriptionStatusBadge,
  TrialBadge,
} from "@/components/status";
import { Loading } from "@/components/admin/Loading";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import {
  fetchBusinessOverview,
  type BusinessOverview,
} from "@/lib/business-overview";

function formatDate(value?: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function BusinessDashboardPage() {
  const { user, subscription } = useBusinessUser();
  const status = subscription?.status;

  const [overview, setOverview] = useState<BusinessOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      setOverview(await fetchBusinessOverview());
    } catch {
      setError("Could not load your business activity.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const cards = [
    { label: "Invoices", value: overview?.invoices },
    { label: "Products", value: overview?.products },
    { label: "Stock items", value: overview?.stockItems },
    { label: "Payments", value: overview?.payments },
    { label: "Expenses", value: overview?.expenses },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">
          Welcome back{user.fullName ? `, ${user.fullName}` : ""}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          A quick look at your subscription and what you have recorded so far.
        </p>
      </div>

      {status === "expired" && (
        <Alert variant="failed">
          <ExclamationCircleIcon />
          <AlertDescription className="gap-3 sm:flex sm:items-center sm:justify-between">
            <p>
              Your subscription has expired. Renew to keep creating invoices,
              recording payments, and syncing data.
            </p>
            <Button asChild size="sm" className="shrink-0">
              <Link href="/business/subscription">Pay now</Link>
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
        <Card className="gap-2 p-4 sm:p-5">
          <CardDescription>Subscription status</CardDescription>
          <div className="flex flex-wrap items-center gap-2">
            <SubscriptionStatusBadge status={status} />
            {subscription?.isTrial && <TrialBadge />}
          </div>
        </Card>
        <Card className="gap-1.5 p-4 sm:p-5">
          <CardDescription>Current period ends</CardDescription>
          <CardTitle className="text-lg">
            {formatDate(subscription?.activeUntil)}
          </CardTitle>
        </Card>
        <Card className="gap-1.5 p-4 sm:p-5">
          <CardDescription>Days remaining</CardDescription>
          <CardTitle className="text-lg">
            {status === "active" ? subscription?.daysLeft ?? "—" : "—"}
          </CardTitle>
        </Card>
      </div>

      <section>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-foreground">
            Business activity
          </h2>
          <Button variant="outline" size="sm" onClick={load} disabled={loading}>
            <ArrowPathIcon className={loading ? "animate-spin" : undefined} />
            {loading ? "Refreshing…" : "Refresh"}
          </Button>
        </div>

        <div className="mt-3">
          {loading && !overview && <Loading />}

          {error && (
            <div className="space-y-3">
              <StatusAlert tone="failed">{error}</StatusAlert>
              <Button variant="outline" size="sm" onClick={load}>
                Try again
              </Button>
            </div>
          )}

          {!error && overview && (
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
              {cards.map((card) => (
                <Card key={card.label} className="gap-1.5 p-4 sm:p-5">
                  <CardDescription>{card.label}</CardDescription>
                  <CardTitle className="text-2xl">
                    {card.value ?? 0}
                  </CardTitle>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      <Card className="gap-3 p-4 sm:p-5">
        <CardTitle className="text-lg">Quick links</CardTitle>
        <div className="flex flex-wrap gap-3 text-sm">
          <Button asChild size="sm">
            <Link href="/business/subscription">Renew subscription</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/business/payments">Payment history</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/business/profile">View profile</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/business/security">Security</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/#contact">Contact support</Link>
          </Button>
        </div>
      </Card>
    </div>
  );
}
