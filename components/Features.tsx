import { CheckIcon } from "@heroicons/react/24/outline";

const features = [
  {
    title: "Professional Invoicing",
    description:
      "Create and send beautiful, customizable invoices in seconds. Automatically calculate taxes, discounts, and totals.",
  },
  {
    title: "Multi-User Access",
    description:
      "Add sub-users with granular permissions. Your team can collaborate without compromising security.",
  },
  {
    title: "Inventory Management",
    description:
      "Track stock levels across multiple warehouses. Set low-stock alerts and manage transfers seamlessly.",
  },
  {
    title: "Cloud Sync & Backup",
    description:
      "Offline-first architecture with automatic cloud backup. Your data is always safe and accessible.",
  },
  {
    title: "Payment Tracking",
    description:
      "Record payments, track advances, and reconcile client balances with ease.",
  },
  {
    title: "Customizable Reports",
    description:
      "Generate profit/loss, sales, purchase, and expense reports. Export to Excel or PDF for accounting.",
  },
];

export function Features() {
  return (
    <section className="py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-slate-100 sm:text-4xl">
            Everything you need to run your business
          </h2>
          <p className="mt-4 text-lg text-slate-400">
            Powerful features designed for modern business owners
          </p>
        </div>
        <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-xl border border-slate-800 bg-slate-900/40 p-6 transition hover:border-emerald-500/30 hover:bg-slate-900/60"
            >
              <div className="flex items-start gap-4">
                <div className="rounded-full bg-emerald-500/10 p-2">
                  <CheckIcon className="h-5 w-5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-100">
                    {feature.title}
                  </h3>
                  <p className="mt-1 text-sm text-slate-400">
                    {feature.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}