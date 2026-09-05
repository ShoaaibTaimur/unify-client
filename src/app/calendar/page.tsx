import type { Metadata } from "next";
import { QueryClient, dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { CalendarView } from "@/components/views/CalendarView";
import { serverApi } from "@/lib/server-api";
import { getServerClassSelection } from "@/lib/server-session";
import { hasSelectedClass } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Activity Calendar — UNIFY",
  description: "Month view of every class test, lab test, viva, assignment, and exam scheduled for your class.",
};

export default async function CalendarPage() {
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
      <CalendarView initialClass={cls} />
    </HydrationBoundary>
  );
}
