"use client";

import { useState, useEffect } from "react";
import { ACTIVITY_TYPES, type ActivityStatusFilter, type ActivityType } from "@/types/activity";
import { hasSelectedClass, useClassSelection } from "@/lib/session";
import { ActivityCard } from "@/components/activities/ActivityCard";
import { ClassSelectionDialog } from "@/components/ClassSelectionDialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { getServerErrorMessage, useActivitiesQuery } from "@/lib/api";

export function ActivitiesContent() {
  const { cls, loaded, needsSelection } = useClassSelection();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [q, setQ] = useState("");
  const [type, setType] = useState<ActivityType | "all">("all");
  const [status, setStatus] = useState<ActivityStatusFilter>("upcoming");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(q.trim()), 1500);//1.5sec for me to understand
    return () => clearTimeout(timeout);
  }, [q]);

  const activities = useActivitiesQuery(
    cls
      ? {
          ...cls,
          activityType: type === "all" ? undefined : type,
          status,
          search: debouncedSearch || undefined,
        }
      : undefined,
    { skip: !hasSelectedClass(cls) }
  );
  const filtered = activities.data ?? [];

  const activeFilterCount = (type !== "all" ? 1 : 0) + (status !== "all" ? 1 : 0);

  if (activities.isError) {
    return (
      <div className="mx-auto max-w-md py-24 text-center">
        <p className="text-sm font-medium text-destructive">Failed to load activities.</p>
        <p className="mt-1 text-xs text-muted-foreground">{getServerErrorMessage(activities.error)}</p>
        <button
          onClick={() => activities.refetch()}
          className="mt-4 rounded-[4px] bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground"
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

      {/* Filter Modal Dialog */}
      <Dialog open={filterOpen} onOpenChange={setFilterOpen}>
        <DialogContent className="sm:max-w-md rounded-[4px] border border-border bg-card p-6 shadow-2xs font-mono">
          <DialogHeader>
            <DialogTitle className="font-display text-xl font-bold tracking-tight text-foreground">
              Filter Activities
            </DialogTitle>
            <DialogDescription className="font-mono text-xs text-muted-foreground">
              Filter activities by timeline schedule and activity category.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-3">
            {/* Timeline / Status */}
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-foreground">
                Timeline Status
              </label>
              <div className="mt-2 grid grid-cols-3 gap-1.5">
                {(["upcoming", "completed", "all"] as ActivityStatusFilter[]).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStatus(s)}
                    className={`h-9 rounded-[4px] border px-2 font-mono text-[11px] uppercase tracking-wider font-semibold transition-colors ${
                      status === s
                        ? "bg-primary text-primary-foreground border-primary font-bold shadow-2xs"
                        : "border-border bg-secondary/30 text-muted-foreground hover:bg-primary/10 hover:text-primary hover:border-primary/50"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Activity Type */}
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-foreground">
                Activity Type
              </label>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => setType("all")}
                  className={`h-8 rounded-[4px] border px-3 font-mono text-[11px] uppercase tracking-wider font-semibold transition-colors ${
                    type === "all"
                      ? "bg-primary text-primary-foreground border-primary font-bold shadow-2xs"
                      : "border-border bg-secondary/30 text-muted-foreground hover:bg-primary/10 hover:text-primary hover:border-primary/50"
                  }`}
                >
                  All Types
                </button>
                {Object.entries(ACTIVITY_TYPES).map(([value, activityType]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setType(value as ActivityType)}
                    className={`h-8 rounded-[4px] border px-3 font-mono text-[11px] uppercase tracking-wider font-semibold transition-colors ${
                      type === value
                        ? "bg-primary text-primary-foreground border-primary font-bold shadow-2xs"
                        : "border-border bg-secondary/30 text-muted-foreground hover:bg-primary/10 hover:text-primary hover:border-primary/50"
                    }`}
                  >
                    {activityType.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter className="flex-row items-center justify-between gap-2 border-t border-border pt-4 sm:justify-between">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setStatus("all");
                setType("all");
              }}
              className="rounded-[4px] border border-border font-mono text-[11px] uppercase tracking-wider font-semibold hover:bg-destructive/10 hover:text-destructive hover:border-destructive/40"
            >
              Reset
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={() => setFilterOpen(false)}
              className="rounded-[4px] bg-primary text-primary-foreground hover:bg-primary-deep font-mono text-[11px] uppercase tracking-wider font-bold px-5"
            >
              Apply Filters
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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

        {/* Search bar + Filter Dialog Button */}
        <div className="mt-6 flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by title, subject, course code, or room..."
              className="h-10 rounded-[4px] border border-border bg-card pl-10 font-mono text-xs placeholder:text-muted-foreground/50 focus-visible:ring-1 focus-visible:ring-primary"
            />
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => setFilterOpen(true)}
            className={`h-10 rounded-[4px] border font-mono text-xs uppercase tracking-wider font-semibold px-4 transition-colors ${
              activeFilterCount > 0
                ? "border-primary bg-primary/10 text-primary hover:bg-primary/20"
                : "border-border bg-card text-foreground hover:bg-secondary hover:border-primary/50"
            }`}
          >
            <SlidersHorizontal className="mr-2 h-3.5 w-3.5" />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="ml-2 inline-flex h-5 items-center justify-center rounded-[3px] bg-primary px-1.5 text-[10px] font-bold text-primary-foreground">
                {activeFilterCount}
              </span>
            )}
          </Button>
        </div>

        {/* Active filter summary pill bar */}
        {(activeFilterCount > 0 || q) && (
          <div className="mt-2.5 flex flex-wrap items-center gap-1.5 font-mono text-[11px]">
            <span className="text-muted-foreground uppercase tracking-wider text-[10px]">Active filters:</span>
            {status !== "all" && (
              <span className="inline-flex items-center gap-1 rounded-[3px] border border-border bg-secondary/50 px-2 py-0.5 text-foreground">
                Status: <strong className="capitalize">{status}</strong>
                <button
                  onClick={() => setStatus("all")}
                  className="hover:text-destructive transition-colors ml-0.5"
                  aria-label="Remove status filter"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {type !== "all" && (
              <span className="inline-flex items-center gap-1 rounded-[3px] border border-border bg-secondary/50 px-2 py-0.5 text-foreground">
                Type: <strong>{ACTIVITY_TYPES[type].label}</strong>
                <button
                  onClick={() => setType("all")}
                  className="hover:text-destructive transition-colors ml-0.5"
                  aria-label="Remove type filter"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {q && (
              <span className="inline-flex items-center gap-1 rounded-[3px] border border-border bg-secondary/50 px-2 py-0.5 text-foreground">
                Query: <strong>{`"${q}"`}</strong>
                <button
                  onClick={() => setQ("")}
                  className="hover:text-destructive transition-colors ml-0.5"
                  aria-label="Clear search"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            <button
              onClick={() => {
                setStatus("all");
                setType("all");
                setQ("");
              }}
              className="text-primary hover:underline text-[10px] uppercase tracking-wider font-semibold ml-1 transition-colors"
            >
              Reset all
            </button>
          </div>
        )}

        {/* Activities List */}
        <div className="mt-6 space-y-3">
          {((!loaded) || (hasSelectedClass(cls) && activities.isLoading && !activities.data)) ? (
            [1, 2, 3, 4, 5].map((i) => <div key={i} className="h-24 w-full bg-muted/50 border border-border animate-pulse rounded-[4px]" />)
          ) : filtered.length === 0 ? (
            <div className="rounded-[4px] border border-dashed border-border bg-card p-12 text-center font-mono text-xs text-muted-foreground">
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
