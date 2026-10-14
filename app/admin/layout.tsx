import type { Metadata } from "next";
import { AdminClientLayout } from "./AdminClientLayout";
import { getServerUser } from "@/lib/auth/server";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Admin Console — UNIFY",
  description: "Administrative console for managing UNIFY departments, users, and activities.",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getServerUser();
  if (!user || user.role !== "admin") {
    redirect("/login?from=/admin");
  }

  return <AdminClientLayout initialUser={user}>{children}</AdminClientLayout>;
}
