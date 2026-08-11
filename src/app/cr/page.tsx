"use client";

import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { getStoredUser } from "@/lib/session";
import {
  ActivityFormDialog,
  ManageActivitiesTable,
  useActivityList,
} from "@/components/ActivityForm";
import { CsvImportDialog } from "@/components/CsvImportDialog";
import type { Activity, User } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Plus, ListChecks, CheckCircle2, CalendarDays, ArrowRight, FileSpreadsheet } from "lucide-react";
import { isSameDay } from "date-fns";
import { TopBar, Stat, QuickActions } from "@/components/cr-shared";
import { PageLoader } from "@/components/PageLoader";

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
  const [csvOpen, setCsvOpen] = useState(false);
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

  const del = useMutation({
    mutationFn: (a: Activity) => api.deleteActivity(a.id),
    onSuccess: () => {
      toast.success("Activity deleted");
      qc.invalidateQueries({ queryKey: ["activities"] });
    },
  });

  if (!user || activities.isLoading) {
    return <PageLoader text="Loading CR dashboard..." />;
  }

  const now = new Date();
  const list = activities.data ?? [];
  const todays = list.filter((a) => a.date && isSameDay(new Date(a.date), now));
  const upcoming = list.filter(
    (a) => new Date(a.startDate ?? a.date!) >= now
  );
  const completed = list.filter(
    (a) => new Date(a.endDate ?? a.date!) < now
  );

  // Show top 2 recent activities on dashboard
  const recentTwo = list.slice(0, 2);

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

        <QuickActions
          onAdd={() => { setEditing(null); setOpen(true); }}
          onImportCsv={() => setCsvOpen(true)}
        />

        <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-2xl">Manage activities</h2>
            <p className="text-xs text-muted-foreground">
              Total {list.length} activities in your batch & section
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              className="rounded-full border-primary/30 text-primary hover:bg-primary/10 hover:text-primary"
              onClick={() => setCsvOpen(true)}
            >
              <FileSpreadsheet className="mr-1.5 h-4 w-4" /> Import CSV Routine
            </Button>
            <Link href="/activities">
              <Button variant="outline" className="rounded-full">
                View all <ArrowRight className="ml-1.5 h-4 w-4" />
              </Button>
            </Link>
            <Button
              className="rounded-full"
              onClick={() => { setEditing(null); setOpen(true); }}
            >
              <Plus className="mr-2 h-4 w-4" /> Add activity
            </Button>
          </div>
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

      <CsvImportDialog
        open={csvOpen}
        onOpenChange={setCsvOpen}
        defaultDepartmentId={user.departmentId}
        defaultBatchId={user.batchId}
      />
    </div>
  );
}
