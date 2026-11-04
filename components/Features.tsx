import { CheckIcon } from "@heroicons/react/24/outline";
import { Reveal } from "@/components/marketing/Reveal";

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
    <section
      id="features"
      className="scroll-mt-16 border-t border-border bg-muted/40 py-16 sm:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="text-center">
            <h2 className="text-balance text-3xl font-bold text-foreground sm:text-4xl">
              Everything you need to run your business
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-pretty text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
              Powerful features designed for modern business owners
            </p>
          </div>
        </Reveal>
        <div className="mt-10 grid grid-cols-1 gap-5 sm:mt-12 md:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {features.map((feature, index) => (
            <Reveal key={feature.title} className="h-full" delay={index * 80}>
              <div className="flex h-full items-start gap-4 rounded-xl border border-border bg-card p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-primary/40 hover:shadow-md sm:p-6">
                <div className="shrink-0 rounded-full bg-secondary p-2">
                  <CheckIcon className="size-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-foreground">
                    {feature.title}
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
