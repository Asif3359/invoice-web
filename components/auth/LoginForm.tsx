"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import {
  ArrowRightIcon,
  BanknotesIcon,
  BoltIcon,
  CheckCircleIcon,
  CubeIcon,
  EnvelopeIcon,
  ExclamationCircleIcon,
  EyeIcon,
  EyeSlashIcon,
  LockClosedIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";
import { api } from "@/lib/api-client";
import { businessApi } from "@/lib/business-api";
import { storeAdminSession, storeBusinessSession } from "@/lib/session";
import { useIsMounted, useStoredSession } from "@/lib/use-session";
import { OtpInput } from "./OtpInput";

type WebLoginResponse = {
  success: boolean;
  message?: string;
  data?: {
    next: "otp" | "dashboard";
    userType: "system" | "business";
    email?: string;
    user?: {
      _id: string;
      email: string;
      fullName?: string;
    };
    tokens?: {
      accessToken: string;
      refreshToken: string;
    };
  };
};

type VerifyOtpResponse = {
  success: boolean;
  message?: string;
  data?: {
    user: {
      _id: string;
      email: string;
      fullName?: string;
      role: string;
      isActive: boolean;
      lastLoginAt?: string;
    };
    tokens: {
      accessToken: string;
      refreshToken: string;
    };
  };
};

const highlights = [
  {
    icon: BanknotesIcon,
    title: "Invoices and payments",
    description: "Send invoices and keep every payment and balance in view.",
  },
  {
    icon: CubeIcon,
    title: "Inventory and expenses",
    description: "Know what you own, what you spent, and what is due next.",
  },
  {
    icon: ShieldCheckIcon,
    title: "Secure by default",
    description: "Role-based access with one-time codes for administrators.",
  },
];

/**
 * Business sign-in can be sent to a specific in-app page (for example
 * /login?next=/business/subscription from the pricing page). Only paths inside
 * the business area are honoured, so the parameter cannot redirect off-site.
 */
function getBusinessRedirect(search: string) {
  const next = new URLSearchParams(search).get("next");
  return next && next.startsWith("/business") ? next : "/business";
}

function currentSearch() {
  return typeof window === "undefined" ? "" : window.location.search;
}

function getErrorMessage(err: unknown, fallback: string) {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as { message?: string } | undefined;
    if (data?.message) return data.message;
    if (err.response?.status === 429) {
      return "Too many login attempts. Please wait a few minutes and try again.";
    }
  }
  return err instanceof Error ? err.message : fallback;
}

export function LoginForm() {
  const router = useRouter();
  const session = useStoredSession();
  const mounted = useIsMounted();
  const [step, setStep] = useState<"credentials" | "otp">("credentials");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [verifiedEmail, setVerifiedEmail] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);

  const search = currentSearch();
  const registerHref = search ? `/register${search}` : "/register";

  // Already signed in? Skip the login form.
  useEffect(() => {
    if (!session) return;
    router.replace(
      session.kind === "business"
        ? getBusinessRedirect(currentSearch())
        : "/admin",
    );
  }, [session, router]);

  useEffect(() => {
    if (resendCooldown <= 0) return;

    const timer = setTimeout(() => {
      setResendCooldown((seconds) => Math.max(0, seconds - 1));
    }, 1000);

    return () => clearTimeout(timer);
  }, [resendCooldown]);

  // Password reset/change flows redirect here with a notice.
  useEffect(() => {
    if (typeof window === "undefined") return;

    const notice = new URLSearchParams(window.location.search).get("notice");
    if (notice === "password-changed") {
      setSuccessMessage(
        "Password changed successfully. Please sign in with your new password.",
      );
    } else if (notice === "password-reset") {
      setSuccessMessage(
        "Password reset successfully. Please sign in with your new password.",
      );
    }
  }, []);

  async function handleCredentialsSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      const { data } = await businessApi.post<WebLoginResponse>(
        "/auth/web-login",
        {
          email,
          password,
        },
      );

      const payload = data.data;

      if (!data.success || !payload) {
        throw new Error(data.message || "Login failed");
      }

      if (payload.next === "otp") {
        setVerifiedEmail(payload.email || email);
        setStep("otp");
        setOtp("");
        setResendCooldown(60);
        setSuccessMessage(
          data.message || "A one-time code has been sent to your email.",
        );
        return;
      }

      if (payload.next === "dashboard" && payload.tokens) {
        storeBusinessSession(payload.tokens, payload.user);
        router.push(getBusinessRedirect(currentSearch()));
        return;
      }

      throw new Error("Unexpected login response. Please try again.");
    } catch (err) {
      setError(getErrorMessage(err, "Login failed. Please try again."));
    } finally {
      setLoading(false);
    }
  }

  async function handleOtpSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      const { data } = await api.post<VerifyOtpResponse>(
        "/admin/auth/verify-otp",
        {
          email: verifiedEmail,
          otp,
        },
      );

      if (!data.success || !data.data?.tokens) {
        throw new Error(data.message || "OTP verification failed");
      }

      storeAdminSession(data.data.tokens, data.data.user);
      router.push("/admin");
    } catch (err) {
      setError(
        getErrorMessage(err, "OTP verification failed. Please try again."),
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleResendOtp() {
    setError(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      const { data } = await api.post("/admin/auth/resend-otp", {
        email: verifiedEmail,
      });
      setSuccessMessage(data.message || "A new one-time code has been sent.");
      setResendCooldown(60);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to resend the one-time code."));
    } finally {
      setLoading(false);
    }
  }

  function handleBackToCredentials() {
    setStep("credentials");
    setError(null);
    setSuccessMessage(null);
    setOtp("");
    setResendCooldown(0);
  }

  if (!mounted || session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-3 text-sm text-slate-400">
          <span className="h-8 w-8 animate-spin rounded-full border-2 border-slate-700 border-t-emerald-400" />
          Checking your session...
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950">
      {/* Ambient background */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -left-40 -top-40 h-[32rem] w-[32rem] rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute -right-40 top-1/3 h-[32rem] w-[32rem] rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(148,163,184,0.07)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.07)_1px,transparent_1px)] bg-[size:56px_56px]" />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/20 via-slate-950/60 to-slate-950" />
      </div>

      <div className="relative mx-auto flex min-h-screen w-full max-w-6xl items-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid w-full gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          {/* Brand / value proposition */}
          <section className="hidden lg:block">
            <Link href="/" className="inline-flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-cyan-500 text-slate-950 shadow-lg shadow-emerald-500/20">
                <BoltIcon className="h-5 w-5" />
              </span>
              <span className="text-lg font-semibold tracking-tight text-slate-100">
                Invoice <span className="text-emerald-400">SaaS</span>
              </span>
            </Link>

            <h1 className="mt-12 max-w-xl text-4xl font-bold tracking-tight text-slate-50 sm:text-5xl">
              Run your business.
              <span className="mt-2 block bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                We handle the invoices.
              </span>
            </h1>
            <p className="mt-5 max-w-md text-base leading-7 text-slate-400">
              One secure workspace for invoicing, payments, expenses, and
              inventory. Built for business owners and their teams.
            </p>

            <div className="mt-10 space-y-5">
              {highlights.map((item) => (
                <div key={item.title} className="flex gap-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-800 bg-slate-900/70 text-emerald-400">
                    <item.icon className="h-5 w-5" />
                  </span>
                  <div>
                    <h2 className="text-sm font-semibold text-slate-100">
                      {item.title}
                    </h2>
                    <p className="mt-1 text-sm text-slate-400">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10 flex items-start gap-3 rounded-2xl border border-slate-800/80 bg-slate-900/50 p-4 backdrop-blur">
              <ShieldCheckIcon className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
              <p className="text-sm leading-6 text-slate-400">
                Protected with encrypted connections, role-based access, and
                one-time codes for system administrators.
              </p>
            </div>
          </section>

          {/* Login card */}
          <section className="mx-auto w-full max-w-md">
            <div className="rounded-3xl border border-slate-800/80 bg-slate-900/70 p-6 shadow-2xl shadow-black/40 backdrop-blur-xl sm:p-8">
              <div className="flex items-center justify-between lg:hidden">
                <Link href="/" className="inline-flex items-center gap-2">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 text-slate-950">
                    <BoltIcon className="h-4 w-4" />
                  </span>
                  <span className="text-sm font-semibold text-slate-100">
                    Invoice SaaS
                  </span>
                </Link>
                <Link
                  href="/"
                  className="text-xs text-slate-400 transition hover:text-slate-200"
                >
                  Back to home
                </Link>
              </div>

              <div className="mt-6 lg:mt-0">
                <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-emerald-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  {step === "otp" ? "Two-step verification" : "Secure sign in"}
                </div>
                <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-50">
                  {step === "otp" ? "Check your email" : "Welcome back"}
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  {step === "otp"
                    ? `We sent a 6-digit code to ${verifiedEmail}. Enter it below to continue.`
                    : "Sign in with your email and password. System administrators will be asked for a one-time code."}
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
              {successMessage && (
                <div
                  role="status"
                  className="mt-5 flex gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm text-emerald-200"
                >
                  <CheckCircleIcon className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
                  <span>{successMessage}</span>
                </div>
              )}

              {step === "credentials" ? (
                <form
                  onSubmit={handleCredentialsSubmit}
                  className="mt-6 space-y-5"
                >
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
                        className="w-full rounded-xl border border-slate-700/80 bg-slate-950/60 py-3 pl-11 pr-4 text-sm text-slate-50 outline-none transition placeholder:text-slate-600 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/25"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <label
                        htmlFor="password"
                        className="block text-sm font-medium text-slate-300"
                      >
                        Password
                      </label>
                      <Link
                        href="/forgot-password"
                        className="text-xs text-slate-500 transition hover:text-emerald-400"
                      >
                        Forgot password?
                      </Link>
                    </div>
                    <div className="relative">
                      <LockClosedIcon className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                      <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="current-password"
                        placeholder="Enter your password"
                        className="w-full rounded-xl border border-slate-700/80 bg-slate-950/60 py-3 pl-11 pr-12 text-sm text-slate-50 outline-none transition placeholder:text-slate-600 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/25"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((visible) => !visible)}
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-500 transition hover:bg-slate-800 hover:text-slate-300"
                      >
                        {showPassword ? (
                          <EyeSlashIcon className="h-5 w-5" />
                        ) : (
                          <EyeIcon className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-4 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/20 transition hover:from-emerald-400 hover:to-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-950/30 border-t-slate-950" />
                        Signing in...
                      </>
                    ) : (
                      <>
                        Sign in
                        <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleOtpSubmit} className="mt-6 space-y-5">
                  <OtpInput value={otp} onChange={setOtp} disabled={loading} />

                  <button
                    type="submit"
                    disabled={loading || otp.length !== 6}
                    className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-4 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/20 transition hover:from-emerald-400 hover:to-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-950/30 border-t-slate-950" />
                        Verifying...
                      </>
                    ) : (
                      <>
                        Verify and continue
                        <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                      </>
                    )}
                  </button>

                  <div className="flex items-center justify-between text-sm">
                    <button
                      type="button"
                      onClick={handleBackToCredentials}
                      className="text-slate-400 transition hover:text-slate-200"
                    >
                      ← Back
                    </button>
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={loading || resendCooldown > 0}
                      className="font-medium text-emerald-400 transition hover:text-emerald-300 disabled:cursor-not-allowed disabled:text-slate-500"
                    >
                      {resendCooldown > 0
                        ? `Resend in ${resendCooldown}s`
                        : "Resend code"}
                    </button>
                  </div>
                </form>
              )}

              <div className="mt-6 flex items-center gap-3 text-[11px] text-slate-500">
                <span className="h-px flex-1 bg-slate-800" />
                <span className="flex items-center gap-1.5">
                  <ShieldCheckIcon className="h-3.5 w-3.5 text-emerald-500" />
                  Encrypted and monitored
                </span>
                <span className="h-px flex-1 bg-slate-800" />
              </div>

              <p className="mt-4 text-center text-xs leading-5 text-slate-500">
                By signing in you agree to our{" "}
                <Link
                  href="/data-security-policy"
                  className="text-slate-400 underline-offset-2 transition hover:text-slate-200 hover:underline"
                >
                  Data Security Policy
                </Link>{" "}
                and{" "}
                <Link
                  href="/return-refund-policy"
                  className="text-slate-400 underline-offset-2 transition hover:text-slate-200 hover:underline"
                >
                  Return &amp; Refund Policy
                </Link>
                .
              </p>
            </div>

            <p className="mt-5 text-center text-xs text-slate-600">
              {step === "credentials" ? (
                <>
                  Don&apos;t have an account?{" "}
                  <Link
                    href={registerHref}
                    className="font-medium text-slate-400 transition hover:text-emerald-400"
                  >
                    Register your business
                  </Link>
                </>
              ) : (
                <>
                  Wrong account?{" "}
                  <Link
                    href="/login"
                    className="font-medium text-slate-400 transition hover:text-emerald-400"
                  >
                    Start sign in again
                  </Link>
                </>
              )}
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
