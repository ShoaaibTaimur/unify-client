import type { Metadata } from "next";
import { QueryClient, dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { ActivitiesView } from "@/components/views/academic/ActivitiesView";
import { serverApi } from "@/lib/server-api";
import { getServerClassSelection } from "@/lib/server-session";
import { hasSelectedClass, getActivityQueryKey } from "@/lib/utils";

export const metadata: Metadata = {
  title: "All Activities — UNIFY",
  description: "Browse all scheduled class tests, lab tests, assignments, viva, and exams for your class.",
};

export const dynamic = "force-dynamic";

export default async function ActivitiesPage() {
  const cls = await getServerClassSelection();
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
      },
    },
  });

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
      <ActivitiesView initialClass={cls} />
    </HydrationBoundary>
  );
}
