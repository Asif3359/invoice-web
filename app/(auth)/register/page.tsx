import type { Metadata } from "next";
import { RegisterForm } from "@/components/auth/RegisterForm";

export const metadata: Metadata = {
  title: "Create account | Invento Manager",
  description: "Register a business account and start your free trial.",
};

export default function RegisterPage() {
  return <RegisterForm />;
}
