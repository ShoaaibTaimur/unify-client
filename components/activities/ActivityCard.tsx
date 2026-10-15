"use client";

import { useState } from "react";
import { ACTIVITY_COLOR, ACTIVITY_TYPES, type Activity, type ActivityType } from "@/types";
import { formatAppDate, formatAppTime } from "@/lib/date-utils";
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
  const displayTime = formatAppTime(activity.time, isRange ? null : activity.date);

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
        className="group relative cursor-pointer overflow-hidden rounded-xl border border-border/70 bg-card p-4 sm:p-4.5 shadow-xs transition-all duration-200 ease-out hover:border-primary/40 hover:bg-card/90 active:scale-[0.99] min-w-0 max-w-full"
      >
        <span aria-hidden className="absolute inset-y-0 left-0 w-1 rounded-l-xl" style={{ background: color }} />
        <div className="flex items-start justify-between gap-3 min-w-0 max-w-full pl-1">
          <div className="min-w-0 flex-1 max-w-full">
            <div className="flex flex-wrap items-center gap-1.5 max-w-full">
              <span
                className="inline-flex items-center gap-1.5 rounded-md border border-border/60 bg-secondary/80 px-2 py-0.5 text-[11px] font-medium text-foreground shrink-0"
              >
                <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: color }} />
                {activityLabel(activity.activityType)}
              </span>
              <span className="font-mono text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-md border border-primary/20 shrink-0">
                {activity.title}
              </span>
              {(!activity.batchId || activity.batchId === "all") ? (
                <span className="shrink-0 rounded-md bg-secondary/60 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground border border-border/40">
                  Dept
                </span>
              ) : (!activity.sectionId || activity.sectionId === "all") ? (
                <span className="shrink-0 rounded-md bg-secondary/60 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground border border-border/40">
                  Batch
                </span>
              ) : null}
            </div>

            <h3 className="mt-2 truncate font-display text-base font-semibold text-foreground group-hover:text-primary transition-colors">
              {activity.subject}
            </h3>

            {!compact && activity.description && (
              <p className="mt-1 line-clamp-2 text-xs text-muted-foreground whitespace-pre-line break-words">
                {activity.description}
              </p>
            )}

            {/* Clean bottom metadata */}
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-border/50 pt-2.5 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5 font-medium min-w-0">
                <Clock className="h-3.5 w-3.5 shrink-0 text-muted-foreground/70" />
                <span className="truncate">
                  {isRange
                    ? `${formatAppDate(activity.startDate, "MMM d")} – ${formatAppDate(activity.endDate, "MMM d, yyyy")}`
                    : formatAppDate(activity.date, "EEE, MMM d, yyyy")}
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {activity.room && (
                  <span className="inline-flex items-center gap-1 text-muted-foreground">
                    <MapPin className="h-3 w-3 text-muted-foreground/70" />
                    <span>{activity.room}</span>
                  </span>
                )}
                {displayTime && (
                  <span className="font-mono text-[11px] font-medium text-foreground bg-secondary px-2 py-0.5 rounded border border-border/60">
                    {displayTime}
                  </span>
                )}
              </div>
            </div>
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
