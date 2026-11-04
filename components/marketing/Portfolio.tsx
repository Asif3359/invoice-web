import {
  InventoryVisual,
  InvoiceVisual,
  MobileVisual,
} from "@/components/marketing/Visuals";
import { Reveal } from "@/components/marketing/Reveal";

const work = [
  {
    title: "Invoices that get paid",
    description:
      "Build an invoice in seconds, send it on WhatsApp or email, and watch the balance settle.",
    Visual: InvoiceVisual,
  },
  {
    title: "Stock you can trust",
    description:
      "Warehouse quantities, transfers and low-stock alerts stay in step with every sale.",
    Visual: InventoryVisual,
  },
  {
    title: "Your business in your pocket",
    description:
      "The same workspace on the road — raise an invoice, check a payment, close the month.",
    Visual: MobileVisual,
  },
];

export function Portfolio() {
  return (
    <section
      id="work"
      className="scroll-mt-16 bg-background py-16 sm:py-20 lg:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">
              What you get
            </p>
            <h2 className="mt-3 text-balance text-3xl font-bold text-foreground sm:text-4xl">
              A calm workspace for the everyday running of your business
            </h2>
            <p className="mt-4 text-pretty text-base leading-7 text-muted-foreground sm:text-lg">
              No cluttered screens and no spreadsheets duct-taped together —
              just the numbers you actually look at.
            </p>
          </div>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3 lg:gap-8">
          {work.map(({ title, description, Visual }, index) => (
            <Reveal key={title} className="h-full" delay={index * 110}>
              <figure className="flex h-full flex-col gap-5 rounded-2xl border border-border bg-card p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-primary/40 hover:shadow-md sm:p-6">
                <div className="rounded-xl bg-muted/60 p-3">
                  <Visual />
                </div>
                <figcaption>
                  <h3 className="text-base font-semibold text-foreground">
                    {title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {description}
                  </p>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
