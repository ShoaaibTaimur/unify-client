import type { Metadata } from "next";
import { ActivitiesView } from "@/components/views/ActivitiesView";

export const metadata: Metadata = {
  title: "All Activities — UNIFY",
  description: "Browse all scheduled class tests, lab tests, assignments, viva, and exams for your class.",
};

export default function ActivitiesPage() {
  return <ActivitiesView />;
}
