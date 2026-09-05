import type { Metadata } from "next";
import { QueryClient, dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { ActivitiesView } from "@/components/views/ActivitiesView";
import { serverApi } from "@/lib/server-api";
import { getServerClassSelection } from "@/lib/server-session";
import { hasSelectedClass } from "@/lib/utils";

export const metadata: Metadata = {
  title: "All Activities — UNIFY",
  description: "Browse all scheduled class tests, lab tests, assignments, viva, and exams for your class.",
};

export default async function ActivitiesPage() {
  const cls = await getServerClassSelection();
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60_000,
      },
    },
  });

  await queryClient.prefetchQuery({
    queryKey: ["departments"],
    queryFn: () => serverApi.listDepartments(),
  });

  if (cls && hasSelectedClass(cls)) {
    await queryClient.prefetchQuery({
      queryKey: ["activities", cls],
      queryFn: () => serverApi.listActivities(cls),
    });
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ActivitiesView initialClass={cls} />
    </HydrationBoundary>
  );
}
