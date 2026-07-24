import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { ACTIVITY_TYPES, type Activity, type ActivityType } from "@/lib/types";
import { getClassSelection } from "@/lib/session";
import { ActivityCard } from "@/components/ActivityCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

export const Route = createFileRoute("/activities")({
  head: () => ({
    meta: [
      { title: "Activities — UNIFY" },
      { name: "description", content: "Search, filter, and browse every academic activity for your class." },
      { property: "og:title", content: "Activities — UNIFY" },
      { property: "og:description", content: "Search, filter, and browse every academic activity for your class." },
    ],
  }),
  component: ActivitiesPage,
});

type StatusFilter = "all" | "upcoming" | "completed";

function endDateOf(a: Activity) {
  return new Date(a.endDate ?? a.date!);
}

function ActivitiesPage() {
  const cls = getClassSelection();
  const [q, setQ] = useState("");
  const [type, setType] = useState<ActivityType | "all">("all");
  const [status, setStatus] = useState<StatusFilter>("upcoming");

  const activities = useQuery({
    queryKey: ["activities", cls],
    queryFn: () => api.listActivities(cls ?? undefined),
  });

  const filtered = useMemo(() => {
    const now = new Date();
    const needle = q.trim().toLowerCase();
    return (activities.data ?? [])
      .filter(a => type === "all" || a.activityType === type)
      .filter(a => {
        if (status === "all") return true;
        const done = endDateOf(a) < now;
        return status === "completed" ? done : !done;
      })
      .filter(a => {
        if (!needle) return true;
        return [a.title, a.subject, a.description, a.room, a.activityType]
          .filter(Boolean).some(f => f!.toLowerCase().includes(needle));
      })
      .sort((a, b) => new Date(a.startDate ?? a.date!).getTime() - new Date(b.startDate ?? b.date!).getTime());
  }, [activities.data, q, type, status]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="font-display text-4xl">All activities</h1>
          <p className="mt-1 text-sm text-muted-foreground">Everything scheduled for your class.</p>
        </div>
      </div>

      {/* Search + filters */}
      <div className="mt-6 flex flex-col gap-3 rounded-3xl border border-border bg-card p-3 shadow-card md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q} onChange={(e) => setQ(e.target.value)}
            placeholder="Search title, subject, room, description…"
            className="h-11 rounded-2xl border-0 bg-muted/40 pl-11 text-base focus-visible:ring-primary"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <FilterPill label="Upcoming" active={status === "upcoming"} onClick={() => setStatus("upcoming")} />
          <FilterPill label="Completed" active={status === "completed"} onClick={() => setStatus("completed")} />
          <FilterPill label="All" active={status === "all"} onClick={() => setStatus("all")} />
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <TypePill label="All types" active={type === "all"} onClick={() => setType("all")} />
        {ACTIVITY_TYPES.map(t => (
          <TypePill key={t.value} label={t.label} active={type === t.value} onClick={() => setType(t.value)} />
        ))}
      </div>

      {/* Results */}
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {filtered.length === 0 ? (
          <div className="col-span-full rounded-3xl border border-dashed border-border p-14 text-center text-muted-foreground">
            No activities match your filters.
          </div>
        ) : filtered.map(a => <ActivityCard key={a.id} activity={a} />)}
      </div>
    </div>
  );
}

function FilterPill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <Button
      onClick={onClick}
      variant={active ? "default" : "ghost"}
      className={`h-11 rounded-2xl px-4 ${active ? "" : "text-foreground/70"}`}
    >
      {label}
    </Button>
  );
}
function TypePill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border text-foreground/70 hover:border-primary/40 hover:text-foreground"
      }`}
    >
      {label}
    </button>
  );
}
