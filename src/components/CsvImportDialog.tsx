"use client";

import { useState, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { ActivityType, Batch, Department, Section } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Download,
  Upload,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileSpreadsheet,
  RefreshCw,
  FileCheck2,
  AlertCircle,
  Clock,
  Calendar,
  Layers,
} from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultDepartmentId?: string;
  defaultBatchId?: string;
}

interface ParsedRoutineRow {
  rowNumber: number;
  rawRow: Record<string, string>;
  isValid: boolean;
  errors: string[];
  departmentId: string;
  departmentName: string;
  batchId: string;
  batchName: string;
  sectionId: string;
  sectionName: string;
  activityType: ActivityType;
  title: string;
  subject: string;
  startDate?: string;
  endDate?: string;
  time?: string;
  room?: string;
  description?: string;
}

interface CsvHealthReport {
  isCorrupted: boolean;
  fatalError?: string;
  totalLines: number;
  totalExtractedRows: number;
  validRowsCount: number;
  invalidRowsCount: number;
  matchedBatchesCount: number;
  headersFound: string[];
  missingRequiredHeaders: string[];
}

const REQUIRED_HEADER_GROUPS = [
  { name: "Title / Name", keys: ["title", "name", "exam"] },
  { name: "Subject / Course", keys: ["subject", "course", "code"] },
  { name: "Batch", keys: ["batch", "batch_no", "batch_number"] },
  { name: "Date", keys: ["startdate", "start_date", "date"] },
];

function parseCSVWithDiagnostic(text: string): {
  headers: string[];
  rows: Record<string, string>[];
  corruptedLines: number[];
  fatalError?: string;
} {
  if (!text || text.trim().length === 0) {
    return { headers: [], rows: [], corruptedLines: [], fatalError: "File is empty (0 bytes)." };
  }
  if (text.includes("\0")) {
    return { headers: [], rows: [], corruptedLines: [], fatalError: "File appears to be a binary or non-CSV format." };
  }

  const rawLines = text.split(/\r?\n/);
  const nonContentFiltered = rawLines.filter((l) => l.trim().length > 0);

  if (nonContentFiltered.length === 0) {
    return { headers: [], rows: [], corruptedLines: [], fatalError: "No readable data lines found in CSV." };
  }

  const rawHeaderLine = nonContentFiltered[0];
  const headers = rawHeaderLine
    .split(",")
    .map((h) => h.trim().toLowerCase().replace(/^["']|["']$/g, ""));

  if (headers.length === 0 || (headers.length === 1 && !headers[0])) {
    return { headers: [], rows: [], corruptedLines: [], fatalError: "Unable to parse CSV header columns." };
  }

  const rows: Record<string, string>[] = [];
  const corruptedLines: number[] = [];

  for (let lineIdx = 1; lineIdx < nonContentFiltered.length; lineIdx++) {
    const line = nonContentFiltered[lineIdx];
    const values: string[] = [];
    let insideQuote = false;
    let currentValue = "";

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"' || char === "'") {
        insideQuote = !insideQuote;
      } else if (char === "," && !insideQuote) {
        values.push(currentValue.trim().replace(/^["']|["']$/g, ""));
        currentValue = "";
      } else {
        currentValue += char;
      }
    }
    values.push(currentValue.trim().replace(/^["']|["']$/g, ""));

    if (insideQuote) {
      corruptedLines.push(lineIdx + 1);
    }

    const obj: Record<string, string> = {};
    headers.forEach((h, idx) => {
      obj[h] = values[idx] ?? "";
    });
    rows.push(obj);
  }

  return { headers, rows, corruptedLines };
}

export function downloadDemoCSV(departmentName = "CSE") {
  const csvHeader = "department,batch,section,activityType,title,subject,startDate,endDate,time,room,description\n";
  const rows = [
    `"${departmentName}","17, 18, 19","all","mid-exam","CSE 2101","Algorithms & Data Structures","2026-09-01","2026-09-05","10:00 AM","Room 402","Combined mid exam auto-assigned to Batches 17, 18, and 19"`,
    `"${departmentName}","17, 18","all","final-exam","CSE 2101","Algorithms & Data Structures","2026-11-15","2026-11-20","02:00 PM","Auditorium","Complete course syllabus for Batches 17 & 18"`,
    `"${departmentName}","19","Section A","mid-exam","CSE 2102","Database Systems","2026-09-06","2026-09-10","11:30 AM","Lab 3","Section A specific mid exam"`,
  ];
  const csvContent = "data:text/csv;charset=utf-8," + encodeURIComponent(csvHeader + rows.join("\n"));
  const link = document.createElement("a");
  link.setAttribute("href", csvContent);
  link.setAttribute("download", "exam_routine_sample.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function CsvImportDialog({ open, onOpenChange, defaultDepartmentId, defaultBatchId }: Props) {
  const qc = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [fileName, setFileName] = useState<string | null>(null);
  const [parsedRows, setParsedRows] = useState<ParsedRoutineRow[]>([]);
  const [healthReport, setHealthReport] = useState<CsvHealthReport | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filterMode, setFilterMode] = useState<"all" | "valid" | "errors">("all");

  const departments = useQuery({ queryKey: ["departments"], queryFn: () => api.listDepartments() });
  const batches = useQuery({ queryKey: ["batches", "all"], queryFn: () => api.listBatches() });
  const sections = useQuery({ queryKey: ["sections", "all"], queryFn: () => api.listSections() });

  const depList: Department[] = departments.data ?? [];
  const batList: Batch[] = batches.data ?? [];
  const secList: Section[] = sections.data ?? [];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      if (text === undefined || text === null) {
        toast.error("Failed to read file contents");
        return;
      }
      runExtractionTesting(text);
    };
    reader.readAsText(file);
  };

  const runExtractionTesting = (text: string) => {
    const parsedResult = parseCSVWithDiagnostic(text);

    if (parsedResult.fatalError) {
      setHealthReport({
        isCorrupted: true,
        fatalError: parsedResult.fatalError,
        totalLines: 0,
        totalExtractedRows: 0,
        validRowsCount: 0,
        invalidRowsCount: 0,
        matchedBatchesCount: 0,
        headersFound: parsedResult.headers,
        missingRequiredHeaders: [],
      });
      setParsedRows([]);
      return;
    }

    const headersFound = parsedResult.headers;
    const missingHeaders: string[] = [];

    REQUIRED_HEADER_GROUPS.forEach((group) => {
      const found = group.keys.some((k) => headersFound.some((hf) => hf.includes(k)));
      if (!found) missingHeaders.push(group.name);
    });

    if (missingHeaders.length > 0) {
      setHealthReport({
        isCorrupted: true,
        fatalError: `Missing required CSV columns: ${missingHeaders.join(", ")}`,
        totalLines: parsedResult.rows.length + 1,
        totalExtractedRows: parsedResult.rows.length,
        validRowsCount: 0,
        invalidRowsCount: parsedResult.rows.length,
        matchedBatchesCount: 0,
        headersFound,
        missingRequiredHeaders: missingHeaders,
      });
      setParsedRows([]);
      return;
    }

    let matchedBatchesCount = 0;
    let sequenceRowNumber = 1;

    const processed: ParsedRoutineRow[] = parsedResult.rows.flatMap((row) => {
      const getVal = (...keys: string[]) => {
        for (const k of keys) {
          const matchKey = Object.keys(row).find((rk) => rk.toLowerCase().includes(k.toLowerCase()));
          if (matchKey && row[matchKey]) return row[matchKey].trim();
        }
        return "";
      };

      const deptStr = getVal("department", "dept") || defaultDepartmentId || "";
      const batchRaw = getVal("batch", "batch_no", "batch_number") || defaultBatchId || "";
      const secStr = getVal("section", "sec") || "all";
      const rawType = getVal("activitytype", "activity_type", "type", "exam_type") || "mid-exam";
      const title = getVal("title", "code", "coursecode", "course_code", "name");
      const subject = getVal("subject", "course", "coursename", "course_name", "subjectname");
      const startDateStr = getVal("startdate", "start_date", "date");
      const endDateStr = getVal("enddate", "end_date") || startDateStr;
      const timeStr = getVal("time", "examtime", "exam_time", "starttime", "start_time");
      const room = getVal("room", "venue");
      const description = getVal("description", "syllabus", "details");

      // Split multi-batch entries e.g. "17, 18, 19" or "Batch 17 / Batch 18"
      const batchTokens = batchRaw
        ? batchRaw.split(/[,;/&]+/).map((b) => b.trim()).filter(Boolean)
        : [""];

      // Match Department
      let matchedDep = depList.find((d) => d.id === deptStr || d.name.toLowerCase() === deptStr.toLowerCase());
      if (!matchedDep && defaultDepartmentId) {
        matchedDep = depList.find((d) => d.id === defaultDepartmentId);
      }
      if (!matchedDep && depList.length === 1) {
        matchedDep = depList[0];
      }
      const targetDepId = matchedDep?.id || defaultDepartmentId;
      const filteredBatches = targetDepId ? batList.filter((b) => b.departmentId === targetDepId) : batList;

      // Normalize activity type
      let actType: ActivityType = "mid-exam";
      const normalizedType = rawType.toLowerCase().replace(/[^a-z0-9]/g, "");
      if (normalizedType.includes("final")) actType = "final-exam";
      else if (normalizedType.includes("mid")) actType = "mid-exam";
      else if (normalizedType.includes("quiz")) actType = "quiz";
      else if (normalizedType.includes("test")) actType = "class-test";
      else if (normalizedType.includes("lab")) actType = "lab-test";

      // Common row errors
      const commonErrors: string[] = [];
      if (!title) commonErrors.push("Title is missing");
      if (!subject) commonErrors.push("Subject/Course is missing");

      let startDateIso: string | undefined = undefined;
      let endDateIso: string | undefined = undefined;

      if (!startDateStr) {
        commonErrors.push("Start Date is missing");
      } else {
        try {
          const sD = new Date(startDateStr);
          if (isNaN(sD.getTime())) {
            commonErrors.push(`Invalid start date "${startDateStr}"`);
          } else {
            startDateIso = sD.toISOString();
          }
          const eD = new Date(endDateStr);
          if (isNaN(eD.getTime())) {
            commonErrors.push(`Invalid end date "${endDateStr}"`);
          } else {
            endDateIso = eD.toISOString();
          }
          if (sD && eD && !isNaN(sD.getTime()) && !isNaN(eD.getTime()) && eD < sD) {
            commonErrors.push("End Date cannot be before Start Date");
          }
        } catch {
          commonErrors.push("Unparseable date formats");
        }
      }

      // Generate individual routine entry for each batch token
      return batchTokens.map((batchStr) => {
        const rowErrors = [...commonErrors];

        if (!batchStr) {
          rowErrors.push("Batch number is missing");
        }

        const batchDigits = batchStr.replace(/\D/g, "");
        let matchedBatch = filteredBatches.find(
          (b) =>
            b.id === batchStr ||
            b.name.toLowerCase() === batchStr.toLowerCase() ||
            (batchDigits && b.name.replace(/\D/g, "") === batchDigits)
        );

        if (!matchedBatch && defaultBatchId) {
          matchedBatch = filteredBatches.find((b) => b.id === defaultBatchId);
        }

        if (matchedBatch) {
          matchedBatchesCount++;
        } else if (batchStr) {
          rowErrors.push(`Batch "${batchStr}" not found in system`);
        }

        // Match Section
        let matchedSectionId = "all";
        let matchedSectionName = "All Sections";

        if (secStr && secStr.toLowerCase() !== "all" && secStr.toLowerCase() !== "all sections") {
          const batchSecs = matchedBatch ? secList.filter((s) => s.batchId === matchedBatch.id) : secList;
          const secDigits = secStr.replace(/\D/g, "");
          const foundSec = batchSecs.find(
            (s) =>
              s.id === secStr ||
              s.name.toLowerCase() === secStr.toLowerCase() ||
              (secDigits && s.name.replace(/\D/g, "") === secDigits)
          );
          if (foundSec) {
            matchedSectionId = foundSec.id;
            matchedSectionName = foundSec.name;
          }
        }

        const isValid = rowErrors.length === 0;

        return {
          rowNumber: sequenceRowNumber++,
          rawRow: row,
          isValid,
          errors: rowErrors,
          departmentId: matchedDep?.id || targetDepId || "",
          departmentName: matchedDep?.name || "Department",
          batchId: matchedBatch?.id || "",
          batchName: matchedBatch?.name || batchStr || "Unspecified Batch",
          sectionId: matchedSectionId,
          sectionName: matchedSectionName,
          activityType: actType,
          title: title || "Exam Routine",
          subject: subject || "Subject",
          startDate: startDateIso,
          endDate: endDateIso,
          time: timeStr || undefined,
          room,
          description,
        };
      });
    });

    const validCount = processed.filter((r) => r.isValid).length;
    const invalidCount = processed.length - validCount;

    setHealthReport({
      isCorrupted: false,
      totalLines: parsedResult.rows.length + 1,
      totalExtractedRows: processed.length,
      validRowsCount: validCount,
      invalidRowsCount: invalidCount,
      matchedBatchesCount,
      headersFound,
      missingRequiredHeaders: [],
    });
    setParsedRows(processed);
  };

  const handleImport = async () => {
    const validRows = parsedRows.filter((r) => r.isValid);
    if (validRows.length === 0) {
      toast.error("No valid routine rows extracted to import");
      return;
    }

    setIsSubmitting(true);
    try {
      const itemsToCreate = validRows.map((r) => ({
        departmentId: r.departmentId,
        batchId: r.batchId,
        sectionId: r.sectionId,
        activityType: r.activityType,
        title: r.title,
        subject: r.subject,
        startDate: r.startDate,
        endDate: r.endDate,
        time: r.time || undefined,
        room: r.room || undefined,
        description: r.description || undefined,
      }));

      const res = await api.createActivitiesBulk(itemsToCreate);
      toast.success(`Successfully imported ${res.count} exam routines across batches!`);
      qc.invalidateQueries({ queryKey: ["activities"] });
      onOpenChange(false);
      setParsedRows([]);
      setHealthReport(null);
      setFileName(null);
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredDisplayRows = parsedRows.filter((r) => {
    if (filterMode === "valid") return r.isValid;
    if (filterMode === "errors") return !r.isValid;
    return true;
  });

  const validCount = healthReport?.validRowsCount ?? 0;
  const invalidCount = healthReport?.invalidRowsCount ?? 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl md:max-w-4xl lg:max-w-5xl w-[95vw] max-h-[90vh] overflow-y-auto p-4 sm:p-6 rounded-3xl">
        <DialogHeader className="space-y-1 text-left">
          <div className="flex items-center gap-2 text-primary font-bold text-sm sm:text-base">
            <FileSpreadsheet className="h-5 w-5 text-primary shrink-0" />
            <span>Multi-Batch Exam Routine CSV Importer</span>
          </div>
          <DialogTitle className="font-display text-2xl sm:text-3xl">Upload & Test Multi-Batch CSV</DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            Supports multi-batch lists (e.g. &quot;17, 18, 19&quot;). Automatically auto-creates separate routine entries per batch.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2 text-sm">
          {/* Controls Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 rounded-2xl border border-border bg-muted/20 p-4">
            <div className="space-y-2 flex flex-col justify-between">
              <div>
                <h4 className="font-semibold text-foreground text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Download className="h-3.5 w-3.5 text-primary" /> Step 1: Format Template
                </h4>
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                  Download sample format supporting multi-batch comma lists (e.g., &quot;Batch 17, 18, 19&quot;).
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full sm:w-auto rounded-xl border-primary/40 text-primary hover:bg-primary/10 hover:text-primary font-medium"
                onClick={() => downloadDemoCSV()}
              >
                <Download className="mr-1.5 h-4 w-4" /> Download Multi-Batch Demo CSV
              </Button>
            </div>

            <div className="space-y-2 flex flex-col justify-between border-t md:border-t-0 md:border-l border-border pt-3 md:pt-0 md:pl-4">
              <div>
                <h4 className="font-semibold text-foreground text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Upload className="h-3.5 w-3.5 text-primary" /> Step 2: Upload CSV File
                </h4>
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                  Select CSV to auto-split multi-batch entries and run extraction validation.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <Button
                  size="sm"
                  className="w-full sm:w-auto rounded-xl font-medium"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="mr-1.5 h-4 w-4" /> {fileName ? "Change CSV File" : "Upload CSV File"}
                </Button>
                {fileName && (
                  <span className="text-xs font-mono font-medium text-foreground bg-muted px-2.5 py-1 rounded-lg border border-border truncate max-w-[180px]">
                    {fileName}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Diagnostic Result Banner */}
          {healthReport && (
            <div className="space-y-4 animate-in fade-in duration-300">
              {healthReport.isCorrupted ? (
                <div className="rounded-2xl border border-destructive/40 bg-destructive/10 p-4 sm:p-5 text-destructive space-y-2">
                  <div className="flex items-center gap-2.5 font-bold text-sm sm:text-base">
                    <XCircle className="h-5 w-5 shrink-0" /> CSV Health Check: Extraction Failed — Corrupted or Invalid CSV Format
                  </div>
                  <p className="text-xs sm:text-sm text-foreground font-mono bg-background/80 p-3 rounded-xl border border-destructive/30">
                    {healthReport.fatalError}
                  </p>
                </div>
              ) : invalidCount === 0 ? (
                <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 sm:p-5 text-emerald-800 dark:text-emerald-300 space-y-1">
                  <div className="flex items-center gap-2.5 font-bold text-sm sm:text-base">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" /> 
                    CSV Check Passed — Extracted {healthReport.totalExtractedRows} Separate Batch Routines!
                  </div>
                  <p className="text-xs sm:text-sm text-foreground/80">
                    Auto-split multi-batch rows into {healthReport.totalExtractedRows} individual batch assignments. 100% matched and ready!
                  </p>
                </div>
              ) : (
                <div className="rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4 sm:p-5 text-amber-800 dark:text-amber-300 space-y-1">
                  <div className="flex items-center gap-2.5 font-bold text-sm sm:text-base">
                    <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0" />
                    CSV Test Result: {validCount} Valid Batch Routines, {invalidCount} Issues
                  </div>
                  <p className="text-xs sm:text-sm text-foreground/80">
                    Extracted {healthReport.totalExtractedRows} batch assignments across multi-batch entries. Invalid entries are highlighted below and will be skipped.
                  </p>
                </div>
              )}

              {/* Metric Summary Cards */}
              {!healthReport.isCorrupted && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 text-center">
                  <div className="rounded-2xl border border-border bg-card p-3 shadow-xs">
                    <div className="text-muted-foreground text-[11px] uppercase font-semibold tracking-wider">Total Routines</div>
                    <div className="font-display text-2xl font-bold text-foreground mt-0.5">{healthReport.totalExtractedRows}</div>
                  </div>
                  <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-3 text-emerald-600 dark:text-emerald-400 shadow-xs">
                    <div className="text-[11px] uppercase font-semibold tracking-wider">Valid & Ready</div>
                    <div className="font-display text-2xl font-bold mt-0.5">{healthReport.validRowsCount}</div>
                  </div>
                  <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-3 text-destructive shadow-xs">
                    <div className="text-[11px] uppercase font-semibold tracking-wider">Unmatched / Errors</div>
                    <div className="font-display text-2xl font-bold mt-0.5">{healthReport.invalidRowsCount}</div>
                  </div>
                  <div className="rounded-2xl border border-primary/30 bg-primary/5 p-3 text-primary shadow-xs">
                    <div className="text-[11px] uppercase font-semibold tracking-wider">Batch Matches</div>
                    <div className="font-display text-2xl font-bold mt-0.5">{healthReport.matchedBatchesCount}</div>
                  </div>
                </div>
              )}

              {/* Data Extraction Inspection Section */}
              {parsedRows.length > 0 && (
                <div className="space-y-3 pt-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2 font-display text-base font-semibold text-foreground">
                      <FileCheck2 className="h-5 w-5 text-primary" /> Auto-Split Batch Assignments ({parsedRows.length} routines)
                    </div>

                    {/* Filter Pills */}
                    <div className="flex items-center gap-1 rounded-xl border border-border bg-muted/40 p-1">
                      <button
                        type="button"
                        onClick={() => setFilterMode("all")}
                        className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
                          filterMode === "all" ? "bg-background text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        All ({parsedRows.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setFilterMode("valid")}
                        className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
                          filterMode === "valid" ? "bg-emerald-500 text-white shadow-xs" : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        Ready ({validCount})
                      </button>
                      {invalidCount > 0 && (
                        <button
                          type="button"
                          onClick={() => setFilterMode("errors")}
                          className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
                            filterMode === "errors" ? "bg-destructive text-white shadow-xs" : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          Errors ({invalidCount})
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Desktop / Tablet Table View */}
                  <div className="hidden sm:block overflow-hidden rounded-2xl border border-border bg-card shadow-card">
                    <div className="overflow-x-auto max-h-72">
                      <table className="w-full text-xs min-w-[700px]">
                        <thead className="sticky top-0 z-10 bg-muted/90 backdrop-blur border-b border-border font-semibold uppercase text-muted-foreground tracking-wider">
                          <tr>
                            <th className="px-3.5 py-3 text-left w-12">#</th>
                            <th className="px-3.5 py-3 text-left w-32">Status</th>
                            <th className="px-3.5 py-3 text-left">Assigned Batch</th>
                            <th className="px-3.5 py-3 text-left">Exam Type</th>
                            <th className="px-3.5 py-3 text-left">Subject & Course Code</th>
                            <th className="px-3.5 py-3 text-left">Schedule & Time</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/60">
                          {filteredDisplayRows.map((row) => (
                            <tr
                              key={row.rowNumber}
                              className={`transition-colors ${row.isValid ? "hover:bg-muted/30" : "bg-destructive/5 hover:bg-destructive/10"}`}
                            >
                              <td className="px-3.5 py-3 font-mono font-medium text-muted-foreground">#{row.rowNumber}</td>
                              <td className="px-3.5 py-3 whitespace-nowrap">
                                {row.isValid ? (
                                  <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                                    <CheckCircle2 className="h-3.5 w-3.5" /> Ready
                                  </span>
                                ) : (
                                  <div className="space-y-1">
                                    {row.errors.map((err, eIdx) => (
                                      <span key={eIdx} className="flex items-center gap-1 font-medium text-destructive text-[11px] bg-destructive/10 px-2 py-0.5 rounded-lg border border-destructive/20">
                                        <AlertCircle className="h-3 w-3 shrink-0" /> {err}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </td>
                              <td className="px-3.5 py-3">
                                <div className="font-bold text-foreground flex items-center gap-1">
                                  <Layers className="h-3.5 w-3.5 text-primary" /> {row.batchName}
                                </div>
                                <div className="text-[11px] text-muted-foreground">{row.sectionName}</div>
                              </td>
                              <td className="px-3.5 py-3">
                                <span className="inline-block uppercase font-bold text-primary text-[11px] bg-primary/10 px-2 py-0.5 rounded-md border border-primary/20">
                                  {row.activityType}
                                </span>
                              </td>
                              <td className="px-3.5 py-3">
                                <div className="font-bold text-foreground text-sm">{row.subject}</div>
                                <div className="font-mono text-xs text-primary font-semibold">{row.title}</div>
                                {row.room && <div className="text-[10px] text-muted-foreground mt-0.5">Venue: {row.room}</div>}
                              </td>
                              <td className="px-3.5 py-3 whitespace-nowrap">
                                <div className="font-medium text-foreground flex items-center gap-1">
                                  <Calendar className="h-3.5 w-3.5 text-primary" />
                                  {row.startDate ? new Date(row.startDate).toLocaleDateString() : "Invalid"} –{" "}
                                  {row.endDate ? new Date(row.endDate).toLocaleDateString() : "Invalid"}
                                </div>
                                {row.time && (
                                  <div className="text-[11px] font-bold text-primary flex items-center gap-1 mt-0.5">
                                    <Clock className="h-3 w-3" /> {row.time}
                                  </div>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Mobile Card List View */}
                  <div className="block sm:hidden space-y-3 max-h-80 overflow-y-auto">
                    {filteredDisplayRows.map((row) => (
                      <div
                        key={row.rowNumber}
                        className={`rounded-2xl border p-3.5 space-y-2 text-xs ${
                          row.isValid ? "border-border bg-card" : "border-destructive/30 bg-destructive/5"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 border-b border-border/60 pb-2">
                          <span className="font-mono text-muted-foreground">Routine #{row.rowNumber}</span>
                          {row.isValid ? (
                            <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full text-[11px]">
                              <CheckCircle2 className="h-3 w-3" /> Ready
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 font-semibold text-destructive bg-destructive/10 px-2 py-0.5 rounded-full text-[11px]">
                              <AlertCircle className="h-3 w-3" /> Error
                            </span>
                          )}
                        </div>

                        <div>
                          <div className="font-bold text-sm text-foreground">{row.title}</div>
                          <div className="text-muted-foreground">{row.subject}</div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-[11px] bg-muted/30 p-2 rounded-xl border border-border/50">
                          <div>
                            <span className="text-muted-foreground uppercase text-[9px] block">Assigned Batch</span>
                            <span className="font-semibold">{row.batchName} ({row.sectionName})</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground uppercase text-[9px] block">Exam Type</span>
                            <span className="font-bold text-primary uppercase">{row.activityType}</span>
                          </div>
                          <div className="col-span-2">
                            <span className="text-muted-foreground uppercase text-[9px] block">Schedule & Time</span>
                            <span className="font-medium">
                              {row.startDate ? new Date(row.startDate).toLocaleDateString() : "Invalid"} –{" "}
                              {row.endDate ? new Date(row.endDate).toLocaleDateString() : "Invalid"}
                              {row.time ? ` @ ${row.time}` : ""}
                            </span>
                          </div>
                        </div>

                        {!row.isValid && (
                          <div className="space-y-1 pt-1">
                            {row.errors.map((err, eIdx) => (
                              <div key={eIdx} className="text-destructive font-medium text-[11px] flex items-center gap-1">
                                <AlertCircle className="h-3 w-3 shrink-0" /> {err}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0 pt-2 border-t border-border">
          <Button variant="ghost" className="rounded-xl" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button
            disabled={validCount === 0 || isSubmitting}
            onClick={handleImport}
            className="rounded-xl px-6 font-semibold"
          >
            {isSubmitting ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : null}
            Import {validCount} Exam Routines
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
