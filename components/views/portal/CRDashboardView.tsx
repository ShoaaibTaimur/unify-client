"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ActivityForm,
  ManageActivitiesTable,
} from "@/components/activities/ActivityForm";
import { CsvImportDialog } from "@/components/activities/CsvImportDialog";
import { Stat as StatCard } from "@/components/layout/cr-shared";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CalendarDays,
  CheckCircle,
  FileSpreadsheet,
  Plus,
  ArrowRight,
  Users,
  Building2,
  Layers,
  GraduationCap,
  User as UserIcon,
  Mail,
} from "lucide-react";
import type { Activity } from "@/types";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import { getApiError, useDeleteActivityMutation, usePortalDashboardQuery } from "@/lib/store/api-slice";

export function CRDashboardView() {
  const { user: sessionUser } = useAuth();
  const [open, setOpen] = useState(false);
  const [csvOpen, setCsvOpen] = useState(false);
  const [editing, setEditing] = useState<Activity | null>(null);
  const dashboard = usePortalDashboardQuery(undefined, { skip: !sessionUser });
  const [deleteActivity] = useDeleteActivityMutation();
  const user = dashboard.data?.user ?? sessionUser;

  if (!user) return null;

  const list = dashboard.data?.activities ?? [];
  const stats = dashboard.data?.stats ?? { total: 0, today: 0, upcoming: 0 };
  const depName = user.departmentName ?? "";
  const batchName = user.batchName ?? "";
  const sectionName = user.sectionName ?? "";
  const formatted = dashboard.data?.organizationLabel ?? user.organizationLabel ?? "";
  const orgLoading = dashboard.isLoading;

  const removeActivity = async (activity: Activity) => {
    try {
      await deleteActivity(activity.id).unwrap();
      toast.success("Activity deleted");
    } catch (error) {
      toast.error(getApiError(error));
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      <div className="rounded-[4px] border border-border bg-card p-5 sm:p-6 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 border border-border bg-secondary/50 px-2.5 py-1 font-mono text-[11px] font-semibold uppercase tracking-wider text-foreground">
              <span className="h-1.5 w-1.5 bg-primary shrink-0" />
              <span>CR DASHBOARD · {formatted || (orgLoading ? "LOADING..." : "CLASS SECTION")}</span>
            </div>
            <h1 className="mt-3 font-display text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Welcome back, {user.name}!
            </h1>

            <div className="mt-4 flex flex-wrap items-center gap-2 pt-3 border-t border-border font-mono text-[11px]">
              <div className="inline-flex items-center gap-1.5 rounded-[4px] border border-border bg-secondary/35 px-2.5 py-1 text-foreground">
                <Building2 className="h-3.5 w-3.5 text-primary" />
                <span>Dept: <strong className="text-primary font-bold">{depName || "Loading..."}</strong></span>
              </div>
              <div className="inline-flex items-center gap-1.5 rounded-[4px] border border-border bg-secondary/35 px-2.5 py-1 text-foreground">
                <Layers className="h-3.5 w-3.5 text-primary" />
                <span>Batch: <strong className="text-primary font-bold">{batchName || "Loading..."}</strong></span>
              </div>
              <div className="inline-flex items-center gap-1.5 rounded-[4px] border border-border bg-secondary/35 px-2.5 py-1 text-foreground">
                <GraduationCap className="h-3.5 w-3.5 text-primary" />
                <span>Section: <strong className="text-primary font-bold">{sectionName || "All"}</strong></span>
              </div>
              <div className="inline-flex items-center gap-1.5 rounded-[4px] border border-border bg-secondary/35 px-2.5 py-1 text-foreground">
                <UserIcon className="h-3.5 w-3.5 text-primary" />
                <span>CR: <strong>{user.name}</strong></span>
              </div>
              <div className="inline-flex items-center gap-1.5 rounded-[4px] border border-border bg-secondary/35 px-2.5 py-1 text-muted-foreground">
                <Mail className="h-3.5 w-3.5 text-primary" />
                <span>{user.email}</span>
              </div>
            </div>
          </div>
          <div className="flex w-full sm:w-auto flex-col sm:flex-row gap-2 shrink-0">
            <Button
              className="rounded-[4px] bg-primary text-primary-foreground hover:bg-primary-deep font-mono text-[11px] uppercase tracking-[0.12em] font-bold h-9 px-4 shadow-2xs transition-colors w-full sm:w-auto justify-center"
              onClick={() => {
                setEditing(null);
                setOpen(true);
              }}
            >
              <Plus className="mr-1.5 h-3.5 w-3.5" /> Add activity
            </Button>
            <Button
              variant="outline"
              className="rounded-[4px] border border-border text-foreground hover:bg-primary/10 hover:text-primary hover:border-primary/50 font-mono text-[11px] uppercase tracking-[0.12em] font-semibold h-9 px-4 transition-colors w-full sm:w-auto justify-center"
              onClick={() => setCsvOpen(true)}
            >
              <FileSpreadsheet className="mr-1.5 h-3.5 w-3.5" /> Import CSV Routine
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          icon={<CalendarDays className="h-4 w-4" />}
          value={stats.upcoming}
          label="Upcoming Activities"
        />
        <StatCard
          icon={<CheckCircle className="h-4 w-4 text-emerald-500" />}
          value={stats.total - stats.upcoming}
          label="Completed"
        />
        <StatCard
          icon={<FileSpreadsheet className="h-4 w-4 text-primary" />}
          value={stats.total}
          label={formatted ? `${formatted} Total` : "Total Managed"}
        />
      </div>

      <div className="space-y-4 pt-2">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-mono text-xs font-bold uppercase tracking-[0.14em] text-foreground">
              Manage activities
            </h2>
            <p className="font-mono text-[11px] text-muted-foreground">
              Total {list.length} activities scheduled for {formatted || "your batch & section"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="outline" className="rounded-[4px] border border-border text-foreground hover:bg-primary/10 hover:text-primary hover:border-primary/50 font-mono text-[11px] uppercase tracking-[0.12em] font-semibold h-8 px-3 transition-colors">
              <Link href="/activities">
                View all in calendar <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        </div>
        <div>
          {dashboard.isLoading ? (
            <div className="space-y-2">
              {[1,2,3].map((i) => <Skeleton key={i} className="h-12 w-full rounded-[4px]" />)}
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
        </div>
      </div>

      <ActivityForm
        open={open}
        onOpenChange={setOpen}
        editing={editing}
        fixed={{
          departmentId: user.departmentId,
          batchId: user.batchId,
          sectionId: user.sectionId,
        }}
        createdBy={user.name}
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
