import type { Metadata } from "next";
import { AdminOrgView } from "@/components/views/AdminOrgView";

export const metadata: Metadata = {
  title: "Organization Structure — Admin Console",
  description: "University department, batch, and section structure management.",
};

export default function OrganizationPage() {
  return <AdminOrgView />;
}
