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
    <div className="min-h-screen bg-slate-950">
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-emerald-400">
          Legal
        </p>
        <h1 className="mt-2 text-3xl font-bold text-slate-100">{title}</h1>
        <p className="mt-2 text-sm text-slate-500">
          Last updated: {updatedAt}
        </p>
        <p className="mt-6 text-sm leading-7 text-slate-400">{description}</p>
        <div className="mt-10 space-y-10 text-sm leading-7 text-slate-300">
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
      <h2 className="text-lg font-semibold text-slate-100">{title}</h2>
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
