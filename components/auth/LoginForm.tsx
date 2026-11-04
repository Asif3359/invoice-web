"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import {
  ArrowRightIcon,
  BanknotesIcon,
  CubeIcon,
  EnvelopeIcon,
  EyeIcon,
  EyeSlashIcon,
  LockClosedIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";
import { AuthShell, AuthSplash, Spinner } from "./AuthShell";
import { OtpInput } from "./OtpInput";
import { StatusAlert } from "@/components/status";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api-client";
import { businessApi } from "@/lib/business-api";
import { storeAdminSession, storeBusinessSession } from "@/lib/session";
import { useIsMounted, useStoredSession } from "@/lib/use-session";

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
    return <AuthSplash label="Checking your session..." />;
  }

  return (
    <AuthShell
      eyebrow={step === "otp" ? "Two-step verification" : "Secure sign in"}
      title={step === "otp" ? "Check your email" : "Welcome back"}
      description={
        step === "otp"
          ? `We sent a 6-digit code to ${verifiedEmail}. Enter it below to continue.`
          : "Sign in with your email and password. System administrators will be asked for a one-time code."
      }
      brand={
        <>
          <h1 className="mt-12 max-w-xl text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Run your business.
            <span className="mt-2 block text-primary">
              We handle the invoices.
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
              Protected with encrypted connections, role-based access, and
              one-time codes for system administrators.
            </p>
          </div>
        </>
      }
      footer={
        <p className="mt-5 text-center text-xs text-muted-foreground">
          {step === "credentials" ? (
            <>
              Don&apos;t have an account?{" "}
              <Link
                href={registerHref}
                className="font-medium text-primary transition hover:underline"
              >
                Register your business
              </Link>
            </>
          ) : (
            <>
              Wrong account?{" "}
              <Link
                href="/login"
                className="font-medium text-primary transition hover:underline"
              >
                Start sign in again
              </Link>
            </>
          )}
        </p>
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

      {step === "credentials" ? (
        <form onSubmit={handleCredentialsSubmit} className="mt-6 space-y-5">
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
            <div className="flex items-center justify-between">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-foreground"
              >
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-xs text-muted-foreground transition hover:text-primary"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <LockClosedIcon className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                size="lg"
                autoComplete="current-password"
                placeholder="Enter your password"
                className="min-w-0 pl-11 pr-12"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
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

          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={loading}
          >
            {loading ? (
              <>
                <Spinner />
                Signing in...
              </>
            ) : (
              <>
                Sign in
                <ArrowRightIcon className="size-4" />
              </>
            )}
          </Button>
        </form>
      ) : (
        <form onSubmit={handleOtpSubmit} className="mt-6 space-y-5">
          <OtpInput value={otp} onChange={setOtp} disabled={loading} />

          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={loading || otp.length !== 6}
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
              onClick={handleBackToCredentials}
              className="text-muted-foreground hover:text-foreground"
            >
              ← Back
            </Button>
            <Button
              type="button"
              variant="link"
              onClick={handleResendOtp}
              disabled={loading || resendCooldown > 0}
            >
              {resendCooldown > 0
                ? `Resend in ${resendCooldown}s`
                : "Resend code"}
            </Button>
          </div>
        </form>
      )}

      <div className="mt-6 flex items-center gap-3 text-[11px] text-muted-foreground">
        <span className="h-px flex-1 bg-border" />
        <span className="flex items-center gap-1.5">
          <ShieldCheckIcon className="size-3.5 text-primary" />
          Encrypted and monitored
        </span>
        <span className="h-px flex-1 bg-border" />
      </div>

      <p className="mt-4 text-center text-xs leading-5 text-muted-foreground">
        By signing in you agree to our{" "}
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
    </AuthShell>
  );
}
