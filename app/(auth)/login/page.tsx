import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginContent } from "@/features/auth/LoginContent";

export const metadata: Metadata = {
  title: "Portal Sign In — UNIFY",
  description: "Sign in to CR, Teacher, or Admin dashboard on UNIFY.",
};

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <LoginContent />
    </Suspense>
  );
}
