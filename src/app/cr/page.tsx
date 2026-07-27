"use client";

import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { getStoredUser } from "@/lib/session";
import {
  ActivityFormDialog,
  ManageActivitiesTable,
  useActivityList,
} from "@/components/ActivityForm";
import type { Activity, User } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Plus, ListChecks, CheckCircle2, CalendarDays } from "lucide-react";
import { isSameDay } from "date-fns";
import { TopBar, Stat, QuickActions } from "@/components/cr-shared";

function useAuthGuard(role: "cr" | "teacher" | "admin"): User | null {
  const router = useRouter();
  const [u, setU] = useState<User | null>(null);
  useEffect(() => {
    const user = getStoredUser();
    if (!user) {
      router.push("/login");
      return;
    }
    if (user.mustChangePassword) {
      router.push("/change-password");
      return;
    }
    if (user.role !== role) {
      router.push(
        user.role === "admin"
          ? "/admin"
          : user.role === "teacher"
            ? "/teacher"
            : "/cr"
      );
      return;
    }
    setU(user);
  }, [router, role]);
  return u;
}

export default function CRDashboard() {
  const user = useAuthGuard("cr");
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Activity | null>(null);

  const activities = useActivityList(
    user
      ? {
          departmentId: user.departmentId,
          batchId: user.batchId,
          sectionId: user.sectionId,
        }
      : undefined
  );
  const now = new Date();
  const list = activities.data ?? [];
  const todays = list.filter((a) => a.date && isSameDay(new Date(a.date), now));
  const upcoming = list.filter(
    (a) => new Date(a.startDate ?? a.date!) >= now
  );
  const completed = list.filter(
    (a) => new Date(a.endDate ?? a.date!) < now
  );

  const del = useMutation({
    mutationFn: (a: Activity) => api.deleteActivity(a.id),
    onSuccess: () => {
      toast.success("Activity deleted");
      qc.invalidateQueries({ queryKey: ["activities"] });
    },
  });

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <TopBar user={user} title="CR Dashboard" />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-4 md:grid-cols-3">
          <Stat icon={<CalendarDays />} label="Today" value={todays.length} />
          <Stat icon={<ListChecks />} label="Upcoming" value={upcoming.length} />
          <Stat
            icon={<CheckCircle2 />}
            label="Completed"
            value={completed.length}
          />
        </div>

        <QuickActions onAdd={() => { setEditing(null); setOpen(true); }} />

        <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-2xl">Manage activities</h2>
          <Button
            className="rounded-full"
            onClick={() => { setEditing(null); setOpen(true); }}
          >
            <Plus className="mr-2 h-4 w-4" /> Add activity
          </Button>
        </div>
        <div className="mt-4">
          <ManageActivitiesTable
            activities={list}
            onEdit={(a) => { setEditing(a); setOpen(true); }}
            onDelete={(a) => del.mutate(a)}
          />
        </div>
      </div>

      <ActivityFormDialog
        open={open}
        onOpenChange={setOpen}
        editing={editing}
        fixed={{
          departmentId: user.departmentId,
          batchId: user.batchId,
          sectionId: user.sectionId,
        }}
        createdBy={user.id}
      />
    </div>
  );
}
