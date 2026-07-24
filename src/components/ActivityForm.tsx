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
import { addDays, format, differenceInDays } from "date-fns";
import { CalendarIcon, ClockIcon } from "lucide-react";

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

const TIME_PRESETS = [
  { label: "09:00 AM", value: "09:00" },
  { label: "10:30 AM", value: "10:30" },
  { label: "11:45 AM", value: "11:45" },
  { label: "01:30 PM", value: "13:30" },
  { label: "03:00 PM", value: "15:00" },
  { label: "04:30 PM", value: "16:30" },
];

export function ActivityFormDialog({ open, onOpenChange, editing, fixed, chooseBatchSection, chooseDepartment, createdBy }: Props) {
  const qc = useQueryClient();
  const [type, setType] = useState<ActivityType>("class-test");
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [room, setRoom] = useState("");
  const [description, setDescription] = useState("");
  
  // Date & time state split into clean separate date & time values
  const [dateVal, setDateVal] = useState("");
  const [timeVal, setTimeVal] = useState("09:00");
  
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [departmentId, setDepartmentId] = useState(fixed?.departmentId ?? "");
  const [batchId, setBatchId] = useState(fixed?.batchId ?? "");
  const [sectionId, setSectionId] = useState(fixed?.sectionId ?? "");

  const effectiveDepartmentId = fixed?.departmentId ?? departmentId;
  const allowChooseBatchSection = chooseBatchSection || chooseDepartment;

  useEffect(() => {
    if (!open) return;
    if (editing) {
      setType(editing.activityType); setTitle(editing.title); setSubject(editing.subject);
      setRoom(editing.room ?? ""); setDescription(editing.description ?? "");
      
      if (editing.date) {
        const d = new Date(editing.date);
        setDateVal(format(d, "yyyy-MM-dd"));
        setTimeVal(format(d, "HH:mm"));
      } else {
        setDateVal(""); setTimeVal("09:00");
      }
      
      setStartDate(editing.startDate ? editing.startDate.slice(0, 10) : "");
      setEndDate(editing.endDate ? editing.endDate.slice(0, 10) : "");
      setDepartmentId(editing.departmentId);
      setBatchId(editing.batchId); setSectionId(editing.sectionId);
    } else {
      setType("class-test"); setTitle(""); setSubject(""); setRoom(""); setDescription("");
      setDateVal(format(new Date(), "yyyy-MM-dd")); setTimeVal("09:00");
      setStartDate(format(new Date(), "yyyy-MM-dd"));
      setEndDate(format(addDays(new Date(), 3), "yyyy-MM-dd"));
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
      let combinedIso: string | undefined = undefined;
      if (!isExam && dateVal) {
        const [hours, minutes] = (timeVal || "09:00").split(":");
        const d = new Date(dateVal);
        d.setHours(parseInt(hours || "9", 10), parseInt(minutes || "0", 10), 0, 0);
        combinedIso = d.toISOString();
      }

      const base = {
        departmentId: effectiveDepartmentId, batchId, sectionId, activityType: type, title, subject,
        room: room || undefined, description: description || undefined, createdBy,
        date: isExam ? undefined : combinedIso,
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

  const canSubmit = title && subject && effectiveDepartmentId && batchId && sectionId && (isExam ? (startDate && endDate) : dateVal);

  const examDurationDays = useMemo(() => {
    if (!startDate || !endDate) return null;
    const diff = differenceInDays(new Date(endDate), new Date(startDate)) + 1;
    return diff > 0 ? diff : null;
  }, [startDate, endDate]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">{editing ? "Edit activity" : "New activity"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2 text-sm">
          <Field label="Activity type">
            <Select value={type} onValueChange={(v) => setType(v as ActivityType)}>
              <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
              <SelectContent>{ACTIVITY_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
            </Select>
          </Field>

          {chooseDepartment && (
            <Field label="Department">
              <Select value={departmentId} onValueChange={(v) => { setDepartmentId(v); setBatchId(""); setSectionId(""); }}>
                <SelectTrigger className="rounded-xl"><SelectValue placeholder="Select department" /></SelectTrigger>
                <SelectContent>{departments.data?.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
          )}

          {allowChooseBatchSection && (
            <div className="grid grid-cols-2 gap-3">
              <Field label="Batch">
                <Select value={batchId} onValueChange={(v) => { setBatchId(v); setSectionId(""); }} disabled={!effectiveDepartmentId}>
                  <SelectTrigger className="rounded-xl"><SelectValue placeholder={effectiveDepartmentId ? "Select Batch" : "Select department first"} /></SelectTrigger>
                  <SelectContent>{batches.data?.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}</SelectContent>
                </Select>
              </Field>
              <Field label="Section">
                <Select value={sectionId} onValueChange={setSectionId} disabled={!batchId}>
                  <SelectTrigger className="rounded-xl"><SelectValue placeholder="Select Section" /></SelectTrigger>
                  <SelectContent>{sections.data?.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                </Select>
              </Field>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <Field label="Title"><Input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. CT-1 Algorithms" className="rounded-xl" /></Field>
            <Field label="Subject"><Input value={subject} onChange={e => setSubject(e.target.value)} placeholder="e.g. CSE-2101" className="rounded-xl" /></Field>
          </div>

          {isExam ? (
            <div className="space-y-3 rounded-2xl border border-border/80 bg-muted/30 p-3.5">
              <div className="flex items-center justify-between text-xs font-semibold text-foreground">
                <span className="flex items-center gap-1.5"><CalendarIcon className="h-4 w-4 text-primary" /> Exam Period</span>
                {examDurationDays && <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary font-medium">{examDurationDays} Days</span>}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Start date">
                  <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="rounded-xl bg-background" />
                </Field>
                <Field label="End date">
                  <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="rounded-xl bg-background" />
                </Field>
              </div>
            </div>
          ) : (
            <div className="space-y-3.5 rounded-2xl border border-border/80 bg-muted/30 p-3.5">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                <ClockIcon className="h-4 w-4 text-primary" /> Schedule Date & Time
              </div>

              {/* Quick Date Presets */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-muted-foreground uppercase">Date</label>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => setDateVal(format(new Date(), "yyyy-MM-dd"))}
                      className="rounded-lg bg-background px-2 py-0.5 text-[11px] font-medium border border-border hover:bg-accent"
                    >
                      Today
                    </button>
                    <button
                      type="button"
                      onClick={() => setDateVal(format(addDays(new Date(), 1), "yyyy-MM-dd"))}
                      className="rounded-lg bg-background px-2 py-0.5 text-[11px] font-medium border border-border hover:bg-accent"
                    >
                      Tomorrow
                    </button>
                    <button
                      type="button"
                      onClick={() => setDateVal(format(addDays(new Date(), 7), "yyyy-MM-dd"))}
                      className="rounded-lg bg-background px-2 py-0.5 text-[11px] font-medium border border-border hover:bg-accent"
                    >
                      +1 Week
                    </button>
                  </div>
                </div>
                <Input type="date" value={dateVal} onChange={e => setDateVal(e.target.value)} className="rounded-xl bg-background" />
              </div>

              {/* Time Selection & Presets */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase">Time</label>
                <div className="flex items-center gap-2">
                  <Input type="time" value={timeVal} onChange={e => setTimeVal(e.target.value)} className="rounded-xl bg-background flex-1" />
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {TIME_PRESETS.map((preset) => (
                    <button
                      key={preset.value}
                      type="button"
                      onClick={() => setTimeVal(preset.value)}
                      className={`rounded-full px-2.5 py-1 text-xs font-medium border transition-colors ${
                        timeVal === preset.value
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-background border-border text-foreground hover:bg-accent"
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              <Field label="Room / Venue">
                <Input value={room} onChange={e => setRoom(e.target.value)} placeholder="e.g. Room 402 or Lab 3" className="rounded-xl bg-background" />
              </Field>
            </div>
          )}

          <Field label="Description / Syllabus (Optional)">
            <Textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} placeholder="Topics covered, guidelines..." className="rounded-xl" />
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
