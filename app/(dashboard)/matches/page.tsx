"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Plus, Search, Trash2, ChevronDown, ChevronUp, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

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

function ExpandedRow({ match }: { match: Match }) {
  const economy = match.bowling && match.bowling.overs > 0
    ? (match.bowling.runsConceded / match.bowling.overs).toFixed(2)
    : "—";
  const sr = match.batting && match.batting.balls > 0
    ? ((match.batting.runs / match.batting.balls) * 100).toFixed(1)
    : "—";

  return (
    <div className="px-5 pb-4 grid grid-cols-3 gap-4 bg-[#0A0F1E]/50">
      <div>
        <p className="text-xs text-[#6B7280] uppercase tracking-wider mb-2">Batting</p>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between"><span className="text-[#6B7280]">Runs</span><span className="font-mono text-white">{match.batting?.runs ?? 0}({match.batting?.balls ?? 0})</span></div>
          <div className="flex justify-between"><span className="text-[#6B7280]">4s/6s</span><span className="font-mono text-white">{match.batting?.fours ?? 0}/{match.batting?.sixes ?? 0}</span></div>
          <div className="flex justify-between"><span className="text-[#6B7280]">SR</span><span className="font-mono text-[#00D4AA]">{sr}</span></div>
          <div className="flex justify-between"><span className="text-[#6B7280]">Out</span><span className="text-white">{match.batting?.dismissalType ?? "—"}</span></div>
        </div>
      </div>
      <div>
        <p className="text-xs text-[#6B7280] uppercase tracking-wider mb-2">Bowling</p>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between"><span className="text-[#6B7280]">Figures</span><span className="font-mono text-white">{match.bowling?.wickets ?? 0}/{match.bowling?.runsConceded ?? 0}</span></div>
          <div className="flex justify-between"><span className="text-[#6B7280]">Overs</span><span className="font-mono text-white">{match.bowling?.overs ?? 0}</span></div>
          <div className="flex justify-between"><span className="text-[#6B7280]">Economy</span><span className="font-mono text-[#F59E0B]">{economy}</span></div>
        </div>
      </div>
      <div>
        <p className="text-xs text-[#6B7280] uppercase tracking-wider mb-2">Fielding</p>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between"><span className="text-[#6B7280]">Catches</span><span className="font-mono text-white">{match.fielding?.catches ?? 0}</span></div>
          <div className="flex justify-between"><span className="text-[#6B7280]">Run Outs</span><span className="font-mono text-white">{match.fielding?.runOuts ?? 0}</span></div>
          <div className="flex justify-between"><span className="text-[#6B7280]">Stumpings</span><span className="font-mono text-white">{match.fielding?.stumpings ?? 0}</span></div>
        </div>
      </div>
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

  return (
    <div className="p-6 max-w-5xl space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Match History</h2>
          <p className="text-sm text-[#6B7280]">{total} matches recorded</p>
        </div>
        <Button asChild className="bg-[#00D4AA] text-[#0A0F1E] hover:bg-[#00D4AA]/90 font-semibold">
          <Link href="/matches/new">
            <Plus className="w-4 h-4 mr-1" />
            New Match
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
          <Input
            placeholder="Search opponent..."
            className="pl-9"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <Select value={format} onValueChange={(v) => { setFormat(v); setPage(1); }}>
          <SelectTrigger className="w-36">
            <Filter className="w-4 h-4 mr-2 text-[#6B7280]" />
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

      {/* Table */}
      <div className="rounded-xl border border-[#1F2937] bg-[#111827] overflow-hidden">
        <div className="grid grid-cols-[1fr_auto_auto_auto_auto] text-xs text-[#6B7280] uppercase tracking-wider px-5 py-3 border-b border-[#1F2937] gap-4">
          <span>Match</span>
          <span className="text-right">Batting</span>
          <span className="text-right">Bowling</span>
          <span className="text-right">Result</span>
          <span />
        </div>

        {loading ? (
          <div className="py-12 text-center text-[#6B7280]">Loading...</div>
        ) : matches.length === 0 ? (
          <div className="py-12 text-center text-[#6B7280]">No matches found</div>
        ) : (
          <div className="divide-y divide-[#1F2937]">
            {matches.map((match) => (
              <div key={match.id}>
                <div
                  className="grid grid-cols-[1fr_auto_auto_auto_auto] items-center px-5 py-3 gap-4 hover:bg-[#1F2937]/40 cursor-pointer transition-colors"
                  onClick={() => setExpandedId(expandedId === match.id ? null : match.id)}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-white">vs {match.opponent}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#1F2937] text-[#6B7280]">{match.format}</span>
                    </div>
                    <p className="text-xs text-[#6B7280] mt-0.5">{formatDate(match.date)}{match.venue ? ` · ${match.venue}` : ""}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-mono font-semibold text-white">{match.batting?.runs ?? 0}</span>
                    <span className="text-xs text-[#6B7280]">({match.batting?.balls ?? 0})</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-mono font-semibold text-white">{match.bowling?.wickets ?? 0}/{match.bowling?.runsConceded ?? 0}</span>
                  </div>
                  <ResultBadge result={match.result} />
                  <div className="flex items-center gap-1">
                    {expandedId === match.id ? <ChevronUp className="w-4 h-4 text-[#6B7280]" /> : <ChevronDown className="w-4 h-4 text-[#6B7280]" />}
                    <button
                      onClick={(e) => { e.stopPropagation(); setDeleteId(match.id); }}
                      className="text-[#6B7280] hover:text-red-400 transition-colors p-1 rounded"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                {expandedId === match.id && <ExpandedRow match={match} />}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Prev</Button>
          <span className="text-sm text-[#6B7280]">Page {page} of {totalPages}</span>
          <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Next</Button>
        </div>
      )}

      {/* Delete dialog */}
      <Dialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Match</DialogTitle>
            <DialogDescription>Are you sure you want to delete this match? This action cannot be undone.</DialogDescription>
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
