"use client";

import { useState } from "react";
import { ACTIVITY_TYPES, type Activity } from "@/types/activity";
import { Button } from "@/components/ui/button";
import { formatAppDate, formatAppTime } from "@/lib/date-utils";
import { ConfirmDeleteDialog } from "@/components/common/ConfirmDeleteDialog";

export function ManageActivitiesTable({
  activities,
  onEdit,
  onDelete,
}: {
  activities: Activity[];
  onEdit: (a: Activity) => void;
  onDelete: (a: Activity) => void;
}) {
  const [deletingActivity, setDeletingActivity] = useState<Activity | null>(null);

  return (
    <>
      <div className="overflow-hidden rounded-[4px] border border-border bg-card shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="border-b border-border bg-secondary/40 text-[10px] font-mono font-bold uppercase tracking-[0.14em] text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left">Subject Name</th>
                <th className="px-4 py-3 text-left">Type</th>
                <th className="px-4 py-3 text-left">Course Code</th>
                <th className="px-4 py-3 text-left">When</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {activities.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center font-mono text-xs text-muted-foreground">
                    No activities found.
                  </td>
                </tr>
              )}
              {activities.map((a) => (
                <tr key={a.id} className="border-b border-border/60 last:border-b-0 hover:bg-secondary/20 transition-colors">
                  <td className="px-4 py-3 font-medium">
                    <div className="font-bold text-foreground flex items-center gap-2">
                      <span>{a.subject}</span>
                      {(!a.batchId || a.batchId === "all") ? (
                        <span className="inline-flex items-center rounded-[4px] bg-primary/10 px-2 py-0.5 font-mono text-[10px] font-semibold text-primary border border-primary/20">
                          Dept-wide
                        </span>
                      ) : (!a.sectionId || a.sectionId === "all") ? (
                        <span className="inline-flex items-center rounded-[4px] bg-secondary px-2 py-0.5 font-mono text-[10px] font-semibold text-foreground border border-border">
                          Batch-wide
                        </span>
                      ) : null}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{ACTIVITY_TYPES[a.activityType].label}</td>
                  <td className="px-4 py-3 font-mono text-xs font-bold text-primary">{a.title}</td>
                  <td className="px-4 py-3 whitespace-nowrap font-mono text-xs text-foreground/90">
                    {a.startDate
                      ? `${formatAppDate(a.startDate, "PPP")} – ${formatAppDate(a.endDate, "PPP")}`
                      : `${formatAppDate(a.date, "PPP")}${formatAppTime(a.time, a.date) ? `, ${formatAppTime(a.time, a.date)}` : ""}`}
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <Button size="sm" variant="ghost" className="rounded-[4px] font-mono text-[11px] uppercase tracking-wider hover:bg-primary/10 hover:text-primary mr-1" onClick={() => onEdit(a)}>
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="rounded-[4px] font-mono text-[11px] uppercase tracking-wider text-destructive hover:bg-destructive/10"
                      onClick={() => setDeletingActivity(a)}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>

      <ConfirmDeleteDialog
        open={!!deletingActivity}
        onOpenChange={(open) => {
          if (!open) setDeletingActivity(null);
        }}
        itemName={deletingActivity ? `activity "${deletingActivity.title}"` : "this activity"}
        onConfirm={() => {
          if (deletingActivity) {
            onDelete(deletingActivity);
            setDeletingActivity(null);
          }
        }}
      />
    </>
  );
}
