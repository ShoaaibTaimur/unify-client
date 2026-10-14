import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { QueryClient, dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { CRDashboardView } from "@/components/views/portal/CRDashboardView";
import { getServerUser } from "@/lib/auth/server";
import { serverApi } from "@/lib/server-api";

export const metadata: Metadata = {
  title: "CR Dashboard — UNIFY",
  description: "Class Representative activity management portal.",
};

export const dynamic = "force-dynamic";

export default async function CRDashboardPage() {
  const user = await getServerUser();
  if (!user) {
    redirect("/login?from=/cr");
  }
  if (user.role !== "cr") {
    redirect(user.role === "admin" ? "/admin" : user.role === "teacher" ? "/teacher" : "/");
  }

  const queryClient = new QueryClient();

  const filter = {
    departmentId: user.departmentId,
    batchId: user.batchId,
    sectionId: user.sectionId,
  };

  await Promise.allSettled([
    queryClient.prefetchQuery({
      queryKey: ["activities", filter],
      queryFn: () => serverApi.listActivities(filter),
    }),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <CRDashboardView initialUser={user} />
    </HydrationBoundary>
  );
}
