"use client";

import { FormEvent, Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
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
  PhoneIcon,
  ShieldCheckIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import { businessApi } from "@/lib/business-api";
import { storeBusinessSession } from "@/lib/session";
import { useIsMounted, useStoredSession } from "@/lib/use-session";
import { OtpInput } from "./OtpInput";

type Step = "details" | "verify" | "done";

type RegisterResponse = {
  success: boolean;
  message?: string;
};

type VerifyResponse = {
  success: boolean;
  message?: string;
};

type WebLoginResponse = {
  success: boolean;
  message?: string;
  data?: {
    next: "otp" | "dashboard";
    userType: "system" | "business";
    user?: { _id: string; email: string; fullName?: string };
    tokens?: { accessToken: string; refreshToken: string };
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
    title: "Role-based access",
    description: "One secure workspace for you and your team members.",
  },
];

function getErrorMessage(err: unknown, fallback: string) {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as { message?: string } | undefined;
    if (data?.message) return data.message;
    if (err.response?.status === 429) {
      return "Too many attempts. Please wait a few minutes and try again.";
    }
  }
  return err instanceof Error ? err.message : fallback;
}

/**
 * Only paths inside the business area are honoured, so ?next= cannot be used
 * to redirect off-site. Mirrors the guard on the sign-in form.
 */
function getBusinessRedirect(search: string) {
  const next = new URLSearchParams(search).get("next");
  return next && next.startsWith("/business") ? next : "/business";
}

// Matches the backend registerValidation rules (routes/auth.js).
const PASSWORD_RULES = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;

const inputClassName =
  "w-full rounded-xl border border-slate-700/80 bg-slate-950/60 py-3 pl-11 pr-4 text-sm text-slate-50 outline-none transition placeholder:text-slate-600 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/25";

const passwordInputClassName =
  "w-full rounded-xl border border-slate-700/80 bg-slate-950/60 py-3 pl-11 pr-12 text-sm text-slate-50 outline-none transition placeholder:text-slate-600 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/25";

function RegisterFormInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const session = useStoredSession();
  const mounted = useIsMounted();
  const [step, setStep] = useState<Step>("details");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  const nextParam = searchParams.toString();
  const loginHref = nextParam ? `/login?${nextParam}` : "/login";

  // Already signed in? Skip the registration form.
  useEffect(() => {
    if (!session) return;
    router.replace(
      session.kind === "business"
        ? getBusinessRedirect(searchParams.toString())
        : "/admin",
    );
  }, [session, router, searchParams]);

  useEffect(() => {
    if (resendCooldown <= 0) return;

    const timer = setTimeout(() => {
      setResendCooldown((seconds) => Math.max(0, seconds - 1));
    }, 1000);

    return () => clearTimeout(timer);
  }, [resendCooldown]);

  async function handleRegister(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!PASSWORD_RULES.test(password)) {
      setError(
        "Password must be at least 8 characters with an uppercase letter, a lowercase letter and a number.",
      );
      return;
    }

    if (password !== confirmPassword) {
      setError("Password and confirmation do not match.");
      return;
    }

    setLoading(true);

    try {
      const { data } = await businessApi.post<RegisterResponse>(
        "/auth/register",
        {
          email,
          password,
          fullName: fullName.trim(),
          phone: phone.trim() || undefined,
        },
      );

      if (!data.success) {
        throw new Error(data.message || "Registration failed");
      }

      setStep("verify");
      setCode("");
      setSuccessMessage(
        data.message ||
          "Account created. A 6-digit verification code has been sent to your email.",
      );
      setResendCooldown(60);
    } catch (err) {
      setError(getErrorMessage(err, "Registration failed. Please try again."));
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      const { data } = await businessApi.post<VerifyResponse>(
        "/auth/verify-email",
        { code },
      );

      if (!data.success) {
        throw new Error(data.message || "Verification failed");
      }

      // Verification activates the account (and starts the free trial), so
      // sign the new business user straight in with the credentials they just
      // chose. A registration-only token would be rejected until activation.
      const { data: loginData } = await businessApi.post<WebLoginResponse>(
        "/auth/web-login",
        { email, password },
      );

      const payload = loginData.data;

      if (!loginData.success || !payload || payload.next !== "dashboard") {
        setStep("done");
        return;
      }

      if (payload.tokens) {
        storeBusinessSession(payload.tokens, payload.user);
        router.push(getBusinessRedirect(searchParams.toString()));
        return;
      }

      setStep("done");
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          "Verification succeeded. Please sign in to continue.",
        ),
      );
      setStep("done");
    } finally {
      setLoading(false);
    }
  }

  async function handleResendCode() {
    setError(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      await businessApi.post("/auth/verify-email/resend", { email });
      setSuccessMessage("A new verification code has been sent to your email.");
      setResendCooldown(60);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to resend the verification code."));
    } finally {
      setLoading(false);
    }
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
              Start your business
              <span className="mt-2 block bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                workspace today.
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
                Every new account starts with a free trial. Verify your email
                and your trial begins automatically.
              </p>
            </div>
          </section>

          {/* Registration card */}
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

              <div className="mt-6">
                <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-emerald-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  {step === "verify"
                    ? "Confirm your email"
                    : step === "done"
                      ? "Account ready"
                      : "Create Business account"}
                </div>
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

              {step === "details" && (
                <form onSubmit={handleRegister} className="mt-6 space-y-4">
                  <div>
                    <label
                      htmlFor="fullName"
                      className="mb-2 block text-sm font-medium text-slate-300"
                    >
                      Business / owner name
                    </label>
                    <div className="relative">
                      <UserIcon className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                      <input
                        id="fullName"
                        type="text"
                        autoComplete="name"
                        placeholder="Acme Traders"
                        value={fullName}
                        onChange={(event) => setFullName(event.target.value)}
                        minLength={2}
                        required
                        className={inputClassName}
                      />
                    </div>
                  </div>

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

                  <div>
                    <label
                      htmlFor="phone"
                      className="mb-2 block text-sm font-medium text-slate-300"
                    >
                      Phone number{" "}
                      <span className="text-xs font-normal text-slate-500">
                        (optional, used for payments)
                      </span>
                    </label>
                    <div className="relative">
                      <PhoneIcon className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                      <input
                        id="phone"
                        type="tel"
                        autoComplete="tel"
                        placeholder="01XXXXXXXXX"
                        value={phone}
                        onChange={(event) => setPhone(event.target.value)}
                        className={inputClassName}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="mb-2 flex items-baseline justify-between gap-3">
                      <label
                        htmlFor="password"
                        className="block text-sm font-medium text-slate-300"
                      >
                        Password
                      </label>
                      <span className="text-right text-[11px] leading-4 text-slate-500">
                        8+ chars, upper, lower &amp; number
                      </span>
                    </div>
                    <div className="relative">
                      <LockClosedIcon className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                      <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="new-password"
                        placeholder="At least 8 characters"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        minLength={8}
                        required
                        className={passwordInputClassName}
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

                  <div>
                    <label
                      htmlFor="confirmPassword"
                      className="mb-2 block text-sm font-medium text-slate-300"
                    >
                      Confirm password
                    </label>
                    <div className="relative">
                      <LockClosedIcon className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                      <input
                        id="confirmPassword"
                        type="password"
                        autoComplete="new-password"
                        placeholder="Repeat the password"
                        value={confirmPassword}
                        onChange={(event) =>
                          setConfirmPassword(event.target.value)
                        }
                        minLength={8}
                        required
                        className={inputClassName}
                      />
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
                        Creating account...
                      </>
                    ) : (
                      <>
                        Create account
                        <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                      </>
                    )}
                  </button>
                </form>
              )}

              {step === "verify" && (
                <form onSubmit={handleVerify} className="mt-6 space-y-5">
                  <OtpInput
                    value={code}
                    onChange={setCode}
                    disabled={loading}
                  />

                  <button
                    type="submit"
                    disabled={loading || code.length !== 6}
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
                      onClick={() => {
                        setStep("details");
                        setError(null);
                        setSuccessMessage(null);
                        setCode("");
                        setResendCooldown(0);
                      }}
                      className="text-slate-400 transition hover:text-slate-200"
                    >
                      ← Back
                    </button>
                    <button
                      type="button"
                      onClick={handleResendCode}
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

              {step === "done" && (
                <div className="mt-6 space-y-5">
                  <div className="flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-200">
                    <CheckCircleIcon className="h-6 w-6 shrink-0 text-emerald-400" />
                    <span>
                      Email verified and trial started. Sign in to open your
                      dashboard.
                    </span>
                  </div>
                  <Link
                    href={loginHref}
                    className="flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-4 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/20 transition hover:from-emerald-400 hover:to-cyan-400"
                  >
                    Go to sign in
                  </Link>
                </div>
              )}

              <div className="mt-6 flex items-center gap-3 text-[11px] text-slate-500">
                <span className="h-px flex-1 bg-slate-800" />
                <span className="flex items-center gap-1.5">
                  <ShieldCheckIcon className="h-3.5 w-3.5 text-emerald-500" />
                  Encrypted and monitored
                </span>
                <span className="h-px flex-1 bg-slate-800" />
              </div>

              {step === "details" && (
                <p className="mt-4 text-center text-xs leading-5 text-slate-500">
                  By creating an account you agree to our{" "}
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
              )}
            </div>

            {step !== "done" && (
              <p className="mt-5 text-center text-xs text-slate-600">
                {step === "details"
                  ? "Already have an account?"
                  : "Waited too long or wrong email?"}{" "}
                <Link
                  href={loginHref}
                  className="font-medium text-slate-400 transition hover:text-emerald-400"
                >
                  {step === "details" ? "Sign in" : "Back to sign in"}
                </Link>
              </p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

export function RegisterForm() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-slate-950">
          <div className="flex flex-col items-center gap-3 text-sm text-slate-400">
            <span className="h-8 w-8 animate-spin rounded-full border-2 border-slate-700 border-t-emerald-400" />
            Loading...
          </div>
        </div>
      }
    >
      <RegisterFormInner />
    </Suspense>
  );
}
