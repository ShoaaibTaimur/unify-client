import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { ACTIVITY_TYPES, type Activity, type ActivityType } from "@/lib/types";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  editing?: Activity | null;
  fixed?: { departmentId?: string; batchId?: string; sectionId?: string };
  /** Teacher: allow choosing batch/section within their department. */
  chooseBatchSection?: boolean;
  /** Admin: allow choosing department, batch and section. */
  chooseDepartment?: boolean;
  createdBy: string;
}

export function ActivityFormDialog({ open, onOpenChange, editing, fixed, chooseBatchSection, chooseDepartment, createdBy }: Props) {
  const qc = useQueryClient();
  const [type, setType] = useState<ActivityType>("class-test");
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [room, setRoom] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [departmentId, setDepartmentId] = useState(fixed?.departmentId ?? "");
  const [batchId, setBatchId] = useState(fixed?.batchId ?? "");
  const [sectionId, setSectionId] = useState(fixed?.sectionId ?? "");

  // When a fixed department is provided (teacher/cr), keep it authoritative.
  const effectiveDepartmentId = fixed?.departmentId ?? departmentId;
  const allowChooseBatchSection = chooseBatchSection || chooseDepartment;

  useEffect(() => {
    if (!open) return;
    if (editing) {
      setType(editing.activityType); setTitle(editing.title); setSubject(editing.subject);
      setRoom(editing.room ?? ""); setDescription(editing.description ?? "");
      setDate(editing.date ? editing.date.slice(0, 16) : "");
      setStartDate(editing.startDate ? editing.startDate.slice(0, 10) : "");
      setEndDate(editing.endDate ? editing.endDate.slice(0, 10) : "");
      setDepartmentId(editing.departmentId);
      setBatchId(editing.batchId); setSectionId(editing.sectionId);
    } else {
      setType("class-test"); setTitle(""); setSubject(""); setRoom(""); setDescription("");
      setDate(""); setStartDate(""); setEndDate("");
      setDepartmentId(fixed?.departmentId ?? "");
      setBatchId(fixed?.batchId ?? ""); setSectionId(fixed?.sectionId ?? "");
    }
  }, [open, editing, fixed]);

  const departments = useQuery({
    queryKey: ["departments"], enabled: !!chooseDepartment,
    queryFn: () => api.listDepartments(),
  });
  const batches = useQuery({
    queryKey: ["batches", effectiveDepartmentId], enabled: !!effectiveDepartmentId && !!allowChooseBatchSection,
    queryFn: () => api.listBatches(effectiveDepartmentId),
  });
  const sections = useQuery({
    queryKey: ["sections", batchId], enabled: !!batchId && !!allowChooseBatchSection,
    queryFn: () => api.listSections(batchId),
  });


  const isExam = ACTIVITY_TYPES.find(t => t.value === type)?.isExam;

  const mutation = useMutation({
    mutationFn: async () => {
      const base = {
        departmentId: effectiveDepartmentId, batchId, sectionId, activityType: type, title, subject,
        room: room || undefined, description: description || undefined, createdBy,
        date: isExam ? undefined : (date ? new Date(date).toISOString() : undefined),
        startDate: isExam && startDate ? new Date(startDate).toISOString() : undefined,
        endDate: isExam && endDate ? new Date(endDate).toISOString() : undefined,
      };
      if (editing) return api.updateActivity(editing.id, base);
      return api.createActivity(base);
    },
    onSuccess: () => {
      toast.success(editing ? "Activity updated" : "Activity created");
      qc.invalidateQueries({ queryKey: ["activities"] });
      onOpenChange(false);
    },
    onError: (e) => toast.error((e as Error).message),
  });

  const canSubmit = title && subject && effectiveDepartmentId && batchId && sectionId && (isExam ? (startDate && endDate) : date);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader><DialogTitle className="font-display text-2xl">{editing ? "Edit activity" : "New activity"}</DialogTitle></DialogHeader>

        <div className="space-y-4 py-2">
          <Field label="Activity type">
            <Select value={type} onValueChange={(v) => setType(v as ActivityType)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{ACTIVITY_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
            </Select>
          </Field>

          {chooseDepartment && (
            <Field label="Department">
              <Select value={departmentId} onValueChange={(v) => { setDepartmentId(v); setBatchId(""); setSectionId(""); }}>
                <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
                <SelectContent>{departments.data?.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
          )}

          {allowChooseBatchSection && (
            <div className="grid grid-cols-2 gap-3">
              <Field label="Batch">
                <Select value={batchId} onValueChange={(v) => { setBatchId(v); setSectionId(""); }} disabled={!effectiveDepartmentId}>
                  <SelectTrigger><SelectValue placeholder={effectiveDepartmentId ? "Select" : "Select department first"} /></SelectTrigger>
                  <SelectContent>{batches.data?.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}</SelectContent>
                </Select>
              </Field>
              <Field label="Section">
                <Select value={sectionId} onValueChange={setSectionId} disabled={!batchId}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{sections.data?.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                </Select>
              </Field>
            </div>
          )}

          <Field label="Title"><Input value={title} onChange={e => setTitle(e.target.value)} className="rounded-xl" /></Field>
          <Field label="Subject"><Input value={subject} onChange={e => setSubject(e.target.value)} className="rounded-xl" /></Field>

          {isExam ? (
            <div className="grid grid-cols-2 gap-3">
              <Field label="Start date"><Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="rounded-xl" /></Field>
              <Field label="End date"><Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="rounded-xl" /></Field>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <Field label="Date & time"><Input type="datetime-local" value={date} onChange={e => setDate(e.target.value)} className="rounded-xl" /></Field>
              <Field label="Room"><Input value={room} onChange={e => setRoom(e.target.value)} className="rounded-xl" /></Field>
            </div>
          )}

          <Field label="Description">
            <Textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className="rounded-xl" />
          </Field>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button disabled={!canSubmit || mutation.isPending} onClick={() => mutation.mutate()}>
            {mutation.isPending ? "Saving…" : editing ? "Save changes" : "Create activity"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</label>
      {children}
    </div>
  );
}

export function useActivityList(filter?: { departmentId?: string; batchId?: string; sectionId?: string }) {
  return useQuery({ queryKey: ["activities", filter], queryFn: () => api.listActivities(filter) });
}

/** Simple manage table shared by CR and Teacher dashboards. */
export function ManageActivitiesTable({
  activities, onEdit, onDelete,
}: { activities: Activity[]; onEdit: (a: Activity) => void; onDelete: (a: Activity) => void }) {
  const sorted = useMemo(() =>
    [...activities].sort((a, b) => new Date(a.startDate ?? a.date!).getTime() - new Date(b.startDate ?? b.date!).getTime()),
    [activities]);
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] text-sm">
        <thead className="border-b border-border bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
          <tr>
            <th className="px-4 py-3 text-left">Title</th>
            <th className="px-4 py-3 text-left">Type</th>
            <th className="px-4 py-3 text-left">Subject</th>
            <th className="px-4 py-3 text-left">When</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {sorted.length === 0 && (<tr><td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">No activities.</td></tr>)}
          {sorted.map(a => (
            <tr key={a.id} className="border-b border-border/60 last:border-b-0">
              <td className="px-4 py-3 font-medium">{a.title}</td>
              <td className="px-4 py-3">{ACTIVITY_TYPES.find(t => t.value === a.activityType)?.label}</td>
              <td className="px-4 py-3">{a.subject}</td>
              <td className="px-4 py-3 whitespace-nowrap">
                {a.startDate
                  ? `${new Date(a.startDate).toLocaleDateString()} – ${new Date(a.endDate!).toLocaleDateString()}`
                  : new Date(a.date!).toLocaleString()}
              </td>
              <td className="px-4 py-3 text-right whitespace-nowrap">
                <Button size="sm" variant="ghost" onClick={() => onEdit(a)}>Edit</Button>
                <Button size="sm" variant="ghost" className="text-destructive" onClick={() => onDelete(a)}>Delete</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );
}
