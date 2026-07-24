import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { getClassSelection } from "@/lib/session";
import {
  addMonths, eachDayOfInterval, endOfMonth, endOfWeek, format, isSameDay,
  isSameMonth, startOfMonth, startOfWeek, subMonths,
} from "date-fns";
import { ACTIVITY_COLOR, type Activity } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { activityLabel } from "@/components/ActivityCard";

export const Route = createFileRoute("/calendar")({
  head: () => ({
    meta: [
      { title: "Calendar — UNIFY" },
      { name: "description", content: "Monthly calendar of every class test, lab, viva, assignment, and exam." },
      { property: "og:title", content: "Calendar — UNIFY" },
      { property: "og:description", content: "Monthly calendar of every class test, lab, viva, assignment, and exam." },
    ],
  }),
  component: CalendarPage,
});

function dayActivities(day: Date, list: Activity[]) {
  return list.filter(a => {
    if (a.startDate && a.endDate) {
      const s = new Date(a.startDate); const e = new Date(a.endDate);
      return day >= new Date(s.getFullYear(), s.getMonth(), s.getDate()) &&
             day <= new Date(e.getFullYear(), e.getMonth(), e.getDate());
    }
    return a.date ? isSameDay(new Date(a.date), day) : false;
  });
}

function CalendarPage() {
  const cls = getClassSelection();
  const [cursor, setCursor] = useState(new Date());
  const activities = useQuery({ queryKey: ["activities", cls], queryFn: () => api.listActivities(cls ?? undefined) });

  const start = startOfWeek(startOfMonth(cursor));
  const end = endOfWeek(endOfMonth(cursor));
  const days = useMemo(() => eachDayOfInterval({ start, end }), [start, end]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="font-display text-3xl sm:text-4xl">Calendar</h1>
          <p className="mt-1 text-sm text-muted-foreground">Month view of every activity.</p>
        </div>
        <div className="flex w-full items-center justify-between gap-2 sm:w-auto sm:justify-end">
          <Button variant="outline" size="icon" className="shrink-0 rounded-full" onClick={() => setCursor(subMonths(cursor, 1))}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1 truncate text-center font-display text-base sm:min-w-[10rem] sm:flex-none sm:text-lg">{format(cursor, "MMMM yyyy")}</div>
          <Button variant="outline" size="icon" className="shrink-0 rounded-full" onClick={() => setCursor(addMonths(cursor, 1))}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="shrink-0 rounded-full" onClick={() => setCursor(new Date())}>Today</Button>
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-3xl border border-border bg-card shadow-card">
        <div className="grid grid-cols-7 border-b border-border bg-muted/40 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d => (
            <div key={d} className="px-3 py-2 text-center">{d}</div>
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
                className={`min-h-28 border-b border-r border-border p-2 last:border-r-0 ${
                  inMonth ? "bg-card" : "bg-muted/20 text-muted-foreground"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${
                    today ? "bg-primary text-primary-foreground" : ""
                  }`}>{format(day, "d")}</span>
                </div>
                <div className="mt-1 space-y-1">
                  {items.slice(0, 3).map(a => (
                    <div
                      key={a.id}
                      className="truncate rounded-md px-2 py-0.5 text-[11px] font-medium text-white"
                      style={{ background: ACTIVITY_COLOR[a.activityType] }}
                      title={`${activityLabel(a.activityType)} — ${a.title}`}
                    >
                      {a.title}
                    </div>
                  ))}
                  {items.length > 3 && (
                    <div className="pl-1 text-[11px] text-muted-foreground">+{items.length - 3} more</div>
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
          <span key={k} className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: v }} />
            {activityLabel(k as never)}
          </span>
        ))}
      </div>
    </div>
  );
}
