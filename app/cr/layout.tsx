import { PanelClientLayout } from "@/components/layout/PanelClientLayout";
import { getServerUser } from "@/lib/auth/server";
import { redirect } from "next/navigation";

export default async function CRLayout({ children }: { children: React.ReactNode }) {
  const user = await getServerUser();
  if (!user || (user.role !== "cr" && user.role !== "admin")) {
    redirect("/login?from=/cr");
  }

  return (
    <PanelClientLayout role="cr" roleLabel="CR" panelHref="/cr" initialUser={user}>
      {children}
    </PanelClientLayout>
  );
}
