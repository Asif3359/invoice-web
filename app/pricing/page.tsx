"use client";

import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function PricingPage() {
  const [copied, setCopied] = useState<string | null>(null);

  const whatsappMessage = encodeURIComponent(
    "Hello, I want to subscribe to the Premium plan for ৳499/month. I would like to make the payment manually via bKash. Please provide me with the payment instructions.",
  );

  const whatsappUrl = `https://wa.me/8801971380583?text=${whatsappMessage}`;

  const copyNumber = async (number: string, type: string) => {
    try {
      await navigator.clipboard.writeText(number);
      setCopied(type);

      setTimeout(() => {
        setCopied(null);
      }, 2000);
    } catch (error) {
      console.error("Failed to copy number:", error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <Header />

      <main className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-4 inline-flex items-center rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-1.5 text-sm font-medium text-emerald-400">
            Simple & Affordable
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

              {/* bKash Payment */}
              <div className="mt-6 rounded-2xl border border-pink-500/20 bg-pink-500/5 p-6">
                <div className="text-center">
                  <p className="text-sm font-semibold text-pink-300">
                    Manual Payment via bKash
                  </p>

                  <p className="mt-2 text-xs text-slate-400">
                    Send ৳499 to the following bKash number
                  </p>

                  {/* bKash Number + Copy */}
                  <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-pink-500/20 bg-slate-950 px-4 py-3">
                    <div className="text-left">
                      <p className="text-2xl font-bold tracking-wider text-white">
                        01789846204
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        bKash Payment Number
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => copyNumber("01789846204", "bkash")}
                      className="shrink-0 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-medium text-slate-300 transition hover:border-slate-500 hover:text-white"
                    >
                      {copied === "bkash" ? "Copied!" : "Copy"}
                    </button>
                  </div>
                </div>
              </div>

              {/* WhatsApp CTA */}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-emerald-900/20 transition hover:bg-emerald-500 hover:shadow-emerald-900/30"
              >
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297.767.966.94 1.164.173.199.347.223.644.075.297-.15 1.255-.463 2.39-1.475.883-.788 1.48-1.761 1.653-2.059.173-.297.018-.458-.13-.606-.134-.133-.298-.347-.446-.52-.149-.174-.198-.298-.298-.497-.099-.198-.05-.372.025-.521.075-.149.669-1.611.916-2.206.242-.579-.487-.5-.67-.51-.173-.007-.372-.01-.57-.01-.198 0-.52.075-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.626.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982 1-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.986 2.894a9.825 9.825 0 012.893 6.994c-.002 5.45-4.437 9.888-9.885 9.888m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.89c0 2.096.547 4.142 1.588 5.945L.057 24l6.304-1.654a11.88 11.88 0 005.684 1.447h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.479-8.412" />
                </svg>
                Contact Us on WhatsApp
              </a>

              {/* WhatsApp Number + Copy */}
              <div className="mt-3 flex items-center justify-center gap-2">
                <p className="text-xs text-slate-500">
                  WhatsApp:{" "}
                  <span className="font-medium text-slate-400">
                    01971380583
                  </span>
                </p>

                <button
                  type="button"
                  onClick={() => copyNumber("01971380583", "whatsapp")}
                  className="rounded-md border border-slate-800 px-2 py-1 text-[11px] font-medium text-slate-500 transition hover:border-slate-600 hover:text-slate-300"
                >
                  {copied === "whatsapp" ? "Copied!" : "Copy"}
                </button>
              </div>

              {/* Instructions */}
              <div className="mt-8 border-t border-slate-800 pt-6 text-center">
                <p className="text-xs leading-5 text-slate-500">
                  After making the payment, contact us on WhatsApp with your
                  payment details. We'll help you activate your Premium plan.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
