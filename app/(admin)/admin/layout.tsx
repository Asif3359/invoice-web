import type { ReactNode } from "react";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { AdminRoleGate } from "@/components/admin/AdminRoleGate";
import { Sidebar } from "@/components/admin/Sidebar";
import { Topbar } from "@/components/admin/Topbar";
import { DashboardShell } from "@/components/layout/DashboardShell";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AdminGuard>
      <DashboardShell sidebar={<Sidebar />} topbar={<Topbar />}>
        <AdminRoleGate>{children}</AdminRoleGate>
      </DashboardShell>
    </AdminGuard>
  );
}
