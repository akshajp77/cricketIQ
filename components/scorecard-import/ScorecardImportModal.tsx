"use client";

import { useState, useRef } from "react";
import { toast } from "sonner";
import {
  Upload, CheckCircle2, AlertCircle, Loader2, FileSpreadsheet, User,
} from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { ScorecardPlayerMatch, ScorecardMeta } from "@/lib/parseScorecard";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

type Step = "setup" | "preview" | "disambiguate" | "success";

const FORMAT_OPTIONS = ["T20", "ODI", "Test", "Custom"] as const;
const RESULT_OPTIONS = ["Won", "Lost", "Draw", "No Result"] as const;

function inferResult(meta: ScorecardMeta, userTeam: string | null): string {
  if (!meta.winnerTeam || !userTeam) return "No Result";
  const winnerNorm = meta.winnerTeam.trim().toLowerCase();
  const userNorm = userTeam.trim().toLowerCase();
  if (winnerNorm.includes(userNorm) || userNorm.includes(winnerNorm)) return "Won";
  return "Lost";
}

function inferOpponent(meta: ScorecardMeta, userTeam: string | null): string {
  if (!meta.team1 || !meta.team2) return "";
  if (!userTeam) return meta.team2;
  const t1 = meta.team1.trim().toLowerCase();
  const t2 = meta.team2.trim().toLowerCase();
  const u = userTeam.trim().toLowerCase();
  if (t1.includes(u) || u.includes(t1)) return meta.team2;
  if (t2.includes(u) || u.includes(t2)) return meta.team1;
  return meta.team2;
}

function StatRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex justify-between gap-3 py-1">
      <span className="text-sm text-ink-muted">{label}</span>
      <span className="stat-mono text-sm font-medium tabular-nums text-white">{value}</span>
    </div>
  );
}

export function ScorecardImportModal({ open, onOpenChange, onSuccess }: Props) {
  const [step, setStep] = useState<Step>("setup");
  const [playerName, setPlayerName] = useState("");
  const [userTeam, setUserTeam] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [parsing, setParsing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [meta, setMeta] = useState<ScorecardMeta | null>(null);
  const [candidates, setCandidates] = useState<ScorecardPlayerMatch[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const [opponent, setOpponent] = useState("");
  const [matchDate, setMatchDate] = useState("");
  const [format, setFormat] = useState("T20");
  const [result, setResult] = useState("No Result");

  const fileInputRef = useRef<HTMLInputElement>(null);

  function reset() {
    setStep("setup");
    setPlayerName("");
    setUserTeam("");
    setIsDragging(false);
    setParseError(null);
    setParsing(false);
    setSaving(false);
    setMeta(null);
    setCandidates([]);
    setSelectedIndex(0);
    setOpponent("");
    setMatchDate("");
    setFormat("T20");
    setResult("No Result");
  }

  function handleOpenChange(o: boolean) {
    if (saving || parsing) return;
    if (!o) reset();
    onOpenChange(o);
  }

  async function processFile(file: File) {
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
    if (!["csv", "xlsx", "xls"].includes(ext)) {
      setParseError("File format not recognised. Please upload a CricClubs CSV or Excel scorecard.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setParseError("File too large (max 5 MB).");
      return;
    }
    if (!playerName.trim()) {
      setParseError("Please enter your name before uploading the file.");
      return;
    }

    setParseError(null);
    setParsing(true);

    try {
      const { parseScorecard } = await import("@/lib/parseScorecard");
      const res = await parseScorecard(file, playerName.trim());

      if (!res.ok) {
        setParseError(res.error);
        return;
      }

      const { meta: parsedMeta, matches } = res;
      setMeta(parsedMeta);
      setCandidates(matches);

      const inferredOpponent = inferOpponent(parsedMeta, userTeam || null);
      setOpponent(inferredOpponent);
      setMatchDate(
        parsedMeta.date
          ? new Date(parsedMeta.date).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0]
      );
      setResult(inferResult(parsedMeta, userTeam || null));

      setStep(matches.length > 1 ? "disambiguate" : "preview");
    } catch {
      setParseError("An unexpected error occurred while parsing the scorecard.");
    } finally {
      setParsing(false);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    e.target.value = "";
  }

  function handleDragOver(e: React.DragEvent) { e.preventDefault(); setIsDragging(true); }
  function handleDragLeave(e: React.DragEvent) { e.preventDefault(); setIsDragging(false); }
  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }

  async function handleSave() {
    const player = candidates[selectedIndex];
    if (!player || !opponent.trim() || !matchDate) return;

    setSaving(true);
    try {
      const res = await fetch("/api/matches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          matchInfo: {
            opponent: opponent.trim(),
            date: new Date(matchDate).toISOString(),
            format,
            result,
            venue: "",
            notes: meta?.winMargin && meta.winnerTeam
              ? `${meta.winnerTeam} won by ${meta.winMargin}`
              : "",
          },
          batting: {
            runs: player.batting?.runs ?? 0,
            balls: player.batting?.balls ?? 0,
            fours: player.batting?.fours ?? 0,
            sixes: player.batting?.sixes ?? 0,
            dismissalType: player.batting?.dismissalType ?? "Did Not Bat",
          },
          bowling: {
            overs: player.bowling?.overs ?? 0,
            runsConceded: player.bowling?.runsConceded ?? 0,
            wickets: player.bowling?.wickets ?? 0,
            maidens: player.bowling?.maidens ?? 0,
            wides: player.bowling?.wides ?? 0,
            noBalls: player.bowling?.noBalls ?? 0,
          },
          fielding: { catches: 0, runOuts: 0, stumpings: 0 },
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error ?? "Failed to save match.");
        return;
      }
      setStep("success");
    } catch {
      toast.error("Network error — please try again.");
    } finally {
      setSaving(false);
    }
  }

  const player = candidates[selectedIndex] ?? null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="flex max-h-[90vh] flex-col sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-emerald-400" />
            Import CricClubs Scorecard
          </DialogTitle>
          <DialogDescription>
            Upload a CricClubs scorecard to automatically extract your batting and bowling stats.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 space-y-4 overflow-y-auto py-1 pr-1">
          {/* ── SETUP ── */}
          {step === "setup" && (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="sc-player-name" className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-ink-faint">
                  <User className="h-3 w-3" />
                  Your name in the scorecard <span className="text-red-400">*</span>
                </Label>
                <Input
                  id="sc-player-name"
                  placeholder="e.g. Virat Kohli"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                />
                <p className="text-[11px] text-ink-faint">
                  Enter your name as it appears in the scorecard. A partial match (e.g., first name) also works.
                </p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="sc-team-name" className="text-xs font-semibold uppercase tracking-widest text-ink-faint">
                  Your team name{" "}
                  <span className="font-normal text-ink-faint/60">(optional — helps detect opponent & result)</span>
                </Label>
                <Input
                  id="sc-team-name"
                  placeholder="e.g. Mumbai Indians"
                  value={userTeam}
                  onChange={(e) => setUserTeam(e.target.value)}
                />
              </div>

              <div
                role="button"
                tabIndex={0}
                aria-label="Upload scorecard file"
                className={cn(
                  "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-8 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500",
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
                {parsing ? (
                  <>
                    <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
                    <p className="text-sm text-ink-muted">Parsing scorecard…</p>
                  </>
                ) : (
                  <>
                    <div className={cn(
                      "flex h-12 w-12 items-center justify-center rounded-full",
                      isDragging ? "bg-emerald-500/20" : "bg-white/[0.05]"
                    )}>
                      <Upload className={cn("h-5 w-5", isDragging ? "text-emerald-400" : "text-ink-muted")} />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-white">
                        {isDragging ? "Drop scorecard here" : "Drag scorecard here or click to browse"}
                      </p>
                      <p className="mt-0.5 text-xs text-ink-faint">.csv or .xlsx files · max 5 MB</p>
                    </div>
                  </>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>

              {parseError && (
                <div className="flex items-start gap-2.5 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                  <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                  <span>{parseError}</span>
                </div>
              )}

              <div className="rounded-lg border border-hairline-subtle bg-white/[0.02] px-4 py-3 text-xs text-ink-faint">
                Export your scorecard from CricClubs as CSV or Excel, then upload it here. Your individual batting and bowling stats will be extracted automatically.
              </div>
            </>
          )}

          {/* ── DISAMBIGUATE ── */}
          {step === "disambiguate" && (
            <>
              <div className="flex items-start gap-2.5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-400">
                <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <span>
                  Multiple players matched &ldquo;{playerName}&rdquo;. Select which one is you:
                </span>
              </div>
              <div className="space-y-2">
                {candidates.map((c, i) => (
                  <button
                    key={i}
                    onClick={() => { setSelectedIndex(i); setStep("preview"); }}
                    className="w-full rounded-xl border border-hairline bg-surface px-4 py-3 text-left transition-colors hover:border-emerald-500/40 hover:bg-white/[0.03]"
                  >
                    <p className="text-sm font-medium text-white">{c.name}</p>
                    <p className="mt-0.5 text-xs text-ink-muted">
                      {c.batting
                        ? `${c.batting.runs} runs (${c.batting.balls} balls) · ${c.batting.dismissalType}`
                        : "Did not bat"}
                      {c.bowling?.didBowl
                        ? ` · ${c.bowling.wickets}/${c.bowling.runsConceded} in ${c.bowling.overs} ov`
                        : ""}
                    </p>
                  </button>
                ))}
              </div>
            </>
          )}

          {/* ── PREVIEW ── */}
          {step === "preview" && player && (
            <>
              <div className="space-y-3 rounded-xl border border-hairline bg-surface px-4 py-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-400">
                  Match Details
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-[10px] uppercase tracking-widest text-ink-faint">Opponent *</Label>
                    <Input
                      value={opponent}
                      onChange={(e) => setOpponent(e.target.value)}
                      placeholder="Team name"
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] uppercase tracking-widest text-ink-faint">Date *</Label>
                    <Input
                      type="date"
                      value={matchDate}
                      onChange={(e) => setMatchDate(e.target.value)}
                      className="h-8 text-sm"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-[10px] uppercase tracking-widest text-ink-faint">Format</Label>
                    <Select value={format} onValueChange={setFormat}>
                      <SelectTrigger className="h-8 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {FORMAT_OPTIONS.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] uppercase tracking-widest text-ink-faint">Result</Label>
                    <Select value={result} onValueChange={setResult}>
                      <SelectTrigger className="h-8 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {RESULT_OPTIONS.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {meta?.winMargin && (
                  <p className="text-[11px] text-ink-faint">
                    {meta.winnerTeam} won by {meta.winMargin}
                  </p>
                )}
              </div>

              <div className="space-y-3 rounded-xl border border-hairline bg-surface px-4 py-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-400">
                  Your Stats · {player.name}
                </p>

                {player.batting ? (
                  <div>
                    <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-sky-400">Batting</p>
                    <div className="divide-y divide-hairline-subtle">
                      <StatRow label="Runs (Balls)" value={`${player.batting.runs} (${player.batting.balls})`} />
                      <StatRow label="4s / 6s" value={`${player.batting.fours} / ${player.batting.sixes}`} />
                      <StatRow
                        label="Strike Rate"
                        value={
                          player.batting.balls > 0
                            ? ((player.batting.runs / player.batting.balls) * 100).toFixed(1)
                            : "—"
                        }
                      />
                      <StatRow label="Dismissal" value={player.batting.dismissalType} />
                    </div>
                  </div>
                ) : (
                  <p className="py-1 text-sm text-ink-muted">Did not bat</p>
                )}

                {player.bowling?.didBowl ? (
                  <div>
                    <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-amber-400">Bowling</p>
                    <div className="divide-y divide-hairline-subtle">
                      <StatRow label="Figures" value={`${player.bowling.wickets}/${player.bowling.runsConceded}`} />
                      <StatRow label="Overs" value={player.bowling.overs} />
                      <StatRow label="Maidens" value={player.bowling.maidens} />
                      <StatRow
                        label="Economy"
                        value={
                          player.bowling.overs > 0
                            ? (player.bowling.runsConceded / player.bowling.overs).toFixed(2)
                            : "—"
                        }
                      />
                      <StatRow label="Wides / No Balls" value={`${player.bowling.wides} / ${player.bowling.noBalls}`} />
                    </div>
                  </div>
                ) : (
                  <p className="py-1 text-sm text-ink-muted">Did not bowl</p>
                )}
              </div>

              {candidates.length > 1 && (
                <button
                  type="button"
                  onClick={() => setStep("disambiguate")}
                  className="text-xs text-ink-muted underline hover:text-white"
                >
                  That&apos;s not me — pick a different player
                </button>
              )}
            </>
          )}

          {/* ── SUCCESS ── */}
          {step === "success" && (
            <div className="flex flex-col items-center gap-4 py-8 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/15">
                <CheckCircle2 className="h-8 w-8 text-emerald-400" />
              </div>
              <div>
                <p className="text-lg font-semibold text-white">Match saved!</p>
                <p className="mt-1 text-sm text-ink-muted">
                  Your stats from the CricClubs scorecard have been added to your match log.
                </p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="border-t border-hairline-subtle pt-4">
          {step === "success" ? (
            <Button
              onClick={() => { onSuccess(); handleOpenChange(false); }}
              className="bg-emerald-500 font-semibold text-black hover:bg-emerald-400"
            >
              Done
            </Button>
          ) : step === "preview" ? (
            <>
              <Button variant="ghost" onClick={() => setStep("setup")} disabled={saving}>
                Back
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving || !opponent.trim() || !matchDate}
                className="bg-emerald-500 font-semibold text-black shadow-lg shadow-emerald-500/20 hover:bg-emerald-400 disabled:opacity-50"
              >
                {saving ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving…</>
                ) : (
                  "Confirm & Save"
                )}
              </Button>
            </>
          ) : step === "disambiguate" ? (
            <Button variant="ghost" onClick={() => setStep("setup")} disabled={saving}>
              Back
            </Button>
          ) : (
            <Button variant="ghost" onClick={() => handleOpenChange(false)} disabled={parsing}>
              Cancel
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
