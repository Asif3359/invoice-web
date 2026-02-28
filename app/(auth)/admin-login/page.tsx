"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api-client";

type AdminLoginResponse = {
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
    tokens?: {
      accessToken: string;
      refreshToken: string;
    };
  };
};

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { data } = await api.post<AdminLoginResponse>("/api/admin/auth/login", {
        email,
        password,
      });

      const accessToken = data.data?.tokens?.accessToken;

      if (!accessToken) {
        throw new Error("Login response missing access token");
      }

      if (typeof window !== "undefined") {
        window.localStorage.setItem("admin_token", accessToken);
      }
      router.push("/admin");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Login failed. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-xl bg-slate-900 p-6 shadow-xl"
      >
        <h1 className="mb-4 text-xl font-semibold text-slate-50">
          System Admin Login
        </h1>
        <label className="mb-2 block text-sm text-slate-300">
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
        <label className="mb-4 block text-sm text-slate-300">
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
        {error && <p className="mb-2 text-sm text-rose-400">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center rounded-md bg-emerald-500 px-3 py-2 text-sm font-medium text-slate-950 hover:bg-emerald-400 disabled:opacity-60"
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </div>
  );
}
