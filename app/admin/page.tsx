import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { QueryClient, dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { AdminOverviewView } from "@/components/views/admin/AdminOverviewView";
import { serverApi } from "@/lib/server-api";

export const metadata: Metadata = {
  title: "Admin Console — UNIFY",
  description: "University academic governance, department overview, and stats.",
};

export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  const user = await serverApi.getCurrentUser();
  if (!user) {
    redirect("/login?from=/admin");
  }
  if (user.role !== "admin") {
    redirect(user.role === "teacher" ? "/teacher" : user.role === "cr" ? "/cr" : "/");
  }

  const queryClient = new QueryClient();

  await Promise.allSettled([
    queryClient.prefetchQuery({
      queryKey: ["departments"],
      queryFn: () => serverApi.listDepartments(),
    }),
    queryClient.prefetchQuery({
      queryKey: ["batches", "all"],
      queryFn: () => serverApi.listBatches(),
    }),
    queryClient.prefetchQuery({
      queryKey: ["sections", "all"],
      queryFn: () => serverApi.listSections(),
    }),
    queryClient.prefetchQuery({
      queryKey: ["users"],
      queryFn: () => serverApi.listUsers(),
    }),
    queryClient.prefetchQuery({
      queryKey: ["activities", "all"],
      queryFn: () => serverApi.listActivities(),
    }),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <AdminOverviewView />
    </HydrationBoundary>
  );
}
