import type { Metadata } from "next";
import { AdminActivitiesView } from "@/components/views/AdminActivitiesView";

export const metadata: Metadata = {
  title: "Manage Activities — Admin Console",
  description: "University-wide activity catalog management.",
};

export default function AdminActivitiesPage() {
  return <AdminActivitiesView />;
}
