"use client";

import { useRouter } from "next/navigation";
import { useAdminUser } from "./AdminGuard";

export function Topbar() {
  const router = useRouter();
  const user = useAdminUser();
  const displayRole = (user.role ?? "admin").toUpperCase();

  function handleLogout() {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("admin_token");
    }
    router.push("/admin-login");
  }

  return (
    <header className="flex items-center justify-between border-b border-slate-800 bg-slate-950/60 px-6 py-3">
      <div className="text-sm font-medium text-slate-100">
        System Dashboard
        <span className="ml-2 rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs text-emerald-400">
          {displayRole}
        </span>
      </div>
      <div className="flex items-center gap-3 text-xs text-slate-300">
        <span>{user.fullName || user.email}</span>
        <button
          type="button"
          onClick={handleLogout}
          className="rounded-md border border-slate-700 px-2 py-1 text-[11px] font-medium text-slate-200 hover:bg-slate-800"
        >
          Logout
        </button>
      </div>
    </header>
  );
}

