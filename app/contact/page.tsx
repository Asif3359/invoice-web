import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-slate-950">
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-slate-100">Contact Us</h1>
        <p className="mt-4 text-slate-400">
          We’d love to hear from you. Fill out the form below and we’ll get back to you.
        </p>
        <form className="mt-8 space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-slate-300">
              Name
            </label>
            <input
              type="text"
              id="name"
              className="mt-1 w-full rounded-md bg-slate-900/60 px-3 py-2 text-slate-100 ring-1 ring-slate-700 focus:ring-2 focus:ring-emerald-500"
              placeholder="Your name"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-300">
              Email
            </label>
            <input
              type="email"
              id="email"
              className="mt-1 w-full rounded-md bg-slate-900/60 px-3 py-2 text-slate-100 ring-1 ring-slate-700 focus:ring-2 focus:ring-emerald-500"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-slate-300">
              Message
            </label>
            <textarea
              id="message"
              rows={4}
              className="mt-1 w-full rounded-md bg-slate-900/60 px-3 py-2 text-slate-100 ring-1 ring-slate-700 focus:ring-2 focus:ring-emerald-500"
              placeholder="How can we help?"
            />
          </div>
          <button
            type="submit"
            className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500"
          >
            Send Message
          </button>
        </form>
      </main>
      <Footer />
    </div>
  );
}