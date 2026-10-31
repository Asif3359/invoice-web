import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-slate-950">
      <Header />

      <main className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-4 inline-flex items-center rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-1.5 text-sm font-medium text-emerald-400">
            Simple &amp; Affordable
          </div>

          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Choose Premium
          </h1>

          <p className="mt-4 text-base leading-7 text-slate-400 sm:text-lg">
            Everything you need to manage your invoices, clients, inventory, and
            business in one place.
          </p>
        </div>

        {/* Pricing Card */}
        <div className="mx-auto mt-12 max-w-lg">
          <div className="relative overflow-hidden rounded-3xl border border-emerald-500/40 bg-slate-900 shadow-2xl shadow-emerald-950/30">
            <div className="absolute inset-x-0 top-0 h-1 bg-emerald-500" />

            <div className="p-8 sm:p-10">
              {/* Plan */}
              <div className="text-center">
                <h2 className="text-2xl font-bold text-white">Premium</h2>

                <p className="mt-2 text-sm text-slate-400">
                  Complete business management solution
                </p>
              </div>

              {/* Price */}
              <div className="mt-8 text-center">
                <div className="flex items-end justify-center gap-2">
                  <span className="text-5xl font-extrabold tracking-tight text-white">
                    ৳499
                  </span>

                  <span className="mb-2 text-sm text-slate-400">/ month</span>
                </div>

                <p className="mt-2 text-sm text-emerald-400">
                  Affordable. Simple. Powerful.
                </p>
              </div>

              {/* Features */}
              <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-950/60 p-6">
                <p className="mb-4 text-sm font-semibold text-white">
                  Everything included:
                </p>

                <ul className="space-y-4 text-sm text-slate-300">
                  <li className="flex items-center gap-3">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400">
                      ✓
                    </span>
                    Unlimited invoices
                  </li>

                  <li className="flex items-center gap-3">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400">
                      ✓
                    </span>
                    Unlimited clients
                  </li>

                  <li className="flex items-center gap-3">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400">
                      ✓
                    </span>
                    Inventory management
                  </li>

                  <li className="flex items-center gap-3">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400">
                      ✓
                    </span>
                    Multi-user access
                  </li>

                  <li className="flex items-center gap-3">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400">
                      ✓
                    </span>
                    Business reports
                  </li>
                </ul>
              </div>

              {/* Online payment via SSLCommerz */}
              <Link
                href="/login?next=/business/subscription"
                className="mt-6 flex w-full items-center justify-center rounded-xl bg-emerald-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-emerald-900/20 transition hover:bg-emerald-500 hover:shadow-emerald-900/30"
              >
                Subscribe online
              </Link>

              <p className="mt-3 text-center text-xs leading-5 text-slate-500">
                Secure checkout powered by SSLCommerz. Pay with bKash, Nagad,
                card, or bank — your subscription is activated automatically as
                soon as the payment is confirmed.
              </p>

              <ol className="mt-6 space-y-3 rounded-2xl border border-slate-800 bg-slate-950/60 p-5 text-sm text-slate-300">
                {[
                  "Sign in to your business account, or create one if you are new.",
                  "Open Subscription and choose the plan that suits you.",
                  "Complete the secure SSLCommerz checkout page.",
                  "Your access continues immediately — no waiting for approval.",
                ].map((step, index) => (
                  <li key={step} className="flex gap-3">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-xs font-semibold text-emerald-400">
                      {index + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>

              <p className="mt-6 border-t border-slate-800 pt-6 text-center text-xs leading-5 text-slate-500">
                We never ask for your bKash PIN, card password, or one-time
                password — payment details are entered only on the SSLCommerz
                checkout page. Refund and cancellation terms are in our{" "}
                <Link
                  href="/return-refund-policy"
                  className="text-slate-400 underline-offset-2 hover:text-slate-200 hover:underline"
                >
                  Return &amp; Refund Policy
                </Link>
                .
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
