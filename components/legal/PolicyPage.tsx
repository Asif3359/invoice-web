import type { ReactNode } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

interface PolicyPageProps {
  title: string;
  description: string;
  updatedAt: string;
  children: ReactNode;
}

export function PolicyPage({
  title,
  description,
  updatedAt,
  children,
}: PolicyPageProps) {
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <Header />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-16 sm:px-6 lg:px-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">
          Legal
        </p>
        <h1 className="mt-2 text-3xl font-bold text-foreground">{title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Last updated: {updatedAt}
        </p>
        <p className="mt-6 text-sm leading-7 text-muted-foreground">{description}</p>
        <div className="mt-10 space-y-10 text-sm leading-7 text-foreground/90">
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
}

interface PolicySectionProps {
  title: string;
  children: ReactNode;
}

export function PolicySection({ title, children }: PolicySectionProps) {
  return (
    <section>
      <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      <div className="mt-3 space-y-3">{children}</div>
    </section>
  );
}

export function PolicyList({ items }: { items: ReactNode[] }) {
  return (
    <ul className="list-disc space-y-1 pl-5">
      {items.map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </ul>
  );
}
