"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { getStoredUser } from "@/lib/session";
import {
  ActivityForm,
  ManageActivitiesTable,
  useActivityList,
} from "@/components/ActivityForm";
import { ActivityCard } from "@/components/ActivityCard";
import { CsvImportDialog } from "@/components/CsvImportDialog";
import { Stat as StatCard } from "@/components/cr-shared";
import { PageLoader } from "@/components/PageLoader";
import { Button } from "@/components/ui/button";
import {
  Briefcase,
  CalendarDays,
  CheckCircle,
  FileSpreadsheet,
  Plus,
  ArrowRight,
} from "lucide-react";
import type { Activity } from "@/lib/types";
import { toast } from "sonner";

export function TeacherDashboardView() {
  const user = getStoredUser();
  const [open, setOpen] = useState(false);
  const [csvOpen, setCsvOpen] = useState(false);
  const [editing, setEditing] = useState<Activity | null>(null);
  const qc = useQueryClient();

  const filter = user?.departmentId
    ? { departmentId: user.departmentId }
    : undefined;
  const activities = useActivityList(filter);

  const del = useMutation({
    mutationFn: (a: Activity) => api.deleteActivity(a.id),
    onSuccess: () => {
      toast.success("Activity deleted");
      qc.invalidateQueries({ queryKey: ["activities"] });
    },
  });

  if (!user || user.role !== "teacher") {
    return (
      <div className="mx-auto max-w-md py-16 text-center">
        <p className="text-muted-foreground">Access denied. Teacher sign-in required.</p>
        <Link href="/login">
          <Button className="mt-4 rounded-full">Sign in</Button>
        </Link>
      </div>
    );
  }

  if (activities.isLoading) {
    return <PageLoader text="Loading teacher dashboard..." />;
  }

  const list = activities.data ?? [];
  const now = new Date();
  const upcomingCount = list.filter(
    (a) => new Date(a.endDate ?? a.startDate ?? a.date!) >= now
  ).length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              Teacher Dashboard · {user.departmentId}
            </div>
            <h1 className="mt-3 font-display text-3xl sm:text-4xl font-bold">
              Welcome back, {user.name}!
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Faculty scheduling and activity management for your department.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              className="rounded-full"
              onClick={() => {
                setEditing(null);
                setOpen(true);
              }}
            >
              <Plus className="mr-2 h-4 w-4" /> Add activity
            </Button>
            <Button
              variant="outline"
              className="rounded-full border-primary/30 text-primary hover:bg-primary/10 hover:text-primary"
              onClick={() => setCsvOpen(true)}
            >
              <FileSpreadsheet className="mr-2 h-4 w-4" /> Import Routine CSV
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          icon={<CalendarDays className="h-5 w-5 text-primary" />}
          value={upcomingCount}
          label="Upcoming"
        />
        <StatCard
          icon={<CheckCircle className="h-5 w-5 text-emerald-500" />}
          value={list.length - upcomingCount}
          label="Completed"
        />
        <StatCard
          icon={<Briefcase className="h-5 w-5 text-blue-500" />}
          value={list.length}
          label="Department Total"
        />
      </div>

      <div className="mt-10">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-2xl">
              Recent activities in your department
            </h2>
            <p className="text-xs text-muted-foreground">
              Total {list.length} activities in your department
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
              onClick={() => {
                setEditing(null);
                setOpen(true);
              }}
            >
              <Plus className="mr-2 h-4 w-4" /> Add activity
            </Button>
          </div>
        </div>
        <div className="mt-4">
          <ManageActivitiesTable
            activities={list}
            onEdit={(a) => {
              setEditing(a);
              setOpen(true);
            }}
            onDelete={(a) => del.mutate(a)}
          />
        </div>
      </div>

      <ActivityForm
        open={open}
        onOpenChange={setOpen}
        editing={editing}
        fixed={{ departmentId: user.departmentId }}
        chooseBatchSection
        createdBy={user.name}
      />

      <CsvImportDialog
        open={csvOpen}
        onOpenChange={setCsvOpen}
        defaultDepartmentId={user.departmentId}
      />
    </div>
  );
}
