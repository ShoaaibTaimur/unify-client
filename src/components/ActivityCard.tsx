"use client";

import { useState } from "react";
import { ACTIVITY_COLOR, ACTIVITY_TYPES, type Activity, type ActivityType } from "@/lib/types";
import { format } from "date-fns";
import { MapPin, Clock } from "lucide-react";
import { ActivityDetailsDialog } from "./ActivityDetailsDialog";

export function activityLabel(t: ActivityType) {
  return ACTIVITY_TYPES.find((x) => x.value === t)?.label ?? t;
}

export function ActivityCard({
  activity,
  compact = false,
  onClick,
}: {
  activity: Activity;
  compact?: boolean;
  onClick?: () => void;
}) {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const isRange = !!activity.startDate;
  const color = ACTIVITY_COLOR[activity.activityType];

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      setDetailsOpen(true);
    }
  };

  return (
    <>
      <div
        onClick={handleClick}
        className="group relative cursor-pointer overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-card transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-xl hover:border-primary/50 active:scale-[0.98]"
      >
        <span aria-hidden className="absolute inset-y-0 left-0 w-1" style={{ background: color }} />
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-wide text-white"
                style={{ background: color }}
              >
                {activityLabel(activity.activityType)}
              </span>
              <span className="font-mono text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md border border-primary/20">
                {activity.title}
              </span>
              {(!activity.sectionId || activity.sectionId === "all") && (
                <span className="shrink-0 rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 border border-amber-500/20">
                  Batch-wide
                </span>
              )}
            </div>
            <h3 className="mt-2 truncate font-display text-lg font-bold text-foreground group-hover:text-primary transition-colors">
              {activity.subject}
            </h3>
            {!compact && activity.description && (
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground whitespace-pre-line">{activity.description}</p>
            )}
            {/* Prominent Date & Time Banner */}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-2.5 rounded-xl border border-primary/25 bg-primary/10 px-3.5 py-2.5">
              <div className="flex items-center gap-2 text-primary font-bold text-sm sm:text-base">
                <Clock className="h-4.5 w-4.5 shrink-0 text-primary" />
                <span>
                  {isRange
                    ? `${format(new Date(activity.startDate!), "MMM d, yyyy")} – ${format(new Date(activity.endDate!), "MMM d, yyyy")}`
                    : format(new Date(activity.date!), "EEEE, MMM d")}
                </span>
              </div>
              {(activity.time || (!isRange && activity.date)) && (
                <div className="rounded-md bg-primary px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-primary-foreground shadow-xs">
                  {activity.time ?? format(new Date(activity.date!), "h:mm a")}
                </div>
              )}
            </div>

            {activity.room && (
              <div className="mt-2.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                <MapPin className="h-3.5 w-3.5 text-primary" />
                <span className="font-medium text-foreground">{activity.room}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {!onClick && (
        <ActivityDetailsDialog
          activity={activity}
          open={detailsOpen}
          onOpenChange={setDetailsOpen}
        />
      )}
    </>
  );
}
