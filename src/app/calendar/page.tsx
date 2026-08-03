"use client";

import { useMemo, useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { hasSelectedClass, useClassSelection } from "@/lib/session";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { ACTIVITY_COLOR, type Activity } from "@/lib/types";
import { ClassSelectionDialog } from "@/components/ClassSelectionDialog";
import { PageLoader } from "@/components/PageLoader";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  MapPin,
} from "lucide-react";
import { activityLabel } from "@/components/ActivityCard";
import { ActivityDetailsDialog } from "@/components/ActivityDetailsDialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

function dayActivities(day: Date, list: Activity[]) {
  return list.filter((a) => {
    if (a.startDate && a.endDate) {
      const s = new Date(a.startDate);
      const e = new Date(a.endDate);
      return (
        day >= new Date(s.getFullYear(), s.getMonth(), s.getDate()) &&
        day <= new Date(e.getFullYear(), e.getMonth(), e.getDate())
      );
    }
    return a.date ? isSameDay(new Date(a.date), day) : false;
  });
}

export default function CalendarPage() {
  const { cls, loaded } = useClassSelection();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [cursor, setCursor] = useState(new Date());
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(
    null
  );
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  useEffect(() => {
    if (loaded && !hasSelectedClass(cls)) setDialogOpen(true);
  }, [cls, loaded]);

  const activities = useQuery({
    queryKey: ["activities", cls],
    queryFn: () => api.listActivities(cls ?? undefined),
  });

  const start = startOfWeek(startOfMonth(cursor));
  const end = endOfWeek(endOfMonth(cursor));
  const days = useMemo(
    () => eachDayOfInterval({ start, end }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [start, end]
  );

  const activeDayActivities = useMemo(() => {
    if (!selectedDay) return [];
    return dayActivities(selectedDay, activities.data ?? []);
  }, [selectedDay, activities.data]);

  if (!loaded || activities.isLoading) {
    return <PageLoader text="Loading calendar..." />;
  }

  return (
    <>
      <ClassSelectionDialog
        open={dialogOpen}
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
          <div className="flex w-full items-center justify-between gap-2 sm:w-auto sm:justify-end">
            <Button
              variant="outline"
              size="icon"
              className="shrink-0 rounded-full hover:scale-105 transition-transform"
              onClick={() => setCursor(subMonths(cursor, 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex-1 truncate text-center font-display text-base sm:min-w-[10rem] sm:flex-none sm:text-lg">
              {format(cursor, "MMMM yyyy")}
            </div>
            <Button
              variant="outline"
              size="icon"
              className="shrink-0 rounded-full hover:scale-105 transition-transform"
              onClick={() => setCursor(addMonths(cursor, 1))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="shrink-0 rounded-full"
              onClick={() => setCursor(new Date())}
            >
              Today
            </Button>
          </div>
        </div>

        <div className="mt-6 overflow-hidden rounded-3xl border border-border bg-card shadow-card">
          <div className="grid grid-cols-7 border-b border-border bg-muted/40 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <div key={d} className="px-3 py-2.5 text-center">
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {days.map((day) => {
              const inMonth = isSameMonth(day, cursor);
              const today = isSameDay(day, new Date());
              const items = dayActivities(day, activities.data ?? []);
              return (
                <div
                  key={day.toISOString()}
                  onClick={() => {
                    if (items.length > 0) setSelectedDay(day);
                  }}
                  className={`min-h-28 border-b border-r border-border p-2 last:border-r-0 transition-all duration-200 ${
                    inMonth
                      ? "bg-card hover:bg-muted/30"
                      : "bg-muted/20 text-muted-foreground"
                  } ${items.length > 0 ? "cursor-pointer hover:border-primary/40" : ""}`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${
                        today ? "bg-primary text-primary-foreground shadow-sm" : ""
                      }`}
                    >
                      {format(day, "d")}
                    </span>
                  </div>
                  <div className="mt-1 space-y-1">
                    {items.slice(0, 3).map((a) => (
                      <div
                        key={a.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedActivity(a);
                        }}
                        className="truncate rounded-md px-2 py-0.5 text-[11px] font-medium text-white transition-transform hover:scale-[1.03] shadow-xs cursor-pointer"
                        style={{ background: ACTIVITY_COLOR[a.activityType] }}
                        title={`${activityLabel(a.activityType)} — ${a.title}`}
                      >
                        {a.title}
                      </div>
                    ))}
                    {items.length > 3 && (
                      <div className="pl-1 text-[11px] font-medium text-primary hover:underline">
                        +{items.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-6 flex flex-wrap gap-3 text-xs text-muted-foreground">
          {Object.entries(ACTIVITY_COLOR).map(([k, v]) => (
            <span
              key={k}
              className="inline-flex items-center gap-1.5 rounded-full bg-muted/40 px-2.5 py-1"
            >
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ background: v }}
              />
              {activityLabel(k as never)}
            </span>
          ))}
        </div>

        {/* Single Activity Details Modal */}
        <ActivityDetailsDialog
          activity={selectedActivity}
          open={!!selectedActivity}
          onOpenChange={(v) => {
            if (!v) setSelectedActivity(null);
          }}
        />

        {/* Selected Day Activities List Modal */}
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
              {activeDayActivities.map((a) => (
                <div
                  key={a.id}
                  onClick={() => {
                    setSelectedDay(null);
                    setSelectedActivity(a);
                  }}
                  className="group flex cursor-pointer items-start justify-between gap-3 rounded-2xl border border-border bg-card p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-primary/40"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold text-white uppercase tracking-wider"
                        style={{ background: ACTIVITY_COLOR[a.activityType] }}
                      >
                        {activityLabel(a.activityType)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {a.subject}
                      </span>
                    </div>
                    <h4 className="mt-1 font-display text-base font-semibold group-hover:text-primary transition-colors">
                      {a.title}
                    </h4>
                    {a.room && (
                      <span className="mt-2 inline-flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" /> {a.room}
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">
                    {a.date ? format(new Date(a.date), "h:mm a") : "All Day"}
                  </span>
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
