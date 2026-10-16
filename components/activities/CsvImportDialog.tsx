"use client";

import { useRef, useState } from "react";
import type { CsvRequest } from "@/types";
import { getApiError, useImportActivitiesCsvMutation, usePreviewActivitiesCsvMutation } from "@/lib/store/api-slice";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle2, Download, FileSpreadsheet, Upload } from "lucide-react";
import { toast } from "sonner";

const DEMO_CSV = `department,batch,section,activityType,title,subject,startDate,endDate,time,room,description
"CSE","17, 18","all","mid-exam","CSE 2101","Algorithms","2026-09-01","2026-09-05","10:00 AM","Room 402","Combined exam"`;

export function downloadDemoCSV() {
  const link = document.createElement("a");
  link.href = `data:text/csv;charset=utf-8,${encodeURIComponent(DEMO_CSV)}`;
  link.download = "exam_routine_sample.csv";
  link.click();
}

export function CsvImportDialog({ open, onOpenChange, defaultDepartmentId, defaultBatchId }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultDepartmentId?: string;
  defaultBatchId?: string;
}) {
  const fileInput = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState("");
  const [request, setRequest] = useState<CsvRequest | null>(null);
  const [previewCsv, preview] = usePreviewActivitiesCsvMutation();
  const [importCsv, importing] = useImportActivitiesCsvMutation();

  const chooseFile = async (file?: File) => {
    if (!file) return;
    const payload = { csv: await file.text(), defaultDepartmentId, defaultBatchId };
    setFileName(file.name);
    setRequest(payload);
    try { await previewCsv(payload).unwrap(); }
    catch (error) { toast.error(getApiError(error)); }
  };

  const submit = async () => {
    if (!request) return;
    try {
      const result = await importCsv(request).unwrap();
      toast.success(`Imported ${result.count} routines`);
      onOpenChange(false);
      setRequest(null);
      setFileName("");
      preview.reset();
    } catch (error) { toast.error(getApiError(error)); }
  };

  const report = preview.data;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] w-[95vw] overflow-y-auto sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display text-2xl">
            <FileSpreadsheet className="h-5 w-5 text-primary" /> Import routines
          </DialogTitle>
          <DialogDescription>
            Server parses, validates, matches, and creates every row. Browser only uploads and displays the response.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 sm:grid-cols-2">
          <Button variant="outline" onClick={downloadDemoCSV}><Download className="mr-2 h-4 w-4" /> Download template</Button>
          <Button onClick={() => fileInput.current?.click()} disabled={preview.isLoading}>
            <Upload className="mr-2 h-4 w-4" /> {preview.isLoading ? "Server validating…" : fileName || "Choose CSV"}
          </Button>
          <input ref={fileInput} className="hidden" type="file" accept=".csv,text/csv" onChange={(event) => void chooseFile(event.target.files?.[0])} />
        </div>

        {report?.fatalError && (
          <div className="flex gap-2 border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" /> {report.fatalError}
          </div>
        )}

        {report && !report.fatalError && (
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-2 text-center font-mono text-xs">
              <div className="border border-border p-3"><strong className="block text-xl">{report.total}</strong>Total</div>
              <div className="border border-emerald-500/30 p-3 text-emerald-600"><strong className="block text-xl">{report.validCount}</strong>Ready</div>
              <div className="border border-destructive/30 p-3 text-destructive"><strong className="block text-xl">{report.invalidCount}</strong>Errors</div>
            </div>
            <div className="max-h-80 overflow-auto border border-border">
              <table className="w-full min-w-[680px] text-xs">
                <thead className="sticky top-0 bg-secondary text-left font-mono uppercase">
                  <tr><th className="p-3">Status</th><th className="p-3">Batch</th><th className="p-3">Routine</th><th className="p-3">Schedule</th></tr>
                </thead>
                <tbody>
                  {report.rows.map((row) => (
                    <tr key={row.rowNumber} className="border-t border-border">
                      <td className="p-3">{row.isValid ? <span className="flex gap-1 text-emerald-600"><CheckCircle2 className="h-4 w-4" />Ready</span> : row.errors.join("; ")}</td>
                      <td className="p-3">{row.batchName} · {row.sectionName}</td>
                      <td className="p-3"><strong>{row.subject}</strong><br />{row.title} · {row.activityType}</td>
                      <td className="p-3">{row.scheduleLabel}{row.timeLabel ? ` · ${row.timeLabel}` : ""}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button disabled={!report?.validCount || importing.isLoading} onClick={() => void submit()}>
            {importing.isLoading ? "Server importing…" : `Import ${report?.validCount ?? 0}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
