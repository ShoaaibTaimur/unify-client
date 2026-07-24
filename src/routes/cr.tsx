import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { clearStoredSession, getStoredUser } from "@/lib/session";
import { ActivityFormDialog, ManageActivitiesTable, useActivityList } from "@/components/ActivityForm";
import type { Activity, User } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { toast } from "sonner";
import { Plus, LogOut, ListChecks, CheckCircle2, CalendarDays, Menu, LayoutDashboard, Search, KeyRound, ArrowRight } from "lucide-react";
import { isSameDay } from "date-fns";

export const Route = createFileRoute("/cr")({
  head: () => ({
    meta: [
      { title: "CR Dashboard — UNIFY" },
      { name: "description", content: "Class Representative dashboard for managing your section's activities." },
      { property: "og:title", content: "CR Dashboard — UNIFY" },
      { property: "og:description", content: "Manage your section's activities in UNIFY." },
    ],
  }),
  component: CRDashboard,
});

function useAuthGuard(role: "cr" | "teacher" | "admin"): User | null {
  const navigate = useNavigate();
  const [u, setU] = useState<User | null>(null);
  useEffect(() => {
    const user = getStoredUser();
    if (!user) { navigate({ to: "/login" }); return; }
    if (user.mustChangePassword) { navigate({ to: "/change-password" }); return; }
    if (user.role !== role) { navigate({ to: user.role === "admin" ? "/admin" : user.role === "teacher" ? "/teacher" : "/cr" }); return; }
    setU(user);
  }, [navigate, role]);
  return u;
}

function CRDashboard() {
  const user = useAuthGuard("cr");
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Activity | null>(null);

  const activities = useActivityList(user ? { departmentId: user.departmentId, batchId: user.batchId, sectionId: user.sectionId } : undefined);
  const now = new Date();
  const list = activities.data ?? [];
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
      <TopBar user={user} title="CR Dashboard" />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-4 md:grid-cols-3">
          <Stat icon={<CalendarDays />} label="Today" value={todays.length} />
          <Stat icon={<ListChecks />} label="Upcoming" value={upcoming.length} />
          <Stat icon={<CheckCircle2 />} label="Completed" value={completed.length} />
        </div>

        <QuickActions onAdd={() => { setEditing(null); setOpen(true); }} />

        <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-2xl">Manage activities</h2>
          <Button className="rounded-full" onClick={() => { setEditing(null); setOpen(true); }}>
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
        open={open} onOpenChange={setOpen} editing={editing}
        fixed={{ departmentId: user.departmentId, batchId: user.batchId, sectionId: user.sectionId }}
        createdBy={user.id}
      />
    </div>
  );
}

const PANEL_NAV = [
  { to: "/", label: "Public dashboard", icon: LayoutDashboard, description: "Student-facing home" },
  { to: "/activities", label: "Browse activities", icon: Search, description: "Search & filter" },
  { to: "/calendar", label: "Calendar", icon: CalendarDays, description: "Monthly view" },
  { to: "/change-password", label: "Change password", icon: KeyRound, description: "Update credentials" },
] as const;

export function QuickActions({ onAdd }: { onAdd?: () => void }) {
  const items = [
    ...(onAdd
      ? [{ label: "Add activity", description: "Create a new activity", icon: Plus, onClick: onAdd }]
      : []),
    ...PANEL_NAV.map((n) => ({ label: n.label, description: n.description, icon: n.icon, to: n.to })),
  ];
  return (
    <div className="mt-8">
      <h2 className="font-display text-2xl">Quick actions</h2>
      <p className="mt-1 text-sm text-muted-foreground">Everything you need, in one place.</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((n) => {
          const Icon = n.icon;
          const inner = (
            <>
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1 text-left">
                <div className="font-medium">{n.label}</div>
                <div className="truncate text-xs text-muted-foreground">{n.description}</div>
              </div>
              <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
            </>
          );
          const cls = "group flex w-full items-center gap-4 rounded-2xl border border-border bg-card p-4 shadow-card transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md";
          return "to" in n && n.to ? (
            <Link key={n.label} to={n.to as never} className={cls}>{inner}</Link>
          ) : (
            <button key={n.label} type="button" onClick={(n as { onClick?: () => void }).onClick} className={cls}>{inner}</button>
          );
        })}
      </div>
    </div>
  );
}

export function TopBar({ user, title }: { user: User; title: string }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-card/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-2">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full" aria-label="Open menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] p-0">
              <SheetHeader className="border-b border-border p-4">
                <SheetTitle className="text-left"><Logo /></SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col p-3">
                {PANEL_NAV.map((n) => {
                  const Icon = n.icon;
                  return (
                    <Link key={n.to} to={n.to as never} onClick={() => setOpen(false)}
                      className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-foreground/80 hover:bg-muted">
                      <Icon className="h-4 w-4" /> {n.label}
                    </Link>
                  );
                })}
                <div className="my-3 border-t border-border" />
                <div className="rounded-xl border border-border bg-card p-3">
                  <div className="text-xs font-medium">{user.name}</div>
                  <div className="truncate text-xs text-muted-foreground">{user.email}</div>
                </div>
              </nav>
            </SheetContent>
          </Sheet>
          <Link to="/" className="flex min-w-0 items-center gap-2"><Logo /></Link>
        </div>
        <div className="hidden font-display text-lg md:block">{title}</div>
        <div className="flex items-center gap-2">
          <div className="hidden text-right text-xs sm:block">
            <div className="font-medium">{user.name}</div>
            <div className="truncate text-muted-foreground">{user.email}</div>
          </div>
          <ThemeToggle />
          <Button variant="outline" size="sm" className="rounded-full" onClick={() => { clearStoredSession(); navigate({ to: "/login" }); }}>
            <LogOut className="mr-1.5 h-3.5 w-3.5" /> Sign out
          </Button>
        </div>
      </div>
    </header>
  );
}

export function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
      <div className="flex items-center gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary [&>svg]:h-5 [&>svg]:w-5">{icon}</div>
        <div className="min-w-0">
          <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
          <div className="font-display text-3xl leading-tight">{value}</div>
        </div>
      </div>
    </div>
  );
}
