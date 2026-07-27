import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-slate-950">
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-slate-100">Pricing</h1>
        <p className="mt-4 text-slate-400">
          Choose the plan that fits your business.
        </p>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-6 text-center">
            <h3 className="text-lg font-semibold text-slate-100">Starter</h3>
            <p className="mt-2 text-3xl font-bold text-slate-50">$9</p>
            <p className="text-sm text-slate-400">per month</p>
            <ul className="mt-4 space-y-2 text-sm text-slate-400">
              <li>Up to 50 invoices/month</li>
              <li>5 clients</li>
              <li>Basic reports</li>
            </ul>
            <button className="mt-6 rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500">
              Get Started
            </button>
          </div>
          <div className="rounded-xl border-2 border-emerald-500 bg-slate-900/60 p-6 text-center">
            <h3 className="text-lg font-semibold text-slate-100">Professional</h3>
            <p className="mt-2 text-3xl font-bold text-slate-50">$29</p>
            <p className="text-sm text-slate-400">per month</p>
            <ul className="mt-4 space-y-2 text-sm text-slate-400">
              <li>Unlimited invoices</li>
              <li>Unlimited clients</li>
              <li>Inventory management</li>
              <li>Multi-user access</li>
            </ul>
            <button className="mt-6 rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500">
              Get Started
            </button>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-6 text-center">
            <h3 className="text-lg font-semibold text-slate-100">Enterprise</h3>
            <p className="mt-2 text-3xl font-bold text-slate-50">Custom</p>
            <p className="text-sm text-slate-400">contact us</p>
            <ul className="mt-4 space-y-2 text-sm text-slate-400">
              <li>All Professional features</li>
              <li>Dedicated support</li>
              <li>Custom integrations</li>
            </ul>
            <button className="mt-6 rounded-md border border-slate-700 px-4 py-2 text-sm font-medium text-slate-300 hover:border-slate-500 hover:text-slate-100">
              Contact Sales
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}