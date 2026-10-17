import type { Metadata } from "next";
import { DashboardContent } from "@/components/pages/Dashboard";

export const metadata: Metadata = {
  title: "CR Dashboard — UNIFY",
  description: "Class Representative activity management portal.",
};

export default function CRDashboardPage() {
  return <DashboardContent />;
}
