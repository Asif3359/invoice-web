"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api-client";

type LoginResponse = {
  success: boolean;
  message?: string;
  data?: {
    email: string;
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

export default function AdminLoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<"credentials" | "otp">("credentials");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Store email from the first step for OTP verification
  const [verifiedEmail, setVerifiedEmail] = useState("");

  async function handleCredentialsSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setLoading(true);
    try {
      const { data } = await api.post<LoginResponse>("/api/admin/auth/login", {
        email,
        password,
      });

      if (!data.success) {
        throw new Error(data.message || "Login failed");
      }

      // OTP sent successfully → move to OTP step
      setVerifiedEmail(email);
      setStep("otp");
      setSuccessMessage(data.message || "OTP sent to your email.");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Login failed. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  async function handleOtpSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setLoading(true);
    try {
      const { data } = await api.post<VerifyOtpResponse>("/api/admin/auth/verify-otp", {
        email: verifiedEmail,
        otp,
      });

      if (!data.success || !data.data?.tokens) {
        throw new Error(data.message || "OTP verification failed");
      }

      const { accessToken } = data.data.tokens;
      if (typeof window !== "undefined") {
        window.localStorage.setItem("admin_token", accessToken);
      }
      router.push("/admin");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "OTP verification failed. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  async function handleResendOtp() {
    setError(null);
    setSuccessMessage(null);
    setLoading(true);
    try {
      const { data } = await api.post("/api/admin/auth/resend-otp", {
        email: verifiedEmail,
      });
      setSuccessMessage(data.message || "A new OTP has been sent.");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to resend OTP.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950">
      <div className="w-full max-w-sm rounded-xl bg-slate-900 p-6 shadow-xl">
        <h1 className="mb-4 text-xl font-semibold text-slate-50">
          {step === "credentials" ? "System Admin Login" : "Enter OTP"}
        </h1>

        {error && (
          <div className="mb-4 rounded-md bg-rose-500/10 p-3 text-sm text-rose-400">
            {error}
          </div>
        )}
        {successMessage && (
          <div className="mb-4 rounded-md bg-emerald-500/10 p-3 text-sm text-emerald-400">
            {successMessage}
          </div>
        )}

        {step === "credentials" ? (
          <form onSubmit={handleCredentialsSubmit} className="space-y-4">
            <label className="block text-sm text-slate-300">
              Email
              <input
                type="email"
                autoComplete="email"
                className="mt-1 w-full rounded-md bg-slate-800 px-3 py-2 text-sm text-slate-50 outline-none ring-1 ring-slate-700 focus:ring-2 focus:ring-emerald-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </label>
            <label className="block text-sm text-slate-300">
              Password
              <input
                type="password"
                autoComplete="current-password"
                className="mt-1 w-full rounded-md bg-slate-800 px-3 py-2 text-sm text-slate-50 outline-none ring-1 ring-slate-700 focus:ring-2 focus:ring-emerald-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </label>
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center rounded-md bg-emerald-500 px-3 py-2 text-sm font-medium text-slate-950 hover:bg-emerald-400 disabled:opacity-60"
            >
              {loading ? "Sending OTP..." : "Sign in"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleOtpSubmit} className="space-y-4">
            <p className="text-sm text-slate-400">
              Enter the 6‑digit code sent to <strong>{verifiedEmail}</strong>
            </p>
            <label className="block text-sm text-slate-300">
              OTP
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                autoComplete="one-time-code"
                className="mt-1 w-full rounded-md bg-slate-800 px-3 py-2 text-sm text-slate-50 outline-none ring-1 ring-slate-700 focus:ring-2 focus:ring-emerald-500"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                required
              />
            </label>
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={loading}
                className="text-sm text-emerald-400 hover:text-emerald-300 disabled:opacity-50"
              >
                Resend OTP
              </button>
              <button
                type="submit"
                disabled={loading || otp.length < 6}
                className="flex items-center justify-center rounded-md bg-emerald-500 px-4 py-2 text-sm font-medium text-slate-950 hover:bg-emerald-400 disabled:opacity-60"
              >
                {loading ? "Verifying..." : "Verify"}
              </button>
            </div>
            <button
              type="button"
              onClick={() => {
                setStep("credentials");
                setError(null);
                setSuccessMessage(null);
                setOtp("");
              }}
              className="mt-2 text-sm text-slate-400 hover:text-slate-300"
            >
              ← Back to login
            </button>
          </form>
        )}
      </div>
    </div>
  );
}