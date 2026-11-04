"use client";

import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MobileNavSheet } from "@/components/layout/MobileNavSheet";
import { AdminNav } from "./Sidebar";
import { clearSession } from "@/lib/session";
import { useAdminUser } from "./AdminGuard";

export function Topbar() {
  const router = useRouter();
  const user = useAdminUser();
  const displayRole = (user.role ?? "admin").toUpperCase();

  function handleLogout() {
    clearSession("admin");
    router.push("/login");
  }

  return (
    <header className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 border-b border-border bg-background px-4 py-3 sm:px-6">
      <div className="flex min-w-0 items-center gap-2">
        <MobileNavSheet label="Admin">
          <AdminNav />
        </MobileNavSheet>
        <span className="truncate text-sm font-medium text-foreground">
          System Dashboard
        </span>
        <Badge variant="secondary" className="shrink-0">
          {displayRole}
        </Badge>
      </div>
      <div className="flex min-w-0 items-center gap-3 text-xs text-muted-foreground">
        <span className="max-w-[10rem] truncate">{user.fullName || user.email}</span>
        <Button variant="outline" size="xs" onClick={handleLogout}>
          Log out
        </Button>
      </div>
    </header>
  );
}
