## Admin Dashboard (System Admin & Manager) – Next.js Implementation Guide

This guide describes how to build a **System Admin Dashboard** in a separate **Next.js** app that talks to this backend. It focuses on two roles:

- **System Admin (`admin`)**: full control over system configuration and monitoring.
- **System Manager (`manager`)**: day‑to‑day monitoring and management with limited configuration powers.

Use this as an implementation blueprint for your frontend team.

---

### 1. High‑Level Architecture

- **Frontend**: Next.js (recommended: App Router, TypeScript, Tailwind CSS, shadcn/ui or similar).
- **Backend**: Existing Node.js/MongoDB API (`invoice-app-backend`).
- **Auth**: JWT (or existing token system) with role claims (`admin`, `manager`).
- **RBAC**: Role + permissions object (similar to `SubUser` permissions) returned from backend.

**Flow**:

1. System admin/manager logs in via **admin login API** and receives an access token.
2. Next.js stores token (HTTP‑only cookie or secure storage) and decodes role/permissions.
3. Protected `/admin/**` routes call backend APIs with the token.
4. Components show/hide actions based on **role** and **permissions**.

---

### 2. Next.js Project Setup

In a new folder (e.g. `invoice-admin-frontend`):

```bash
npx create-next-app@latest invoice-admin-frontend --typescript --eslint
cd invoice-admin-frontend
npm install axios jotai zustand @tanstack/react-query tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

Configure Tailwind in `tailwind.config.ts` (standard Next.js + Tailwind setup).

Recommended folder structure (App Router):

```text
app/
  (auth)/
    admin-login/
      page.tsx
  (admin)/
    admin/
      layout.tsx
      page.tsx              # dashboard overview
      users/
        page.tsx
      sub-users/
        page.tsx
      permissions/
        page.tsx
      monitoring/
        page.tsx
      settings/
        page.tsx
lib/
  api-client.ts
  auth.ts
  rbac.ts
components/
  admin/
    Sidebar.tsx
    Topbar.tsx
    StatsCards.tsx
    Table.tsx
    Loading.tsx
    ErrorState.tsx
```

---

### 3. Backend Assumptions & Required APIs

Adjust these to match your actual routes, but aim for:

- **Auth**
  - `POST /api/admin/auth/login` – admin/manager login, returns `{ token, user }`
- **Admin Users**
  - `GET /api/admin/users` – list system users (admins/managers)
  - `POST /api/admin/users` – create system user
  - `PATCH /api/admin/users/:id` – update role / status
  - `DELETE /api/admin/users/:id` – soft delete / deactivate
- **Monitoring / Analytics**
  - `GET /api/admin/metrics/overview`
  - `GET /api/admin/logs` (optional, paginated)
- **Tenants / Businesses** (if multi‑tenant)
  - `GET /api/admin/tenants`
  - `PATCH /api/admin/tenants/:id/status`

**Token payload (example)**:

```json
{
  "id": "SYSTEM_USER_ID",
  "role": "admin",
  "permissions": {
    "users": { "create": true, "read": true, "update": true, "delete": true },
    "monitoring": { "read": true },
    "settings": { "update": true }
  },
  "type": "system" // distinguish from business users/sub-users if needed
}
```

---

### 4. Auth & API Client in Next.js

**`lib/api-client.ts`** – axios instance with auth header:

```ts
import axios from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = window.localStorage.getItem("admin_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});
```

**`lib/auth.ts`** – types + helper:

```ts
export type AdminRole = "admin" | "manager";

export interface AdminUser {
  id: string;
  email: string;
  fullName?: string;
  role: AdminRole;
  permissions: Record<string, Record<string, boolean>>;
}

export function hasPermission(
  user: AdminUser | null | undefined,
  resource: string,
  action: string
): boolean {
  if (!user) return false;
  if (user.role === "admin") return true; // full access for system admin
  return user.permissions?.[resource]?.[action] === true;
}
```

You can fetch the authenticated admin user via a `/api/admin/me` endpoint after login.

---

### 5. Route Protection (App Router)

Protect all `/admin/**` routes so only authenticated system admins/managers can access them.

**Option A – `middleware.ts`**:

```ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const isAdminRoute = req.nextUrl.pathname.startsWith("/admin");
  if (!isAdminRoute) return NextResponse.next();

  const token = req.cookies.get("admin_token")?.value;
  if (!token) {
    const loginUrl = new URL("/admin-login", req.url);
    return NextResponse.redirect(loginUrl);
  }

  // Optional: decode JWT here and enforce role === "admin" | "manager"

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
```

**Option B – Layout guard** inside `app/(admin)/admin/layout.tsx`:

```tsx
import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getCurrentAdminUser } from "@/lib/server-auth"; // implement with cookies + backend call
import { Sidebar } from "@/components/admin/Sidebar";
import { Topbar } from "@/components/admin/Topbar";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const adminUser = await getCurrentAdminUser();
  if (!adminUser) redirect("/admin-login");

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-50">
      <Sidebar user={adminUser} />
      <div className="flex flex-1 flex-col">
        <Topbar user={adminUser} />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
```

---

### 6. Admin Login Page

`app/(auth)/admin-login/page.tsx`:

```tsx
"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api-client";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { data } = await api.post("/api/admin/auth/login", { email, password });
      window.localStorage.setItem("admin_token", data.token);
      router.push("/admin");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-xl bg-slate-900 p-6 shadow-xl"
      >
        <h1 className="mb-4 text-xl font-semibold text-slate-50">System Admin Login</h1>
        <label className="mb-2 block text-sm text-slate-300">
          Email
          <input
            type="email"
            className="mt-1 w-full rounded-md bg-slate-800 px-3 py-2 text-sm text-slate-50 outline-none ring-1 ring-slate-700 focus:ring-2 focus:ring-emerald-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <label className="mb-4 block text-sm text-slate-300">
          Password
          <input
            type="password"
            className="mt-1 w-full rounded-md bg-slate-800 px-3 py-2 text-sm text-slate-50 outline-none ring-1 ring-slate-700 focus:ring-2 focus:ring-emerald-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        {error && <p className="mb-2 text-sm text-rose-400">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center rounded-md bg-emerald-500 px-3 py-2 text-sm font-medium text-slate-950 hover:bg-emerald-400 disabled:opacity-60"
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </div>
  );
}
```

---

### 7. Admin Layout & Navigation

**Sidebar** example (`components/admin/Sidebar.tsx`):

```tsx
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { AdminUser } from "@/lib/auth";

interface Props {
  user: AdminUser;
}

const links = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/users", label: "System Users" },
  { href: "/admin/sub-users", label: "Business Users" },
  { href: "/admin/permissions", label: "Permissions" },
  { href: "/admin/monitoring", label: "Monitoring" },
  { href: "/admin/settings", label: "Settings" },
];

export function Sidebar({ user }: Props) {
  const pathname = usePathname();

  return (
    <aside className="flex w-64 flex-col border-r border-slate-800 bg-slate-950/80">
      <div className="p-4 text-sm font-semibold text-slate-100">
        Invoice System Admin
        <div className="mt-1 text-xs text-slate-400">
          {user.fullName || user.email} · {user.role.toUpperCase()}
        </div>
      </div>
      <nav className="flex-1 space-y-1 px-2">
        {links.map((link) => {
          const active = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`block rounded-md px-3 py-2 text-sm ${
                active
                  ? "bg-emerald-500 text-slate-950"
                  : "text-slate-300 hover:bg-slate-900 hover:text-slate-50"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
```

---

### 8. Dashboard Pages & Role‑Based UI

#### 8.1 Overview Page (`/admin`)

Show high‑level metrics and system health:

- Number of tenants / businesses.
- Number of active users / sub‑users.
- Today’s invoices, payments, revenue.
- Error rate, failed jobs, email failures.

Fetch from `GET /api/admin/metrics/overview` and display in cards and charts.

#### 8.2 System Users Management (`/admin/users`)

- **Admin**:
  - Can create, update, deactivate system users.
  - Can set role to `admin` or `manager`.
- **Manager**:
  - Can only view list, maybe reset passwords for managers, no promote to admin.

Use `hasPermission(user, "systemUsers", "create")` etc. to enable/disable buttons.

#### 8.3 Business Users & Permissions (`/admin/sub-users`, `/admin/permissions`)

Connect to backend entities like:

- Business owner users.
- `SubUser` documents (with `role` and `permissions` object).

From the system admin dashboard:

- View all tenants and their sub‑users.
- For **admin**:
  - Impersonate a tenant admin (for debugging).
  - Force deactivate a problematic sub‑user.
  - Update permission templates.
- For **manager**:
  - Read‑only or limited update capabilities.

#### 8.4 Monitoring (`/admin/monitoring`)

Typical widgets:

- API request volume by endpoint.
- Error logs (last N errors).
- Email queue / SMS queue status.
- Background jobs (success vs failure).

Backed by `GET /api/admin/logs`, `GET /api/admin/metrics/overview`, etc.

---

### 9. Role & Permission Strategy (System Admin vs Manager)

On the backend, ensure system users have:

- A `role` field with values `admin` or `manager`.
- Optional `permissions` object for granular control (similar to `SubUser.permissions`).

Suggested permission keys:

- `systemUsers`: `{ create, read, update, delete }`
- `tenants`: `{ read, update }`
- `monitoring`: `{ read }`
- `settings`: `{ read, update }`

In the frontend, centralize checks using `hasPermission` so you can:

- Control visibility (show/hide menu items and actions).
- Disable dangerous actions for managers while keeping UI consistent.

---

### 10. Testing Checklist

- **Auth**
  - Admin login succeeds, token stored, protected routes accessible.
  - Manager login succeeds, but restricted actions are hidden or disabled.
  - Unauthenticated access to `/admin/**` redirects to `/admin-login`.
- **RBAC**
  - Manager cannot:
    - Create or delete system admins.
    - Change own role to admin.
    - Change global system settings if not allowed.
- **Monitoring**
  - Metrics panels load with realistic data.
  - Errors in API calls show user‑friendly error states (not blank pages).
- **Security**
  - Token is not exposed in client logs.
  - Admin APIs reject non‑system tokens (e.g. normal business user tokens).

---

### 11. Next Steps

- Finalize backend admin endpoints and token structure.
- Implement the Next.js admin app following this layout.
- Add integration tests for critical admin flows (login, user creation, permission changes).

Use this document as your main reference while building the **system admin dashboard** in Next.js.

