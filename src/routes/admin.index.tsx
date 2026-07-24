import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Building2, Users, CalendarDays, Layers, GraduationCap, ArrowRight } from "lucide-react";
import { ADMIN_NAV } from "./admin";

export const Route = createFileRoute("/admin/")({
  component: AdminOverview,
});

function AdminOverview() {
  const departments = useQuery({ queryKey: ["departments"], queryFn: () => api.listDepartments() });
  const batches = useQuery({ queryKey: ["batches", "all"], queryFn: () => api.listBatches() });
  const sections = useQuery({ queryKey: ["sections", "all"], queryFn: () => api.listSections() });
  const users = useQuery({ queryKey: ["users"], queryFn: () => api.listUsers() });
  const activities = useQuery({ queryKey: ["activities", "all"], queryFn: () => api.listActivities() });

  const cards = [
    { label: "Departments", value: departments.data?.length ?? 0, icon: Building2 },
    { label: "Batches", value: batches.data?.length ?? 0, icon: Layers },
    { label: "Sections", value: sections.data?.length ?? 0, icon: GraduationCap },
    { label: "Users", value: users.data?.length ?? 0, icon: Users },
    { label: "Activities", value: activities.data?.length ?? 0, icon: CalendarDays },
  ];

  const quickNav = ADMIN_NAV.filter((n) => !n.exact);

  return (
    <div>
      <h1 className="font-display text-3xl sm:text-4xl">Admin dashboard</h1>
      <p className="mt-1 text-sm text-muted-foreground">A quick look at UNIFY across the university.</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {cards.map(c => {
          const Icon = c.icon;
          return (
            <div key={c.label} className="rounded-2xl border border-border bg-card p-5 shadow-card">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground">{c.label}</div>
                  <div className="font-display text-3xl leading-tight">{c.value}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-10">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="font-display text-2xl">Manage everything</h2>
            <p className="mt-1 text-sm text-muted-foreground">All admin sections in one place.</p>
          </div>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {quickNav.map((n) => {
            const Icon = n.icon;
            return (
              <Link
                key={n.to}
                to={n.to as never}
                className="group flex items-center gap-4 rounded-2xl border border-border bg-card p-4 shadow-card transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
              >
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-medium">{n.label}</div>
                  {n.description && <div className="truncate text-xs text-muted-foreground">{n.description}</div>}
                </div>
                <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
