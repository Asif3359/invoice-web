import Link from "next/link";
import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PricingCards } from "@/components/pricing/PricingCards";
import { Badge } from "@/components/ui/badge";
import { Card, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Pricing | Invento Manager",
  description:
    "Choose the subscription plan that fits your business. Pay securely with bKash, Nagad, card, or bank.",
};

const steps = [
  "Sign in to your business account, or create one if you are new.",
  "Open Subscription and choose the plan that suits you.",
  "Complete the secure EPS checkout page.",
  "Your access continues immediately — no waiting for approval.",
];

export default function PricingPage() {
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <Header />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <Badge variant="secondary" className="mb-4 px-4 py-1.5 text-sm font-medium">
            Simple &amp; Affordable
          </Badge>

          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Choose your plan
          </h1>

          <p className="mt-4 text-base leading-7 text-muted-foreground sm:text-lg">
            Every plan includes the full business toolkit — invoices, clients,
            inventory, expenses, reports, and team access.
          </p>
        </div>

        <PricingCards />

        <div className="mx-auto mt-14 grid max-w-4xl grid-cols-1 gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <Card className="gap-0 p-6 shadow-sm">
            <CardTitle className="text-lg">How online payment works</CardTitle>
            <ol className="mt-4 space-y-3 text-sm text-muted-foreground">
              {steps.map((step, index) => (
                <li key={step} className="flex gap-3">
                  <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                    {index + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </Card>

          <Card className="gap-0 p-6 text-sm leading-6 text-muted-foreground shadow-sm">
            <CardTitle className="text-lg">Secure checkout</CardTitle>
            <p className="mt-3">
              Payments are processed by EPS (Easy Payment System). Pay with
              bKash, Nagad, card,
              or bank — your subscription is activated automatically as soon as
              the payment is confirmed.
            </p>
            <p className="mt-3">
              We never ask for your bKash PIN, card password, or one-time
              password. Payment details are entered only on the EPS
              checkout page.
            </p>
            <p className="mt-3">
              Refund and cancellation terms are in our{" "}
              <Link
                href="/return-refund-policy"
                className="text-foreground underline-offset-2 hover:text-primary hover:underline"
              >
                Return &amp; Refund Policy
              </Link>
              .
            </p>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
