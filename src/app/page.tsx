"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { api } from "@/lib/api";
import { setClassSelection, useClassSelection } from "@/lib/session";
import type { Activity } from "@/lib/types";
import { ClassSelectionDialog } from "@/components/ClassSelectionDialog";
import { ActivityCard } from "@/components/ActivityCard";
import { ActivityDetailsDialog } from "@/components/ActivityDetailsDialog";
import { Button } from "@/components/ui/button";
import { PageLoader } from "@/components/PageLoader";
import { differenceInSeconds, isSameDay } from "date-fns";
import { ArrowRight, PartyPopper, Settings2 } from "lucide-react";

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

export default function StudentDashboard() {
  const { cls, loaded } = useClassSelection();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedNextActivity, setSelectedNextActivity] =
    useState<Activity | null>(null);
  useTicker(1000);

  useEffect(() => {
    if (loaded && !cls) setDialogOpen(true);
  }, [cls, loaded]);

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
  const activities = useQuery({
    queryKey: ["activities", cls],
    enabled: !!cls,
    queryFn: () => api.listActivities(cls!),
  });

  const meta = useMemo(() => {
    if (!cls) return null;
    const dep = departments.data?.find((d) => d.id === cls.departmentId)?.name;
    const bat = batches.data?.find((b) => b.id === cls.batchId)?.name;
    const sec = sections.data?.find((s) => s.id === cls.sectionId)?.name;
    return { dep, bat, sec };
  }, [cls, departments.data, batches.data, sections.data]);

  const now = new Date();
  const upcoming = useMemo(
    () =>
      (activities.data ?? [])
        .filter(
          (a) => (a.endDate ? new Date(a.endDate) : nextActivityDate(a)) > now
        )
        .sort(
          (a, b) =>
            nextActivityDate(a).getTime() - nextActivityDate(b).getTime()
        ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activities.data, now]
  );

  const todays = useMemo(
    () =>
      (activities.data ?? []).filter((a) => {
        const targetDate = a.endDate
          ? new Date(a.endDate)
          : a.date
            ? new Date(a.date)
            : null;
        if (!targetDate) return false;
        const isToday =
          isSameDay(targetDate, now) ||
          (a.startDate &&
            a.endDate &&
            now >= new Date(a.startDate) &&
            now <= new Date(a.endDate));
        return isToday && targetDate.getTime() > now.getTime();
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activities.data, now]
  );

  const next = upcoming[0];
  const nextDelta = next ? differenceInSeconds(nextActivityDate(next), now) : 0;
  const upNext2 = upcoming.filter((a) => a.id !== next?.id).slice(0, 2);

  if (!loaded) {
    return <PageLoader text="Loading your class..." />;
  }

  return (
    <>
      <ClassSelectionDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        initial={cls}
      />

      <ActivityDetailsDialog
        activity={selectedNextActivity}
        open={!!selectedNextActivity}
        onOpenChange={(v) => {
          if (!v) setSelectedNextActivity(null);
        }}
      />

      {/* HERO */}
      <section className="relative overflow-hidden animate-in fade-in slide-in-from-bottom-3 duration-500">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(60%_60%_at_50%_0%,color-mix(in_oklab,var(--primary)_18%,transparent),transparent)]" />
        <div className="mx-auto max-w-7xl px-4 pb-8 pt-14 sm:px-6 sm:pt-20 lg:px-8">
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
            <div>
              <p className="text-xs font-medium uppercase tracking-widest text-accent">
                Your class
              </p>
              <h1 className="mt-2 font-display text-4xl leading-tight text-foreground sm:text-5xl">
                {meta?.dep ? (
                  <>
                    {meta.dep}{" "}
                    <span className="text-muted-foreground">·</span>{" "}
                    <span className="text-primary">{meta.bat}</span>{" "}
                    <span className="text-muted-foreground">·</span> {meta.sec}
                  </>
                ) : (
                  "Welcome to UNIFY"
                )}
              </h1>
              <p className="mt-2 max-w-xl text-muted-foreground">
                {meta
                  ? "Everything happening in your class — at a glance."
                  : "Pick your class to see your activities."}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="rounded-full"
                onClick={() => {
                  setClassSelection({
                    departmentId: "",
                    batchId: "",
                    sectionId: "",
                  });
                  setDialogOpen(true);
                }}
              >
                <Settings2 className="mr-2 h-4 w-4" /> Change class
              </Button>
              <Link href="/activities">
                <Button className="rounded-full">
                  View all activities <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CONTENT */}
      <section className="mx-auto grid max-w-7xl gap-6 px-4 pb-16 sm:px-6 lg:grid-cols-3 lg:px-8">
        {/* Today */}
        <div className="lg:col-span-2">
          <h2 className="mb-3 flex items-center gap-2 font-display text-xl font-semibold">
            Today&apos;s activities
          </h2>
          {todays.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-card/60 px-6 py-14 text-center">
              <PartyPopper className="h-8 w-8 text-accent" />
              <p className="mt-3 text-lg font-medium">No activities today.</p>
              <p className="text-sm text-muted-foreground">
                Enjoy your day — we&apos;ll let you know what&apos;s next below.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {todays.map((a) => (
                <ActivityCard key={a.id} activity={a} />
              ))}
            </div>
          )}

          {/* Up next 2 */}
          <h2 className="mt-10 mb-3 font-display text-xl font-semibold">
            Upcoming
          </h2>
          {upNext2.length === 0 ? (
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
              <Button variant="outline" className="rounded-full">
                View all
              </Button>
            </Link>
          </div>
        </div>

        {/* Countdown */}
        <aside className="order-first lg:order-last">
          <div
            onClick={() => {
              if (next) setSelectedNextActivity(next);
            }}
            className={`sticky top-24 overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-[color:var(--primary)] to-[color:var(--primary-deep)] p-6 text-primary-foreground shadow-card transition-all duration-300 ${
              next
                ? "cursor-pointer hover:scale-[1.01] hover:shadow-xl active:scale-[0.99]"
                : ""
            }`}
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium uppercase tracking-widest opacity-70">
                Next activity
              </p>
              {next && (
                <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider backdrop-blur-xs">
                  Click for details
                </span>
              )}
            </div>
            {next ? (
              <>
                <h3 className="mt-2 font-display text-2xl leading-tight">
                  {next.subject}
                </h3>
                <p className="mt-1 text-sm opacity-80">{next.title}</p>
                <div className="mt-6 grid grid-cols-3 gap-3">
                  {countdown(nextDelta).map(([n, l]) => (
                    <div
                      key={l}
                      className="rounded-2xl bg-white/10 px-3 py-4 text-center backdrop-blur-sm"
                    >
                      <div className="font-display text-3xl font-semibold tabular-nums">
                        {n}
                      </div>
                      <div className="mt-0.5 text-[10px] uppercase tracking-widest opacity-80">
                        {l}
                      </div>
                    </div>
                  ))}
                </div>
                <p className="mt-6 text-sm opacity-80">
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
              <p className="mt-4 text-sm opacity-80">Nothing scheduled yet.</p>
            )}
          </div>
        </aside>
      </section>
    </>
  );
}
