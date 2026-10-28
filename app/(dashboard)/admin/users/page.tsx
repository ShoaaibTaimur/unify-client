import type { Metadata } from "next";
import { AdminUsersContent } from "@/features/admin/components/AdminUsersContent";

export const metadata: Metadata = {
  title: "Manage Users — Admin Console",
  description: "Governance & user management for CRs, Teachers, and Admins.",
};

export default function AdminUsersPage() {
  return <AdminUsersContent />;
}
