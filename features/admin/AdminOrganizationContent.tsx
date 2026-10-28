"use client";

import { useState } from "react";
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
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Building2, Layers, GraduationCap, Pencil, Trash2 } from "lucide-react";
import {
  getServerErrorMessage,
  useCreateBatchMutation,
  useCreateDepartmentMutation,
  useCreateSectionMutation,
  useDeleteBatchMutation,
  useDeleteDepartmentMutation,
  useDeleteSectionMutation,
  useOrganizationQuery,
  useUpdateBatchMutation,
  useUpdateDepartmentMutation,
  useUpdateSectionMutation,
} from "@/lib/api";

export function AdminOrganizationContent() {
  const organization = useOrganizationQuery();
  const departments = organization.data?.departments ?? [];
  const [createDepartment, createDepartmentState] = useCreateDepartmentMutation();
  const [createBatch, createBatchState] = useCreateBatchMutation();
  const [createSection, createSectionState] = useCreateSectionMutation();
  const [updateDepartment, updateDepartmentState] = useUpdateDepartmentMutation();
  const [updateBatch, updateBatchState] = useUpdateBatchMutation();
  const [updateSection, updateSectionState] = useUpdateSectionMutation();
  const [deleteDepartment, deleteDepartmentState] = useDeleteDepartmentMutation();
  const [deleteBatch, deleteBatchState] = useDeleteBatchMutation();
  const [deleteSection, deleteSectionState] = useDeleteSectionMutation();

  const [departmentName, setDepartmentName] = useState("");
  async function addDepartment() {
    try {
      await createDepartment(departmentName).unwrap();
      toast.success("Department created");
      setDepartmentName("");
    } catch (error) {
      toast.error(getServerErrorMessage(error));
    }
  }

  const [batchName, setBatchName] = useState("");
  const [batchDepartmentId, setBatchDepartmentId] = useState("");
  async function addBatch() {
    try {
      await createBatch({ departmentId: batchDepartmentId, name: batchName }).unwrap();
      toast.success("Batch created");
      setBatchName("");
    } catch (error) {
      toast.error(getServerErrorMessage(error));
    }
  }

  const [sectionName, setSectionName] = useState("");
  const [sectionDepartmentId, setSectionDepartmentId] = useState("");
  const [sectionBatchId, setSectionBatchId] = useState("");
  async function addSection() {
    try {
      await createSection({ batchId: sectionBatchId, name: sectionName }).unwrap();
      toast.success("Section created");
      setSectionName("");
    } catch (error) {
      toast.error(getServerErrorMessage(error));
    }
  }

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

  const isUpdating = updateDepartmentState.isLoading || updateBatchState.isLoading || updateSectionState.isLoading;
  const isDeleting = deleteDepartmentState.isLoading || deleteBatchState.isLoading || deleteSectionState.isLoading;

  async function saveName() {
    if (!editingItem || !editingItem.name.trim()) return;
    try {
      const input = { id: editingItem.id, name: editingItem.name.trim() };
      if (editingItem.type === "dep") await updateDepartment(input).unwrap();
      else if (editingItem.type === "batch") await updateBatch(input).unwrap();
      else await updateSection(input).unwrap();
      toast.success("Updated successfully");
      setEditingItem(null);
    } catch (error) {
      toast.error(getServerErrorMessage(error));
    }
  }

  async function removeItem() {
    if (!deletingItem) return;
    try {
      if (deletingItem.type === "dep") await deleteDepartment(deletingItem.id).unwrap();
      else if (deletingItem.type === "batch") await deleteBatch(deletingItem.id).unwrap();
      else await deleteSection(deletingItem.id).unwrap();
      toast.success("Deleted successfully");
      setDeletingItem(null);
    } catch (error) {
      toast.error(getServerErrorMessage(error));
    }
  }

  const availableSectionBatches = organization.data?.batchesByDepartment?.[sectionDepartmentId] ?? [];

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

      <div className="grid gap-4 lg:grid-cols-3">
        <FormCard
          icon={Building2}
          title="Add department"
          onSubmit={() => departmentName && void addDepartment()}
        >
          <Input
            value={departmentName}
            onChange={(e) => setDepartmentName(e.target.value)}
            placeholder="e.g. CSE"
            className="rounded-[4px] font-mono text-xs"
          />
          <Button
            type="submit"
            disabled={!departmentName || createDepartmentState.isLoading}
            className="w-full rounded-[4px] bg-primary text-primary-foreground hover:bg-primary-deep font-mono text-[11px] uppercase tracking-[0.12em] font-bold h-9"
          >
            Add department
          </Button>
        </FormCard>

        <FormCard
          icon={Layers}
          title="Add batch"
          onSubmit={() => batchName && batchDepartmentId && void addBatch()}
        >
          <Select value={batchDepartmentId} onValueChange={setBatchDepartmentId}>
            <SelectTrigger className="rounded-[4px] font-mono text-xs">
              <SelectValue placeholder="Select department" />
            </SelectTrigger>
            <SelectContent className="rounded-[4px]">
              {departments.map((d) => (
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
            disabled={!batchName || !batchDepartmentId || createBatchState.isLoading}
            className="w-full rounded-[4px] bg-primary text-primary-foreground hover:bg-primary-deep font-mono text-[11px] uppercase tracking-[0.12em] font-bold h-9"
          >
            Add batch
          </Button>
        </FormCard>

        <FormCard
          icon={GraduationCap}
          title="Add section"
          onSubmit={() => sectionName && sectionBatchId && void addSection()}
        >
          <Select
            value={sectionDepartmentId}
            onValueChange={(v) => {
              setSectionDepartmentId(v);
              setSectionBatchId("");
            }}
          >
            <SelectTrigger className="rounded-[4px] font-mono text-xs">
              <SelectValue placeholder="Select department" />
            </SelectTrigger>
            <SelectContent className="rounded-[4px]">
              {departments.map((d) => (
                <SelectItem key={d.id} value={d.id}>
                  {d.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={sectionBatchId}
            onValueChange={setSectionBatchId}
            disabled={!sectionDepartmentId}
          >
            <SelectTrigger className="rounded-[4px] font-mono text-xs">
              <SelectValue
                placeholder={sectionDepartmentId ? "Select batch" : "Select department first"}
              />
            </SelectTrigger>
            <SelectContent className="rounded-[4px]">
              {availableSectionBatches.map((b) => (
                <SelectItem key={b.id} value={b.id}>
                  {b.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            value={sectionName}
            onChange={(e) => setSectionName(e.target.value)}
            placeholder="e.g. Section A"
            className="rounded-[4px] font-mono text-xs"
          />
          <Button
            type="submit"
            disabled={!sectionName || !sectionBatchId || createSectionState.isLoading}
            className="w-full rounded-[4px] bg-primary text-primary-foreground hover:bg-primary-deep font-mono text-[11px] uppercase tracking-[0.12em] font-bold h-9"
          >
            Add section
          </Button>
        </FormCard>
      </div>

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
          {organization.isLoading ? (
            [1,2,3].map((i) => <Skeleton key={i} className="h-28 w-full rounded-[4px]" />)
          ) : departments.length === 0 ? (
            <div className="rounded-[4px] border border-dashed border-border bg-card p-8 text-center font-mono text-xs text-muted-foreground">
              No departments yet. Add one above to get started.
            </div>
          ) : null}
          {!organization.isLoading && departments.map((d) => {
            const depBatches = organization.data?.batchesByDepartment?.[d.id] ?? [];
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
                    const batchSections = organization.data?.sectionsByBatch?.[b.id] ?? [];
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
                !editingItem?.name.trim() || isUpdating
              }
              onClick={() => void saveName()}
            >
              {isUpdating ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
        isPending={isDeleting}
        onConfirm={() => void removeItem()}
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
