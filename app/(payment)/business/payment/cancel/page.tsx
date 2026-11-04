import type { Metadata } from "next";
import { BusinessGuard } from "@/components/business/BusinessGuard";
import { PaymentResult } from "@/components/business/PaymentResult";

export const metadata: Metadata = {
  title: "Payment not completed | Invento Manager",
  description: "This subscription payment was cancelled or not confirmed.",
};

export default function PaymentCancelPage() {
  return (
    <BusinessGuard>
      <PaymentResult kind="cancel" />
    </BusinessGuard>
  );
}
