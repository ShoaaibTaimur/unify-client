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
            <div className="flex items-center gap-2">
              <span
                className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-wide text-white"
                style={{ background: color }}
              >
                {activityLabel(activity.activityType)}
              </span>
              <span className="truncate text-xs text-muted-foreground">{activity.subject}</span>
            </div>
            <h3 className="mt-2 truncate font-display text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
              {activity.title}
            </h3>
            {!compact && activity.description && (
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground whitespace-pre-line">{activity.description}</p>
            )}
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-primary/10 border border-primary/20 px-2.5 py-1 text-xs font-semibold text-primary">
                <Clock className="h-3.5 w-3.5 shrink-0" />
                {isRange
                  ? `${format(new Date(activity.startDate!), "MMM d")} – ${format(new Date(activity.endDate!), "MMM d, yyyy")}`
                  : format(new Date(activity.date!), "EEE, MMM d • h:mm a")}
              </span>
              {activity.room && (
                <span className="inline-flex items-center gap-1 rounded-lg bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5 shrink-0" />
                  {activity.room}
                </span>
              )}
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
