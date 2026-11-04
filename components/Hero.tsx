import Link from "next/link";
import { CSSProperties } from "react";
import { CheckIcon } from "@heroicons/react/24/outline";
import { Typewriter } from "@/components/marketing/Typewriter";
import { Button } from "@/components/ui/button";
import { DashboardVisual } from "@/components/marketing/Visuals";

const trustPoints = [
  "10,000+ businesses trust us",
  "24/7 support",
  "Free 14-day trial",
];

const typedWords = [
  "invoicing",
  "inventory",
  "payments",
  "reports",
  "expenses",
];

export function Hero() {
  return (
    <section className="flex flex-1 items-center bg-background py-16 sm:py-24 lg:py-28">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
          <h1 className="text-balance text-4xl font-bold leading-tight text-foreground sm:text-5xl lg:text-6xl">
            <span className="headline-word inline-block">Simple,</span>{" "}
            <span
              className="headline-word inline-block"
              style={{ "--word-delay": "90ms" } as CSSProperties}
            >
              powerful
            </span>{" "}
            <span
              className="headline-word inline-block"
              style={{ "--word-delay": "180ms" } as CSSProperties}
            >
              <Typewriter
                words={typedWords}
                className="text-primary"
                startDelayMs={750}
              />
            </span>{" "}
            <span
              className="headline-word inline-block"
              style={{ "--word-delay": "270ms" } as CSSProperties}
            >
              for
            </span>{" "}
            <span
              className="headline-word inline-block"
              style={{ "--word-delay": "360ms" } as CSSProperties}
            >
              everyone
            </span>
          </h1>
          <p
            className="rise mt-6 max-w-2xl text-pretty text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8"
            style={{ "--rise-delay": "90ms" } as CSSProperties}
          >
            Invento Manager helps you create, send, and track invoices, manage
            inventory, and handle payments – all in one place.
          </p>
          <div
            className="rise mt-8 flex w-full flex-wrap items-center justify-center gap-3 sm:w-auto sm:gap-4"
            style={{ "--rise-delay": "180ms" } as CSSProperties}
          >
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link href="/register">Get Started</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="w-full sm:w-auto"
            >
              <Link href="#features">Learn More</Link>
            </Button>
          </div>

          <div
            className="rise mt-14 w-full max-w-4xl rounded-2xl border border-border bg-card p-2 shadow-lg sm:mt-16 sm:p-3"
            style={{ "--rise-delay": "260ms" } as CSSProperties}
          >
            <DashboardVisual />
          </div>

          <ul
            className="rise mt-10 flex flex-col items-start gap-3 text-sm text-muted-foreground sm:mt-12 sm:flex-row sm:flex-wrap sm:items-center sm:justify-center sm:gap-x-8 sm:gap-y-2"
            style={{ "--rise-delay": "340ms" } as CSSProperties}
          >
            {trustPoints.map((point) => (
              <li key={point} className="flex items-center gap-2">
                <CheckIcon className="size-4 shrink-0 text-primary" />
                {point}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
