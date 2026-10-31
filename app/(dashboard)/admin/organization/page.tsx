import type { Metadata } from "next";
import { AdminOrganizationContent } from "@/components/features/admin/AdminOrganizationContent";

export const metadata: Metadata = {
  title: "Organization Structure — Admin Console",
  description: "University department, batch, and section structure management.",
};

export default function OrganizationPage() {
  return <AdminOrganizationContent />;
}
