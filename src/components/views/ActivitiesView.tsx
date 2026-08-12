"use client";

import { useMemo, useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { ACTIVITY_TYPES, type Activity, type ActivityType } from "@/lib/types";
import { hasSelectedClass, useClassSelection } from "@/lib/session";
import { ActivityCard } from "@/components/ActivityCard";
import { ClassSelectionDialog } from "@/components/ClassSelectionDialog";
import { PageLoader } from "@/components/PageLoader";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

type StatusFilter = "all" | "upcoming" | "completed";

function endDateOf(a: Activity) {
  return new Date(a.endDate ?? a.date!);
}

export function ActivitiesView() {
  const { cls, loaded } = useClassSelection();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [q, setQ] = useState("");
  const [type, setType] = useState<ActivityType | "all">("all");
  const [status, setStatus] = useState<StatusFilter>("upcoming");

  useEffect(() => {
    if (loaded && !hasSelectedClass(cls)) setDialogOpen(true);
  }, [cls, loaded]);

  const activities = useQuery({
    queryKey: ["activities", cls],
    queryFn: () => api.listActivities(cls ?? undefined),
    // Don't fire until we know the class selection (avoids double fetch)
    enabled: loaded,
  });

  const filtered = useMemo(() => {
    const now = new Date();
    const needle = q.trim().toLowerCase();
    return (activities.data ?? [])
      .filter((a) => type === "all" || a.activityType === type)
      .filter((a) => {
        if (status === "all") return true;
        const done = endDateOf(a) < now;
        return status === "completed" ? done : !done;
      })
      .filter((a) => {
        if (!needle) return true;
        return [a.title, a.subject, a.description, a.room, a.activityType]
          .filter(Boolean)
          .some((f) => f!.toLowerCase().includes(needle));
      })
      .sort(
        (a, b) =>
          new Date(a.startDate ?? a.date!).getTime() -
          new Date(b.startDate ?? b.date!).getTime()
      );
  }, [activities.data, q, type, status]);

  if (!loaded || activities.isLoading) {
    return <PageLoader text="Loading activities..." />;
  }

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
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="font-display text-4xl">All activities</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Everything scheduled for your class.
            </p>
          </div>
        </div>

        {/* Search + filters */}
        <div className="mt-6 flex flex-col gap-3 rounded-3xl border border-border bg-card p-3 shadow-card md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search title, subject, room, description…"
              className="h-11 rounded-2xl border-0 bg-muted/40 pl-11 text-base focus-visible:ring-primary"
            />
          </div>
          <div className="flex flex-wrap gap-2">
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
        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            size="sm"
            variant={type === "all" ? "default" : "outline"}
            className="rounded-full text-xs"
            onClick={() => setType("all")}
          >
            All Types
          </Button>
          {ACTIVITY_TYPES.map((t) => (
            <Button
              key={t.value}
              size="sm"
              variant={type === t.value ? "default" : "outline"}
              className="rounded-full text-xs"
              onClick={() => setType(t.value)}
            >
              {t.label}
            </Button>
          ))}
        </div>

        {/* List */}
        <div className="mt-6 space-y-3">
          {filtered.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center text-sm text-muted-foreground">
              No activities found for this filter.
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
      className={`rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
        active
          ? "bg-primary text-primary-foreground shadow-xs"
          : "bg-transparent text-muted-foreground hover:bg-muted/60 hover:text-foreground"
      }`}
    >
      {label}
    </button>
  );
}
