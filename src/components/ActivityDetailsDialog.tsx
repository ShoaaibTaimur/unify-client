"use client";

import { ACTIVITY_COLOR, type Activity } from "@/lib/types";
import { format } from "date-fns";
import { MapPin, Clock, Calendar, BookOpen, FileText, Layers, ExternalLink } from "lucide-react";
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
  const isExam = activity.activityType === "mid-exam" || activity.activityType === "final-exam";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto rounded-3xl p-6">
        {/* Header Block */}
        <DialogHeader className="space-y-2 text-left">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className="inline-flex items-center rounded-full px-3 py-0.5 text-xs font-bold uppercase tracking-wider text-white shadow-xs"
              style={{ background: color }}
            >
              {activityLabel(activity.activityType)}
            </span>

            {(!activity.sectionId || activity.sectionId === "all") && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 px-2.5 py-0.5 text-xs font-semibold">
                <Layers className="h-3 w-3" /> Batch-wide
              </span>
            )}
          </div>

          <div>
            <DialogTitle className="font-display text-2xl font-bold leading-tight text-foreground">
              {activity.subject}
            </DialogTitle>
            <p className="mt-1 font-mono text-sm font-semibold text-primary flex items-center gap-1.5">
              <BookOpen className="h-4 w-4" /> {activity.title}
            </p>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Key Information Panel */}
          <div className="rounded-2xl border border-border bg-card p-4 space-y-3 shadow-xs">
            {/* Date & Time */}
            <div className="flex items-start gap-3">
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                <Calendar className="h-4.5 w-4.5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Date & Schedule</div>
                <div className="font-semibold text-sm text-foreground">
                  {isRange
                    ? `${format(new Date(activity.startDate!), "EEEE, MMM d, yyyy")} – ${format(new Date(activity.endDate!), "EEEE, MMM d, yyyy")}`
                    : format(new Date(activity.date!), "EEEE, MMMM d, yyyy")}
                </div>
                {(activity.time || (!isRange && activity.date)) && (
                  <div className="mt-1 inline-flex items-center gap-1 font-mono text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                    <Clock className="h-3 w-3" />
                    {activity.time ?? format(new Date(activity.date!), "h:mm a")}
                  </div>
                )}
              </div>
            </div>

            {/* Room / Venue */}
            <div className="flex items-start gap-3 border-t border-border/60 pt-3">
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                <MapPin className="h-4.5 w-4.5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Venue / Room</div>
                <div className="font-semibold text-sm text-foreground">{activity.room || "To be announced"}</div>
              </div>
            </div>
          </div>

          {/* Conditional Seat Plan Link for Exams */}
          {isExam && (
            <a
              href="https://examsync.kiron.dev/"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-between gap-3 rounded-2xl border border-primary/30 bg-primary/5 p-3.5 transition-all duration-200 hover:border-primary hover:bg-primary/10 shadow-xs"
            >
              <div className="flex items-center gap-3">
                <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground shadow-xs">
                  <ExternalLink className="h-4 w-4" />
                </div>
                <div>
                  <div className="font-bold text-foreground text-xs flex items-center gap-1">
                    Check Seat Plan (ExamSync) <ExternalLink className="h-3 w-3 text-primary opacity-80" />
                  </div>
                  <div className="text-[11px] text-muted-foreground">View room seat allocations</div>
                </div>
              </div>
              <span className="text-xs font-bold text-primary group-hover:underline">
                Open ↗
              </span>
            </a>
          )}

          {/* Description Section */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <FileText className="h-4 w-4 text-primary" /> Description & Syllabus
            </div>
            <div className="rounded-2xl border border-border bg-muted/20 p-4 text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap break-words">
              {activity.description ? (
                formatDescription(activity.description)
              ) : (
                <p className="italic text-muted-foreground text-xs">No detailed syllabus or description provided.</p>
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
