"use client";

import { useBusinessUser } from "@/components/business/BusinessGuard";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function formatDate(value?: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function BusinessProfilePage() {
  const { user } = useBusinessUser();

  const details = [
    { label: "Full name", value: user.fullName || "Not provided" },
    { label: "Email", value: user.email },
    { label: "Phone", value: user.phone || "Not provided" },
    {
      label: "Email verified",
      value: user.emailVerified ? "Yes" : "No",
    },
    {
      label: "Account status",
      value: user.isActive ? "Active" : "Inactive",
    },
    { label: "Member since", value: formatDate(user.createdAt) },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Profile</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Your business account details.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Account details</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {details.map((detail) => (
              <div key={detail.label} className="min-w-0">
                <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {detail.label}
                </dt>
                <dd className="mt-1 break-words text-sm text-card-foreground">
                  {detail.value}
                </dd>
              </div>
            ))}
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}
