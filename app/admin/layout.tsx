import type { Metadata } from "next";
import { AdminClientLayout } from "./AdminClientLayout";
import { serverApi } from "@/lib/server-api";
import { cookies } from "next/headers";
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
  const user = await serverApi.getCurrentUser();

  if (!user) {
    const cookieStore = await cookies();
    const hasAnyToken =
      cookieStore.has("access_token") ||
      cookieStore.has("refresh_token");

    if (!hasAnyToken) {
      redirect("/login?from=/admin");
    }
  } else if (user.role !== "admin") {
    redirect(user.role === "teacher" ? "/teacher" : user.role === "cr" ? "/cr" : "/");
  }

  return <AdminClientLayout initialUser={user}>{children}</AdminClientLayout>;
}
