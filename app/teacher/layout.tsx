import { PanelClientLayout } from "@/components/layout/PanelClientLayout";
import { getServerUser } from "@/lib/auth/server";
import { redirect } from "next/navigation";

export default async function TeacherLayout({ children }: { children: React.ReactNode }) {
  const user = await getServerUser();
  if (!user) {
    redirect("/login?from=/teacher");
  }
  if (user.role !== "teacher" && user.role !== "admin") {
    redirect(user.role === "cr" ? "/cr" : "/");
  }

  return (
    <PanelClientLayout role="teacher" roleLabel="Teacher" panelHref="/teacher" initialUser={user}>
      {children}
    </PanelClientLayout>
  );
}
