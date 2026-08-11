"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Activity } from "@/lib/types";
import { ManageActivitiesTable, ActivityFormDialog } from "@/components/ActivityForm";
import { CsvImportDialog } from "@/components/CsvImportDialog";
import { PageLoader } from "@/components/PageLoader";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Plus, FileSpreadsheet } from "lucide-react";

export default function AdminActivitiesPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [csvOpen, setCsvOpen] = useState(false);
  const [editing, setEditing] = useState<Activity | null>(null);
  const activities = useQuery({
    queryKey: ["activities", "all"],
    queryFn: () => api.listActivities(),
  });
  const del = useMutation({
    mutationFn: (a: Activity) => api.deleteActivity(a.id),
    onSuccess: () => {
      toast.success("Deleted");
      qc.invalidateQueries({ queryKey: ["activities"] });
    },
  });

  if (activities.isLoading) {
    return <PageLoader text="Loading activities..." />;
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-4xl">All activities</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Every activity across every department.
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
            onClick={() => { setEditing(null); setOpen(true); }}
          >
            <Plus className="mr-2 h-4 w-4" /> Add
          </Button>
        </div>
      </div>
      <div className="mt-6">
        <ManageActivitiesTable
          activities={activities.data ?? []}
          onEdit={(a) => { setEditing(a); setOpen(true); }}
          onDelete={(a) => del.mutate(a)}
        />
      </div>
      <ActivityFormDialog
        open={open}
        onOpenChange={setOpen}
        editing={editing}
        chooseDepartment
        createdBy="u-admin"
      />
      <CsvImportDialog
        open={csvOpen}
        onOpenChange={setCsvOpen}
      />
    </div>
  );
}
