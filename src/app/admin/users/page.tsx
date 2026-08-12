import type { Metadata } from "next";
import { AdminUsersView } from "@/components/views/AdminUsersView";

export const metadata: Metadata = {
  title: "Manage Users — Admin Console",
  description: "Governance & user management for CRs, Teachers, and Admins.",
};

export default function AdminUsersPage() {
  return <AdminUsersView />;
}
