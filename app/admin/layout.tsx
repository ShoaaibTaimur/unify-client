import type { Metadata } from "next";
import { AdminClientLayout } from "./AdminClientLayout";

export const metadata: Metadata = {
  title: "Admin Console — UNIFY",
  description: "Administrative console for managing UNIFY departments, users, and activities.",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminClientLayout>{children}</AdminClientLayout>;
}
