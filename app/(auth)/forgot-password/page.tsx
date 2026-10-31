"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import axios from "axios";
import {
  BoltIcon,
  CheckCircleIcon,
  EnvelopeIcon,
  ExclamationCircleIcon,
  LockClosedIcon,
} from "@heroicons/react/24/outline";
import { OtpInput } from "@/components/auth/OtpInput";
import { businessApi } from "@/lib/business-api";

type Step = "email" | "reset" | "done";

function getErrorMessage(err: unknown, fallback: string) {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as { message?: string } | undefined;
    if (data?.message) return data.message;
    if (err.response?.status === 429) {
      return "Too many attempts. Please wait a while and try again.";
    }
  }
  return err instanceof Error ? err.message : fallback;
}

const inputClassName =
  "w-full rounded-xl border border-slate-700/80 bg-slate-950/60 py-3 pl-11 pr-4 text-sm text-slate-50 outline-none transition placeholder:text-slate-600 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/25";

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function requestCode(event?: FormEvent) {
    event?.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await businessApi.post("/auth/forgot-password", { email });
      setStep("reset");
      setCode("");
    } catch (err) {
      setError(
        getErrorMessage(err, "Could not send the reset code. Please try again."),
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleReset(event: FormEvent) {
    event.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("New password and confirmation do not match.");
      return;
    }

    setLoading(true);

    try {
      await businessApi.post("/auth/forgot-password/reset", {
        email,
        code,
        password,
      });
      setStep("done");
    } catch (err) {
      setError(
        getErrorMessage(err, "Could not reset your password. Please try again."),
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -left-40 -top-40 h-[32rem] w-[32rem] rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute -right-40 top-1/3 h-[32rem] w-[32rem] rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(148,163,184,0.07)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.07)_1px,transparent_1px)] bg-[size:56px_56px]" />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/20 via-slate-950/60 to-slate-950" />
      </div>

      <div className="relative mx-auto flex min-h-screen w-full max-w-md items-center px-4 py-10 sm:px-6">
        <div className="w-full rounded-3xl border border-slate-800/80 bg-slate-900/70 p-6 shadow-2xl shadow-black/40 backdrop-blur-xl sm:p-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 text-slate-950">
              <BoltIcon className="h-4 w-4" />
            </span>
            <span className="text-sm font-semibold text-slate-100">
              Invoice SaaS
            </span>
          </Link>

          <div className="mt-6">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Account recovery
            </div>
            <h1 className="mt-3 text-2xl font-semibold tracking-tight text-slate-50">
              {step === "done" ? "Password reset" : "Reset your password"}
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              {step === "email"
                ? "Enter the email for your business or system admin account. We will send a 6-digit reset code."
                : step === "reset"
                  ? `Enter the code sent to ${email} and choose a new password.`
                  : "Your password has been updated. Sign in with your new password."}
            </p>
          </div>

          {error && (
            <div
              role="alert"
              className="mt-5 flex gap-3 rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-sm text-rose-200"
            >
              <ExclamationCircleIcon className="mt-0.5 h-5 w-5 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {step === "email" && (
            <form onSubmit={requestCode} className="mt-6 space-y-5">
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-slate-300"
                >
                  Email address
                </label>
                <div className="relative">
                  <EnvelopeIcon className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                    className={inputClassName}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-4 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/20 transition hover:from-emerald-400 hover:to-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Sending code..." : "Send reset code"}
              </button>
            </form>
          )}

          {step === "reset" && (
            <form onSubmit={handleReset} className="mt-6 space-y-5">
              <div>
                <span className="mb-2 block text-sm font-medium text-slate-300">
                  Reset code
                </span>
                <OtpInput value={code} onChange={setCode} disabled={loading} />
              </div>

              <label className="block text-sm font-medium text-slate-300">
                New password
                <div className="relative mt-2">
                  <LockClosedIcon className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                  <input
                    type="password"
                    autoComplete="new-password"
                    placeholder="At least 8 characters"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    minLength={8}
                    required
                    className={inputClassName}
                  />
                </div>
              </label>

              <label className="block text-sm font-medium text-slate-300">
                Confirm new password
                <div className="relative mt-2">
                  <LockClosedIcon className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                  <input
                    type="password"
                    autoComplete="new-password"
                    placeholder="Repeat the new password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    minLength={8}
                    required
                    className={inputClassName}
                  />
                </div>
              </label>

              <p className="text-xs text-slate-500">
                At least 8 characters with an uppercase letter, a lowercase
                letter and a number.
              </p>

              <button
                type="submit"
                disabled={loading || code.length !== 6}
                className="flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-4 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/20 transition hover:from-emerald-400 hover:to-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Resetting..." : "Reset password"}
              </button>

              <div className="flex items-center justify-between text-sm">
                <button
                  type="button"
                  onClick={() => {
                    setStep("email");
                    setError(null);
                  }}
                  className="text-slate-400 transition hover:text-slate-200"
                >
                  ← Change email
                </button>
                <button
                  type="button"
                  onClick={() => requestCode()}
                  disabled={loading}
                  className="font-medium text-emerald-400 transition hover:text-emerald-300 disabled:cursor-not-allowed disabled:text-slate-500"
                >
                  Resend code
                </button>
              </div>
            </form>
          )}

          {step === "done" && (
            <div className="mt-6 space-y-5">
              <div className="flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-200">
                <CheckCircleIcon className="h-6 w-6 shrink-0 text-emerald-400" />
                <span>
                  Password reset successful. You can now sign in with your new
                  password.
                </span>
              </div>
              <Link
                href="/login"
                className="flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-4 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/20 transition hover:from-emerald-400 hover:to-cyan-400"
              >
                Back to sign in
              </Link>
            </div>
          )}

          {step !== "done" && (
            <p className="mt-6 text-center text-xs text-slate-500">
              Remembered it?{" "}
              <Link
                href="/login"
                className="font-medium text-slate-400 transition hover:text-emerald-400"
              >
                Back to sign in
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
