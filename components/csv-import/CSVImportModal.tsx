"use client";

import { useState, useRef } from "react";
import Papa from "papaparse";
import { parse as dateParse, isValid } from "date-fns";
import { toast } from "sonner";
import {
  Upload, CheckCircle2, XCircle, Download, Loader2, AlertCircle,
} from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const REQUIRED_COLUMNS = ["date", "opponent", "format", "runs", "wickets", "overs", "dismissal"];

const FORMAT_MAP: Record<string, string> = {
  t20: "T20",
  odi: "ODI",
  test: "Test",
  casual: "Custom",
  custom: "Custom",
};

const DISMISSAL_MAP: Record<string, string> = {
  caught: "Caught",
  bowled: "Bowled",
  lbw: "LBW",
  "run out": "Run Out",
  runout: "Run Out",
  "not out": "Not Out",
  notout: "Not Out",
  retired: "Retired",
  "": "Did Not Bat",
};

interface ParsedMatch {
  date: string;
  opponent: string;
  format: string;
  runs: number;
  wickets: number;
  overs: number;
  dismissal: string;
  notes: string;
}

interface CSVRow {
  rowIndex: number;
  raw: Record<string, string>;
  parsed: ParsedMatch | null;
  errors: string[];
  valid: boolean;
}

function tryParseDate(value: string): Date | null {
  const trimmed = value.trim();
  const formats = ["yyyy-MM-dd", "MM/dd/yyyy", "dd/MM/yyyy", "d/M/yyyy", "yyyy/MM/dd"];
  const ref = new Date(2000, 0, 1);
  for (const fmt of formats) {
    const d = dateParse(trimmed, fmt, ref);
    if (isValid(d) && d.getFullYear() > 1900 && d.getFullYear() < 2200) return d;
  }
  return null;
}

function validateRow(raw: Record<string, string>, rowIndex: number): CSVRow {
  const errors: string[] = [];

  const dateVal = (raw.date ?? "").trim();
  let parsedDate: Date | null = null;
  if (!dateVal) {
    errors.push("Date is required");
  } else {
    parsedDate = tryParseDate(dateVal);
    if (!parsedDate) errors.push("Invalid date — use YYYY-MM-DD, MM/DD/YYYY, or DD/MM/YYYY");
  }

  const opponent = (raw.opponent ?? "").trim();
  if (!opponent) errors.push("Opponent is required");

  const formatKey = (raw.format ?? "").trim().toLowerCase();
  const format = FORMAT_MAP[formatKey];
  if (!format) errors.push(`Format must be T20, ODI, Test, or Casual (got "${raw.format?.trim()}")`);

  const runsRaw = (raw.runs ?? "").trim();
  const runs = runsRaw === "" ? 0 : parseInt(runsRaw, 10);
  if (runsRaw !== "" && (isNaN(runs) || runs < 0 || !Number.isInteger(runs)))
    errors.push("Runs must be a non-negative integer");

  const wicketsRaw = (raw.wickets ?? "").trim();
  const wickets = wicketsRaw === "" ? 0 : parseInt(wicketsRaw, 10);
  if (wicketsRaw !== "" && (isNaN(wickets) || wickets < 0 || !Number.isInteger(wickets)))
    errors.push("Wickets must be a non-negative integer");

  const oversRaw = (raw.overs ?? "").trim();
  let overs = 0;
  if (oversRaw !== "") {
    overs = parseFloat(oversRaw);
    if (isNaN(overs) || overs < 0) {
      errors.push("Overs must be a non-negative number (e.g., 4.2)");
    } else {
      const balls = Math.round((overs % 1) * 10);
      if (balls > 5) errors.push(`Overs ball count ${balls} is invalid — max 5 balls per over`);
    }
  }

  const dismissalRaw = (raw.dismissal ?? "").trim().toLowerCase();
  const dismissal = DISMISSAL_MAP[dismissalRaw];
  if (dismissal === undefined)
    errors.push(`Invalid dismissal "${raw.dismissal?.trim()}" — use: caught, bowled, lbw, run out, not out, retired`);

  if (errors.length > 0) {
    return { rowIndex, raw, parsed: null, errors, valid: false };
  }

  return {
    rowIndex,
    raw,
    errors: [],
    valid: true,
    parsed: {
      date: parsedDate!.toISOString(),
      opponent,
      format: format!,
      runs: isNaN(runs) ? 0 : runs,
      wickets: isNaN(wickets) ? 0 : wickets,
      overs: isNaN(overs) ? 0 : overs,
      dismissal: dismissal!,
      notes: (raw.notes ?? "").trim(),
    },
  };
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function CSVImportModal({ open, onOpenChange, onSuccess }: Props) {
  const [rows, setRows] = useState<CSVRow[]>([]);
  const [hasFile, setHasFile] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ imported: number } | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function reset() {
    setRows([]);
    setHasFile(false);
    setIsDragging(false);
    setImporting(false);
    setImportResult(null);
    setParseError(null);
  }

  function handleOpenChange(o: boolean) {
    if (importing) return;
    if (!o) reset();
    onOpenChange(o);
  }

  function processFile(file: File) {
    if (!file.name.endsWith(".csv") && file.type !== "text/csv" && file.type !== "application/vnd.ms-excel") {
      setParseError("Please upload a .csv file");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setParseError("File too large (max 2MB)");
      return;
    }
    setParseError(null);

    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h) => h.trim().toLowerCase(),
      complete: (result) => {
        const fields = result.meta.fields ?? [];
        const missingCols = REQUIRED_COLUMNS.filter((c) => !fields.includes(c));
        if (missingCols.length > 0) {
          setParseError(`Missing required columns: ${missingCols.join(", ")}`);
          return;
        }

        const dataRows = result.data.filter((row) => {
          const firstVal = Object.values(row)[0] ?? "";
          return !String(firstVal).startsWith("#");
        });

        if (dataRows.length === 0) {
          setParseError("No data rows found in the CSV");
          return;
        }
        if (dataRows.length > 200) {
          setParseError("Maximum 200 rows per import. Split into smaller files.");
          return;
        }

        setHasFile(true);
        setRows(dataRows.map((row, i) => validateRow(row, i + 1)));
      },
      error: (err) => {
        setParseError(`Failed to parse CSV: ${err.message}`);
      },
    });
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    e.target.value = "";
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }

  async function handleImport() {
    if (!rows.length || rows.some((r) => !r.valid)) return;
    setImporting(true);
    try {
      const res = await fetch("/api/matches/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matches: rows.map((r) => r.parsed!) }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Import failed");
        return;
      }
      setImportResult({ imported: data.imported });
    } catch {
      toast.error("Network error — please try again");
    } finally {
      setImporting(false);
    }
  }

  function downloadTemplate() {
    const a = document.createElement("a");
    a.href = "/cricketiq-import-template.csv";
    a.download = "cricketiq-matches-template.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  const validCount = rows.filter((r) => r.valid).length;
  const invalidCount = rows.filter((r) => !r.valid).length;
  const allValid = rows.length > 0 && invalidCount === 0;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="flex max-h-[85vh] flex-col sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Import Matches from CSV</DialogTitle>
          <DialogDescription asChild>
            <span className="flex items-center gap-2">
              Bulk upload your past matches.{" "}
              <button
                type="button"
                onClick={downloadTemplate}
                className="inline-flex items-center gap-1 text-emerald-400 transition-colors hover:text-emerald-300"
              >
                <Download className="h-3 w-3" />
                Download template
              </button>
            </span>
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 space-y-4 overflow-y-auto py-2 pr-1">
          {importResult ? (
            <div className="flex flex-col items-center gap-4 py-8 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/15">
                <CheckCircle2 className="h-8 w-8 text-emerald-400" />
              </div>
              <div>
                <p className="text-lg font-semibold text-white">
                  {importResult.imported} {importResult.imported === 1 ? "match" : "matches"} imported!
                </p>
                <p className="mt-1 text-sm text-ink-muted">
                  Your stats and rating are being recalculated.
                </p>
              </div>
            </div>
          ) : !hasFile ? (
            <>
              <div
                role="button"
                tabIndex={0}
                aria-label="Upload CSV file"
                className={cn(
                  "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500",
                  isDragging
                    ? "border-emerald-500 bg-emerald-500/10"
                    : "border-hairline bg-white/[0.02] hover:border-emerald-500/40 hover:bg-white/[0.03]"
                )}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                onKeyDown={(e) => e.key === "Enter" && fileInputRef.current?.click()}
              >
                <div className={cn(
                  "flex h-12 w-12 items-center justify-center rounded-full",
                  isDragging ? "bg-emerald-500/20" : "bg-white/[0.05]"
                )}>
                  <Upload className={cn("h-5 w-5", isDragging ? "text-emerald-400" : "text-ink-muted")} />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-white">
                    {isDragging ? "Drop your CSV here" : "Drag CSV here or click to browse"}
                  </p>
                  <p className="mt-0.5 text-xs text-ink-faint">
                    .csv files only · max 200 rows · 2 MB limit
                  </p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,text/csv"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>

              {parseError && (
                <div className="flex items-start gap-2.5 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                  <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                  {parseError}
                </div>
              )}

              <div className="rounded-lg border border-hairline-subtle bg-white/[0.02] px-4 py-3 text-xs">
                <p className="mb-1.5 font-semibold uppercase tracking-widest text-ink-faint">
                  Required columns
                </p>
                <p className="break-all font-mono text-ink-muted">
                  date, opponent, format, runs, wickets, overs, dismissal, notes
                </p>
                <p className="mt-2 text-ink-faint">
                  <span className="font-medium text-ink-muted">Format:</span> T20 · ODI · Test · Casual
                  &nbsp;&nbsp;
                  <span className="font-medium text-ink-muted">Dismissal:</span> caught · bowled · lbw · run out · not out · retired
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-sm">
                  <span className="flex items-center gap-1.5 text-emerald-400">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    {validCount} valid
                  </span>
                  {invalidCount > 0 && (
                    <span className="flex items-center gap-1.5 text-red-400">
                      <XCircle className="h-3.5 w-3.5" />
                      {invalidCount} with errors
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => { setRows([]); setHasFile(false); setParseError(null); }}
                  className="text-xs text-ink-muted transition-colors hover:text-white"
                >
                  Change file
                </button>
              </div>

              {!allValid && (
                <div className="flex items-start gap-2.5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-400">
                  <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                  Fix the errors below before importing. All rows must be valid.
                </div>
              )}

              <div className="overflow-auto rounded-xl border border-hairline" style={{ maxHeight: 360 }}>
                <table className="w-full text-xs">
                  <thead className="sticky top-0 z-10">
                    <tr className="border-b border-hairline-subtle bg-[#0C1015]">
                      <th className="w-8 px-3 py-2 text-left font-semibold uppercase tracking-widest text-ink-faint">#</th>
                      <th className="px-3 py-2 text-left font-semibold uppercase tracking-widest text-ink-faint">Date</th>
                      <th className="px-3 py-2 text-left font-semibold uppercase tracking-widest text-ink-faint">Opponent</th>
                      <th className="px-3 py-2 text-left font-semibold uppercase tracking-widest text-ink-faint">Fmt</th>
                      <th className="px-3 py-2 text-right font-semibold uppercase tracking-widest text-ink-faint">Runs</th>
                      <th className="px-3 py-2 text-right font-semibold uppercase tracking-widest text-ink-faint">Wkt</th>
                      <th className="px-3 py-2 text-left font-semibold uppercase tracking-widest text-ink-faint">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-hairline-subtle">
                    {rows.map((row) => (
                      <tr
                        key={row.rowIndex}
                        className={cn(row.valid ? "hover:bg-white/[0.01]" : "bg-red-500/[0.04]")}
                      >
                        <td className="px-3 py-2 tabular-nums text-ink-faint">{row.rowIndex}</td>
                        <td className="px-3 py-2 font-mono text-ink-muted">
                          {row.parsed?.date
                            ? new Date(row.parsed.date).toLocaleDateString("en-GB", {
                                day: "2-digit", month: "short", year: "numeric",
                              })
                            : <span className="text-red-400">{row.raw.date || "—"}</span>
                          }
                        </td>
                        <td className="max-w-[110px] truncate px-3 py-2 text-white">
                          {row.parsed?.opponent || <span className="text-red-400">{row.raw.opponent || "—"}</span>}
                        </td>
                        <td className="px-3 py-2">
                          {row.parsed?.format
                            ? <span className="rounded border border-hairline bg-white/[0.03] px-1.5 py-px font-medium text-ink-muted">{row.parsed.format}</span>
                            : <span className="text-red-400">{row.raw.format || "—"}</span>
                          }
                        </td>
                        <td className="px-3 py-2 text-right tabular-nums text-white">
                          {row.parsed != null ? row.parsed.runs : row.raw.runs}
                        </td>
                        <td className="px-3 py-2 text-right tabular-nums text-white">
                          {row.parsed != null ? row.parsed.wickets : row.raw.wickets}
                        </td>
                        <td className="px-3 py-2">
                          {row.valid ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                          ) : (
                            <div className="flex items-start gap-1.5">
                              <XCircle className="mt-px h-3.5 w-3.5 flex-shrink-0 text-red-400" />
                              <span className="leading-tight text-red-400" style={{ fontSize: 11 }}>
                                {row.errors[0]}
                                {row.errors.length > 1 && ` (+${row.errors.length - 1} more)`}
                              </span>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        <DialogFooter className="border-t border-hairline-subtle pt-4">
          {importResult ? (
            <Button
              onClick={() => { onSuccess(); handleOpenChange(false); }}
              className="bg-emerald-500 font-semibold text-black hover:bg-emerald-400"
            >
              Done
            </Button>
          ) : (
            <>
              <Button variant="ghost" onClick={() => handleOpenChange(false)} disabled={importing}>
                Cancel
              </Button>
              {hasFile && rows.length > 0 && (
                <Button
                  onClick={handleImport}
                  disabled={!allValid || importing}
                  className="bg-emerald-500 font-semibold text-black shadow-lg shadow-emerald-500/20 hover:bg-emerald-400 disabled:opacity-50"
                >
                  {importing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Importing…
                    </>
                  ) : (
                    `Import ${validCount} ${validCount === 1 ? "Match" : "Matches"}`
                  )}
                </Button>
              )}
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
