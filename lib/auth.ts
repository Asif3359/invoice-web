export type AdminRole = "superadmin" | "admin" | "manager";

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
  action: string,
): boolean {
  if (!user) return false;
  if (user.role === "superadmin") return true;
  return user.permissions?.[resource]?.[action] === true;
}

