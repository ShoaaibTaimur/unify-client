import type { Metadata } from "next";
import { QueryClient, dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { HomeView } from "@/components/views/academic/HomeView";
import { serverApi } from "@/lib/server-api";
import { getServerClassSelection } from "@/lib/server-session";
import { getServerUser } from "@/lib/auth/server";
import { hasSelectedClass, getActivityQueryKey } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Dashboard — UNIFY Academic Portal",
  description: "Track today's, upcoming, and past academic activities for your university class.",
};

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [cls, user] = await Promise.all([
    getServerClassSelection(),
    getServerUser(),
  ]);

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
      },
    },
  });

  // Single unified hop — zero waterfall!
  const bootstrap = await serverApi.getBootstrap(cls ?? undefined);

  queryClient.setQueryData(["departments"], bootstrap.departments || []);
  if (cls?.departmentId) {
    queryClient.setQueryData(["batches", cls.departmentId], bootstrap.batches || []);
  }
  if (cls?.batchId && cls.batchId !== "all") {
    queryClient.setQueryData(["sections", cls.batchId], bootstrap.sections || []);
  }
  if (cls && hasSelectedClass(cls)) {
    queryClient.setQueryData(getActivityQueryKey(cls), bootstrap.activities || []);
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <HomeView initialClass={cls} initialUser={user} />
    </HydrationBoundary>
  );
}
