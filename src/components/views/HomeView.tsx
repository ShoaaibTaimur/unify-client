"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { api } from "@/lib/api";
import { hasSelectedClass, setClassSelection, useClassSelection } from "@/lib/session";
import type { Activity } from "@/lib/types";
import { ClassSelectionDialog } from "@/components/ClassSelectionDialog";
import { ActivityCard } from "@/components/ActivityCard";
import { ActivityDetailsDialog } from "@/components/ActivityDetailsDialog";
import { Button } from "@/components/ui/button";
import { PageLoader } from "@/components/PageLoader";
import { differenceInSeconds, isSameDay } from "date-fns";
import { hasActiveExams } from "@/lib/utils";
import { ArrowRight, PartyPopper, Settings2, ExternalLink } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

function useTicker(ms = 1000) {
  const [, set] = useState(0);
  useEffect(() => {
    const id = setInterval(() => set((n) => n + 1), ms);
    return () => clearInterval(id);
  }, [ms]);
}

function nextActivityDate(a: Activity) {
  return new Date(a.startDate ?? a.date!);
}

function countdown(totalSeconds: number): [number, string][] {
  if (totalSeconds <= 0)
    return [
      [0, "Days"],
      [0, "Hours"],
      [0, "Minutes"],
    ];
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  return [
    [days, "Days"],
    [hours, "Hours"],
    [mins, "Minutes"],
  ];
}

export function HomeView() {
  const { cls, loaded } = useClassSelection();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedNextActivity, setSelectedNextActivity] = useState<Activity | null>(null);

  useEffect(() => {
    if (loaded && !hasSelectedClass(cls)) {
      setDialogOpen(true);
    }
  }, [cls, loaded]);

  useTicker(1000);

  const activities = useQuery({
    queryKey: ["activities", cls],
    queryFn: () => api.listActivities(cls ?? undefined),
    enabled: loaded,
  });

  const departments = useQuery({
    queryKey: ["departments"],
    queryFn: () => api.listDepartments(),
  });
  const batches = useQuery({
    queryKey: ["batches", cls?.departmentId],
    queryFn: () => (cls?.departmentId ? api.listBatches(cls.departmentId) : []),
    enabled: !!cls?.departmentId,
  });
  const sections = useQuery({
    queryKey: ["sections", cls?.batchId],
    queryFn: () => (cls?.batchId ? api.listSections(cls.batchId) : []),
    enabled: !!cls?.batchId,
  });

  const list = activities.data ?? [];
  const showSeatPlan = hasActiveExams(list);
  const now = new Date();

  const todayList = useMemo(() => {
    return list.filter((a) => {
      if (a.startDate && a.endDate) {
        const s = new Date(a.startDate);
        const e = new Date(a.endDate);
        return (
          now >= new Date(s.getFullYear(), s.getMonth(), s.getDate()) &&
          now <= new Date(e.getFullYear(), e.getMonth(), e.getDate(), 23, 59, 59)
        );
      }
      return a.date ? isSameDay(new Date(a.date), now) : false;
    });
  }, [list, now]);

  const upcomingList = useMemo(() => {
    return list
      .filter((a) => nextActivityDate(a) >= now)
      .sort((a, b) => nextActivityDate(a).getTime() - nextActivityDate(b).getTime());
  }, [list, now]);

  const next = upcomingList[0] ?? null;
  const upNext2 = upcomingList.slice(1, 3);

  const nextDelta = next ? differenceInSeconds(nextActivityDate(next), now) : 0;

  const depName = departments.data?.find((d) => d.id === cls?.departmentId)?.name;
  const batchName = batches.data?.find((b) => b.id === cls?.batchId)?.name;
  const secName =
    cls?.sectionId === "all"
      ? "All Sections"
      : sections.data?.find((s) => s.id === cls?.sectionId)?.name;

  const meta =
    depName && batchName
      ? `${depName} · ${batchName}${secName ? ` · ${secName}` : ""}`
      : null;

  // Don't block the whole page — skeleton inline where data is still loading
  const isDataLoading = !loaded || activities.isLoading;

  if (activities.isError) {
    return (
      <div className="mx-auto max-w-md py-24 text-center">
        <p className="text-sm font-medium text-destructive">Failed to load activities.</p>
        <p className="mt-1 text-xs text-muted-foreground">{(activities.error as Error)?.message}</p>
        <button
          onClick={() => activities.refetch()}
          className="mt-4 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <>
      <ClassSelectionDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        initial={cls}
      />

      {/* Single Activity Details Modal */}
      <ActivityDetailsDialog
        activity={selectedNextActivity}
        open={!!selectedNextActivity}
        onOpenChange={(v) => {
          if (!v) setSelectedNextActivity(null);
        }}
      />

      {/* HERO */}
      <section className="relative overflow-hidden border-b border-border/60 bg-gradient-to-b from-primary/5 via-transparent to-transparent py-10 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
            <div className="min-w-0 max-w-full">
              {meta ? (
                <div className="inline-flex max-w-full items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary truncate">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary animate-pulse" />
                  <span className="truncate">{meta}</span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-600 dark:text-amber-400">
                  No class selected
                </div>
              )}
              <h1 className="mt-4 font-display text-2xl sm:text-4xl md:text-5xl font-bold tracking-tight break-words max-w-full">
                {meta ? (
                  <>
                    <span className="text-primary">{meta}</span>
                  </>
                ) : (
                  "Welcome to UNIFY"
                )}
              </h1>
              <p className="mt-2 max-w-xl text-sm sm:text-base text-muted-foreground">
                {meta
                  ? "Everything happening in your class — at a glance."
                  : "Pick your class to see your activities."}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-2 sm:gap-2.5 w-full sm:w-auto max-w-full">
              {showSeatPlan && (
                <a
                  href="https://examsync.kiron.dev/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto"
                >
                  <Button
                    variant="outline"
                    className="w-full sm:w-auto rounded-full border-primary/40 text-primary hover:bg-primary/10 hover:text-primary font-bold justify-center text-xs sm:text-sm"
                  >
                    <ExternalLink className="mr-1.5 h-3.5 w-3.5 shrink-0" /> Exam Seat Plan ↗
                  </Button>
                </a>
              )}
              <Button
                variant="outline"
                className="w-full sm:w-auto rounded-full justify-center text-xs sm:text-sm"
                onClick={() => {
                  setClassSelection({
                    departmentId: "",
                    batchId: "",
                    sectionId: "",
                  });
                  setDialogOpen(true);
                }}
              >
                <Settings2 className="mr-1.5 h-3.5 w-3.5 shrink-0" /> Change class
              </Button>
              <Link href="/activities" className="w-full sm:w-auto">
                <Button className="w-full sm:w-auto rounded-full justify-center text-xs sm:text-sm">
                  View all activities <ArrowRight className="ml-1.5 h-3.5 w-3.5 shrink-0" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CONTENT */}
      <section className="mx-auto grid max-w-7xl gap-6 px-4 pb-16 pt-8 sm:px-6 lg:grid-cols-3 lg:px-8">
        {/* Main feed */}
        <div className="min-w-0 max-w-full lg:col-span-2">
          {/* Today */}
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl sm:text-2xl font-semibold">Today</h2>
            <span className="text-xs text-muted-foreground">
              {todayList.length} activity
            </span>
          </div>

          {isDataLoading ? (
            <div className="mt-3 space-y-3">
              {[1, 2].map((i) => <Skeleton key={i} className="h-24 w-full rounded-2xl" />)}
            </div>
          ) : todayList.length === 0 ? (
            <div className="mt-3 flex items-center justify-between rounded-2xl border border-dashed border-border bg-card p-4 sm:p-6 text-sm text-muted-foreground shadow-xs max-w-full">
              <span className="flex items-center gap-2 font-medium">
                <PartyPopper className="h-5 w-5 shrink-0 text-primary" />
                No activities today. Enjoy your day!
              </span>
            </div>
          ) : (
            <div className="mt-3 space-y-3">
              {todayList.map((a) => (
                <ActivityCard key={a.id} activity={a} />
              ))}
            </div>
          )}

          {/* Up next 2 */}
          <h2 className="mt-10 mb-3 font-display text-lg sm:text-xl font-semibold">
            Upcoming
          </h2>
          {isDataLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-24 w-full rounded-2xl" />)}
            </div>
          ) : upNext2.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nothing else on the horizon.
            </p>
          ) : (
            <div className="space-y-3">
              {upNext2.map((a) => (
                <ActivityCard key={a.id} activity={a} />
              ))}
            </div>
          )}
          <div className="mt-4">
            <Link href="/activities">
              <Button variant="outline" className="rounded-full text-xs sm:text-sm">
                View all
              </Button>
            </Link>
          </div>
        </div>

        {/* Countdown Sidebar */}
        <aside className="order-first min-w-0 max-w-full lg:order-last">
          {isDataLoading ? (
            <div className="sticky top-24 overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-[color:var(--primary)] to-[color:var(--primary-deep)] p-5 sm:p-6 shadow-card">
              <Skeleton className="h-3 w-20 rounded bg-white/20" />
              <Skeleton className="mt-4 h-7 w-3/4 rounded bg-white/20" />
              <div className="mt-5 grid grid-cols-3 gap-2">
                {[1,2,3].map(i => <Skeleton key={i} className="h-16 rounded-xl bg-white/20" />)}
              </div>
            </div>
          ) : (
            <div
              onClick={() => { if (next) setSelectedNextActivity(next); }}
              className={`sticky top-24 overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-[color:var(--primary)] to-[color:var(--primary-deep)] p-5 sm:p-6 text-primary-foreground shadow-card transition-all duration-300 ${
                next ? "cursor-pointer hover:scale-[1.01] hover:shadow-xl active:scale-[0.99]" : ""
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-medium uppercase tracking-widest opacity-70 truncate">
                  Next activity
                </p>
                {next && (
                  <span className="shrink-0 rounded-full bg-white/10 px-2 py-0.5 text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider backdrop-blur-xs">
                    Details
                  </span>
                )}
              </div>
              {next ? (
                <>
                  <h3 className="mt-2 font-display text-xl sm:text-2xl font-bold leading-tight break-words">
                    {next.subject}
                  </h3>
                  <p className="mt-1 font-mono text-xs sm:text-sm font-semibold opacity-90 break-words">{next.title}</p>
                  <div className="mt-5 grid grid-cols-3 gap-1.5 sm:gap-3">
                    {countdown(nextDelta).map(([n, l]) => (
                      <div
                        key={l}
                        className="min-w-0 rounded-xl sm:rounded-2xl bg-white/10 px-1.5 sm:px-3 py-2.5 sm:py-4 text-center backdrop-blur-sm"
                      >
                        <div className="font-display text-xl sm:text-3xl font-semibold tabular-nums truncate">
                          {n}
                        </div>
                        <div className="mt-0.5 text-[9px] sm:text-[10px] uppercase tracking-widest opacity-80 truncate">
                          {l}
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="mt-5 text-xs sm:text-sm opacity-80">
                    Starts{" "}
                    {nextActivityDate(next).toLocaleString(undefined, {
                      weekday: "long",
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </p>
                </>
              ) : (
                <div className="py-6 text-center text-sm opacity-80">
                  No upcoming activities scheduled.
                </div>
              )}
            </div>
          )}
        </aside>
      </section>
    </>
  );
}
