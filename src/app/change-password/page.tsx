import type { Metadata } from "next";
import { ChangePasswordView } from "@/components/views/ChangePasswordView";

export const metadata: Metadata = {
  title: "Change Password — UNIFY",
  description: "Update your portal account security password.",
};

export default function ChangePasswordPage() {
  return <ChangePasswordView />;
}
