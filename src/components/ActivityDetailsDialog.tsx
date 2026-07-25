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
          {/* Key Details Grid */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 rounded-2xl border border-border/80 bg-muted/30 p-4">
            <div className="flex items-start gap-2.5 rounded-xl bg-primary/10 border border-primary/20 p-3.5">
              <Clock className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-primary">Schedule / Date</p>
                <p className="mt-0.5 text-sm font-bold text-foreground">
                  {isRange
                    ? `${format(new Date(activity.startDate!), "MMM d, yyyy")} – ${format(new Date(activity.endDate!), "MMM d, yyyy")}`
                    : format(new Date(activity.date!), "EEEE, MMM d, yyyy • h:mm a")}
                </p>
              </div>
            </div>

            {activity.room ? (
              <div className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Venue / Room</p>
                  <p className="mt-0.5 text-sm font-medium text-foreground">{activity.room}</p>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-2.5">
                <BookOpen className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Course Subject</p>
                  <p className="mt-0.5 text-sm font-medium text-foreground">{activity.subject}</p>
                </div>
              </div>
            )}
          </div>

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
