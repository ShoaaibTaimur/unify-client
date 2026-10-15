import { PanelClientLayout } from "@/components/layout/PanelClientLayout";
import { serverApi } from "@/lib/server-api";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function TeacherLayout({ children }: { children: React.ReactNode }) {
  const user = await serverApi.getCurrentUser();

  if (user && user.role !== "teacher") {
    redirect(user.role === "admin" ? "/admin" : user.role === "cr" ? "/cr" : "/");
  }

  return (
    <PanelClientLayout role="teacher" roleLabel="Teacher" panelHref="/teacher" initialUser={user}>
      {children}
    </PanelClientLayout>
  );
}
