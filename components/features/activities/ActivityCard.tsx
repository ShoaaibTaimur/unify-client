"use client";

import { useState } from "react";
import { ACTIVITY_TYPES, type Activity } from "@/types/activity";
import { formatAppDate, formatAppTime } from "@/lib/date-utils";
import { MapPin, Clock } from "lucide-react";
import { ActivityDetailsDialog } from "./ActivityDetailsDialog";

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
  const activityType = ACTIVITY_TYPES[activity.activityType];
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
        className="group relative cursor-pointer overflow-hidden rounded-none border border-border bg-card transition-all duration-150 hover:border-primary/70 hover:shadow-xs active:bg-secondary/40 min-w-0 max-w-full pl-1"
      >
        <span aria-hidden className="absolute inset-y-0 left-0 w-1" style={{ background: activityType.color }} />
        <div className="flex items-center justify-between gap-2 border-b border-border/80 bg-secondary/35 px-3.5 py-1.5">
          <div className="flex items-center gap-2 min-w-0">
            <span className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-primary flex items-center gap-1.5 shrink-0">
              <span className="h-1.5 w-1.5 rounded-none shrink-0" style={{ background: activityType.color }} />
              {activityType.label}
            </span>
            <span className="text-muted-foreground/40 font-mono text-xs">/</span>
            <span className="font-mono text-[11px] font-semibold text-foreground/90 tracking-wide truncate">
              {activity.title}
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {(!activity.batchId || activity.batchId === "all") ? (
              <span className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground border border-border/60 px-1.5 py-0.5">
                DEPT
              </span>
            ) : (!activity.sectionId || activity.sectionId === "all") ? (
              <span className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground border border-border/60 px-1.5 py-0.5">
                BATCH
              </span>
            ) : null}
            <span className="font-mono text-[10px] text-muted-foreground/60">#</span>
          </div>
        </div>

        <div className="p-3.5 sm:p-4">
          <h3 className="truncate font-display text-base font-semibold text-foreground group-hover:text-primary transition-colors tracking-tight">
            {activity.subject}
          </h3>

          {!compact && activity.description && (
            <p className="mt-1 line-clamp-2 text-xs text-muted-foreground whitespace-pre-line break-words">
              {activity.description}
            </p>
          )}
        </div>

        <div className="border-t border-border/80 grid grid-cols-2 sm:grid-cols-3 divide-x divide-border/80 bg-secondary/15 text-xs">
          <div className="px-3 py-2 flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground min-w-0">
            <Clock className="h-3 w-3 shrink-0 text-muted-foreground/70" />
            <span className="truncate">
              {isRange
                ? `${formatAppDate(activity.startDate, "MMM d")} – ${formatAppDate(activity.endDate, "MMM d, yy")}`
                : formatAppDate(activity.date, "EEE, MMM d, yyyy")}
            </span>
          </div>

          <div className="px-3 py-2 flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground min-w-0">
            <MapPin className="h-3 w-3 shrink-0 text-muted-foreground/70" />
            <span className="truncate">{activity.room || "Campus"}</span>
          </div>

          <div className="hidden sm:flex px-3 py-2 items-center justify-end font-mono text-[11px] font-semibold text-foreground tracking-wider">
            {displayTime ? (
              <span className="text-primary font-bold">{displayTime}</span>
            ) : (
              <span className="text-muted-foreground/60">ALL DAY</span>
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
