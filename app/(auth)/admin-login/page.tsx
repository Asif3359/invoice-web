import { redirect } from "next/navigation";

/**
 * Kept for old bookmarks. The web app now has a single login form at /login
 * which detects whether the account is a business owner or a system admin.
 */
export default function AdminLoginPage() {
  redirect("/login");
}
