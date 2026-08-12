import type { Metadata } from "next";
import { LoginView } from "@/components/views/LoginView";

export const metadata: Metadata = {
  title: "Portal Sign In — UNIFY",
  description: "Sign in to CR, Teacher, or Admin dashboard on UNIFY.",
};

export default function LoginPage() {
  return <LoginView />;
}
