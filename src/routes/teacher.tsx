import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { getStoredUser } from "@/lib/session";
import { ActivityFormDialog, ManageActivitiesTable, useActivityList } from "@/components/ActivityForm";
import type { Activity, User } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Plus, ListChecks, CheckCircle2, CalendarDays } from "lucide-react";
import { isSameDay } from "date-fns";
import { TopBar, Stat, QuickActions } from "./cr";

export const Route = createFileRoute("/teacher")({
  head: () => ({
    meta: [
      { title: "Teacher Dashboard — UNIFY" },
      { name: "description", content: "Manage activities across every batch and section in your department." },
      { property: "og:title", content: "Teacher Dashboard — UNIFY" },
      { property: "og:description", content: "Manage academic activities across your department." },
    ],
  }),
  component: TeacherDashboard,
});

function TeacherDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  useEffect(() => {
    const u = getStoredUser();
    if (!u) { navigate({ to: "/login" }); return; }
    if (u.mustChangePassword) { navigate({ to: "/change-password" }); return; }
    if (u.role !== "teacher") { navigate({ to: u.role === "admin" ? "/admin" : "/cr" }); return; }
    setUser(u);
  }, [navigate]);

  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Activity | null>(null);

  const activities = useActivityList(user ? { departmentId: user.departmentId } : undefined);
  const list = activities.data ?? [];
  const now = new Date();
  const todays = list.filter(a => a.date && isSameDay(new Date(a.date), now));
  const upcoming = list.filter(a => new Date(a.startDate ?? a.date!) >= now);
  const completed = list.filter(a => new Date(a.endDate ?? a.date!) < now);

  const del = useMutation({
    mutationFn: (a: Activity) => api.deleteActivity(a.id),
    onSuccess: () => { toast.success("Activity deleted"); qc.invalidateQueries({ queryKey: ["activities"] }); },
  });

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <TopBar user={user} title="Teacher Dashboard" />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-4 md:grid-cols-3">
          <Stat icon={<CalendarDays />} label="Today" value={todays.length} />
          <Stat icon={<ListChecks />} label="Upcoming" value={upcoming.length} />
          <Stat icon={<CheckCircle2 />} label="Completed" value={completed.length} />
        </div>

        <QuickActions onAdd={() => { setEditing(null); setOpen(true); }} />

        <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-2xl">All activities in your department</h2>
          <Button className="rounded-full" onClick={() => { setEditing(null); setOpen(true); }}>
            <Plus className="mr-2 h-4 w-4" /> Add activity
          </Button>
        </div>
        <div className="mt-4">
          <ManageActivitiesTable activities={list} onEdit={(a) => { setEditing(a); setOpen(true); }} onDelete={(a) => del.mutate(a)} />
        </div>
      </div>

      <ActivityFormDialog
        open={open} onOpenChange={setOpen} editing={editing}
        fixed={{ departmentId: user.departmentId }}
        chooseBatchSection
        createdBy={user.id}
      />
    </div>
  );
}
