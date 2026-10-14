import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { QueryClient, dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { TeacherDashboardView } from "@/components/views/portal/TeacherDashboardView";
import { getServerUser } from "@/lib/auth/server";
import { serverApi } from "@/lib/server-api";

export const metadata: Metadata = {
  title: "Teacher Dashboard — UNIFY",
  description: "Faculty Teacher activity scheduling and management console.",
};

export const dynamic = "force-dynamic";

export default async function TeacherDashboardPage() {
  const user = await getServerUser();
  if (!user || (user.role !== "teacher" && user.role !== "admin")) {
    redirect("/login?from=/teacher");
  }

  const queryClient = new QueryClient();

  await Promise.allSettled([
    queryClient.prefetchQuery({
      queryKey: ["departments"],
      queryFn: () => serverApi.listDepartments(),
    }),
    user.departmentId
      ? queryClient.prefetchQuery({
          queryKey: ["batches", user.departmentId],
          queryFn: () => serverApi.listBatches(user.departmentId),
        })
      : Promise.resolve(),
    queryClient.prefetchQuery({
      queryKey: ["activities", { departmentId: user.departmentId }],
      queryFn: () => serverApi.listActivities({ departmentId: user.departmentId }),
    }),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <TeacherDashboardView />
    </HydrationBoundary>
  );
}
