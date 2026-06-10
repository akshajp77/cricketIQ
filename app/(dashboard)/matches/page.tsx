"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Plus, Search, Trash2, ChevronDown, ChevronUp, Filter, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface Match {
  id: string;
  opponent: string;
  date: string;
  format: string;
  venue?: string;
  result: string;
  batting: { runs: number; balls: number; fours: number; sixes: number; dismissalType: string } | null;
  bowling: { overs: number; runsConceded: number; wickets: number } | null;
  fielding: { catches: number; runOuts: number; stumpings: number } | null;
}

function ResultBadge({ result }: { result: string }) {
  const variant = result === "Won" ? "success" : result === "Lost" ? "danger" : "warning";
  return <Badge variant={variant}>{result}</Badge>;
}

function StatBlock({ title, accent, rows }: {
  title: string;
  accent: string;
  rows: Array<{ label: string; value: string | number; highlight?: boolean }>;
}) {
  return (
    <div>
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em]" style={{ color: accent }}>
        {title}
      </p>
      <div className="space-y-1.5 text-sm">
        {rows.map((r) => (
          <div key={r.label} className="flex justify-between gap-3">
            <span className="text-[#6B7484]">{r.label}</span>
            <span className={cn("stat-mono tabular-nums", r.highlight ? "font-semibold" : "text-white")}
              style={r.highlight ? { color: accent } : undefined}>
              {r.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ExpandedRow({ match }: { match: Match }) {
  const economy = match.bowling && match.bowling.overs > 0
    ? (match.bowling.runsConceded / match.bowling.overs).toFixed(2)
    : "—";
  const sr = match.batting && match.batting.balls > 0
    ? ((match.batting.runs / match.batting.balls) * 100).toFixed(1)
    : "—";

  return (
    <div className="grid grid-cols-1 gap-5 border-t border-[#161B24] bg-[#07090D]/60 px-5 py-4 sm:grid-cols-3">
      <StatBlock
        title="Batting"
        accent="#10B981"
        rows={[
          { label: "Runs", value: `${match.batting?.runs ?? 0} (${match.batting?.balls ?? 0})` },
          { label: "4s / 6s", value: `${match.batting?.fours ?? 0} / ${match.batting?.sixes ?? 0}` },
          { label: "Strike Rate", value: sr, highlight: true },
          { label: "Dismissal", value: match.batting?.dismissalType ?? "—" },
        ]}
      />
      <StatBlock
        title="Bowling"
        accent="#F59E0B"
        rows={[
          { label: "Figures", value: `${match.bowling?.wickets ?? 0}/${match.bowling?.runsConceded ?? 0}` },
          { label: "Overs", value: match.bowling?.overs ?? 0 },
          { label: "Economy", value: economy, highlight: true },
        ]}
      />
      <StatBlock
        title="Fielding"
        accent="#38BDF8"
        rows={[
          { label: "Catches", value: match.fielding?.catches ?? 0 },
          { label: "Run Outs", value: match.fielding?.runOuts ?? 0 },
          { label: "Stumpings", value: match.fielding?.stumpings ?? 0 },
        ]}
      />
    </div>
  );
}

function RowSkeleton() {
  return (
    <div className="flex items-center gap-4 px-5 py-4">
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-44" />
        <Skeleton className="h-3 w-28" />
      </div>
      <Skeleton className="hidden h-4 w-14 sm:block" />
      <Skeleton className="hidden h-4 w-12 sm:block" />
      <Skeleton className="h-6 w-16 rounded-full" />
    </div>
  );
}

export default function MatchesPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [format, setFormat] = useState("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchMatches = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "15" });
      if (search) params.set("opponent", search);
      if (format !== "all") params.set("format", format);
      const res = await fetch(`/api/matches?${params}`);
      if (!res.ok) throw new Error("Failed to load matches");
      const data = await res.json();
      setMatches(data.matches ?? []);
      setTotal(data.total ?? 0);
    } catch {
      toast.error("Failed to load matches");
    } finally {
      setLoading(false);
    }
  }, [page, search, format]);

  useEffect(() => { fetchMatches(); }, [fetchMatches]);

  async function handleDelete() {
    if (!deleteId) return;
    const res = await fetch(`/api/matches/${deleteId}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Match deleted");
      setDeleteId(null);
      fetchMatches();
    } else {
      toast.error("Failed to delete match");
    }
  }

  const totalPages = Math.ceil(total / 15);
  const isFiltered = search !== "" || format !== "all";

  return (
    <div className="mx-auto max-w-5xl space-y-5 p-4 sm:p-6">
      <PageHeader
        kicker="Match Log"
        title="Match History"
        description={`${total} ${total === 1 ? "match" : "matches"} recorded`}
        actions={
          <Button
            asChild
            className="bg-emerald-500 font-semibold text-black shadow-lg shadow-emerald-500/20 hover:bg-emerald-400"
          >
            <Link href="/matches/new">
              <Plus className="mr-1.5 h-4 w-4" />
              New Match
            </Link>
          </Button>
        }
      />

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative min-w-[200px] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#5A6372]" />
          <Input
            placeholder="Search opponent..."
            className="pl-9"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <Select value={format} onValueChange={(v) => { setFormat(v); setPage(1); }}>
          <SelectTrigger className="w-36">
            <Filter className="mr-2 h-4 w-4 text-[#5A6372]" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Formats</SelectItem>
            <SelectItem value="T20">T20</SelectItem>
            <SelectItem value="ODI">ODI</SelectItem>
            <SelectItem value="Test">Test</SelectItem>
            <SelectItem value="Custom">Custom</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* List */}
      {loading ? (
        <div className="divide-y divide-[#161B24] overflow-hidden rounded-xl border border-[#1B212C] bg-[#0C1015]">
          {Array.from({ length: 6 }).map((_, i) => (
            <RowSkeleton key={i} />
          ))}
        </div>
      ) : matches.length === 0 ? (
        <EmptyState
          icon={isFiltered ? Search : ClipboardList}
          title={isFiltered ? "No matches found" : "No matches yet"}
          description={
            isFiltered
              ? "Try a different opponent name or format filter."
              : "Log your first match to start building your performance history."
          }
          action={
            !isFiltered && (
              <Button
                asChild
                className="bg-emerald-500 font-semibold text-black hover:bg-emerald-400"
              >
                <Link href="/matches/new">
                  <Plus className="mr-1.5 h-4 w-4" />
                  Add First Match
                </Link>
              </Button>
            )
          }
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-[#1B212C] bg-[#0C1015]">
          {/* Column header (desktop) */}
          <div className="hidden grid-cols-[1fr_90px_90px_90px_64px] items-center gap-4 border-b border-[#161B24] px-5 py-2.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#5A6372] sm:grid">
            <span>Match</span>
            <span className="text-right">Batting</span>
            <span className="text-right">Bowling</span>
            <span className="text-center">Result</span>
            <span />
          </div>

          <div className="divide-y divide-[#161B24]">
            {matches.map((match) => (
              <div key={match.id} className="group">
                <div
                  className="flex cursor-pointer flex-wrap items-center gap-x-4 gap-y-2 px-5 py-3.5 transition-colors hover:bg-white/[0.02] sm:grid sm:grid-cols-[1fr_90px_90px_90px_64px]"
                  onClick={() => setExpandedId(expandedId === match.id ? null : match.id)}
                >
                  <div className="min-w-0 flex-1 sm:flex-none">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-sm font-medium text-white">vs {match.opponent}</span>
                      <span className="flex-shrink-0 rounded border border-[#1B212C] bg-white/[0.02] px-1.5 py-px text-[10px] font-medium text-[#6B7484]">
                        {match.format}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-[#6B7484]">
                      {formatDate(match.date)}{match.venue ? ` · ${match.venue}` : ""}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="stat-mono text-sm font-semibold tabular-nums text-white">
                      {match.batting?.runs ?? 0}
                    </span>
                    <span className="text-xs text-[#5A6372]">({match.batting?.balls ?? 0})</span>
                  </div>
                  <div className="text-right">
                    <span className="stat-mono text-sm font-semibold tabular-nums text-white">
                      {match.bowling?.wickets ?? 0}/{match.bowling?.runsConceded ?? 0}
                    </span>
                  </div>
                  <div className="flex sm:justify-center">
                    <ResultBadge result={match.result} />
                  </div>
                  <div className="ml-auto flex items-center gap-0.5 sm:ml-0">
                    <button
                      onClick={(e) => { e.stopPropagation(); setDeleteId(match.id); }}
                      title="Delete match"
                      className="rounded-md p-1.5 text-[#5A6372] transition-all hover:bg-red-500/10 hover:text-red-400 sm:opacity-0 sm:group-hover:opacity-100"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                    {expandedId === match.id
                      ? <ChevronUp className="h-4 w-4 text-[#5A6372]" />
                      : <ChevronDown className="h-4 w-4 text-[#5A6372]" />}
                  </div>
                </div>
                {expandedId === match.id && <ExpandedRow match={match} />}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
            Prev
          </Button>
          <span className="font-mono text-xs tabular-nums text-[#6B7484]">
            {page} / {totalPages}
          </span>
          <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
            Next
          </Button>
        </div>
      )}

      {/* Delete dialog */}
      <Dialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Match</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this match? This action cannot be undone and your CricketIQ Rating will be recalculated.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
