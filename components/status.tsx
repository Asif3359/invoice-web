"use client";

import type { ComponentType, ReactNode, SVGProps } from "react";
import {
  NoSymbolIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationCircleIcon,
  GiftIcon,
  InformationCircleIcon,
  MagnifyingGlassIcon,
  QuestionMarkCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import type { SubscriptionStatus } from "@/lib/business-auth";
import type { PaymentStatus } from "@/lib/subscription-payments";

type StatusIcon = ComponentType<SVGProps<SVGSVGElement>>;

/**
 * The palette is blue-family only, so a tint can never tell two statuses apart.
 * Every status therefore carries an icon and its own word; colour is decorative.
 */
type StatusStyle = { label: string; className: string; Icon: StatusIcon };

const subscriptionStatusStyles: Record<SubscriptionStatus, StatusStyle> = {
  active: {
    label: "Active",
    className: "border-blue-600/20 bg-blue-50 text-blue-700",
    Icon: CheckCircleIcon,
  },
  expired: {
    label: "Expired",
    className: "border-indigo-600/20 bg-indigo-50 text-indigo-700",
    Icon: ExclamationCircleIcon,
  },
  not_started: {
    label: "Not started",
    className: "border-sky-600/20 bg-sky-50 text-sky-700",
    Icon: ClockIcon,
  },
  inactive: {
    label: "Inactive",
    className: "border-indigo-600/20 bg-indigo-50 text-indigo-700",
    Icon: XCircleIcon,
  },
};

const paymentStatusStyles: Record<PaymentStatus, StatusStyle> = {
  pending: {
    label: "Pending",
    className: "border-sky-600/20 bg-sky-50 text-sky-700",
    Icon: ClockIcon,
  },
  paid: {
    label: "Paid",
    className: "border-blue-600/20 bg-blue-50 text-blue-700",
    Icon: CheckCircleIcon,
  },
  failed: {
    label: "Payment failed",
    className: "border-indigo-600/20 bg-indigo-50 text-indigo-700",
    Icon: XCircleIcon,
  },
  cancelled: {
    label: "Cancelled",
    className: "border-border bg-muted text-muted-foreground",
    Icon: NoSymbolIcon,
  },
  review: {
    label: "Under review",
    className: "border-blue-600/20 bg-blue-50 text-blue-700",
    Icon: MagnifyingGlassIcon,
  },
};

function StatusBadge({
  style,
  title,
  className,
}: {
  style: StatusStyle;
  title?: string;
  className?: string;
}) {
  const { label, className: tone, Icon } = style;
  return (
    <Badge variant="outline" title={title} className={cn(tone, className)}>
      <Icon aria-hidden="true" />
      {label}
    </Badge>
  );
}

export function TrialBadge({ className }: { className?: string }) {
  return (
    <Badge
      variant="outline"
      className={cn("border-sky-600/20 bg-sky-50 text-sky-700", className)}
    >
      <GiftIcon aria-hidden="true" />
      Trial
    </Badge>
  );
}

/** Unknown status stays neutral; every known status gets its own icon and word. */
export function SubscriptionStatusBadge({
  status,
  title,
  className,
}: {
  status?: SubscriptionStatus;
  title?: string;
  className?: string;
}) {
  if (!status) {
    return (
      <Badge
        variant="outline"
        title={title}
        className={cn("border-border bg-muted text-muted-foreground", className)}
      >
        <QuestionMarkCircleIcon aria-hidden="true" />
        Unknown
      </Badge>
    );
  }

  return (
    <StatusBadge
      style={subscriptionStatusStyles[status]}
      title={title}
      className={className}
    />
  );
}

export function PaymentStatusBadge({
  status,
  title,
  className,
}: {
  status: PaymentStatus;
  title?: string;
  className?: string;
}) {
  return (
    <StatusBadge
      style={paymentStatusStyles[status]}
      title={title}
      className={className}
    />
  );
}

const alertTones: Record<"success" | "info" | "failed", StatusIcon> = {
  success: CheckCircleIcon,
  info: InformationCircleIcon,
  failed: XCircleIcon,
};

/** Banner-style notice: tint, icon and `role` always travel together. */
export function StatusAlert({
  tone,
  children,
  className,
}: {
  tone: "success" | "info" | "failed";
  children: ReactNode;
  className?: string;
}) {
  const Icon = alertTones[tone];
  return (
    <Alert
      variant={tone}
      role={tone === "success" ? "status" : "alert"}
      className={className}
    >
      <Icon aria-hidden="true" />
      <AlertDescription>{children}</AlertDescription>
    </Alert>
  );
}
