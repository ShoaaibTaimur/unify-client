"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { getClassSelection, setClassSelection } from "@/lib/session";
import type { ClassSelection } from "@/lib/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Logo } from "./Logo";

export function ClassSelectionDialog({
  open, onOpenChange, initial,
}: { open: boolean; onOpenChange: (v: boolean) => void; initial?: ClassSelection | null }) {
  const [departmentId, setDepartmentId] = useState(initial?.departmentId ?? "");
  const [batchId, setBatchId] = useState(initial?.batchId ?? "");
  const [sectionId, setSectionId] = useState(initial?.sectionId || "all");

  useEffect(() => {
    if (open) {
      const s = initial ?? getClassSelection();
      setDepartmentId(s?.departmentId ?? "");
      setBatchId(s?.batchId ?? "");
      setSectionId(s?.sectionId || "all");
    }
  }, [open, initial]);

  const departments = useQuery({ queryKey: ["departments"], queryFn: () => api.listDepartments() });
  const batches = useQuery({
    queryKey: ["batches", departmentId], enabled: !!departmentId,
    queryFn: () => api.listBatches(departmentId),
  });
  const sections = useQuery({
    queryKey: ["sections", batchId], enabled: !!batchId,
    queryFn: () => api.listSections(batchId),
  });

  const canContinue = Boolean(departmentId && batchId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="mb-2 flex justify-center"><Logo showWordmark={false} size={44} /></div>
          <DialogTitle className="text-center font-display text-2xl">Select your class</DialogTitle>
          <DialogDescription className="text-center">
            Pick your Department, Batch, and Section. You can change this anytime.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Department</label>
            <Select value={departmentId} onValueChange={(v) => { setDepartmentId(v); setBatchId(""); setSectionId("all"); }}>
              <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
              <SelectContent>
                {departments.data?.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Batch</label>
            <Select value={batchId} onValueChange={(v) => { setBatchId(v); setSectionId("all"); }} disabled={!departmentId}>
              <SelectTrigger><SelectValue placeholder="Select batch" /></SelectTrigger>
              <SelectContent>
                {batches.data?.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Section</label>
            <Select value={sectionId || "all"} onValueChange={setSectionId} disabled={!batchId}>
              <SelectTrigger><SelectValue placeholder="Select section" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sections (Default)</SelectItem>
                {sections.data?.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button
          className="mt-2 h-11 w-full rounded-xl text-base"
          disabled={!canContinue}
          onClick={() => {
            setClassSelection({ departmentId, batchId, sectionId: sectionId || "all" });
            onOpenChange(false);
          }}
        >
          Continue
        </Button>
      </DialogContent>
    </Dialog>
  );
}
