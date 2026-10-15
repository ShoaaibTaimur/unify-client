"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { ConfirmDeleteDialog } from "@/components/common/ConfirmDeleteDialog";
import { PageLoader } from "@/components/common/PageLoader";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Building2, Layers, GraduationCap, Pencil, Trash2 } from "lucide-react";

export function AdminOrgView() {
  const router = useRouter();
  const qc = useQueryClient();
  const deps = useQuery({
    queryKey: ["departments"],
    queryFn: () => api.listDepartments(),
  });
  const batches = useQuery({
    queryKey: ["batches", "all"],
    queryFn: () => api.listBatches(),
  });
  const sections = useQuery({
    queryKey: ["sections", "all"],
    queryFn: () => api.listSections(),
  });

  // Note: isLoading check moved below all hooks to avoid React rules-of-hooks violation

  const [depName, setDepName] = useState("");
  const createDep = useMutation({
    mutationFn: (n: string) => api.createDepartment(n),
    onSuccess: () => {
      toast.success("Department created");
      setDepName("");
      qc.invalidateQueries({ queryKey: ["departments"] });
      router.refresh();
    },
    onError: (e) => toast.error((e as Error).message),
  });

  const [batchName, setBatchName] = useState("");
  const [batchDep, setBatchDep] = useState("");
  const createBatch = useMutation({
    mutationFn: () => api.createBatch(batchDep, batchName),
    onSuccess: () => {
      toast.success("Batch created");
      setBatchName("");
      qc.invalidateQueries({ queryKey: ["batches"] });
      router.refresh();
    },
    onError: (e) => toast.error((e as Error).message),
  });

  const [secName, setSecName] = useState("");
  const [secDep, setSecDep] = useState("");
  const [secBatch, setSecBatch] = useState("");
  const createSection = useMutation({
    mutationFn: () => api.createSection(secBatch, secName),
    onSuccess: () => {
      toast.success("Section created");
      setSecName("");
      qc.invalidateQueries({ queryKey: ["sections"] });
      router.refresh();
    },
    onError: (e) => toast.error((e as Error).message),
  });

  const [editingItem, setEditingItem] = useState<{
    type: "dep" | "batch" | "sec";
    id: string;
    name: string;
  } | null>(null);
  const [deletingItem, setDeletingItem] = useState<{
    type: "dep" | "batch" | "sec";
    id: string;
    name: string;
  } | null>(null);

  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!editingItem || !editingItem.name.trim()) return;
      if (editingItem.type === "dep")
        return api.updateDepartment(editingItem.id, editingItem.name.trim());
      if (editingItem.type === "batch")
        return api.updateBatch(editingItem.id, editingItem.name.trim());
      return api.updateSection(editingItem.id, editingItem.name.trim());
    },
    onSuccess: () => {
      toast.success("Updated successfully");
      setEditingItem(null);
      qc.invalidateQueries({ queryKey: ["departments"] });
      qc.invalidateQueries({ queryKey: ["batches"] });
      qc.invalidateQueries({ queryKey: ["sections"] });
      router.refresh();
    },
    onError: (e) => toast.error((e as Error).message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (item: { type: "dep" | "batch" | "sec"; id: string }) => {
      if (item.type === "dep") return api.deleteDepartment(item.id);
      if (item.type === "batch") return api.deleteBatch(item.id);
      return api.deleteSection(item.id);
    },
    onSuccess: () => {
      toast.success("Deleted successfully");
      setDeletingItem(null);
      qc.invalidateQueries({ queryKey: ["departments"] });
      qc.invalidateQueries({ queryKey: ["batches"] });
      qc.invalidateQueries({ queryKey: ["sections"] });
      router.refresh();
    },
    onError: (e) => toast.error((e as Error).message),
  });

  const secFilteredBatches = secDep
    ? (batches.data ?? []).filter((b) => b.departmentId === secDep)
    : [];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col gap-1 border-b border-border pb-5">
        <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-primary font-bold">
          ORGANIZATION ARCHITECTURE
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
          Academic Structure
        </h1>
        <p className="font-mono text-xs text-muted-foreground">
          Departments, batches, and sections — manage and edit academic hierarchy in one place.
        </p>
      </div>

      {/* Add forms */}
      <div className="grid gap-4 lg:grid-cols-3">
        <FormCard
          icon={Building2}
          title="Add department"
          onSubmit={() => depName && createDep.mutate(depName)}
        >
          <Input
            value={depName}
            onChange={(e) => setDepName(e.target.value)}
            placeholder="e.g. CSE"
            className="rounded-[4px] font-mono text-xs"
          />
          <Button
            type="submit"
            disabled={!depName || createDep.isPending}
            className="w-full rounded-[4px] bg-primary text-primary-foreground hover:bg-primary-deep font-mono text-[11px] uppercase tracking-[0.12em] font-bold h-9"
          >
            Add department
          </Button>
        </FormCard>

        <FormCard
          icon={Layers}
          title="Add batch"
          onSubmit={() => batchName && batchDep && createBatch.mutate()}
        >
          <Select value={batchDep} onValueChange={setBatchDep}>
            <SelectTrigger className="rounded-[4px] font-mono text-xs">
              <SelectValue placeholder="Select department" />
            </SelectTrigger>
            <SelectContent className="rounded-[4px]">
              {deps.data?.map((d) => (
                <SelectItem key={d.id} value={d.id}>
                  {d.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            value={batchName}
            onChange={(e) => setBatchName(e.target.value)}
            placeholder="e.g. Batch 17"
            className="rounded-[4px] font-mono text-xs"
          />
          <Button
            type="submit"
            disabled={!batchName || !batchDep || createBatch.isPending}
            className="w-full rounded-[4px] bg-primary text-primary-foreground hover:bg-primary-deep font-mono text-[11px] uppercase tracking-[0.12em] font-bold h-9"
          >
            Add batch
          </Button>
        </FormCard>

        <FormCard
          icon={GraduationCap}
          title="Add section"
          onSubmit={() => secName && secBatch && createSection.mutate()}
        >
          <Select
            value={secDep}
            onValueChange={(v) => {
              setSecDep(v);
              setSecBatch("");
            }}
          >
            <SelectTrigger className="rounded-[4px] font-mono text-xs">
              <SelectValue placeholder="Select department" />
            </SelectTrigger>
            <SelectContent className="rounded-[4px]">
              {deps.data?.map((d) => (
                <SelectItem key={d.id} value={d.id}>
                  {d.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={secBatch}
            onValueChange={setSecBatch}
            disabled={!secDep}
          >
            <SelectTrigger className="rounded-[4px] font-mono text-xs">
              <SelectValue
                placeholder={secDep ? "Select batch" : "Select department first"}
              />
            </SelectTrigger>
            <SelectContent className="rounded-[4px]">
              {secFilteredBatches.map((b) => (
                <SelectItem key={b.id} value={b.id}>
                  {b.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            value={secName}
            onChange={(e) => setSecName(e.target.value)}
            placeholder="e.g. Section A"
            className="rounded-[4px] font-mono text-xs"
          />
          <Button
            type="submit"
            disabled={!secName || !secBatch || createSection.isPending}
            className="w-full rounded-[4px] bg-primary text-primary-foreground hover:bg-primary-deep font-mono text-[11px] uppercase tracking-[0.12em] font-bold h-9"
          >
            Add section
          </Button>
        </FormCard>
      </div>

      {/* Hierarchy view */}
      <div className="space-y-4 pt-4">
        <div>
          <h2 className="font-mono text-xs font-bold uppercase tracking-[0.14em] text-foreground">
            Structure
          </h2>
          <p className="font-mono text-[11px] text-muted-foreground">
            Every department, its batches, and their sections.
          </p>
        </div>

        <div className="space-y-4">
          {(deps.isLoading || batches.isLoading || sections.isLoading) ? (
            [1,2,3].map((i) => <Skeleton key={i} className="h-28 w-full rounded-[4px]" />)
          ) : (deps.data ?? []).length === 0 ? (
            <div className="rounded-[4px] border border-dashed border-border bg-card p-8 text-center font-mono text-xs text-muted-foreground">
              No departments yet. Add one above to get started.
            </div>
          ) : null}
          {!(deps.isLoading || batches.isLoading || sections.isLoading) && (deps.data ?? []).map((d) => {
            const depBatches = (batches.data ?? []).filter(
              (b) => b.departmentId === d.id
            );
            return (
              <section
                key={d.id}
                className="rounded-[4px] border border-border bg-card p-5 shadow-2xs"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="grid h-9 w-9 place-items-center rounded-[4px] bg-primary/10 text-primary">
                      <Building2 className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="font-mono text-base font-bold text-foreground">
                        {d.name}
                      </div>
                      <div className="font-mono text-[11px] text-muted-foreground">
                        {depBatches.length} batch
                        {depBatches.length === 1 ? "" : "es"}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 rounded-[4px] text-muted-foreground hover:text-foreground hover:bg-primary/10"
                      onClick={() =>
                        setEditingItem({ type: "dep", id: d.id, name: d.name })
                      }
                      title="Edit Department"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 rounded-[4px] text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      onClick={() =>
                        setDeletingItem({
                          type: "dep",
                          id: d.id,
                          name: d.name,
                        })
                      }
                      title="Delete Department"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  {depBatches.length === 0 && (
                    <div className="rounded-[4px] border border-dashed border-border p-4 font-mono text-xs text-muted-foreground">
                      No batches in this department yet.
                    </div>
                  )}
                  {depBatches.map((b) => {
                    const batchSections = (sections.data ?? []).filter(
                      (s) => s.batchId === b.id
                    );
                    return (
                      <div
                        key={b.id}
                        className="rounded-[4px] border border-border bg-secondary/35 p-3.5"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Layers className="h-3.5 w-3.5 text-primary" />
                            <div className="font-mono text-xs font-bold text-foreground">
                              {b.name}
                            </div>
                            <span className="font-mono text-[11px] text-muted-foreground">
                              ({batchSections.length} sections)
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7 rounded-[4px] text-muted-foreground hover:text-foreground hover:bg-primary/10"
                              onClick={() =>
                                setEditingItem({
                                  type: "batch",
                                  id: b.id,
                                  name: b.name,
                                })
                              }
                              title="Edit Batch"
                            >
                              <Pencil className="h-3 w-3" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7 rounded-[4px] text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                              onClick={() =>
                                setDeletingItem({
                                  type: "batch",
                                  id: b.id,
                                  name: b.name,
                                })
                              }
                              title="Delete Batch"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>

                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {batchSections.length === 0 && (
                            <span className="font-mono text-[11px] text-muted-foreground">
                              No sections yet.
                            </span>
                          )}
                          {batchSections.map((s) => (
                            <div
                              key={s.id}
                              className="group inline-flex items-center gap-1.5 rounded-[4px] border border-border bg-card px-2.5 py-1 font-mono text-[11px] font-medium text-foreground"
                            >
                              <GraduationCap className="h-3 w-3 text-primary" />
                              <span>{s.name}</span>
                              <button
                                onClick={() =>
                                  setEditingItem({
                                    type: "sec",
                                    id: s.id,
                                    name: s.name,
                                  })
                                }
                                className="text-muted-foreground hover:text-foreground"
                                title="Edit Section"
                              >
                                <Pencil className="h-2.5 w-2.5" />
                              </button>
                              <button
                                onClick={() =>
                                  setDeletingItem({
                                    type: "sec",
                                    id: s.id,
                                    name: s.name,
                                  })
                                }
                                className="text-muted-foreground hover:text-destructive"
                                title="Delete Section"
                              >
                                <Trash2 className="h-2.5 w-2.5" />
                              </button>
                            </div>
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

      {/* Edit Item Modal */}
      <Dialog
        open={!!editingItem}
        onOpenChange={(v) => {
          if (!v) setEditingItem(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">
              Edit{" "}
              {editingItem?.type === "dep"
                ? "Department"
                : editingItem?.type === "batch"
                  ? "Batch"
                  : "Section"}
            </DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <Input
              value={editingItem?.name ?? ""}
              onChange={(e) =>
                setEditingItem((prev) =>
                  prev ? { ...prev, name: e.target.value } : null
                )
              }
              placeholder="Name..."
              className="rounded-xl"
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditingItem(null)}>
              Cancel
            </Button>
            <Button
              disabled={
                !editingItem?.name.trim() || updateMutation.isPending
              }
              onClick={() => updateMutation.mutate()}
            >
              {updateMutation.isPending ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Delete Dialog */}
      <ConfirmDeleteDialog
        open={!!deletingItem}
        onOpenChange={(open) => {
          if (!open) setDeletingItem(null);
        }}
        itemName={
          deletingItem
            ? `${deletingItem.type === "dep" ? "department" : deletingItem.type === "batch" ? "batch" : "section"} "${deletingItem.name}"`
            : "this item"
        }
        isPending={deleteMutation.isPending}
        onConfirm={() => {
          if (deletingItem)
            deleteMutation.mutate({
              type: deletingItem.type,
              id: deletingItem.id,
            });
        }}
      />
    </div>
  );
}

function FormCard({
  icon: Icon,
  title,
  onSubmit,
  children,
}: {
  icon: typeof Building2;
  title: string;
  onSubmit: () => void;
  children: React.ReactNode;
}) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className="rounded-[4px] border border-border bg-card p-5 shadow-2xs"
    >
      <div className="flex items-center gap-2">
        <div className="grid h-8 w-8 place-items-center rounded-[4px] bg-primary/10 text-primary">
          <Icon className="h-4 w-4" />
        </div>
        <h3 className="font-mono text-xs font-bold uppercase tracking-[0.12em] text-foreground">{title}</h3>
      </div>
      <div className="mt-4 space-y-2.5">{children}</div>
    </form>
  );
}
