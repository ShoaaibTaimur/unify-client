import type { Metadata } from "next";
import { CRDashboardView } from "@/components/views/portal/CRDashboardView";

export const metadata: Metadata = {
  title: "CR Dashboard — UNIFY",
  description: "Class Representative activity management portal.",
};

export default function CRDashboardPage() {
  return <CRDashboardView />;
}
