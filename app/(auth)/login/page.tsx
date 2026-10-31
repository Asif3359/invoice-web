import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Login | Invoice SaaS",
  description: "Sign in to your Invoice SaaS account.",
};

export default function LoginPage() {
  return <LoginForm />;
}
