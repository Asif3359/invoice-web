import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PricingCards } from "@/components/pricing/PricingCards";
import { Reveal } from "@/components/marketing/Reveal";

export function Pricing() {
  return (
    <section
      id="pricing"
      className="scroll-mt-16 border-t border-border bg-muted/40 py-16 sm:py-20 lg:py-24"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <Badge variant="secondary" className="px-3 py-1 text-xs font-medium">
              Simple &amp; affordable
            </Badge>
            <h2 className="mt-4 text-balance text-3xl font-bold text-foreground sm:text-4xl">
              One plan, everything included
            </h2>
            <p className="mt-4 text-pretty text-base leading-7 text-muted-foreground sm:text-lg">
              Invoices, clients, inventory, expenses, reports and team access —
              pay monthly or save on a longer term.
            </p>
          </div>
        </Reveal>

        <Reveal delay={120}>
          <PricingCards />
        </Reveal>

        <Reveal delay={200}>
          <div className="mt-12 flex flex-col items-center gap-4 text-center sm:flex-row sm:justify-between sm:text-left">
            <p className="text-sm text-muted-foreground">
              Pay securely with bKash, Nagad, card or bank through EPS.
            </p>
            <Button asChild variant="outline">
              <Link href="/pricing">See full plan details</Link>
            </Button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
