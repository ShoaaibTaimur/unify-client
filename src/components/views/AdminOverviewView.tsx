"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { api } from "@/lib/api";
import {
  Building2,
  Users,
  CalendarDays,
  Layers,
  ArrowRight,
  ShieldCheck,
  UserCheck,
  Briefcase,
  Plus,
  Server,
  Activity as ActivityIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ActivityCard } from "@/components/ActivityCard";
import { PageLoader } from "@/components/PageLoader";
import { ACTIVITY_TYPES } from "@/lib/types";

export function AdminOverviewView() {
  const departments = useQuery({
    queryKey: ["departments"],
    queryFn: () => api.listDepartments(),
  });
  const batches = useQuery({
    queryKey: ["batches", "all"],
    queryFn: () => api.listBatches(),
  });
  const sections = useQuery({
    queryKey: ["sections", "all"],
    queryFn: () => api.listSections(),
  });
  const users = useQuery({
    queryKey: ["users"],
    queryFn: () => api.listUsers(),
  });
  const activities = useQuery({
    queryKey: ["activities", "all"],
    queryFn: () => api.listActivities(),
  });

  const isLoading =
    departments.isLoading ||
    batches.isLoading ||
    sections.isLoading ||
    users.isLoading ||
    activities.isLoading;

  if (isLoading) {
    return <PageLoader text="Loading admin console..." />;
  }

  const depList = departments.data ?? [];
  const batList = batches.data ?? [];
  const secList = sections.data ?? [];
  const userList = users.data ?? [];
  const actList = activities.data ?? [];

  const crCount = userList.filter((u) => u.role === "cr").length;
  const teacherCount = userList.filter((u) => u.role === "teacher").length;
  const adminCount = userList.filter((u) => u.role === "admin").length;

  const now = new Date();
  const upcomingCount = actList.filter(
    (a) => new Date(a.endDate ?? a.startDate ?? a.date!) >= now
  ).length;
  const completedCount = actList.length - upcomingCount;

  const recentActivities = [...actList]
    .sort(
      (a, b) =>
        new Date(b.createdAt ?? b.date ?? 0).getTime() -
        new Date(a.createdAt ?? a.date ?? 0).getTime()
    )
    .slice(0, 2);

  const kpis = [
    {
      label: "Departments",
      value: depList.length,
      sub: "Academic divisions",
      icon: Building2,
      color: "text-blue-500 bg-blue-500/10",
    },
    {
      label: "Batches",
      value: batList.length,
      sub: `${secList.length} active sections`,
      icon: Layers,
      color: "text-amber-500 bg-amber-500/10",
    },
    {
      label: "Total Users",
      value: userList.length,
      sub: `${crCount} CRs · ${teacherCount} Teachers`,
      icon: Users,
      color: "text-emerald-500 bg-emerald-500/10",
    },
    {
      label: "Total Activities",
      value: actList.length,
      sub: `${upcomingCount} upcoming entries`,
      icon: CalendarDays,
      color: "text-purple-500 bg-purple-500/10",
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div>
        <h1 className="font-display text-4xl font-semibold">Admin Console</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          System-wide governance & management overview across UNIFY.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((k) => {
          const Icon = k.icon;
          return (
            <div
              key={k.label}
              className="rounded-3xl border border-border bg-card p-5 shadow-card transition-all hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <div
                  className={`grid h-10 w-10 place-items-center rounded-2xl ${k.color}`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <span className="font-display text-3xl font-bold text-foreground">
                  {k.value}
                </span>
              </div>
              <div className="mt-3">
                <div className="font-semibold text-sm">{k.label}</div>
                <div className="text-xs text-muted-foreground">{k.sub}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-3xl border border-border bg-card p-6 shadow-card space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display text-xl font-semibold">
                  Recent Activities
                </h2>
                <p className="text-xs text-muted-foreground">
                  Latest entries added across all departments
                </p>
              </div>
              <Link href="/admin/activities">
                <Button variant="outline" size="sm" className="rounded-full">
                  View all ({actList.length}) <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>

            <div className="space-y-3">
              {recentActivities.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
                  No activities created yet.
                </div>
              ) : (
                recentActivities.map((a) => (
                  <ActivityCard key={a.id} activity={a} />
                ))
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl border border-border bg-card p-6 shadow-card space-y-4">
            <h2 className="font-display text-xl font-semibold">Quick Actions</h2>
            <div className="space-y-2">
              <Link href="/admin/organization" className="block">
                <Button variant="outline" className="w-full justify-start rounded-2xl h-11 text-xs font-semibold">
                  <Building2 className="mr-2 h-4 w-4 text-blue-500" /> Manage Departments & Batches
                </Button>
              </Link>
              <Link href="/admin/users" className="block">
                <Button variant="outline" className="w-full justify-start rounded-2xl h-11 text-xs font-semibold">
                  <Users className="mr-2 h-4 w-4 text-emerald-500" /> Manage CRs & Teachers
                </Button>
              </Link>
              <Link href="/admin/activities" className="block">
                <Button variant="outline" className="w-full justify-start rounded-2xl h-11 text-xs font-semibold">
                  <CalendarDays className="mr-2 h-4 w-4 text-purple-500" /> Manage All Activities
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
