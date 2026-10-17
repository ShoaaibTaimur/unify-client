"use client";

import { useEffect, useState } from "react";
import { ACTIVITY_TYPES, type Activity, type ActivityType } from "@/types";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "sonner";
import { addDays, format, differenceInDays, parseISO } from "date-fns";
import { parseAppDate, formatAppDate, formatAppTime, to24HourTime } from "@/lib/date-utils";
import { CalendarIcon, ClockIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { ConfirmDeleteDialog } from "@/components/common/ConfirmDeleteDialog";
import {
  getServerErrorMessage,
  useBatchesQuery,
  useCreateActivityMutation,
  useDepartmentsQuery,
  useSectionsQuery,
  useUpdateActivityMutation,
} from "@/lib/state/server-api";

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
  const fixedDepartmentId = fixed?.departmentId;
  const fixedBatchId = fixed?.batchId;
  const fixedSectionId = fixed?.sectionId;
  const [type, setType] = useState<ActivityType>("class-test");
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [room, setRoom] = useState("");
  const [description, setDescription] = useState("");
  
  // Date state using Date object
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [timeVal, setTimeVal] = useState("09:00");
  
  const [startDateObj, setStartDateObj] = useState<Date | undefined>(new Date());
  const [endDateObj, setEndDateObj] = useState<Date | undefined>(addDays(new Date(), 3));

  const [departmentId, setDepartmentId] = useState(fixedDepartmentId ?? "");
  const [batchId, setBatchId] = useState(fixedBatchId ?? "");
  const [sectionId, setSectionId] = useState(fixedSectionId ?? "");

  const effectiveDepartmentId = fixedDepartmentId ?? departmentId;
  const allowChooseBatchSection = chooseBatchSection || chooseDepartment;

  useEffect(() => {
    if (!open) return;
    if (editing) {
      setType(editing.activityType); setTitle(editing.title); setSubject(editing.subject);
      setRoom(editing.room ?? ""); setDescription(editing.description ?? "");

      if (editing.date) {
        const d = parseAppDate(editing.date) || new Date();
        setSelectedDate(d);
        setTimeVal(to24HourTime(editing.time) || format(d, "HH:mm"));
      } else if (editing.time) {
        setSelectedDate(new Date());
        setTimeVal(to24HourTime(editing.time));
      } else {
        setSelectedDate(new Date()); setTimeVal("09:00");
      }

      setStartDateObj(editing.startDate ? parseAppDate(editing.startDate) || new Date() : new Date());
      setEndDateObj(editing.endDate ? parseAppDate(editing.endDate) || addDays(new Date(), 3) : addDays(new Date(), 3));
      setDepartmentId(editing.departmentId);
      setBatchId(editing.batchId); setSectionId(editing.sectionId || "all");
    } else {
      setType("class-test"); setTitle(""); setSubject(""); setRoom(""); setDescription("");
      setSelectedDate(new Date()); setTimeVal("09:00");
      setStartDateObj(new Date());
      setEndDateObj(addDays(new Date(), 3));
      setDepartmentId(fixedDepartmentId ?? "");
      setBatchId(fixedBatchId ?? ""); setSectionId(fixedSectionId ?? "all");
    }
  }, [open, editing, fixedDepartmentId, fixedBatchId, fixedSectionId]);

  const departments = useDepartmentsQuery(undefined, { skip: !chooseDepartment });
  const batches = useBatchesQuery(effectiveDepartmentId, {
    skip: !effectiveDepartmentId || !allowChooseBatchSection,
  });
  const sections = useSectionsQuery(batchId, { skip: !batchId });

  const isExam = ACTIVITY_TYPES.find(t => t.value === type)?.isExam;

  const [createActivity, createState] = useCreateActivityMutation();
  const [updateActivity, updateState] = useUpdateActivityMutation();
  const mutation = {
    isPending: createState.isLoading || updateState.isLoading,
    mutate: async () => {
      let combinedIso: string | undefined = undefined;
      if (!isExam && selectedDate) {
        const [hours, minutes] = (timeVal || "09:00").split(":");
        const d = new Date(selectedDate);
        d.setHours(parseInt(hours || "9", 10), parseInt(minutes || "0", 10), 0, 0);
        combinedIso = d.toISOString();
      }

      const targetBatchId = (!batchId || batchId === "") ? "all" : batchId;
      const targetSectionId = (!sectionId || sectionId === "") ? "all" : sectionId;
      const base = {
        departmentId: effectiveDepartmentId, batchId: targetBatchId, sectionId: targetSectionId, activityType: type, title, subject,
        room: room || undefined, description: description || undefined, createdBy,
        time: formatAppTime(timeVal) || undefined,
        date: isExam ? undefined : combinedIso,
        startDate: isExam && startDateObj ? startDateObj.toISOString() : undefined,
        endDate: isExam && endDateObj ? endDateObj.toISOString() : undefined,
      };
      try {
        if (editing) await updateActivity({ id: editing.id, patch: base }).unwrap();
        else await createActivity(base).unwrap();
        toast.success(editing ? "Activity updated" : "Activity created");
        onOpenChange(false);
      } catch (error) {
        toast.error(getServerErrorMessage(error));
      }
    },
  };

  const canSubmit = title && subject && effectiveDepartmentId && (batchId || allowChooseBatchSection) && (isExam ? (startDateObj && endDateObj) : selectedDate);

  const duration =
    startDateObj && endDateObj ? differenceInDays(endDateObj, startDateObj) + 1 : 0;
  const examDurationDays = duration > 0 ? duration : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
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
              <Select value={departmentId} onValueChange={(v) => { setDepartmentId(v); setBatchId("all"); setSectionId("all"); }}>
                <SelectTrigger className="rounded-xl"><SelectValue placeholder="Select department" /></SelectTrigger>
                <SelectContent>{departments.data?.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
          )}

          {allowChooseBatchSection && (
            <div className="grid grid-cols-2 gap-3">
              <Field label="Batch">
                <Select value={batchId || "all"} onValueChange={(v) => { setBatchId(v); setSectionId("all"); }} disabled={!effectiveDepartmentId}>
                  <SelectTrigger className="rounded-xl"><SelectValue placeholder={effectiveDepartmentId ? "Select Batch" : "Select department first"} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Batches (Dept-wide)</SelectItem>
                    {batches.data?.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Section (Optional)">
                <Select value={sectionId || "all"} onValueChange={setSectionId} disabled={!batchId || batchId === "all"}>
                  <SelectTrigger className="rounded-xl"><SelectValue placeholder="Select Section" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sections (Batch-wide)</SelectItem>
                    {sections.data?.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </Field>
            </div>
          )}

          {!allowChooseBatchSection && (
            <Field label="Target Section">
              {/* CR role: fixed.sectionId is always set — lock to their section only, no batch-wide option */}
              {fixedSectionId ? (
                <div className="flex h-10 w-full items-center rounded-xl border border-border bg-muted/40 px-3 text-sm text-foreground/80">
                  My Section Only
                </div>
              ) : (
                <Select value={sectionId || "all"} onValueChange={setSectionId}>
                  <SelectTrigger className="rounded-xl"><SelectValue placeholder="Select Target" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sections (Batch-wide)</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </Field>
          )}

          <div className="grid grid-cols-2 gap-3">
            <Field label="Course Code (Title)"><Input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. CSE-2101" className="rounded-xl font-mono" /></Field>
            <Field label="Subject Name"><Input value={subject} onChange={e => setSubject(e.target.value)} placeholder="e.g. Algorithms & Data Structures" className="rounded-xl" /></Field>
          </div>

          {isExam ? (
            <div className="space-y-3 rounded-2xl border border-border/80 bg-muted/30 p-3.5">
              <div className="flex items-center justify-between text-xs font-semibold text-foreground">
                <span className="flex items-center gap-1.5"><CalendarIcon className="h-4 w-4 text-primary" /> Exam Period</span>
                {examDurationDays && <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary font-medium">{examDurationDays} Days</span>}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Start date">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal rounded-xl bg-background",
                          !startDateObj && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
                        {startDateObj ? format(startDateObj, "PPP") : <span>Pick date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={startDateObj}
                        onSelect={setStartDateObj}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </Field>
                <Field label="End date">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal rounded-xl bg-background",
                          !endDateObj && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
                        {endDateObj ? format(endDateObj, "PPP") : <span>Pick date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={endDateObj}
                        onSelect={setEndDateObj}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </Field>
              </div>

              {/* Time Selection for Exams */}
              <div className="space-y-1.5 pt-1">
                <label className="text-xs font-medium text-muted-foreground uppercase flex items-center gap-1">
                  <ClockIcon className="h-3.5 w-3.5 text-primary" /> Exam Time / Schedule
                </label>
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
            </div>
          ) : (
            <div className="space-y-3.5 rounded-2xl border border-border/80 bg-muted/30 p-3.5">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                <ClockIcon className="h-4 w-4 text-primary" /> Schedule Date & Time
              </div>

              {/* Shadcn Calendar Date Picker & Presets */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-muted-foreground uppercase">Date</label>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => setSelectedDate(new Date())}
                      className="rounded-lg bg-background px-2 py-0.5 text-[11px] font-medium border border-border hover:bg-accent"
                    >
                      Today
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedDate(addDays(new Date(), 1))}
                      className="rounded-lg bg-background px-2 py-0.5 text-[11px] font-medium border border-border hover:bg-accent"
                    >
                      Tomorrow
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedDate(addDays(new Date(), 7))}
                      className="rounded-lg bg-background px-2 py-0.5 text-[11px] font-medium border border-border hover:bg-accent"
                    >
                      +1 Week
                    </button>
                  </div>
                </div>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal rounded-xl bg-background",
                        !selectedDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
                      {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
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
                      className={`rounded-[4px] px-2.5 py-1 font-mono text-[11px] font-semibold border transition-colors ${
                        timeVal === preset.value
                          ? "bg-primary text-primary-foreground border-primary shadow-2xs"
                          : "bg-card border-border text-foreground hover:bg-primary/10 hover:text-primary hover:border-primary/50"
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              <Field label="Room / Venue">
                <Input value={room} onChange={e => setRoom(e.target.value)} placeholder="e.g. Room 402 or Lab 3" className="rounded-[4px] font-mono text-xs bg-background" />
              </Field>
            </div>
          )}

          <Field label="Description / Syllabus (Optional)">
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="Topics covered, syllabus details, exam guidelines, links (https://...)..."
              className="rounded-[4px] font-mono text-xs leading-relaxed"
            />
            <p className="mt-1 font-mono text-[11px] text-muted-foreground">
              Preserves multiline formatting, lists, and links when viewed by students.
            </p>
          </Field>
        </div>

        <DialogFooter>
          <Button variant="ghost" className="rounded-[4px] font-mono text-xs uppercase" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button disabled={!canSubmit || mutation.isPending} className="rounded-[4px] bg-primary text-primary-foreground hover:bg-primary-deep font-mono text-[11px] uppercase tracking-[0.12em] font-bold shadow-2xs" onClick={() => mutation.mutate()}>
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

export function ManageActivitiesTable({
  activities,
  onEdit,
  onDelete,
}: {
  activities: Activity[];
  onEdit: (a: Activity) => void;
  onDelete: (a: Activity) => void;
}) {
  const [deletingActivity, setDeletingActivity] = useState<Activity | null>(null);

  return (
    <>
      <div className="overflow-hidden rounded-[4px] border border-border bg-card shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="border-b border-border bg-secondary/40 text-[10px] font-mono font-bold uppercase tracking-[0.14em] text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left">Subject Name</th>
                <th className="px-4 py-3 text-left">Type</th>
                <th className="px-4 py-3 text-left">Course Code</th>
                <th className="px-4 py-3 text-left">When</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {activities.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center font-mono text-xs text-muted-foreground">
                    No activities found.
                  </td>
                </tr>
              )}
              {activities.map((a) => (
                <tr key={a.id} className="border-b border-border/60 last:border-b-0 hover:bg-secondary/20 transition-colors">
                  <td className="px-4 py-3 font-medium">
                    <div className="font-bold text-foreground flex items-center gap-2">
                      <span>{a.subject}</span>
                      {(!a.batchId || a.batchId === "all") ? (
                        <span className="inline-flex items-center rounded-[4px] bg-primary/10 px-2 py-0.5 font-mono text-[10px] font-semibold text-primary border border-primary/20">
                          Dept-wide
                        </span>
                      ) : (!a.sectionId || a.sectionId === "all") ? (
                        <span className="inline-flex items-center rounded-[4px] bg-secondary px-2 py-0.5 font-mono text-[10px] font-semibold text-foreground border border-border">
                          Batch-wide
                        </span>
                      ) : null}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{ACTIVITY_TYPES.find((t) => t.value === a.activityType)?.label}</td>
                  <td className="px-4 py-3 font-mono text-xs font-bold text-primary">{a.title}</td>
                  <td className="px-4 py-3 whitespace-nowrap font-mono text-xs text-foreground/90">
                    {a.startDate
                      ? `${formatAppDate(a.startDate, "PPP")} – ${formatAppDate(a.endDate, "PPP")}`
                      : `${formatAppDate(a.date, "PPP")}${formatAppTime(a.time, a.date) ? `, ${formatAppTime(a.time, a.date)}` : ""}`}
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <Button size="sm" variant="ghost" className="rounded-[4px] font-mono text-[11px] uppercase tracking-wider hover:bg-primary/10 hover:text-primary mr-1" onClick={() => onEdit(a)}>
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="rounded-[4px] font-mono text-[11px] uppercase tracking-wider text-destructive hover:bg-destructive/10"
                      onClick={() => setDeletingActivity(a)}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>

      <ConfirmDeleteDialog
        open={!!deletingActivity}
        onOpenChange={(open) => {
          if (!open) setDeletingActivity(null);
        }}
        itemName={deletingActivity ? `activity "${deletingActivity.title}"` : "this activity"}
        onConfirm={() => {
          if (deletingActivity) {
            onDelete(deletingActivity);
            setDeletingActivity(null);
          }
        }}
      />
    </>
  );
}

export { ActivityFormDialog as ActivityForm };
