import { PanelClientLayout } from "@/components/layout/PanelClientLayout";
import { serverApi } from "@/lib/server-api";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function TeacherLayout({ children }: { children: React.ReactNode }) {
  const user = await serverApi.getCurrentUser();

  if (!user) {
    const cookieStore = await cookies();
    const hasAnyToken =
      cookieStore.has("access_token") ||
      cookieStore.has("refresh_token");

    if (!hasAnyToken) {
      redirect("/login?from=/teacher");
    }
  } else if (user.role !== "teacher") {
    redirect(user.role === "admin" ? "/admin" : user.role === "cr" ? "/cr" : "/");
  }

  return (
    <PanelClientLayout role="teacher" roleLabel="Teacher" panelHref="/teacher" initialUser={user}>
      {children}
    </PanelClientLayout>
  );
}
