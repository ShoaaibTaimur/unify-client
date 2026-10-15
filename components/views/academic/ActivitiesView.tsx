"use client";

import { useMemo, useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { ACTIVITY_TYPES, type Activity, type ActivityType, type ClassSelection } from "@/types";
import { hasSelectedClass, useClassSelection } from "@/lib/session";
import { getActivityQueryKey } from "@/lib/utils";
import { useAuth } from "@/lib/auth";
import { ActivityCard } from "@/components/activities/ActivityCard";
import { ClassSelectionDialog } from "@/components/academic/ClassSelectionDialog";
import { PageLoader } from "@/components/common/PageLoader";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { parseAppDate, combineDateAndTime, isActivityExpired, isStaffUser } from "@/lib/date-utils";

type StatusFilter = "all" | "upcoming" | "completed";

function startDateOf(a: Activity): Date {
  return combineDateAndTime(a.startDate ?? a.date, a.time);
}

export function ActivitiesView({ initialClass }: { initialClass?: ClassSelection | null } = {}) {
  const { cls, loaded } = useClassSelection(initialClass);
  const { user } = useAuth();
  const isStaff = isStaffUser(user);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [q, setQ] = useState("");
  const [type, setType] = useState<ActivityType | "all">("all");
  const [status, setStatus] = useState<StatusFilter>("upcoming");

  useEffect(() => {
    if (loaded && !hasSelectedClass(cls)) setDialogOpen(true);
  }, [cls, loaded]);

  const activities = useQuery({
    queryKey: getActivityQueryKey(cls),
    queryFn: () => (hasSelectedClass(cls) ? api.listActivities(cls!) : Promise.resolve([])),
    enabled: true,
  });

  const filtered = useMemo(() => {
    const now = new Date();
    const needle = q.trim().toLowerCase();
    return (activities.data ?? [])
      .filter((a) => {
        // Common users cannot view activities expired more than 1 hour ago
        if (!isStaff && isActivityExpired(a, now)) return false;
        return true;
      })
      .filter((a) => type === "all" || a.activityType === type)
      .filter((a) => {
        if (status === "all") return true;
        const done = isActivityExpired(a, now);
        return status === "completed" ? done : !done;
      })
      .filter((a) => {
        if (!needle) return true;
        return [a.title, a.subject, a.description, a.room, a.activityType]
          .filter(Boolean)
          .some((f) => f!.toLowerCase().includes(needle));
      })
      .sort((a, b) => startDateOf(a).getTime() - startDateOf(b).getTime());
  }, [activities.data, q, type, status, isStaff]);

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
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-2">
          <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-primary font-bold">
            ACADEMIC SCHEDULE
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            Academic Activities
          </h1>
          <p className="font-mono text-xs text-muted-foreground">
            All scheduled tests, exams, assignments, and academic deadlines.
          </p>
        </div>

        {/* Search + status filter bar */}
        <div className="mt-6 flex flex-col rounded-none border border-border bg-card md:flex-row divide-y md:divide-y-0 md:divide-x divide-border">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="FILTER BY TITLE, CODE, SUBJECT, ROOM…"
              className="h-11 rounded-none border-0 bg-transparent pl-11 font-mono text-xs tracking-wider placeholder:text-muted-foreground/50 focus-visible:ring-0"
            />
          </div>
          <div className="flex items-stretch divide-x divide-border">
            <FilterPill
              label="Upcoming"
              active={status === "upcoming"}
              onClick={() => setStatus("upcoming")}
            />
            <FilterPill
              label="Completed"
              active={status === "completed"}
              onClick={() => setStatus("completed")}
            />
            <FilterPill
              label="All"
              active={status === "all"}
              onClick={() => setStatus("all")}
            />
          </div>
        </div>

        {/* Type pills */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          <button
            type="button"
            className={`h-7 px-3 font-mono text-[10px] uppercase tracking-wider font-semibold border transition-colors ${type === "all"
                ? "bg-primary text-primary-foreground border-primary font-bold shadow-2xs"
                : "border-border bg-card text-muted-foreground hover:border-primary/50 hover:bg-primary/10 hover:text-primary"
              }`}
            onClick={() => setType("all")}
          >
            All Types
          </button>
          {ACTIVITY_TYPES.map((t) => (
            <button
              key={t.value}
              type="button"
              className={`h-7 px-3 font-mono text-[10px] uppercase tracking-wider font-semibold border transition-colors ${type === t.value
                  ? "bg-primary text-primary-foreground border-primary font-bold shadow-2xs"
                  : "border-border bg-card text-muted-foreground hover:border-primary/50 hover:bg-primary/10 hover:text-primary"
                }`}
              onClick={() => setType(t.value)}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* List */}
        <div className="mt-6 space-y-3">
          {((!loaded && !initialClass) || (hasSelectedClass(cls) && activities.isLoading && !activities.data)) ? (
            [1, 2, 3, 4, 5].map((i) => <div key={i} className="h-24 w-full bg-muted/50 border border-border animate-pulse" />)
          ) : filtered.length === 0 ? (
            <div className="border border-dashed border-border bg-card p-12 text-center font-mono text-xs text-muted-foreground">
              [NO ACTIVITIES MATCH THE CURRENT FILTER]
            </div>
          ) : (
            filtered.map((a) => <ActivityCard key={a.id} activity={a} />)
          )}
        </div>
      </div>
    </>
  );
}

function FilterPill({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 h-11 font-mono text-[11px] uppercase tracking-[0.12em] font-bold transition-colors flex items-center justify-center whitespace-nowrap ${active
          ? "bg-primary text-primary-foreground shadow-2xs"
          : "bg-transparent text-muted-foreground hover:bg-primary/10 hover:text-primary"
        }`}
    >
      {label}
    </button>
  );
}
