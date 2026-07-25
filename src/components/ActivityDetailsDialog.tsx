import { ACTIVITY_COLOR, type Activity, type ActivityType } from "@/lib/types";
import { format } from "date-fns";
import { MapPin, Clock, Calendar, BookOpen, FileText, User } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { activityLabel } from "./ActivityCard";

interface Props {
  activity: Activity | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ActivityDetailsDialog({ activity, open, onOpenChange }: Props) {
  if (!activity) return null;

  const isRange = !!activity.startDate;
  const color = ACTIVITY_COLOR[activity.activityType];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader className="space-y-3">
          <div className="flex items-center gap-2">
            <span
              className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white"
              style={{ background: color }}
            >
              {activityLabel(activity.activityType)}
            </span>
            <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
              {activity.subject}
            </span>
          </div>
          <DialogTitle className="font-display text-2xl font-semibold leading-tight text-foreground">
            {activity.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Prominent Hero Schedule & Date Banner */}
          <div className="rounded-2xl border border-primary/30 bg-primary/10 p-4 shadow-xs">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
              <Clock className="h-4 w-4 text-primary" /> Schedule & Time
            </div>
            <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
              <div className="text-base sm:text-lg font-bold text-foreground">
                {isRange
                  ? `${format(new Date(activity.startDate!), "EEEE, MMM d, yyyy")} – ${format(new Date(activity.endDate!), "EEEE, MMM d, yyyy")}`
                  : format(new Date(activity.date!), "EEEE, MMMM d, yyyy")}
              </div>
              {!isRange && activity.date && (
                <span className="rounded-lg bg-primary px-3 py-1 text-xs sm:text-sm font-bold uppercase tracking-wider text-primary-foreground shadow-xs">
                  {format(new Date(activity.date), "h:mm a")}
                </span>
              )}
            </div>
          </div>

          {/* Venue Info */}
          {activity.room && (
            <div className="flex items-center gap-2.5 rounded-xl border border-border bg-card p-3.5 text-sm font-medium">
              <MapPin className="h-4 w-4 shrink-0 text-primary" />
              <span className="text-muted-foreground">Venue:</span>
              <span className="font-semibold text-foreground">{activity.room}</span>
            </div>
          )}

          {/* Description Section */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <FileText className="h-4 w-4 text-primary" /> Description & Syllabus
            </div>
            <div className="rounded-2xl border border-border bg-card p-4 text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap break-words">
              {activity.description ? (
                formatDescription(activity.description)
              ) : (
                <p className="italic text-muted-foreground text-xs">No detailed description provided for this activity.</p>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/** Formats URLs into clickable links while preserving line breaks and whitespace */
function formatDescription(text: string) {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlRegex);

  return parts.map((part, i) => {
    if (part.match(urlRegex)) {
      return (
        <a
          key={i}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-primary underline underline-offset-2 hover:opacity-80"
        >
          {part}
        </a>
      );
    }
    return part;
  });
}
