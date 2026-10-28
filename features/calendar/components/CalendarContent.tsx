"use client";

import { useState } from "react";
import { hasSelectedClass, useClassSelection } from "@/lib/session";
import { useCalendarQuery } from "@/lib/api";
import {
  addMonths,
  format,
  subMonths,
} from "date-fns";
import { ACTIVITY_TYPES, type Activity } from "@/types/activity";
import { ClassSelectionDialog } from "@/features/class-selection/components/ClassSelectionDialog";
import { PageLoader } from "@/components/common/PageLoader";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  MapPin,
  Clock,
} from "lucide-react";
import { parseAppDate, formatAppTime } from "@/lib/date-utils";
import { ActivityDetailsDialog } from "@/features/activities/components/ActivityDetailsDialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export function CalendarContent() {
  const { cls, loaded, needsSelection } = useClassSelection();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [cursor, setCursor] = useState(new Date());
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(
    null
  );
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  const calendar = useCalendarQuery(
    { selection: cls!, month: format(cursor, "yyyy-MM") },
    { skip: !hasSelectedClass(cls) }
  );
  const days = calendar.data?.days ?? [];
  const selectedDateKey = selectedDay ? format(selectedDay, "yyyy-MM-dd") : "";
  const activeDayActivities =
    days.find((day) => day.date === selectedDateKey)?.activities ?? [];

  if (!loaded || (calendar.isLoading && !calendar.data)) {
    return <PageLoader text="Loading calendar..." />;
  }

  return (
    <>
      <ClassSelectionDialog
        key={`${dialogOpen || needsSelection}-${cls?.departmentId}-${cls?.batchId}-${cls?.sectionId}`}
        open={dialogOpen || needsSelection}
        onOpenChange={setDialogOpen}
        initial={cls}
      />
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 animate-in fade-in duration-300">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h1 className="font-display text-3xl sm:text-4xl">Calendar</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Month view of every activity. Click any date or event for details.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-none border border-border hover:border-primary/60 hover:bg-primary/10 hover:text-primary transition-colors"
              onClick={() => setCursor(subMonths(cursor, 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="min-w-[140px] text-center font-mono text-xs uppercase tracking-[0.14em] font-bold">
              {format(cursor, "MMMM yyyy")}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-none border border-border hover:border-primary/60 hover:bg-primary/10 hover:text-primary transition-colors"
              onClick={() => setCursor(addMonths(cursor, 1))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="rounded-none border border-border text-[11px] font-mono uppercase tracking-wider font-semibold ml-1 h-8 px-3 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors"
              onClick={() => setCursor(new Date())}
            >
              Today
            </Button>
          </div>
        </div>

        <div className="mt-6 overflow-hidden rounded-none border border-border bg-card">
          <div className="grid grid-cols-7 border-b border-border bg-secondary/40 text-center font-mono text-[10px] uppercase tracking-[0.14em] font-bold text-muted-foreground">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <div key={d} className="py-2.5">
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 divide-x divide-y divide-border">
            {days.map((day) => {
              const dayDate = parseAppDate(day.date) ?? new Date();
              const items = day.activities;
              const isToday = day.date === format(new Date(), "yyyy-MM-dd");
              return (
                <div
                  key={day.date}
                  onClick={() => {
                    if (items.length > 0) setSelectedDay(dayDate);
                  }}
                  className={`min-h-[110px] p-1.5 transition-colors sm:p-2 ${
                    day.inMonth ? "bg-card" : "bg-muted/15 text-muted-foreground/40"
                  } ${items.length > 0 ? "cursor-pointer hover:bg-secondary/30" : ""}`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`inline-flex px-1.5 py-0.5 font-mono text-[11px] font-semibold ${
                        isToday
                          ? "bg-primary text-primary-foreground font-bold"
                          : ""
                      }`}
                    >
                      {format(dayDate, "d")}
                    </span>
                  </div>
                  <div className="mt-1 space-y-1">
                    {day.previewActivities.map((a) => (
                      <div
                        key={a.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedActivity(a);
                        }}
                        className="flex items-center gap-1.5 truncate rounded-none px-1.5 py-0.5 font-mono text-[10px] transition-colors bg-secondary/80 hover:bg-primary/15 hover:text-primary hover:border-primary/50 border border-border/70 text-foreground cursor-pointer"
                        title={`${ACTIVITY_TYPES[a.activityType].label} — ${a.subject} (${a.title})`}
                      >
                        <span
                          className="h-1.5 w-1.5 rounded-none shrink-0"
                          style={{ background: ACTIVITY_TYPES[a.activityType].color }}
                        />
                        <span className="truncate">{a.subject}</span>
                      </div>
                    ))}
                    {day.overflowCount > 0 && (
                      <div className="pl-1 text-[11px] font-medium text-primary hover:underline">
                        +{day.overflowCount} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3 text-xs text-muted-foreground">
          {Object.entries(ACTIVITY_TYPES).map(([value, activityType]) => (
            <span
              key={value}
              className="inline-flex items-center gap-1.5 rounded-full bg-muted/40 px-2.5 py-1"
            >
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ background: activityType.color }}
              />
              {activityType.label}
            </span>
          ))}
        </div>

        <ActivityDetailsDialog
          activity={selectedActivity}
          open={!!selectedActivity}
          onOpenChange={(v) => {
            if (!v) setSelectedActivity(null);
          }}
        />

        <Dialog
          open={!!selectedDay}
          onOpenChange={(v) => {
            if (!v) setSelectedDay(null);
          }}
        >
          <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center gap-2 text-primary font-medium text-sm">
                <CalendarIcon className="h-4 w-4" />{" "}
                {selectedDay && format(selectedDay, "EEEE, MMMM d, yyyy")}
              </div>
              <DialogTitle className="font-display text-2xl">
                Activities for this day
              </DialogTitle>
              <DialogDescription>
                Click any activity below for full details.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 py-2">
              {activeDayActivities.map((act) => (
                <div
                  key={act.id}
                  onClick={() => {
                    setSelectedActivity(act);
                    setSelectedDay(null);
                  }}
                  className="group relative cursor-pointer overflow-hidden rounded-[4px] border border-border bg-card p-4 shadow-2xs transition-all hover:border-primary/50"
                >
                  <span
                    aria-hidden
                    className="absolute inset-y-0 left-0 w-1"
                    style={{ background: ACTIVITY_TYPES[act.activityType].color }}
                  />
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className="inline-flex items-center gap-1.5 rounded-md border border-border/60 bg-secondary/80 px-2 py-0.5 text-[11px] font-medium text-foreground shrink-0"
                    >
                      <span
                        className="h-1.5 w-1.5 rounded-full shrink-0"
                        style={{ background: ACTIVITY_TYPES[act.activityType].color }}
                      />
                      {ACTIVITY_TYPES[act.activityType].label}
                    </span>
                    <div className="flex items-center gap-2">
                      {formatAppTime(act.time, act.startDate ? null : act.date) && (
                        <span className="flex items-center gap-1 text-xs font-semibold text-primary">
                          <Clock className="h-3 w-3" /> {formatAppTime(act.time, act.startDate ? null : act.date)}
                        </span>
                      )}
                      {act.room && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3" /> {act.room}
                        </span>
                      )}
                    </div>
                  </div>
                  <h4 className="mt-2 font-display text-base font-bold text-foreground group-hover:text-primary transition-colors">
                    {act.subject}
                  </h4>
                  <p className="font-mono text-xs text-primary font-semibold">
                    {act.title}
                  </p>
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
