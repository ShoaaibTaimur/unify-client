"use client";

import { ACTIVITY_TYPES, type Activity } from "@/types/activity";
import { formatAppDate, formatAppTime } from "@/lib/date-utils";
import { MapPin, Clock, Calendar, BookOpen, FileText, Layers, ExternalLink } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface Props {
  activity: Activity | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ActivityDetailsDialog({ activity, open, onOpenChange }: Props) {
  if (!activity) return null;

  const isRange = !!activity.startDate;
  const activityType = ACTIVITY_TYPES[activity.activityType];
  const isExam = activity.activityType === "mid-exam" || activity.activityType === "final-exam";
  const displayTime = formatAppTime(activity.time, isRange ? null : activity.date);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto rounded-none border border-border bg-card p-6 shadow-2xl">
        {/* Header Block */}
        <DialogHeader className="space-y-2 text-left border-b border-border pb-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-none border border-border/80 bg-secondary/80 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-foreground shrink-0">
              <span className="h-1.5 w-1.5 rounded-none shrink-0" style={{ background: activityType.color }} />
              {activityType.label}
            </span>

            {(!activity.sectionId || activity.sectionId === "all") && (
              <span className="inline-flex items-center gap-1 rounded-none bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider">
                <Layers className="h-3 w-3" /> Batch-wide
              </span>
            )}
          </div>

          <div>
            <DialogTitle className="font-display text-2xl font-bold leading-tight text-foreground tracking-tight">
              {activity.subject}
            </DialogTitle>
            <p className="mt-1 font-mono text-xs font-semibold text-primary flex items-center gap-1.5 tracking-wide">
              <BookOpen className="h-3.5 w-3.5" /> [{activity.title}]
            </p>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Key Information Panel */}
          <div className="rounded-none border border-border bg-card p-4 space-y-3">
            {/* Date & Time */}
            <div className="flex items-start gap-3">
              <div className="grid h-8 w-8 shrink-0 place-items-center rounded-none bg-primary/10 text-primary border border-primary/20">
                <Calendar className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Date & Schedule</div>
                <div className="font-mono text-xs font-semibold text-foreground mt-0.5">
                  {isRange
                    ? `${formatAppDate(activity.startDate, "EEEE, MMM d, yyyy")} – ${formatAppDate(activity.endDate, "EEEE, MMM d, yyyy")}`
                    : formatAppDate(activity.date, "EEEE, MMMM d, yyyy")}
                </div>
                {displayTime && (
                  <div className="mt-1 inline-flex items-center gap-1 font-mono text-[11px] font-bold text-primary bg-primary/10 px-2 py-0.5 border border-primary/20">
                    <Clock className="h-3 w-3" />
                    {displayTime}
                  </div>
                )}
              </div>
            </div>

            {/* Room / Venue */}
            <div className="flex items-start gap-3 border-t border-border pt-3">
              <div className="grid h-8 w-8 shrink-0 place-items-center rounded-none bg-primary/10 text-primary border border-primary/20">
                <MapPin className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Venue / Room</div>
                <div className="font-mono text-xs font-semibold text-foreground mt-0.5">{activity.room || "To be announced"}</div>
              </div>
            </div>
          </div>

          {/* Conditional Seat Plan Link for Exams */}
          {isExam && (
            <a
              href="https://examsync.kiron.dev/"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-between gap-3 rounded-none border border-primary/40 bg-primary/5 p-3.5 transition-colors hover:bg-primary/10"
            >
              <div className="flex items-center gap-3">
                <div className="grid h-7 w-7 shrink-0 place-items-center rounded-none bg-primary text-primary-foreground">
                  <ExternalLink className="h-3.5 w-3.5" />
                </div>
                <div>
                  <div className="font-mono font-bold text-foreground text-xs flex items-center gap-1 uppercase tracking-wider">
                    Check Seat Plan (ExamSync) <ExternalLink className="h-3 w-3 text-primary opacity-80" />
                  </div>
                  <div className="font-mono text-[10px] text-muted-foreground">View room seat allocations</div>
                </div>
              </div>
              <span className="font-mono text-xs font-bold text-primary group-hover:underline">
                OPEN [↗]
              </span>
            </a>
          )}

          {/* Description Section */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
              <FileText className="h-3.5 w-3.5 text-primary" /> Description & Syllabus
            </div>
            <div className="rounded-none border border-border bg-secondary/30 p-3.5 text-xs leading-relaxed text-foreground/90 whitespace-pre-wrap break-words font-sans">
              {activity.description ? (
                formatDescription(activity.description)
              ) : (
                <p className="italic font-mono text-muted-foreground text-[11px]">[No detailed syllabus or description provided]</p>
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
