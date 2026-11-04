import type { ReactNode } from "react";
import { BusinessGuard } from "@/components/business/BusinessGuard";
import { BusinessSidebar } from "@/components/business/BusinessSidebar";
import { BusinessTopbar } from "@/components/business/BusinessTopbar";
import { DashboardShell } from "@/components/layout/DashboardShell";

export default function BusinessLayout({ children }: { children: ReactNode }) {
  return (
    <BusinessGuard>
      <DashboardShell sidebar={<BusinessSidebar />} topbar={<BusinessTopbar />}>
        {children}
      </DashboardShell>
    </BusinessGuard>
  );
}
