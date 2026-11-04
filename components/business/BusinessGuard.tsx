"use client";

import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { businessApi } from "@/lib/business-api";
import type { BusinessSubscription, BusinessUser } from "@/lib/business-auth";
import {
  clearSession,
  getStoredSession,
  updateSessionUser,
} from "@/lib/session";
import { Loading } from "@/components/admin/Loading";
import { ErrorState } from "@/components/admin/ErrorState";

interface BusinessContextValue {
  user: BusinessUser;
  subscription: BusinessSubscription | null;
  refreshSubscription: () => Promise<BusinessSubscription | null>;
}

const BusinessContext = createContext<BusinessContextValue | null>(null);

export function useBusinessUser() {
  const ctx = useContext(BusinessContext);
  if (!ctx) {
    throw new Error("useBusinessUser must be used within a BusinessGuard");
  }
  return ctx;
}

type ProfileResponse = {
  success: boolean;
  data?: {
    user: {
      _id?: string;
      id?: string;
      email: string;
      fullName?: string;
      phone?: string;
      emailVerified?: boolean;
      isActive?: boolean;
      createdAt?: string;
    };
    subscription?: BusinessSubscription | null;
  };
};

export function BusinessGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<BusinessUser | null>(null);
  const [subscription, setSubscription] =
    useState<BusinessSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadUser() {
      const session = getStoredSession();

      if (!session || session.kind !== "business") {
        router.replace("/login");
        return;
      }

      try {
        const { data } = await businessApi.get<ProfileResponse>(
          "/auth/profile",
        );
        const apiUser = data.data?.user;

        if (!apiUser) {
          throw new Error("Missing user in profile response");
        }

        if (cancelled) return;

        setUser({
          id: apiUser._id ?? apiUser.id ?? "",
          email: apiUser.email,
          fullName: apiUser.fullName,
          phone: apiUser.phone,
          emailVerified: apiUser.emailVerified,
          isActive: apiUser.isActive,
          createdAt: apiUser.createdAt,
        });
        setSubscription(data.data?.subscription ?? null);
        updateSessionUser("business", {
          fullName: apiUser.fullName,
          email: apiUser.email,
        });
      } catch {
        if (!cancelled) {
          setError("Unable to load your business session. Please log in again.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadUser();

    return () => {
      cancelled = true;
    };
  }, [router]);

  /**
   * Re-read the profile so the subscription status is current after a payment
   * is activated. Used by the subscription page's "Check activation status".
   * Stable identity, so consumers can keep it in an effect dependency list
   * without re-running their own requests on every render.
   */
  const refreshSubscription = useCallback(async () => {
    const { data } = await businessApi.get<ProfileResponse>("/auth/profile");
    const next = data.data?.subscription ?? null;
    setSubscription(next);
    return next;
  }, []);

  useEffect(() => {
    if (!loading && (error || !user)) {
      clearSession("business");
      router.replace("/login");
    }
  }, [loading, error, user, router]);

  if (loading || error || !user) {
    return error ? (
      <ErrorState message={error ?? "Redirecting to login..."} />
    ) : (
      <Loading />
    );
  }

  return (
    <BusinessContext.Provider
      value={{ user, subscription, refreshSubscription }}
    >
      {children}
    </BusinessContext.Provider>
  );
}
