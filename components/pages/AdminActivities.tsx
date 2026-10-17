"use client";

import { useState } from "react";
import {
  ActivityForm,
  ManageActivitiesTable,
} from "@/components/activities/ActivityForm";
import { CsvImportDialog } from "@/components/activities/CsvImportDialog";
import { Button } from "@/components/ui/button";
import { Plus, FileSpreadsheet, Trash2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmDeleteDialog } from "@/components/ConfirmDeleteDialog";
import type { Activity } from "@/types";
import { toast } from "sonner";
import { useAuth } from "@/lib/state";
import { getServerErrorMessage, useActivitiesQuery, useClearActivitiesMutation, useDeleteActivityMutation } from "@/lib/api";

export function AdminActivitiesContent() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [csvOpen, setCsvOpen] = useState(false);
  const [confirmClearAll, setConfirmClearAll] = useState(false);
  const [editing, setEditing] = useState<Activity | null>(null);
  const activities = useActivitiesQuery();
  const [deleteActivity] = useDeleteActivityMutation();
  const [clearActivities, clearState] = useClearActivitiesMutation();

  const removeActivity = async (activity: Activity) => {
    try {
      await deleteActivity(activity.id).unwrap();
      toast.success("Activity deleted");
    } catch (error) {
      toast.error(getServerErrorMessage(error));
    }
  };

  const clearAll = async () => {
    try {
      const res = await clearActivities().unwrap();
      toast.success(`Cleared all ${res.deletedCount} activities`);
      setConfirmClearAll(false);
    } catch (error) {
      toast.error(getServerErrorMessage(error));
    }
  };

  const list = activities.data ?? [];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col gap-3 border-b border-border pb-5">
        <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-primary font-bold">
          ACTIVITIES REGISTRY
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
              Academic Activities
            </h1>
            <p className="font-mono text-xs text-muted-foreground mt-0.5">
              Manage all class tests, lab tests, viva, assignments, and exams across the university.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {list.length > 0 && (
              <Button
                variant="destructive"
                className="rounded-[4px] gap-2 font-mono text-[11px] uppercase tracking-[0.12em] font-semibold h-9 px-3.5"
                disabled={clearState.isLoading}
                onClick={() => setConfirmClearAll(true)}
              >
                <Trash2 className="h-3.5 w-3.5" /> Clear All ({list.length})
              </Button>
            )}
            <Button
              variant="outline"
              className="rounded-[4px] border border-border text-foreground hover:bg-primary/10 hover:text-primary hover:border-primary/50 font-mono text-[11px] uppercase tracking-[0.12em] font-semibold h-9 px-3.5 transition-colors"
              onClick={() => setCsvOpen(true)}
            >
              <FileSpreadsheet className="mr-1.5 h-3.5 w-3.5" /> Import CSV Routine
            </Button>
            <Button
              className="rounded-[4px] bg-primary text-primary-foreground hover:bg-primary-deep font-mono text-[11px] uppercase tracking-[0.12em] font-bold h-9 px-4 shadow-2xs transition-colors"
              onClick={() => {
                setEditing(null);
                setOpen(true);
              }}
            >
              <Plus className="mr-1.5 h-3.5 w-3.5" /> Create activity
            </Button>
          </div>
        </div>
      </div>

      {activities.isLoading ? (
        <div className="space-y-2">
          {[1,2,3,4,5].map((i) => <Skeleton key={i} className="h-12 w-full rounded-[4px]" />)}
        </div>
      ) : (
        <ManageActivitiesTable
          activities={list}
          onEdit={(a) => {
            setEditing(a);
            setOpen(true);
          }}
          onDelete={(a) => void removeActivity(a)}
        />
      )}

      <ActivityForm
        key={`${open}-${editing?.id ?? "new"}`}
        open={open}
        onOpenChange={setOpen}
        editing={editing}
        chooseDepartment
        createdBy={user?.name ?? "Admin"}
      />

      <CsvImportDialog open={csvOpen} onOpenChange={setCsvOpen} />

      <ConfirmDeleteDialog
        open={confirmClearAll}
        onOpenChange={setConfirmClearAll}
        itemName={`ALL ${list.length} activities university-wide`}
        isPending={clearState.isLoading}
        onConfirm={() => void clearAll()}
      />
    </div>
  );
}
