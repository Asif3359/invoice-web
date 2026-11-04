"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import axios from "axios";
import {
  EnvelopeIcon,
  LockClosedIcon,
} from "@heroicons/react/24/outline";
import { AuthShell } from "@/components/auth/AuthShell";
import { OtpInput } from "@/components/auth/OtpInput";
import { StatusAlert } from "@/components/status";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
    <AuthShell
      eyebrow="Account recovery"
      title={step === "done" ? "Password reset" : "Reset your password"}
      description={
        step === "email"
          ? "Enter the email for your business or system admin account. We will send a 6-digit reset code."
          : step === "reset"
            ? `Enter the code sent to ${email} and choose a new password.`
            : "Your password has been updated. Sign in with your new password."
      }
      footer={
        step !== "done" ? (
          <p className="mt-5 text-center text-xs text-muted-foreground">
            Remembered it?{" "}
            <Link
              href="/login"
              className="font-medium text-primary transition hover:underline"
            >
              Back to sign in
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

      {step === "email" && (
        <form onSubmit={requestCode} className="mt-6 space-y-5">
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

          <Button type="submit" size="lg" className="w-full" disabled={loading}>
            {loading ? "Sending code..." : "Send reset code"}
          </Button>
        </form>
      )}

      {step === "reset" && (
        <form onSubmit={handleReset} className="mt-6 space-y-5">
          <div className="space-y-2">
            <span className="block text-sm font-medium text-foreground">
              Reset code
            </span>
            <OtpInput value={code} onChange={setCode} disabled={loading} />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="new-password"
              className="block text-sm font-medium text-foreground"
            >
              New password
            </label>
            <div className="relative">
              <LockClosedIcon className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="new-password"
                type="password"
                size="lg"
                autoComplete="new-password"
                placeholder="At least 8 characters"
                className="min-w-0 pl-11"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                minLength={8}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="confirm-password"
              className="block text-sm font-medium text-foreground"
            >
              Confirm new password
            </label>
            <div className="relative">
              <LockClosedIcon className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="confirm-password"
                type="password"
                size="lg"
                autoComplete="new-password"
                placeholder="Repeat the new password"
                className="min-w-0 pl-11"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                minLength={8}
                required
              />
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            At least 8 characters with an uppercase letter, a lowercase letter
            and a number.
          </p>

          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={loading || code.length !== 6}
          >
            {loading ? "Resetting..." : "Reset password"}
          </Button>

          <div className="flex items-center justify-between text-sm">
            <Button
              type="button"
              variant="link"
              onClick={() => {
                setStep("email");
                setError(null);
              }}
              className="text-muted-foreground hover:text-foreground"
            >
              ← Change email
            </Button>
            <Button
              type="button"
              variant="link"
              onClick={() => requestCode()}
              disabled={loading}
            >
              Resend code
            </Button>
          </div>
        </form>
      )}

      {step === "done" && (
        <div className="mt-6 space-y-5">
          <StatusAlert tone="success">
            Password reset successful. You can now sign in with your new
            password.
          </StatusAlert>
          <Button asChild size="lg" className="w-full">
            <Link href="/login">Back to sign in</Link>
          </Button>
        </div>
      )}
    </AuthShell>
  );
}
