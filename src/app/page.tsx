import type { Metadata } from "next";
import { QueryClient, dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { HomeView } from "@/components/views/HomeView";
import { serverApi } from "@/lib/server-api";
import { getServerClassSelection } from "@/lib/server-session";
import { hasSelectedClass } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Dashboard — UNIFY Academic Portal",
  description: "Track today's, upcoming, and past academic activities for your university class.",
};

export default async function HomePage() {
  const cls = await getServerClassSelection();
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60_000,
      },
    },
  });

  // Prefetch departments on server
  await queryClient.prefetchQuery({
    queryKey: ["departments"],
    queryFn: () => serverApi.listDepartments(),
  });

  if (cls && hasSelectedClass(cls)) {
    await Promise.allSettled([
      queryClient.prefetchQuery({
        queryKey: ["activities", cls],
        queryFn: () => serverApi.listActivities(cls),
      }),
      cls.departmentId
        ? queryClient.prefetchQuery({
            queryKey: ["batches", cls.departmentId],
            queryFn: () => serverApi.listBatches(cls.departmentId),
          })
        : Promise.resolve(),
      cls.batchId && cls.batchId !== "all"
        ? queryClient.prefetchQuery({
            queryKey: ["sections", cls.batchId],
            queryFn: () => serverApi.listSections(cls.batchId),
          })
        : Promise.resolve(),
    ]);
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <HomeView initialClass={cls} />
    </HydrationBoundary>
  );
}
