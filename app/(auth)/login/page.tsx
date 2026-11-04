import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Login | Invento Manager",
  description: "Sign in to your Invento Manager account.",
};

export default function LoginPage() {
  return <LoginForm />;
}
