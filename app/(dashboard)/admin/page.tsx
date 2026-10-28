import type { Metadata } from "next";
import { AdminOverviewContent } from "@/features/admin/components/AdminOverviewContent";

export const metadata: Metadata = {
  title: "Admin Console — UNIFY",
  description: "University academic governance, department overview, and stats.",
};

export default function AdminOverviewPage() {
  return <AdminOverviewContent />;
}
