import Link from "next/link";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-slate-950 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center">
          <h1 className="text-4xl font-bold text-slate-100 sm:text-6xl lg:text-7xl">
            Simple, powerful{" "}
            <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              invoicing
            </span>{" "}
            for everyone
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-slate-400">
            Invoice SaaS helps you create, send, and track invoices, manage
            inventory, and handle payments – all in one place.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/admin-login"
              className="rounded-md bg-emerald-600 px-6 py-3 text-sm font-medium text-white transition hover:bg-emerald-500"
            >
              Get Started
            </Link>
            <Link
              href="#features"
              className="rounded-md border border-slate-700 px-6 py-3 text-sm font-medium text-slate-300 transition hover:border-slate-500 hover:text-slate-100"
            >
              Learn More
            </Link>
          </div>
          <div className="mt-16 flex flex-wrap items-center justify-center gap-8 text-sm text-slate-500">
            <span className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
              10,000+ businesses trust us
            </span>
            <span className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
              24/7 support
            </span>
            <span className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
              Free 14-day trial
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}