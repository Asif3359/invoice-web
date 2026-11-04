import type { Metadata } from "next";
import { BusinessGuard } from "@/components/business/BusinessGuard";
import { PaymentResult } from "@/components/business/PaymentResult";

export const metadata: Metadata = {
  title: "Payment successful | Invoice SaaS",
  description: "Your subscription payment was confirmed.",
};

export default function PaymentSuccessPage() {
  return (
    <BusinessGuard>
      <PaymentResult kind="success" />
    </BusinessGuard>
  );
}
