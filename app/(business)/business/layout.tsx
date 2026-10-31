import type { ReactNode } from "react";
import { BusinessGuard } from "@/components/business/BusinessGuard";
import { BusinessSidebar } from "@/components/business/BusinessSidebar";
import { BusinessTopbar } from "@/components/business/BusinessTopbar";

export default function BusinessLayout({ children }: { children: ReactNode }) {
  return (
    <BusinessGuard>
      <div className="flex min-h-screen bg-slate-950 text-slate-50">
        <BusinessSidebar />
        <div className="flex flex-1 flex-col">
          <BusinessTopbar />
          <main className="flex-1 p-6">{children}</main>
        </div>
      </div>
    </BusinessGuard>
  );
}
