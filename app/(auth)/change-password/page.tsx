import type { Metadata } from "next";
import { ChangePasswordContent } from "@/features/auth/ChangePasswordContent";

export const metadata: Metadata = {
  title: "Change Password — UNIFY",
  description: "Update your portal account security password.",
};

export default function ChangePasswordPage() {
  return <ChangePasswordContent />;
}
