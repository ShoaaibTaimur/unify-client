import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Building2, Layers, GraduationCap } from "lucide-react";

export const Route = createFileRoute("/admin/organization")({
  head: () => ({
    meta: [
      { title: "Organization — UNIFY Admin" },
      { name: "description", content: "Manage departments, batches, and sections all in one place." },
      { property: "og:title", content: "Organization — UNIFY Admin" },
      { property: "og:description", content: "Departments, batches, and sections." },
    ],
  }),
  component: OrganizationPage,
});

function OrganizationPage() {
  const qc = useQueryClient();
  const deps = useQuery({ queryKey: ["departments"], queryFn: () => api.listDepartments() });
  const batches = useQuery({ queryKey: ["batches", "all"], queryFn: () => api.listBatches() });
  const sections = useQuery({ queryKey: ["sections", "all"], queryFn: () => api.listSections() });

  // Department form
  const [depName, setDepName] = useState("");
  const createDep = useMutation({
    mutationFn: (n: string) => api.createDepartment(n),
    onSuccess: () => { toast.success("Department created"); setDepName(""); qc.invalidateQueries({ queryKey: ["departments"] }); },
  });

  // Batch form
  const [batchName, setBatchName] = useState("");
  const [batchDep, setBatchDep] = useState("");
  const createBatch = useMutation({
    mutationFn: () => api.createBatch(batchDep, batchName),
    onSuccess: () => { toast.success("Batch created"); setBatchName(""); qc.invalidateQueries({ queryKey: ["batches", "all"] }); },
  });

  // Section form
  const [secName, setSecName] = useState("");
  const [secDep, setSecDep] = useState("");
  const [secBatch, setSecBatch] = useState("");
  const createSection = useMutation({
    mutationFn: () => api.createSection(secBatch, secName),
    onSuccess: () => { toast.success("Section created"); setSecName(""); qc.invalidateQueries({ queryKey: ["sections", "all"] }); },
  });

  const filteredBatches = batchDep ? (batches.data ?? []).filter(b => b.departmentId === batchDep) : [];
  const secFilteredBatches = secDep ? (batches.data ?? []).filter(b => b.departmentId === secDep) : [];

  return (
    <div>
      <h1 className="font-display text-3xl sm:text-4xl">Organization</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Departments, batches, and sections — everything in one structured place.
      </p>

      {/* Add forms */}
      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <FormCard icon={Building2} title="Add department" onSubmit={() => depName && createDep.mutate(depName)}>
          <Input value={depName} onChange={(e) => setDepName(e.target.value)} placeholder="e.g. CSE" className="rounded-xl" />
          <Button type="submit" disabled={!depName || createDep.isPending} className="w-full rounded-xl">Add department</Button>
        </FormCard>

        <FormCard icon={Layers} title="Add batch" onSubmit={() => batchName && batchDep && createBatch.mutate()}>
          <Select value={batchDep} onValueChange={setBatchDep}>
            <SelectTrigger className="rounded-xl"><SelectValue placeholder="Select department" /></SelectTrigger>
            <SelectContent>{deps.data?.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}</SelectContent>
          </Select>
          <Input value={batchName} onChange={(e) => setBatchName(e.target.value)} placeholder="e.g. Batch 17" className="rounded-xl" />
          <Button type="submit" disabled={!batchName || !batchDep || createBatch.isPending} className="w-full rounded-xl">Add batch</Button>
        </FormCard>

        <FormCard icon={GraduationCap} title="Add section" onSubmit={() => secName && secBatch && createSection.mutate()}>
          <Select value={secDep} onValueChange={(v) => { setSecDep(v); setSecBatch(""); }}>
            <SelectTrigger className="rounded-xl"><SelectValue placeholder="Select department" /></SelectTrigger>
            <SelectContent>{deps.data?.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={secBatch} onValueChange={setSecBatch} disabled={!secDep}>
            <SelectTrigger className="rounded-xl"><SelectValue placeholder={secDep ? "Select batch" : "Select department first"} /></SelectTrigger>
            <SelectContent>{secFilteredBatches.map(b => (
              <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
            ))}</SelectContent>
          </Select>
          <Input value={secName} onChange={(e) => setSecName(e.target.value)} placeholder="e.g. Section A" className="rounded-xl" />
          <Button type="submit" disabled={!secName || !secBatch || createSection.isPending} className="w-full rounded-xl">Add section</Button>
        </FormCard>
      </div>

      {/* Hierarchy view */}
      <div className="mt-10">
        <h2 className="font-display text-2xl">Structure</h2>
        <p className="mt-1 text-sm text-muted-foreground">Every department, its batches, and their sections.</p>

        <div className="mt-4 space-y-4">
          {(deps.data ?? []).length === 0 && (
            <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground">
              No departments yet. Add one above to get started.
            </div>
          )}
          {(deps.data ?? []).map(d => {
            const depBatches = (batches.data ?? []).filter(b => b.departmentId === d.id);
            return (
              <section key={d.id} className="rounded-2xl border border-border bg-card p-5 shadow-card">
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-display text-lg">{d.name}</div>
                    <div className="text-xs text-muted-foreground">{depBatches.length} batch{depBatches.length === 1 ? "" : "es"}</div>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  {depBatches.length === 0 && (
                    <div className="rounded-xl border border-dashed border-border p-4 text-xs text-muted-foreground">
                      No batches in this department yet.
                    </div>
                  )}
                  {depBatches.map(b => {
                    const batchSections = (sections.data ?? []).filter(s => s.batchId === b.id);
                    return (
                      <div key={b.id} className="rounded-xl border border-border bg-background/60 p-4">
                        <div className="flex items-center gap-2">
                          <Layers className="h-4 w-4 text-primary" />
                          <div className="font-medium">{b.name}</div>
                          <div className="ml-auto text-xs text-muted-foreground">{batchSections.length} sections</div>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {batchSections.length === 0 && <span className="text-xs text-muted-foreground">No sections yet.</span>}
                          {batchSections.map(s => (
                            <span key={s.id} className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground">
                              <GraduationCap className="h-3 w-3" /> {s.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function FormCard({ icon: Icon, title, onSubmit, children }: { icon: typeof Building2; title: string; onSubmit: () => void; children: React.ReactNode }) {
  return (
    <form
      onSubmit={(e) => { e.preventDefault(); onSubmit(); }}
      className="rounded-2xl border border-border bg-card p-5 shadow-card"
    >
      <div className="flex items-center gap-2">
        <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary/10 text-primary">
          <Icon className="h-4 w-4" />
        </div>
        <h3 className="font-display text-base">{title}</h3>
      </div>
      <div className="mt-4 space-y-2">{children}</div>
    </form>
  );
}
