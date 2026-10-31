export type SubscriptionStatus =
  | "active"
  | "expired"
  | "not_started"
  | "inactive";

export interface BusinessSubscription {
  status: SubscriptionStatus;
  activeFrom: string | null;
  activeUntil: string | null;
  daysLeft: number;
  isTrial: boolean;
}

export interface BusinessUser {
  id: string;
  email: string;
  fullName?: string;
  phone?: string;
  emailVerified?: boolean;
  isActive?: boolean;
  createdAt?: string;
}
