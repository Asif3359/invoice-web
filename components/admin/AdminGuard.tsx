"use client";

import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import type { AdminRole, AdminUser } from "@/lib/auth";
import { api } from "@/lib/api-client";
import { Loading } from "./Loading";
import { ErrorState } from "./ErrorState";

interface AdminGuardProps {
  children: ReactNode;
}

interface AdminContextValue {
  user: AdminUser;
}

const AdminContext = createContext<AdminContextValue | null>(null);

export function useAdminUser() {
  const ctx = useContext(AdminContext);
  if (!ctx) {
    throw new Error("useAdminUser must be used within an AdminGuard");
  }
  return ctx.user;
}

export function AdminGuard({ children }: AdminGuardProps) {
  const router = useRouter();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadUser() {
      const token =
        typeof window !== "undefined"
          ? window.localStorage.getItem("admin_token")
          : null;

      if (!token) {
        router.replace("/admin-login");
        return;
      }

      try {
        type MeResponse = {
          success: boolean;
          data?: {
            user: {
              id: string;
              email: string;
              fullName?: string;
              role: AdminRole;
              permissions?: Record<string, Record<string, boolean>>;
            };
          };
        };

        const { data } = await api.get<MeResponse>("/api/admin/me");
        const apiUser = data.data?.user;

        if (!apiUser) {
          throw new Error("Missing user in /me response");
        }

        const mappedUser: AdminUser = {
          id: apiUser.id,
          email: apiUser.email,
          fullName: apiUser.fullName,
          role: apiUser.role,
          permissions: apiUser.permissions ?? {},
        };

        setUser(mappedUser);
      } catch {
        setError("Unable to load admin session. Please log in again.");
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, [router]);

  useEffect(() => {
    if (!loading && (error || !user)) {
      if (typeof window !== "undefined") {
        window.localStorage.removeItem("admin_token");
      }
      router.replace("/admin-login");
    }
  }, [loading, error, user, router]);

  if (loading || error || !user) {
    return error ? (
      <ErrorState message={error ?? "Redirecting to admin login..."} />
    ) : (
      <Loading />
    );
  }

  return (
    <AdminContext.Provider value={{ user }}>
      {children}
    </AdminContext.Provider>
  );
}

