import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { QueryClient, dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { CRDashboardView } from "@/components/views/portal/CRDashboardView";
import { getServerUser } from "@/lib/server-auth";
import { serverApi } from "@/lib/server-api";

export const metadata: Metadata = {
  title: "CR Dashboard — UNIFY",
  description: "Class Representative activity management portal.",
};

export const dynamic = "force-dynamic";

export default async function CRDashboardPage() {
  const user = await getServerUser();
  if (!user || (user.role !== "cr" && user.role !== "admin")) {
    redirect("/login");
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
      <CRDashboardView />
    </HydrationBoundary>
  );
}
