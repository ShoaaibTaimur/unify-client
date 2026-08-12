import type { Metadata } from "next";
import { TeacherDashboardView } from "@/components/views/TeacherDashboardView";

export const metadata: Metadata = {
  title: "Teacher Dashboard — UNIFY",
  description: "Faculty Teacher activity scheduling and management console.",
};

export default function TeacherDashboardPage() {
  return <TeacherDashboardView />;
}
