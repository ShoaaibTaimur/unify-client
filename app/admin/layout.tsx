import type { Metadata } from "next";
import { PanelClientLayout } from "@/components/layout/PanelClientLayout";

export const metadata: Metadata = {
  title: "Admin Console — UNIFY",
  description: "Administrative console for managing UNIFY departments, users, and activities.",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PanelClientLayout role="admin" roleLabel="Admin" panelHref="/admin">{children}</PanelClientLayout>;
}
