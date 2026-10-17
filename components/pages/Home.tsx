"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { hasSelectedClass, setClassSelection, useClassSelection } from "@/lib/session";
import type { Activity } from "@/types/activity";
import { ClassSelectionDialog } from "@/components/ClassSelectionDialog";
import { ActivityCard } from "@/components/activities/ActivityCard";
import { ActivityDetailsDialog } from "@/components/activities/ActivityDetailsDialog";
import { Button } from "@/components/ui/button";
import { differenceInSeconds } from "date-fns";
import { formatAppDate, formatAppTime, combineDateAndTime } from "@/lib/date-utils";
import { ArrowRight, PartyPopper, Settings2, ExternalLink, Clock, MapPin } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { getServerErrorMessage, usePublicDashboardQuery } from "@/lib/api";

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
    <div className="mt-4 grid grid-cols-3 border border-border bg-card divide-x divide-border" suppressHydrationWarning>
      {items.map(([n, l]) => (
        <div key={l} className="min-w-0 p-2 sm:p-2.5 text-center">
          <div className="font-mono text-xl sm:text-2xl font-bold tracking-tight tabular-nums text-primary truncate">
            {String(n).padStart(2, "0")}
          </div>
          <div className="mt-0.5 font-mono text-[9px] uppercase tracking-[0.14em] text-muted-foreground truncate">
            {l}
          </div>
        </div>
      ))}
    </div>
  );
}

export function HomeContent() {
  const { cls, loaded, needsSelection } = useClassSelection();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedNextActivity, setSelectedNextActivity] = useState<Activity | null>(null);

  const dashboard = usePublicDashboardQuery(hasSelectedClass(cls) ? cls : null);
  const todayList = dashboard.data?.todayActivities ?? [];
  const showSeatPlan = dashboard.data?.hasActiveExams ?? false;
  const next = dashboard.data?.nextActivity ?? null;
  const upNext2 = dashboard.data?.upNextActivities ?? [];

  const meta = dashboard.data?.classLabel || null;

  const isDataLoading =
    !loaded ||
    (hasSelectedClass(cls) && dashboard.isLoading && !dashboard.data);

  if (dashboard.isError) {
    return (
      <div className="mx-auto max-w-md py-24 text-center">
        <p className="text-sm font-medium text-destructive">Failed to load activities.</p>
        <p className="mt-1 text-xs text-muted-foreground">{getServerErrorMessage(dashboard.error)}</p>
        <button
          onClick={() => dashboard.refetch()}
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
        key={`${dialogOpen || needsSelection}-${cls?.departmentId}-${cls?.batchId}-${cls?.sectionId}`}
        open={dialogOpen || needsSelection}
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
      <section className="relative overflow-hidden border-b border-border bg-background blueprint-grid py-8 sm:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
            <div className="min-w-0 max-w-full">
              {meta ? (
                <div className="inline-flex max-w-full items-center gap-2 border border-border bg-card px-2.5 py-1 font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-foreground truncate shadow-2xs">
                  <span className="h-1.5 w-1.5 shrink-0 bg-primary" />
                  <span className="text-muted-foreground">CLASS //</span>
                  <span className="truncate text-primary font-bold">{meta}</span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 border border-border bg-secondary px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                  [NO CLASS SELECTED]
                </div>
              )}
              <h1 className="mt-3 font-display text-2xl sm:text-4xl font-bold tracking-tight text-foreground break-words max-w-full">
                {meta ? "Class Activities" : "UNIFY Academic Portal"}
              </h1>
              <p className="mt-1 max-w-xl text-xs sm:text-sm text-muted-foreground font-mono">
                {meta
                  ? "Everything happening in your class — class tests, assignments, and exams."
                  : "Pick your class to load your timetable, tests, and academic deadlines."}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-2 w-full sm:w-auto max-w-full">
              {showSeatPlan && (
                <Button
                  asChild
                  variant="outline"
                  className="w-full sm:w-auto rounded-none border border-border text-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary font-mono text-[11px] uppercase tracking-[0.12em] font-semibold justify-center h-9 px-4 transition-colors"
                >
                  <a
                    href="https://examsync.kiron.dev/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="mr-1.5 h-3.5 w-3.5 shrink-0 text-primary" /> Seat Plan ↗
                  </a>
                </Button>
              )}
              <Button
                variant="outline"
                className="w-full sm:w-auto rounded-none border border-border text-foreground hover:bg-primary/10 hover:text-primary hover:border-primary/60 font-mono text-[11px] uppercase tracking-[0.12em] font-semibold justify-center h-9 px-4 transition-colors"
                onClick={() => {
                  setClassSelection({
                    departmentId: "",
                    batchId: "",
                    sectionId: "",
                  });
                  setDialogOpen(true);
                }}
              >
                <Settings2 className="mr-1.5 h-3.5 w-3.5 shrink-0 text-primary" /> Change Class
              </Button>
              <Button
                asChild
                className="w-full sm:w-auto rounded-none bg-primary text-primary-foreground hover:bg-primary-deep font-mono text-[11px] uppercase tracking-[0.12em] font-bold justify-center h-9 px-4 transition-colors shadow-2xs"
              >
                <Link href="/activities" className="w-full sm:w-auto">
                  All Activities <ArrowRight className="ml-1.5 h-3.5 w-3.5 shrink-0" />
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
              {[1, 2].map((i) => <Skeleton key={i} className="h-24 w-full rounded-[4px]" />)}
            </div>
          ) : todayList.length === 0 ? (
            <div className="mt-3 flex items-center justify-between rounded-[4px] border border-dashed border-border bg-card p-4 sm:p-6 text-sm text-muted-foreground shadow-2xs max-w-full">
              <span className="flex items-center gap-2 font-medium font-mono text-xs">
                <PartyPopper className="h-4 w-4 shrink-0 text-primary" />
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
                {[1, 2, 3].map((i) => <Skeleton key={i} className="h-24 w-full rounded-[4px]" />)}
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
            <Button asChild variant="outline" className="rounded-none border border-border text-foreground hover:bg-primary/10 hover:text-primary hover:border-primary/50 font-mono text-[11px] uppercase tracking-[0.12em] font-semibold h-8 px-4 transition-colors">
              <Link href="/activities">
                View All Activities [→]
              </Link>
            </Button>
          </div>
        </div>

        {/* Countdown Sidebar */}
        <aside className="order-first min-w-0 max-w-full lg:order-last">
          {isDataLoading ? (
            <div className="sticky top-16 overflow-hidden rounded-none border border-border bg-card p-4">
              <div className="h-3 w-24 bg-muted animate-pulse" />
              <div className="mt-4 h-6 w-3/4 bg-muted animate-pulse" />
              <div className="mt-4 grid grid-cols-3 gap-1 border border-border p-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-12 bg-muted animate-pulse" />
                ))}
              </div>
            </div>
          ) : (
            <div
              onClick={() => { if (next) setSelectedNextActivity(next); }}
              className={`sticky top-16 overflow-hidden rounded-none border border-border bg-card p-0 transition-colors duration-150 ${next ? "cursor-pointer hover:border-primary/80" : ""
                }`}
            >
              {/* Top Countdown Header Strip */}
              <div className="flex items-center justify-between gap-2 border-b border-border/80 bg-secondary/35 px-4 py-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="h-1.5 w-1.5 rounded-none bg-primary shrink-0" />
                  <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-primary truncate">
                    {"// NEXT ACTIVITY"}
                  </p>
                </div>
                {next && (
                  <span className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground border border-border/60 px-1.5 py-0.5 shrink-0 group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-colors">
                    DETAILS [→]
                  </span>
                )}
              </div>

              {/* Main Info */}
              <div className="p-4 sm:p-5">
                {next ? (
                  <>
                    <h3 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-foreground leading-tight break-words">
                      {next.subject}
                    </h3>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-semibold text-primary border border-primary/30 px-2 py-0.5 bg-primary/5">
                        {next.title}
                      </span>
                      {next.room && (
                        <span className="inline-flex items-center gap-1 font-mono text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3 text-muted-foreground/70" />
                          <span>{next.room}</span>
                        </span>
                      )}
                    </div>
                    <ActivityCountdown targetDate={nextActivityDate(next)} />
                  </>
                ) : (
                  <div className="py-6 text-center font-mono text-xs text-muted-foreground">
                    [NO UPCOMING ACTIVITIES]
                  </div>
                )}
              </div>

              {/* Bottom Schedule Strip */}
              {next && (
                <div className="border-t border-border/80 bg-secondary/15 px-4 py-2.5 flex items-center gap-2 font-mono text-[11px] text-muted-foreground" suppressHydrationWarning>
                  <Clock className="h-3 w-3 shrink-0 text-muted-foreground/70" />
                  <span className="truncate">
                    STARTS: {formatAppDate(nextActivityDate(next), "EEEE, MMM d")}
                    {formatAppTime(next.time, next.startDate ? null : next.date)
                      ? ` // ${formatAppTime(next.time, next.startDate ? null : next.date)}`
                      : ""}
                  </span>
                </div>
              )}
            </div>
          )}
        </aside>
      </section>
    </>
  );
}
