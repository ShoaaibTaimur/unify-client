"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { api } from "@/lib/api";
import { hasSelectedClass, setClassSelection, useClassSelection } from "@/lib/session";
import { useAuth } from "@/lib/auth";
import type { Activity, ClassSelection, User } from "@/types";
import { ClassSelectionDialog } from "@/components/academic/ClassSelectionDialog";
import { ActivityCard } from "@/components/activities/ActivityCard";
import { ActivityDetailsDialog } from "@/components/activities/ActivityDetailsDialog";
import { Button } from "@/components/ui/button";
import { differenceInSeconds, isSameDay } from "date-fns";
import { parseAppDate, formatAppDate, formatAppTime, combineDateAndTime, parseTimeComponents, isActivityExpired, isStaffUser } from "@/lib/date-utils";
import { hasActiveExams, getActivityQueryKey } from "@/lib/utils";
import { ArrowRight, PartyPopper, Settings2, ExternalLink, Clock, MapPin } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

function nextActivityDate(a: Activity): Date {
  return combineDateAndTime(a.startDate ?? a.date, a.time);
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

function ActivityCountdown({ targetDate }: { targetDate: Date }) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const totalSeconds = differenceInSeconds(targetDate, now);
  const items = countdown(totalSeconds);

  return (
    <div className="mt-5 grid grid-cols-3 gap-2 sm:gap-2.5" suppressHydrationWarning>
      {items.map(([n, l]) => (
        <div
          key={l}
          className="min-w-0 rounded-xl border border-border/60 bg-secondary/50 px-2 py-3 text-center"
        >
          <div className="font-mono text-2xl sm:text-3xl font-bold tracking-tight tabular-nums text-foreground truncate">
            {n}
          </div>
          <div className="mt-1 text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider text-muted-foreground truncate">
            {l}
          </div>
        </div>
      ))}
    </div>
  );
}

export function HomeView({
  initialClass,
}: {
  initialClass?: ClassSelection | null;
} = {}) {
  const { cls, loaded } = useClassSelection(initialClass);
  const { user } = useAuth();
  const isStaff = isStaffUser(user);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedNextActivity, setSelectedNextActivity] = useState<Activity | null>(null);

  useEffect(() => {
    if (loaded && !hasSelectedClass(cls)) {
      setDialogOpen(true);
    }
  }, [cls, loaded]);

  const activities = useQuery({
    queryKey: getActivityQueryKey(cls),
    queryFn: () => (hasSelectedClass(cls) ? api.listActivities(cls!) : Promise.resolve([])),
    enabled: true,
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
    queryFn: () => (cls?.batchId && cls.batchId !== "all" ? api.listSections(cls.batchId) : []),
    enabled: !!cls?.batchId && cls.batchId !== "all",
  });

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const list = activities.data ?? [];
  const showSeatPlan = mounted && hasActiveExams(list);
  const now = new Date();

  const todayList = useMemo(() => {
    return list
      .filter((a) => {
        // Exclude activities whose scheduled time was > 1 hour ago for common users
        if (!isStaff && isActivityExpired(a, now)) return false;

        if (a.startDate && a.endDate) {
          const s = parseAppDate(a.startDate);
          const e = parseAppDate(a.endDate);
          if (!s || !e) return false;
          const sStart = new Date(s.getFullYear(), s.getMonth(), s.getDate());
          const eEnd = new Date(e.getFullYear(), e.getMonth(), e.getDate(), 23, 59, 59, 999);
          const nowStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          return nowStart >= sStart && nowStart <= eEnd;
        }
        const d = parseAppDate(a.date);
        return d ? isSameDay(d, now) : false;
      })
      .sort((a, b) => {
        // Sort by earliest scheduled time first
        const hasTimeA = Boolean(a.time && parseTimeComponents(a.time));
        const hasTimeB = Boolean(b.time && parseTimeComponents(b.time));
        if (hasTimeA && hasTimeB) {
          const timeA = combineDateAndTime(a.startDate ?? a.date, a.time).getTime();
          const timeB = combineDateAndTime(b.startDate ?? b.date, b.time).getTime();
          return timeA - timeB;
        }
        if (hasTimeA && !hasTimeB) return -1;
        if (!hasTimeA && hasTimeB) return 1;
        return 0;
      });
  }, [list, now, isStaff]);

  const upcomingList = useMemo(() => {
    return list
      .filter((a) => (!isStaff ? !isActivityExpired(a, now) : true) && nextActivityDate(a) >= now)
      .sort((a, b) => nextActivityDate(a).getTime() - nextActivityDate(b).getTime());
  }, [list, now, isStaff]);

  const next = upcomingList[0] ?? null;
  const upNext2 = upcomingList.slice(1, 3);

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

  const isDataLoading =
    (!loaded && !initialClass) ||
    (hasSelectedClass(cls) && activities.isLoading && !activities.data);

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
      <section className="relative overflow-hidden border-b border-border/60 bg-gradient-to-b from-primary/[0.03] via-transparent to-transparent py-8 sm:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
            <div className="min-w-0 max-w-full">
              {meta ? (
                <div className="inline-flex max-w-full items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary truncate">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  <span className="truncate">{meta}</span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-secondary px-3 py-1 text-xs font-semibold text-muted-foreground">
                  No class selected
                </div>
              )}
              <h1 className="mt-3 font-display text-2xl sm:text-4xl font-bold tracking-tight text-foreground break-words max-w-full">
                {meta ? "Class Schedule" : "Welcome to UNIFY"}
              </h1>
              <p className="mt-1.5 max-w-xl text-sm sm:text-base text-muted-foreground">
                {meta
                  ? "Everything happening in your class — at a glance."
                  : "Pick your class to see your activities."}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-2 sm:gap-2.5 w-full sm:w-auto max-w-full">
              {showSeatPlan && (
                <Button
                  asChild
                  variant="outline"
                  className="w-full sm:w-auto rounded-full border-border/80 text-foreground hover:bg-secondary font-medium justify-center text-xs sm:text-sm shadow-xs"
                >
                  <a
                    href="https://examsync.kiron.dev/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="mr-1.5 h-3.5 w-3.5 shrink-0 text-primary" /> Exam Seat Plan ↗
                  </a>
                </Button>
              )}
              <Button
                variant="outline"
                className="w-full sm:w-auto rounded-full justify-center text-xs sm:text-sm shadow-xs"
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
              <Button
                asChild
                className="w-full sm:w-auto rounded-full justify-center text-xs sm:text-sm shadow-xs"
              >
                <Link href="/activities" className="w-full sm:w-auto">
                  View all activities <ArrowRight className="ml-1.5 h-3.5 w-3.5 shrink-0" />
                </Link>
              </Button>
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
            <span className="text-xs text-muted-foreground" suppressHydrationWarning>
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
          <div suppressHydrationWarning>
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
          </div>
          <div className="mt-4">
            <Button asChild variant="outline" className="rounded-full text-xs sm:text-sm">
              <Link href="/activities">
                View all
              </Link>
            </Button>
          </div>
        </div>

        {/* Countdown Sidebar */}
        <aside className="order-first min-w-0 max-w-full lg:order-last">
          {isDataLoading ? (
            <div className="sticky top-24 overflow-hidden rounded-2xl border border-border/80 border-t-2 border-t-primary bg-card p-5 sm:p-6 shadow-xs">
              <div className="h-3 w-24 rounded bg-muted animate-pulse" />
              <div className="mt-4 h-7 w-3/4 rounded bg-muted animate-pulse" />
              <div className="mt-5 grid grid-cols-3 gap-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 rounded-xl bg-muted animate-pulse" />
                ))}
              </div>
            </div>
          ) : (
            <div
              onClick={() => { if (next) setSelectedNextActivity(next); }}
              className={`sticky top-24 overflow-hidden rounded-2xl border border-border/80 border-t-2 border-t-primary bg-card p-5 sm:p-6 shadow-xs transition-all duration-200 ${
                next ? "cursor-pointer hover:border-primary/40 active:scale-[0.99]" : ""
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-primary">
                    Next activity
                  </p>
                </div>
                {next && (
                  <span className="shrink-0 rounded-full bg-secondary px-2.5 py-0.5 text-[10px] font-medium text-muted-foreground border border-border/60">
                    Details
                  </span>
                )}
              </div>
              {next ? (
                <>
                  <h3 className="mt-3 font-display text-xl sm:text-2xl font-bold tracking-tight text-foreground leading-tight break-words">
                    {next.subject}
                  </h3>
                  <div className="mt-1.5 flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-md border border-primary/20">
                      {next.title}
                    </span>
                    {next.room && (
                      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3 text-muted-foreground/70" />
                        <span>{next.room}</span>
                      </span>
                    )}
                  </div>
                  <ActivityCountdown targetDate={nextActivityDate(next)} />
                  <div className="mt-5 border-t border-border/60 pt-3 flex items-center gap-1.5 text-xs text-muted-foreground" suppressHydrationWarning>
                    <Clock className="h-3.5 w-3.5 shrink-0 text-muted-foreground/70" />
                    <span className="truncate">
                      Starts {formatAppDate(nextActivityDate(next), "EEEE, MMMM d")}
                      {formatAppTime(next.time, next.startDate ? null : next.date)
                        ? ` at ${formatAppTime(next.time, next.startDate ? null : next.date)}`
                        : ""}
                    </span>
                  </div>
                </>
              ) : (
                <div className="py-8 text-center text-sm text-muted-foreground">
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
