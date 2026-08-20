"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import {
  ActivityForm,
  ManageActivitiesTable,
} from "@/components/ActivityForm";
import { CsvImportDialog } from "@/components/CsvImportDialog";
import { Button } from "@/components/ui/button";
import { PageLoader } from "@/components/PageLoader";
import { Plus, FileSpreadsheet } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { Activity } from "@/lib/types";
import { toast } from "sonner";
import { getStoredUser } from "@/lib/session";

export function AdminActivitiesView() {
  const user = getStoredUser();
  const [open, setOpen] = useState(false);
  const [csvOpen, setCsvOpen] = useState(false);
  const [editing, setEditing] = useState<Activity | null>(null);
  const qc = useQueryClient();

  const activities = useQuery({
    queryKey: ["activities", "all"],
    queryFn: () => api.listActivities(),
  });

  const del = useMutation({
    mutationFn: (a: Activity) => api.deleteActivity(a.id),
    onSuccess: () => {
      toast.success("Activity deleted");
      qc.invalidateQueries({ queryKey: ["activities"] });
    },
  });

  const list = activities.data ?? [];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-4xl font-semibold">Activities</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage all class tests, lab tests, viva, assignments, and exams across the university.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="rounded-full border-primary/30 text-primary hover:bg-primary/10 hover:text-primary"
            onClick={() => setCsvOpen(true)}
          >
            <FileSpreadsheet className="mr-2 h-4 w-4" /> Import CSV Routine
          </Button>
          <Button
            className="rounded-full"
            onClick={() => {
              setEditing(null);
              setOpen(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" /> Create activity
          </Button>
        </div>
      </div>

      {activities.isLoading ? (
        <div className="space-y-3">
          {[1,2,3,4,5].map((i) => <Skeleton key={i} className="h-14 w-full rounded-2xl" />)}
        </div>
      ) : (
        <ManageActivitiesTable
          activities={list}
          onEdit={(a) => {
            setEditing(a);
            setOpen(true);
          }}
          onDelete={(a) => del.mutate(a)}
        />
      )}

      <ActivityForm
        open={open}
        onOpenChange={setOpen}
        editing={editing}
        chooseDepartment
        createdBy={user?.name ?? "Admin"}
      />

      <CsvImportDialog open={csvOpen} onOpenChange={setCsvOpen} />
    </div>
  );
}
