import type { Metadata } from "next";
import { AdminOverviewView } from "@/components/views/AdminOverviewView";

export const metadata: Metadata = {
  title: "Admin Console — UNIFY",
  description: "University academic governance, department overview, and stats.",
};

export default function AdminOverviewPage() {
  return <AdminOverviewView />;
}
