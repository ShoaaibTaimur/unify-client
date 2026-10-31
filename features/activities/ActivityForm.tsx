"use client";

import { useState } from "react";
import { ACTIVITY_TYPES, type Activity, type ActivityType } from "@/types/activity";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "sonner";
import { addDays, format, differenceInDays } from "date-fns";
import { parseAppDate, formatAppTime, to24HourTime } from "@/lib/date-utils";
import { CalendarIcon, ClockIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getServerErrorMessage,
  useCreateActivityMutation,
  useOrganizationQuery,
  useUpdateActivityMutation,
} from "@/lib/api";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  editing?: Activity | null;
  fixed?: { departmentId?: string; batchId?: string; sectionId?: string };
  chooseBatchSection?: boolean;
  chooseDepartment?: boolean;
}

const TIME_PRESETS = [
  { label: "09:00 AM", value: "09:00" },
  { label: "10:30 AM", value: "10:30" },
  { label: "11:45 AM", value: "11:45" },
  { label: "01:30 PM", value: "13:30" },
  { label: "03:00 PM", value: "15:00" },
  { label: "04:30 PM", value: "16:30" },
];

export function ActivityForm({ open, onOpenChange, editing, fixed, chooseBatchSection, chooseDepartment }: Props) {
  const fixedDepartmentId = fixed?.departmentId;
  const fixedBatchId = fixed?.batchId;
  const fixedSectionId = fixed?.sectionId;
  const activityDate = editing?.date ? parseAppDate(editing.date) || new Date() : new Date();
  const [type, setType] = useState<ActivityType>(editing?.activityType ?? "class-test");
  const [title, setTitle] = useState(editing?.title ?? "");
  const [subject, setSubject] = useState(editing?.subject ?? "");
  const [room, setRoom] = useState(editing?.room ?? "");
  const [description, setDescription] = useState(editing?.description ?? "");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(activityDate);
  const [timeVal, setTimeVal] = useState(
    editing?.time ? to24HourTime(editing.time) : editing?.date ? format(activityDate, "HH:mm") : "09:00"
  );
  const [startDateObj, setStartDateObj] = useState<Date | undefined>(
    editing?.startDate ? parseAppDate(editing.startDate) || new Date() : new Date()
  );
  const [endDateObj, setEndDateObj] = useState<Date | undefined>(
    editing?.endDate ? parseAppDate(editing.endDate) || addDays(new Date(), 3) : addDays(new Date(), 3)
  );
  const [departmentId, setDepartmentId] = useState(editing?.departmentId ?? fixedDepartmentId ?? "");
  const [batchId, setBatchId] = useState(editing?.batchId ?? fixedBatchId ?? "");
  const [sectionId, setSectionId] = useState(editing?.sectionId ?? fixedSectionId ?? "all");

  const effectiveDepartmentId = fixedDepartmentId ?? departmentId;
  const allowChooseBatchSection = chooseBatchSection || chooseDepartment;

  const organization = useOrganizationQuery(undefined, { skip: !allowChooseBatchSection });
  const batches = organization.data?.batchesByDepartment?.[effectiveDepartmentId] ?? [];
  const sections = organization.data?.sectionsByBatch?.[batchId] ?? [];

  const isExam = ACTIVITY_TYPES[type].isExam;

  const [createActivity, createStatus] = useCreateActivityMutation();
  const [updateActivity, updateStatus] = useUpdateActivityMutation();
  const isSaving = createStatus.isLoading || updateStatus.isLoading;

  async function saveActivity() {
    let combinedIso: string | undefined;
    if (!isExam && selectedDate) {
      const [hours, minutes] = (timeVal || "09:00").split(":");
      const date = new Date(selectedDate);
      date.setHours(parseInt(hours || "9", 10), parseInt(minutes || "0", 10), 0, 0);
      combinedIso = date.toISOString();
    }

    const activity = {
      departmentId: effectiveDepartmentId,
      batchId: batchId || "all",
      sectionId: sectionId || "all",
      activityType: type,
      title,
      subject,
      room: room || undefined,
      description: description || undefined,
      time: formatAppTime(timeVal) || undefined,
      date: isExam ? undefined : combinedIso,
      startDate: isExam && startDateObj ? startDateObj.toISOString() : undefined,
      endDate: isExam && endDateObj ? endDateObj.toISOString() : undefined,
    };

    try {
      if (editing) await updateActivity({ id: editing.id, patch: activity }).unwrap();
      else await createActivity(activity).unwrap();
      toast.success(editing ? "Activity updated" : "Activity created");
      onOpenChange(false);
    } catch (error) {
      toast.error(getServerErrorMessage(error));
    }
  }

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
              <SelectContent>{Object.entries(ACTIVITY_TYPES).map(([value, option]) => <SelectItem key={value} value={value}>{option.label}</SelectItem>)}</SelectContent>
            </Select>
          </Field>

          {chooseDepartment && (
            <Field label="Department">
              <Select value={departmentId} onValueChange={(v) => { setDepartmentId(v); setBatchId("all"); setSectionId("all"); }}>
                <SelectTrigger className="rounded-xl"><SelectValue placeholder="Select department" /></SelectTrigger>
                <SelectContent>{organization.data?.departments.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}</SelectContent>
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
                    {batches.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Section (Optional)">
                <Select value={sectionId || "all"} onValueChange={setSectionId} disabled={!batchId || batchId === "all"}>
                  <SelectTrigger className="rounded-xl"><SelectValue placeholder="Select Section" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sections (Batch-wide)</SelectItem>
                    {sections.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </Field>
            </div>
          )}

          {!allowChooseBatchSection && (
            <Field label="Target Section">
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
          <Button disabled={!canSubmit || isSaving} className="rounded-[4px] bg-primary text-primary-foreground hover:bg-primary-deep font-mono text-[11px] uppercase tracking-[0.12em] font-bold shadow-2xs" onClick={() => void saveActivity()}>
            {isSaving ? "Saving…" : editing ? "Save changes" : "Create activity"}
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
