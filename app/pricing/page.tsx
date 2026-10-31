import Link from "next/link";
import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PricingCards } from "@/components/pricing/PricingCards";

export const metadata: Metadata = {
  title: "Pricing | Invoice SaaS",
  description:
    "Choose the subscription plan that fits your business. Pay securely with bKash, Nagad, card, or bank.",
};

const steps = [
  "Sign in to your business account, or create one if you are new.",
  "Open Subscription and choose the plan that suits you.",
  "Complete the secure SSLCommerz checkout page.",
  "Your access continues immediately — no waiting for approval.",
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-slate-950">
      <Header />

      <main className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-4 inline-flex items-center rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-1.5 text-sm font-medium text-emerald-400">
            Simple &amp; Affordable
          </div>

          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Choose your plan
          </h1>

          <p className="mt-4 text-base leading-7 text-slate-400 sm:text-lg">
            Every plan includes the full business toolkit — invoices, clients,
            inventory, expenses, reports, and team access.
          </p>
        </div>

        <PricingCards />

        <div className="mx-auto mt-14 grid max-w-4xl gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
            <h2 className="text-lg font-semibold text-white">
              How online payment works
            </h2>
            <ol className="mt-4 space-y-3 text-sm text-slate-300">
              {steps.map((step, index) => (
                <li key={step} className="flex gap-3">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-xs font-semibold text-emerald-400">
                    {index + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </section>

          <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 text-sm leading-6 text-slate-400">
            <h2 className="text-lg font-semibold text-white">
              Secure checkout
            </h2>
            <p className="mt-3">
              Payments are processed by SSLCommerz. Pay with bKash, Nagad, card,
              or bank — your subscription is activated automatically as soon as
              the payment is confirmed.
            </p>
            <p className="mt-3">
              We never ask for your bKash PIN, card password, or one-time
              password. Payment details are entered only on the SSLCommerz
              checkout page.
            </p>
            <p className="mt-3">
              Refund and cancellation terms are in our{" "}
              <Link
                href="/return-refund-policy"
                className="text-slate-300 underline-offset-2 hover:text-white hover:underline"
              >
                Return &amp; Refund Policy
              </Link>
              .
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
