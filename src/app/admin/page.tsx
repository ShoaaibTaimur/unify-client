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

export default function AdminOverview() {
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
      label: "Activities",
      value: actList.length,
      sub: `${upcomingCount} upcoming · ${completedCount} done`,
      icon: CalendarDays,
      color: "text-purple-500 bg-purple-500/10",
    },
  ];

  return (
    <div className="space-y-8">
      {/* HEADER WITH QUICK ACTIONS */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Admin Console
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            University-wide system overview, manage organization structure and
            access.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <Link href="/admin/organization">
            <Button size="sm" variant="outline" className="rounded-full">
              <Plus className="mr-1.5 h-3.5 w-3.5" /> Dept / Batch
            </Button>
          </Link>
          <Link href="/admin/users">
            <Button size="sm" variant="outline" className="rounded-full">
              <UserCheck className="mr-1.5 h-3.5 w-3.5" /> Manage Users
            </Button>
          </Link>
          <Link href="/admin/activities">
            <Button size="sm" className="rounded-full">
              <ActivityIcon className="mr-1.5 h-3.5 w-3.5" /> Manage Activities
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI METRICS GRID */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div
              key={kpi.label}
              className="relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-card transition-all hover:border-primary/30"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {kpi.label}
                </span>
                <div
                  className={`grid h-9 w-9 place-items-center rounded-xl ${kpi.color}`}
                >
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="font-display text-3xl font-semibold leading-none">
                  {kpi.value}
                </span>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">{kpi.sub}</p>
            </div>
          );
        })}
      </div>

      {/* MAIN TWO-COLUMN DASHBOARD GRID */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* LEFT 2 COLUMNS */}
        <div className="space-y-6 lg:col-span-2">
          {/* RECENT ACTIVITIES FEED */}
          <div className="rounded-3xl border border-border bg-card p-6 shadow-card">
            <div className="flex items-center justify-between border-b border-border/60 pb-4">
              <div>
                <h2 className="font-display text-xl font-semibold">
                  Recent Activities
                </h2>
                <p className="text-xs text-muted-foreground">
                  Latest academic schedules posted across departments
                </p>
              </div>
              <Link href="/admin/activities">
                <Button variant="ghost" size="sm" className="rounded-full text-xs">
                  View all <ArrowRight className="ml-1 h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
            <div className="mt-4 space-y-3">
              {recentActivities.length === 0 ? (
                <div className="py-10 text-center text-sm text-muted-foreground">
                  No activities created yet.
                </div>
              ) : (
                recentActivities.map((act) => (
                  <ActivityCard key={act.id} activity={act} compact />
                ))
              )}
            </div>
          </div>

          {/* ACTIVITY TYPE DISTRIBUTION */}
          <div className="rounded-3xl border border-border bg-card p-6 shadow-card">
            <h2 className="font-display text-xl font-semibold">
              Activity Distribution
            </h2>
            <p className="text-xs text-muted-foreground">
              Breakdown of recorded activities by type
            </p>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {ACTIVITY_TYPES.map((t) => {
                const count = actList.filter(
                  (a) => a.activityType === t.value
                ).length;
                return (
                  <div
                    key={t.value}
                    className="flex items-center justify-between rounded-xl border border-border/80 bg-background/50 px-3 py-2.5"
                  >
                    <span className="text-xs font-medium truncate">
                      {t.label}
                    </span>
                    <span className="ml-2 rounded-md bg-muted px-2 py-0.5 text-xs font-semibold">
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-6">
          {/* USER ROLES BREAKDOWN */}
          <div className="rounded-3xl border border-border bg-card p-6 shadow-card">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold">
                User Directory
              </h2>
              <Link href="/admin/users">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 rounded-full text-xs px-2.5"
                >
                  Manage
                </Button>
              </Link>
            </div>
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between rounded-2xl border border-border/60 bg-muted/30 p-3">
                <div className="flex items-center gap-3">
                  <div className="grid h-8 w-8 place-items-center rounded-xl bg-blue-500/10 text-blue-500">
                    <UserCheck className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold">
                      Class Representatives
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                      Section managers
                    </div>
                  </div>
                </div>
                <span className="font-display text-lg font-semibold">
                  {crCount}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-border/60 bg-muted/30 p-3">
                <div className="flex items-center gap-3">
                  <div className="grid h-8 w-8 place-items-center rounded-xl bg-emerald-500/10 text-emerald-500">
                    <Briefcase className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold">Teachers</div>
                    <div className="text-[11px] text-muted-foreground">
                      Course instructors
                    </div>
                  </div>
                </div>
                <span className="font-display text-lg font-semibold">
                  {teacherCount}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-border/60 bg-muted/30 p-3">
                <div className="flex items-center gap-3">
                  <div className="grid h-8 w-8 place-items-center rounded-xl bg-purple-500/10 text-purple-500">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold">
                      System Administrators
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                      Full access
                    </div>
                  </div>
                </div>
                <span className="font-display text-lg font-semibold">
                  {adminCount}
                </span>
              </div>
            </div>
          </div>

          {/* DEPARTMENTS QUICK SNAPSHOT */}
          <div className="rounded-3xl border border-border bg-card p-6 shadow-card">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold">
                Departments
              </h2>
              <Link href="/admin/organization">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 rounded-full text-xs px-2.5"
                >
                  Structure
                </Button>
              </Link>
            </div>
            <div className="mt-4 space-y-2.5">
              {depList.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  No departments configured.
                </p>
              ) : (
                depList.map((dep) => {
                  const bCount = batList.filter(
                    (b) => b.departmentId === dep.id
                  ).length;
                  return (
                    <div
                      key={dep.id}
                      className="flex items-center justify-between rounded-xl border border-border/50 bg-background/40 px-3 py-2 text-xs"
                    >
                      <span className="font-medium truncate">{dep.name}</span>
                      <span className="text-muted-foreground">
                        {bCount} Batches
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* SYSTEM HEALTH */}
          <div className="rounded-3xl border border-border bg-card p-6 shadow-card">
            <div className="flex items-center gap-3">
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-500/10 text-emerald-500">
                <Server className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-xs font-semibold">System Status</h3>
                <p className="text-[11px] text-muted-foreground">
                  Backend &amp; Database status
                </p>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between rounded-xl bg-muted/40 px-3 py-2.5 text-xs">
              <span className="text-muted-foreground">API Service:</span>
              <span className="flex items-center gap-1.5 font-medium text-emerald-500">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />{" "}
                Live &amp; Ready
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
