import axios from "axios";
import { businessApi } from "./business-api";
import type { BusinessSubscription } from "./business-auth";

export interface Plan {
  id: string;
  code: string;
  name: string;
  description?: string;
  durationDays: number;
  amount: number;
  currency: string;
}

export type PaymentStatus =
  | "pending"
  | "paid"
  | "failed"
  | "cancelled"
  | "review";

export interface CheckoutResponse {
  tranId: string;
  paymentUrl: string;
  amount: number;
  currency: string;
  plan: { name: string; durationDays: number };
}

export interface PaymentStatusResponse {
  tranId: string;
  status: PaymentStatus;
  amount: number;
  currency: string;
  plan?: { name: string; durationDays: number };
  periodTo?: string | null;
  subscription?: BusinessSubscription | null;
}

const PENDING_KEY = "business_pending_payment";
const PENDING_MAX_AGE_MS = 24 * 60 * 60 * 1000;

export function paymentErrorMessage(error: unknown, fallback: string) {
  if (axios.isAxiosError(error)) {
    if (!error.response) {
      return "No internet connection. Please try again.";
    }

    const message = (error.response.data as { message?: string } | undefined)
      ?.message;
    if (message) return message;
  }

  return fallback;
}

export async function fetchPlans(): Promise<{
  plans: Plan[];
  subscription: BusinessSubscription | null;
}> {
  const { data } = await businessApi.get("/subscription/plans");

  return {
    plans: (data?.data?.plans ?? []) as Plan[],
    subscription: (data?.data?.subscription ?? null) as BusinessSubscription | null,
  };
}

export async function createCheckout(planId: string): Promise<CheckoutResponse> {
  const { data } = await businessApi.post("/subscription/checkout", {
    planId,
    // The backend sends the gateway's browser back here instead of the app deep link.
    platform: "web",
    returnUrl: typeof window === "undefined" ? "" : window.location.origin,
  });
  return data.data as CheckoutResponse;
}

export async function fetchPaymentStatus(
  tranId: string,
): Promise<PaymentStatusResponse> {
  const { data } = await businessApi.get(
    `/subscription/status/${encodeURIComponent(tranId)}`,
  );
  return data.data as PaymentStatusResponse;
}

/**
 * Kept in localStorage so a payment started before a reload, a crash, or a
 * dropped connection can still be confirmed later.
 */
export function savePendingPayment(tranId: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(
    PENDING_KEY,
    JSON.stringify({ tranId, at: Date.now() }),
  );
}

export function readPendingPayment(): { tranId: string; at: number } | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(PENDING_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as { tranId?: string; at?: number };
    if (!parsed.tranId || !parsed.at) return null;
    if (Date.now() - parsed.at > PENDING_MAX_AGE_MS) {
      window.localStorage.removeItem(PENDING_KEY);
      return null;
    }

    return { tranId: parsed.tranId, at: parsed.at };
  } catch {
    return null;
  }
}

export function clearPendingPayment() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(PENDING_KEY);
}
