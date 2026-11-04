import type { ReactNode } from "react";
import Link from "next/link";
import { BoltIcon } from "@heroicons/react/24/outline";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function AuthLogo({ compact = false }: { compact?: boolean }) {
  return (
    <span className="flex items-center gap-2">
      <span
        className={cn(
          "flex items-center justify-center rounded-xl bg-primary text-primary-foreground",
          compact ? "size-9" : "size-11 rounded-2xl",
        )}
      >
        <BoltIcon className={compact ? "size-4" : "size-5"} />
      </span>
      <span
        className={cn(
          "font-semibold tracking-tight text-foreground",
          compact ? "text-sm" : "text-lg",
        )}
      >
        <span className="font-bold text-primary">Invento</span>{" "}
        <span className="font-light text-muted-foreground">manager</span>
      </span>
    </span>
  );
}

export function Spinner() {
  return (
    <span className="size-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
  );
}

export function AuthSplash({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-3 text-sm text-muted-foreground">
        <span className="size-8 animate-spin rounded-full border-2 border-border border-t-primary" />
        {label}
      </div>
    </div>
  );
}

/**
 * Shared surface for sign in, registration, account recovery and the payment
 * result pages. `brand` renders the desktop-only value column; without it the
 * card is centred in a single column.
 */
export function AuthShell({
  brand,
  eyebrow,
  title,
  description,
  align = "start",
  children,
  footer,
  panelClassName,
}: {
  brand?: ReactNode;
  eyebrow?: ReactNode;
  title?: ReactNode;
  description?: ReactNode;
  align?: "start" | "center";
  children: ReactNode;
  footer?: ReactNode;
  panelClassName?: string;
}) {
  const Heading = brand ? "h2" : "h1";
  const hasHeader = Boolean(title || description || eyebrow);

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 -top-24 h-[18rem] w-[18rem] rounded-full bg-blue-500/10 blur-3xl sm:-left-40 sm:-top-40 sm:h-[32rem] sm:w-[32rem]" />
        <div className="absolute -right-24 top-1/3 h-[18rem] w-[18rem] rounded-full bg-sky-400/10 blur-3xl sm:-right-40 sm:h-[32rem] sm:w-[32rem]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(37,99,235,0.045)_1px,transparent_1px),linear-gradient(to_bottom,rgba(37,99,235,0.045)_1px,transparent_1px)] bg-[size:56px_56px]" />
      </div>

      <div
        className={cn(
          "relative mx-auto flex min-h-screen w-full items-center px-4 py-10 sm:px-6",
          brand ? "max-w-6xl lg:px-8" : "max-w-md",
        )}
      >
        <div
          className={cn(
            "w-full",
            brand && "grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center",
          )}
        >
          {brand && (
            <section className="hidden lg:block">
              <Link href="/" className="inline-flex">
                <AuthLogo />
              </Link>
              {brand}
            </section>
          )}

          <section
            className={cn("mx-auto w-full", !brand && "max-w-md", panelClassName)}
          >
            <Card className="gap-0 rounded-2xl p-6 shadow-lg sm:p-8">
              <div
                className={cn(
                  "flex items-center justify-between gap-3",
                  brand && "lg:hidden",
                )}
              >
                <Link href="/" className="inline-flex">
                  <AuthLogo compact />
                </Link>
                <Link
                  href="/"
                  className="text-xs text-muted-foreground transition hover:text-foreground"
                >
                  Back to home
                </Link>
              </div>

              {hasHeader && (
                <div
                  className={cn(
                    "mt-6",
                    align === "center" ? "text-center" : brand && "lg:mt-0"
                  )}
                >
                  {eyebrow && (
                    <p className="text-xs font-medium uppercase tracking-[0.2em] text-primary">
                      {eyebrow}
                    </p>
                  )}
                  {title && (
                    <Heading className="mt-3 text-2xl font-semibold tracking-tight text-foreground">
                      {title}
                    </Heading>
                  )}
                  {description && (
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {description}
                    </p>
                  )}
                </div>
              )}

              {children}
            </Card>

            {footer}
          </section>
        </div>
      </div>
    </div>
  );
}
