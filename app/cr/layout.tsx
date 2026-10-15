import { PanelClientLayout } from "@/components/layout/PanelClientLayout";
import { serverApi } from "@/lib/server-api";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function CRLayout({ children }: { children: React.ReactNode }) {
  const user = await serverApi.getCurrentUser();

  if (!user) {
    const cookieStore = await cookies();
    const hasAnyToken =
      cookieStore.has("access_token") ||
      cookieStore.has("refresh_token");

    if (!hasAnyToken) {
      redirect("/login?from=/cr");
    }
  } else if (user.role !== "cr") {
    redirect(user.role === "admin" ? "/admin" : user.role === "teacher" ? "/teacher" : "/");
  }

  return (
    <PanelClientLayout role="cr" roleLabel="CR" panelHref="/cr" initialUser={user}>
      {children}
    </PanelClientLayout>
  );
}
