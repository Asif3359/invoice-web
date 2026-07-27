import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-slate-950">
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-slate-100">Features</h1>
        <p className="mt-4 text-slate-400">
          Explore the powerful features of Invoice SaaS.
        </p>
        {/* Detailed feature content can be added here */}
        <div className="mt-8 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-6">
            <h3 className="font-semibold text-slate-100">Professional Invoicing</h3>
            <p className="mt-2 text-sm text-slate-400">
              Create beautiful invoices, auto-calculate taxes, and send them in seconds.
            </p>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-6">
            <h3 className="font-semibold text-slate-100">Multi-User Access</h3>
            <p className="mt-2 text-sm text-slate-400">
              Add sub-users with granular permissions for your team.
            </p>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-6">
            <h3 className="font-semibold text-slate-100">Inventory Management</h3>
            <p className="mt-2 text-sm text-slate-400">
              Track stock across multiple warehouses and set low-stock alerts.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}