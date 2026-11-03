"use client";

import { PaymentHistory } from "@/components/business/PaymentHistory";

export default function BusinessPaymentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-50">
          Payment History
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Every subscription payment made through EPS, including pending
          and failed attempts.
        </p>
      </div>

      <PaymentHistory showHeading={false} />
    </div>
  );
}
