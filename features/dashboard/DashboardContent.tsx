"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import {
  ActivityForm,
  ManageActivitiesTable,
} from "@/features/activities/ActivityForm";
import { CsvImportDialog } from "@/features/activities/CsvImportDialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowRight,
  Briefcase,
  Building2,
  CalendarDays,
  CheckCircle,
  FileSpreadsheet,
  GraduationCap,
  Layers,
  Mail,
  Plus,
  User as UserIcon,
} from "lucide-react";
import type { Activity } from "@/types/activity";
import { toast } from "sonner";
import { useAuth } from "@/lib/state";
import {
  getServerErrorMessage,
  useDeleteActivityMutation,
  usePortalDashboardQuery,
} from "@/lib/api";

export function DashboardContent() {
  const { user: sessionUser } = useAuth();
  const [formOpen, setFormOpen] = useState(false);
  const [csvOpen, setCsvOpen] = useState(false);
  const [editing, setEditing] = useState<Activity | null>(null);
  const dashboard = usePortalDashboardQuery(undefined, { skip: !sessionUser });
  const [deleteActivity] = useDeleteActivityMutation();
  const user = sessionUser;

  if (!user) return null;

  const isTeacher = user.role === "teacher";
  const activities = dashboard.data?.activities ?? [];
  const stats = dashboard.data?.stats ?? { total: 0, today: 0, upcoming: 0 };
  const department = user.departmentName ?? "";
  const organization = user.organizationLabel ?? "";
  const scope = isTeacher ? department : organization;

  async function removeActivity(activity: Activity) {
    try {
      await deleteActivity(activity.id).unwrap();
      toast.success("Activity deleted");
    } catch (error) {
      toast.error(getServerErrorMessage(error));
    }
  }

  function openNewActivity() {
    setEditing(null);
    setFormOpen(true);
  }

  function openActivity(activity: Activity) {
    setEditing(activity);
    setFormOpen(true);
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <div className="rounded-[4px] border border-border bg-card p-5 shadow-2xs sm:p-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="inline-flex items-center gap-2 border border-border bg-secondary/50 px-2.5 py-1 font-mono text-[11px] font-semibold uppercase tracking-wider text-foreground">
              <span className="h-1.5 w-1.5 shrink-0 bg-primary" />
              <span>
                {isTeacher ? "TEACHER" : "CR"} DASHBOARD ·{" "}
                {scope || (dashboard.isLoading ? "LOADING..." : isTeacher ? "DEPARTMENT" : "CLASS SECTION")}
              </span>
            </div>
            <h1 className="mt-3 font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Welcome back, {user.name}!
            </h1>

            <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border pt-3 font-mono text-[11px]">
              <Detail icon={<Building2 />} label={isTeacher ? "Department" : "Dept"} value={department || "Loading..."} highlight />
              {!isTeacher && <Detail icon={<Layers />} label="Batch" value={user.batchName || "Loading..."} highlight />}
              {!isTeacher && <Detail icon={<GraduationCap />} label="Section" value={user.sectionName || "All"} highlight />}
              <Detail icon={<UserIcon />} label={isTeacher ? "Faculty" : "CR"} value={user.name} />
              <Detail icon={<Mail />} value={user.email} muted />
            </div>
          </div>

          <div className="flex w-full shrink-0 flex-col gap-2 sm:w-auto sm:flex-row">
            <Button className="h-9 w-full justify-center rounded-[4px] bg-primary px-4 font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-primary-foreground shadow-2xs hover:bg-primary-deep sm:w-auto" onClick={openNewActivity}>
              <Plus className="mr-1.5 h-3.5 w-3.5" /> Add activity
            </Button>
            <Button variant="outline" className="h-9 w-full justify-center rounded-[4px] border-border px-4 font-mono text-[11px] font-semibold uppercase tracking-[0.12em] hover:border-primary/50 hover:bg-primary/10 hover:text-primary sm:w-auto" onClick={() => setCsvOpen(true)}>
              <FileSpreadsheet className="mr-1.5 h-3.5 w-3.5" /> Import {isTeacher ? "Routine " : ""}CSV
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Stat icon={<CalendarDays />} value={stats.upcoming} label="Upcoming Activities" />
        <Stat icon={<CheckCircle className="text-emerald-500" />} value={stats.total - stats.upcoming} label="Completed" />
        <Stat icon={isTeacher ? <Briefcase /> : <FileSpreadsheet />} value={stats.total} label={scope ? `${scope} Total` : isTeacher ? "Department Total" : "Total Managed"} />
      </div>

      <div className="space-y-4 pt-2">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-mono text-xs font-bold uppercase tracking-[0.14em] text-foreground">
              {isTeacher ? `Recent activities in ${department || "your department"}` : "Manage activities"}
            </h2>
            <p className="font-mono text-[11px] text-muted-foreground">
              Total {activities.length} activities scheduled {isTeacher ? `in ${department || "your department"}` : `for ${organization || "your batch & section"}`}
            </p>
          </div>
          <Button asChild variant="outline" className="h-8 rounded-[4px] border-border px-3 font-mono text-[11px] font-semibold uppercase tracking-[0.12em] hover:border-primary/50 hover:bg-primary/10 hover:text-primary">
            <Link href="/activities">View all in calendar <ArrowRight className="ml-1.5 h-3.5 w-3.5" /></Link>
          </Button>
        </div>

        {dashboard.isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((item) => <Skeleton key={item} className="h-12 w-full rounded-[4px]" />)}
          </div>
        ) : (
          <ManageActivitiesTable activities={activities} onEdit={openActivity} onDelete={(activity) => void removeActivity(activity)} />
        )}
      </div>

      <ActivityForm
        key={`${formOpen}-${editing?.id ?? "new"}`}
        open={formOpen}
        onOpenChange={setFormOpen}
        editing={editing}
        fixed={isTeacher ? { departmentId: user.departmentId } : { departmentId: user.departmentId, batchId: user.batchId, sectionId: user.sectionId }}
        chooseBatchSection={isTeacher}
      />
      <CsvImportDialog
        open={csvOpen}
        onOpenChange={setCsvOpen}
        defaultDepartmentId={user.departmentId}
        defaultBatchId={isTeacher ? undefined : user.batchId}
      />
    </div>
  );
}

function Detail({ icon, label, value, highlight, muted }: { icon: ReactNode; label?: string; value: string; highlight?: boolean; muted?: boolean }) {
  return (
    <div className={`inline-flex items-center gap-1.5 rounded-[4px] border border-border bg-secondary/35 px-2.5 py-1 ${muted ? "text-muted-foreground" : "text-foreground"}`}>
      <span className="text-primary [&>svg]:h-3.5 [&>svg]:w-3.5">{icon}</span>
      <span>{label && `${label}: `}<strong className={highlight ? "font-bold text-primary" : undefined}>{value}</strong></span>
    </div>
  );
}

function Stat({ icon, label, value }: { icon: ReactNode; label: string; value: number }) {
  return (
    <div className="group rounded-[4px] border border-border bg-card p-4 shadow-2xs transition-all hover:border-primary/60">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 shrink-0 bg-primary" />
          <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">{label}</span>
        </div>
        <div className="text-muted-foreground/70 transition-colors group-hover:text-primary [&>svg]:h-4 [&>svg]:w-4">{icon}</div>
      </div>
      <div className="mt-3 font-mono text-3xl font-bold text-foreground transition-colors group-hover:text-primary">{value}</div>
    </div>
  );
}
