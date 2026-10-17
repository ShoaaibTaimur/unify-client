"use client";

import Link from "next/link";
import {
  Building2,
  Users,
  CalendarDays,
  Layers,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ActivityCard } from "@/components/activities/ActivityCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminOverviewQuery } from "@/lib/api";

export function AdminOverviewContent() {
  const overview = useAdminOverviewQuery();
  const counts = overview.data?.counts;
  const recentActivities = overview.data?.recentActivities ?? [];

  const kpis = [
    {
      label: "Departments",
      value: counts?.departments ?? 0,
      sub: "Academic divisions",
      icon: Building2,
      color: "text-blue-500 bg-blue-500/10",
      loading: overview.isLoading,
    },
    {
      label: "Batches",
      value: counts?.batches ?? 0,
      sub: `${counts?.sections ?? 0} active sections`,
      icon: Layers,
      color: "text-amber-500 bg-amber-500/10",
      loading: overview.isLoading,
    },
    {
      label: "Total Users",
      value: counts?.users ?? 0,
      sub: `${counts?.roles.cr ?? 0} CRs · ${counts?.roles.teacher ?? 0} Teachers · ${counts?.roles.admin ?? 0} Admins`,
      icon: Users,
      color: "text-emerald-500 bg-emerald-500/10",
      loading: overview.isLoading,
    },
    {
      label: "Total Activities",
      value: counts?.activities ?? 0,
      sub: `${counts?.upcomingActivities ?? 0} upcoming entries`,
      icon: CalendarDays,
      color: "text-purple-500 bg-purple-500/10",
      loading: overview.isLoading,
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col gap-1 border-b border-border pb-5">
        <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-primary font-bold">
          SYSTEM GOVERNANCE
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
          Admin Console
        </h1>
        <p className="font-mono text-xs text-muted-foreground">
          System-wide governance, class structures, and academic activities across UNIFY.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((k) => {
          const Icon = k.icon;
          return (
            <div
              key={k.label}
              className="rounded-[4px] border border-border bg-card p-4 transition-all hover:border-primary/60 hover:shadow-2xs group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 bg-primary shrink-0" />
                  <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground font-semibold">
                    {k.label}
                  </span>
                </div>
                <Icon className="h-4 w-4 text-muted-foreground/60 group-hover:text-primary transition-colors" />
              </div>
              <div className="mt-3">
                {k.loading ? (
                  <Skeleton className="h-8 w-16 rounded-[4px]" />
                ) : (
                  <span className="font-mono text-3xl font-bold text-foreground group-hover:text-primary transition-colors">
                    {k.value}
                  </span>
                )}
                <div className="mt-1 font-mono text-[11px] text-muted-foreground">
                  {k.loading ? <Skeleton className="h-3 w-24 rounded-[4px]" /> : k.sub}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-[4px] border border-border bg-card overflow-hidden shadow-2xs">
            <div className="flex items-center justify-between border-b border-border bg-secondary/35 px-4 py-2.5">
              <div>
                <h2 className="font-mono text-xs font-bold uppercase tracking-[0.12em] text-foreground">
                  Recent Activities
                </h2>
                <p className="font-mono text-[11px] text-muted-foreground">
                  Latest entries added across all departments
                </p>
              </div>
              <Button asChild variant="outline" size="sm" className="rounded-[4px] border border-border text-foreground hover:bg-primary/10 hover:text-primary hover:border-primary/50 font-mono text-[11px] uppercase tracking-[0.12em] font-semibold h-8 px-3 transition-colors">
                <Link href="/admin/activities">
                  View all ({counts?.activities ?? 0}) <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>

            <div className="p-4 space-y-3">
              {recentActivities.length === 0 ? (
                <div className="rounded-[4px] border border-dashed border-border p-6 text-center font-mono text-xs text-muted-foreground">
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
          <div className="rounded-[4px] border border-border bg-card overflow-hidden shadow-2xs">
            <div className="border-b border-border bg-secondary/35 px-4 py-2.5">
              <h2 className="font-mono text-xs font-bold uppercase tracking-[0.12em] text-foreground">
                Quick Actions
              </h2>
            </div>
            <div className="p-4 space-y-2.5">
              <Link href="/admin/organization" className="block">
                <Button variant="outline" className="w-full justify-start rounded-[4px] border border-border hover:bg-primary/10 hover:text-primary hover:border-primary/50 font-mono text-xs uppercase tracking-wide font-semibold h-11 transition-colors">
                  <Building2 className="mr-2 h-4 w-4 text-primary" /> Manage Departments & Batches
                </Button>
              </Link>
              <Link href="/admin/users" className="block">
                <Button variant="outline" className="w-full justify-start rounded-[4px] border border-border hover:bg-primary/10 hover:text-primary hover:border-primary/50 font-mono text-xs uppercase tracking-wide font-semibold h-11 transition-colors">
                  <Users className="mr-2 h-4 w-4 text-primary" /> Manage CRs & Teachers
                </Button>
              </Link>
              <Link href="/admin/activities" className="block">
                <Button variant="outline" className="w-full justify-start rounded-[4px] border border-border hover:bg-primary/10 hover:text-primary hover:border-primary/50 font-mono text-xs uppercase tracking-wide font-semibold h-11 transition-colors">
                  <CalendarDays className="mr-2 h-4 w-4 text-primary" /> Manage All Activities
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
