import type { Metadata } from "next";
import { DashboardContent } from "@/features/dashboard/DashboardContent";

export const metadata: Metadata = {
  title: "Teacher Dashboard — UNIFY",
  description: "Faculty Teacher activity scheduling and management console.",
};

export default function TeacherDashboardPage() {
  return <DashboardContent />;
}
