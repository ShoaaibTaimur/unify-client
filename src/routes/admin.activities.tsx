import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Activity } from "@/lib/types";
import { ManageActivitiesTable, ActivityFormDialog } from "@/components/ActivityForm";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Plus } from "lucide-react";

export const Route = createFileRoute("/admin/activities")({ component: AdminActivitiesPage });

function AdminActivitiesPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Activity | null>(null);
  const activities = useQuery({ queryKey: ["activities", "all"], queryFn: () => api.listActivities() });
  const del = useMutation({
    mutationFn: (a: Activity) => api.deleteActivity(a.id),
    onSuccess: () => { toast.success("Deleted"); qc.invalidateQueries({ queryKey: ["activities"] }); },
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-4xl">All activities</h1>
          <p className="mt-1 text-sm text-muted-foreground">Every activity across every department.</p>
        </div>
        <Button className="rounded-full" onClick={() => { setEditing(null); setOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" /> Add
        </Button>
      </div>
      <div className="mt-6">
        <ManageActivitiesTable
          activities={activities.data ?? []}
          onEdit={(a) => { setEditing(a); setOpen(true); }}
          onDelete={(a) => del.mutate(a)}
        />
      </div>
      <ActivityFormDialog open={open} onOpenChange={setOpen} editing={editing} chooseDepartment createdBy="u-admin" />
    </div>
  );
}
