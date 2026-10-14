import { PanelClientLayout } from "@/components/layout/PanelClientLayout";
import { getServerUser } from "@/lib/auth/server";
import { redirect } from "next/navigation";

export default async function TeacherLayout({ children }: { children: React.ReactNode }) {
  const user = await getServerUser();
  if (!user || (user.role !== "teacher" && user.role !== "admin")) {
    redirect("/login?from=/teacher");
  }

  return (
    <PanelClientLayout role="teacher" roleLabel="Teacher" panelHref="/teacher" initialUser={user}>
      {children}
    </PanelClientLayout>
  );
}
