"use client";

import { FormEvent, Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import {
  ArrowRightIcon,
  BanknotesIcon,
  CubeIcon,
  EnvelopeIcon,
  EyeIcon,
  EyeSlashIcon,
  LockClosedIcon,
  PhoneIcon,
  ShieldCheckIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import { AuthShell, AuthSplash, Spinner } from "./AuthShell";
import { OtpInput } from "./OtpInput";
import { StatusAlert } from "@/components/status";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { businessApi } from "@/lib/business-api";
import { storeBusinessSession } from "@/lib/session";
import { useIsMounted, useStoredSession } from "@/lib/use-session";

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

const copy: Record<Step, { eyebrow: string; title: string; description: string }> = {
  details: {
    eyebrow: "Create Business account",
    title: "Create your workspace",
    description:
      "Tell us about your business. We will email a 6-digit code to confirm the address.",
  },
  verify: {
    eyebrow: "Confirm your email",
    title: "Check your inbox",
    description:
      "Enter the 6-digit verification code we sent to confirm your account and start the free trial.",
  },
  done: {
    eyebrow: "Account ready",
    title: "Verification complete",
    description:
      "Your email is confirmed and your free trial has started. Sign in to open your dashboard.",
  },
};

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
    return <AuthSplash label="Checking your session..." />;
  }

  return (
    <AuthShell
      eyebrow={copy[step].eyebrow}
      title={copy[step].title}
      description={copy[step].description}
      brand={
        <>
          <h1 className="mt-12 max-w-xl text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Start your business
            <span className="mt-2 block text-primary">
              workspace today.
            </span>
          </h1>
          <p className="mt-5 max-w-md text-base leading-7 text-muted-foreground">
            One secure workspace for invoicing, payments, expenses, and
            inventory. Built for business owners and their teams.
          </p>

          <div className="mt-10 space-y-5">
            {highlights.map((item) => (
              <div key={item.title} className="flex gap-4">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-border bg-muted text-primary">
                  <item.icon className="size-5" />
                </span>
                <div>
                  <h2 className="text-sm font-semibold text-foreground">
                    {item.title}
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 flex items-start gap-3 rounded-2xl border border-border bg-secondary p-4">
            <ShieldCheckIcon className="mt-0.5 size-5 shrink-0 text-primary" />
            <p className="text-sm leading-6 text-secondary-foreground">
              Every new account starts with a free trial. Verify your email
              and your trial begins automatically.
            </p>
          </div>
        </>
      }
      footer={
        step !== "done" ? (
          <p className="mt-5 text-center text-xs text-muted-foreground">
            {step === "details"
              ? "Already have an account?"
              : "Waited too long or wrong email?"}{" "}
            <Link
              href={loginHref}
              className="font-medium text-primary transition hover:underline"
            >
              {step === "details" ? "Sign in" : "Back to sign in"}
            </Link>
          </p>
        ) : null
      }
    >
      {error && (
        <div className="mt-5">
          <StatusAlert tone="failed">{error}</StatusAlert>
        </div>
      )}
      {successMessage && (
        <div className="mt-5">
          <StatusAlert tone="success">{successMessage}</StatusAlert>
        </div>
      )}

      {step === "details" && (
        <form onSubmit={handleRegister} className="mt-6 space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="fullName"
              className="block text-sm font-medium text-foreground"
            >
              Business / owner name
            </label>
            <div className="relative">
              <UserIcon className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="fullName"
                type="text"
                size="lg"
                autoComplete="name"
                placeholder="Acme Traders"
                className="min-w-0 pl-11"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                minLength={2}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-foreground"
            >
              Email address
            </label>
            <div className="relative">
              <EnvelopeIcon className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                size="lg"
                autoComplete="email"
                placeholder="you@company.com"
                className="min-w-0 pl-11"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-foreground"
            >
              Phone number{" "}
              <span className="text-xs font-normal text-muted-foreground">
                (optional, used for payments)
              </span>
            </label>
            <div className="relative">
              <PhoneIcon className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="phone"
                type="tel"
                size="lg"
                autoComplete="tel"
                placeholder="01XXXXXXXXX"
                className="min-w-0 pl-11"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-baseline justify-between gap-3">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-foreground"
              >
                Password
              </label>
              <span className="text-right text-[11px] leading-4 text-muted-foreground">
                8+ chars, upper, lower &amp; number
              </span>
            </div>
            <div className="relative">
              <LockClosedIcon className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                size="lg"
                autoComplete="new-password"
                placeholder="At least 8 characters"
                className="min-w-0 pl-11 pr-12"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                minLength={8}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((visible) => !visible)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground transition hover:bg-accent hover:text-foreground"
              >
                {showPassword ? (
                  <EyeSlashIcon className="size-5" />
                ) : (
                  <EyeIcon className="size-5" />
                )}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-foreground"
            >
              Confirm password
            </label>
            <div className="relative">
              <LockClosedIcon className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="confirmPassword"
                type="password"
                size="lg"
                autoComplete="new-password"
                placeholder="Repeat the password"
                className="min-w-0 pl-11"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                minLength={8}
                required
              />
            </div>
          </div>

          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={loading}
          >
            {loading ? (
              <>
                <Spinner />
                Creating account...
              </>
            ) : (
              <>
                Create account
                <ArrowRightIcon className="size-4" />
              </>
            )}
          </Button>
        </form>
      )}

      {step === "verify" && (
        <form onSubmit={handleVerify} className="mt-6 space-y-5">
          <OtpInput value={code} onChange={setCode} disabled={loading} />

          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={loading || code.length !== 6}
          >
            {loading ? (
              <>
                <Spinner />
                Verifying...
              </>
            ) : (
              <>
                Verify and continue
                <ArrowRightIcon className="size-4" />
              </>
            )}
          </Button>

          <div className="flex items-center justify-between text-sm">
            <Button
              type="button"
              variant="link"
              onClick={() => {
                setStep("details");
                setError(null);
                setSuccessMessage(null);
                setCode("");
                setResendCooldown(0);
              }}
              className="text-muted-foreground hover:text-foreground"
            >
              ← Back
            </Button>
            <Button
              type="button"
              variant="link"
              onClick={handleResendCode}
              disabled={loading || resendCooldown > 0}
            >
              {resendCooldown > 0
                ? `Resend in ${resendCooldown}s`
                : "Resend code"}
            </Button>
          </div>
        </form>
      )}

      {step === "done" && (
        <div className="mt-6 space-y-5">
          <StatusAlert tone="success">
            Email verified and trial started. Sign in to open your dashboard.
          </StatusAlert>
          <Button asChild size="lg" className="w-full">
            <Link href={loginHref}>Go to sign in</Link>
          </Button>
        </div>
      )}

      <div className="mt-6 flex items-center gap-3 text-[11px] text-muted-foreground">
        <span className="h-px flex-1 bg-border" />
        <span className="flex items-center gap-1.5">
          <ShieldCheckIcon className="size-3.5 text-primary" />
          Encrypted and monitored
        </span>
        <span className="h-px flex-1 bg-border" />
      </div>

      {step === "details" && (
        <p className="mt-4 text-center text-xs leading-5 text-muted-foreground">
          By creating an account you agree to our{" "}
          <Link
            href="/data-security-policy"
            className="text-foreground underline-offset-2 transition hover:text-primary hover:underline"
          >
            Data Security Policy
          </Link>{" "}
          and{" "}
          <Link
            href="/return-refund-policy"
            className="text-foreground underline-offset-2 transition hover:text-primary hover:underline"
          >
            Return &amp; Refund Policy
          </Link>
          .
        </p>
      )}
    </AuthShell>
  );
}

export function RegisterForm() {
  return (
    <Suspense fallback={<AuthSplash />}>
      <RegisterFormInner />
    </Suspense>
  );
}
