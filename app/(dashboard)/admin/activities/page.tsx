import type { Metadata } from "next";
import { AdminActivitiesContent } from "@/features/admin/AdminActivitiesContent";

export const metadata: Metadata = {
  title: "Manage Activities — Admin Console",
  description: "University-wide activity catalog management.",
};

export default function AdminActivitiesPage() {
  return <AdminActivitiesContent />;
}
