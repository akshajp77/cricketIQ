"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Sparkles,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  ClipboardList,
  Swords,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";

interface AIAnalysis {
  id: string;
  createdAt: string;
  strengths: string[];
  weaknesses: string[];
  improvements: string[];
  trainingPlan: string;
  matchStrategy: string;
}

// ─── Insight card ────────────────────────────────────────────────────────────

interface CardProps {
  title: string;
  accent: string;
  icon: LucideIcon;
  items?: string[];
  body?: string;
}

function AnalysisCard({ title, accent, icon: Icon, items, body }: CardProps) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-[#1B212C] bg-[#0C1015] p-5 transition-colors hover:border-[#2A3240]">
      <div className="flex items-center gap-2.5">
        <div
          className="flex h-7 w-7 items-center justify-center rounded-lg"
          style={{ background: `${accent}14`, border: `1px solid ${accent}26` }}
        >
          <Icon className="h-3.5 w-3.5" style={{ color: accent }} />
        </div>
        <p
          className="text-[11px] font-semibold uppercase tracking-[0.14em]"
          style={{ color: accent }}
        >
          {title}
        </p>
      </div>
      {items && (
        <ul className="space-y-2.5">
          {items.map((item, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm leading-relaxed text-[#D7DCE4]">
              <span
                className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full"
                style={{ background: accent }}
              />
              {item}
            </li>
          ))}
        </ul>
      )}
      {body && <p className="text-sm leading-relaxed text-[#D7DCE4]">{body}</p>}
    </div>
  );
}

function AnalysisGrid({ analysis }: { analysis: AIAnalysis }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <AnalysisCard title="Strengths" accent="#10B981" icon={CheckCircle2} items={analysis.strengths} />
        <AnalysisCard title="Weaknesses" accent="#EF4444" icon={AlertTriangle} items={analysis.weaknesses} />
        <AnalysisCard title="How to Improve" accent="#F59E0B" icon={TrendingUp} items={analysis.improvements} />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <AnalysisCard title="Training Plan" accent="#A78BFA" icon={ClipboardList} body={analysis.trainingPlan} />
        <AnalysisCard title="Match Strategy" accent="#38BDF8" icon={Swords} body={analysis.matchStrategy} />
      </div>
    </div>
  );
}

// ─── Loading state ───────────────────────────────────────────────────────────

function AnalyzingState() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.05] px-5 py-4">
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
        </span>
        <div>
          <p className="text-sm font-medium text-white">Analyzing your performance…</p>
          <p className="text-xs text-[#8A93A3]">
            The AI coach is reading your full match history. This usually takes a few seconds.
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="space-y-3 rounded-xl border border-[#1B212C] bg-[#0C1015] p-5">
            <Skeleton className="h-5 w-28" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/6" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="space-y-3 rounded-xl border border-[#1B212C] bg-[#0C1015] p-5">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── History item ────────────────────────────────────────────────────────────

function HistoryItem({ analysis }: { analysis: AIAnalysis }) {
  const [open, setOpen] = useState(false);
  const date = new Date(analysis.createdAt).toLocaleString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });

  return (
    <div className="overflow-hidden rounded-xl border border-[#1B212C] bg-[#0C1015]">
      <button
        className="flex w-full items-center justify-between px-5 py-4 text-left transition-colors hover:bg-white/[0.02]"
        onClick={() => setOpen(!open)}
      >
        <div className="min-w-0">
          <p className="text-sm font-medium text-white">{date}</p>
          <p className="mt-0.5 max-w-md truncate text-xs text-[#6B7484]">
            {analysis.strengths[0] ?? "—"}
          </p>
        </div>
        {open ? (
          <ChevronUp className="h-4 w-4 shrink-0 text-[#5A6372]" />
        ) : (
          <ChevronDown className="h-4 w-4 shrink-0 text-[#5A6372]" />
        )}
      </button>

      {open && (
        <div className="border-t border-[#161B24] bg-[#07090D]/40 p-5">
          <AnalysisGrid analysis={analysis} />
        </div>
      )}
    </div>
  );
}

// ─── Main page ───────────────────────────────────────────────────────────────

export default function AICoachPage() {
  const [loading, setLoading] = useState(false);
  const [current, setCurrent] = useState<AIAnalysis | null>(null);
  const [history, setHistory] = useState<AIAnalysis[]>([]);

  useEffect(() => {
    fetch("/api/ai-coach")
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then((data: AIAnalysis[]) => {
        if (data.length > 0) {
          setCurrent(data[0]);
          setHistory(data);
        }
      })
      .catch(() => toast.error("Failed to load analysis history"));
  }, []);

  async function handleAnalyze() {
    setLoading(true);
    try {
      const res = await fetch("/api/ai-coach", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Analysis failed");
        return;
      }
      setCurrent(data);
      setHistory((prev) => [data, ...prev.filter((x) => x.id !== data.id)]);
      toast.success("Analysis complete!");
    } catch {
      toast.error("Network error — please try again");
    } finally {
      setLoading(false);
    }
  }

  const pastAnalyses = current ? history.filter((h) => h.id !== current.id) : history;

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 sm:p-6">
      {/* Hero header */}
      <div className="relative overflow-hidden rounded-2xl border border-emerald-500/20 bg-[#0C1015] p-6 sm:p-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(16,185,129,0.10),transparent_55%)]" />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-green-600 shadow-lg shadow-emerald-500/25">
              <Sparkles className="h-5 w-5 text-black" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
                AI Coach
              </h1>
              <p className="mt-1 max-w-md text-sm leading-relaxed text-[#8A93A3]">
                Personalised strengths, weaknesses, and a training plan — generated
                from your complete match history.
              </p>
            </div>
          </div>
          <Button
            onClick={handleAnalyze}
            disabled={loading}
            size="lg"
            className="shrink-0 bg-emerald-500 px-6 font-semibold text-black shadow-lg shadow-emerald-500/25 transition-all hover:bg-emerald-400 hover:shadow-emerald-400/30"
          >
            {loading ? (
              <>
                <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-black/30 border-t-black" />
                Analyzing…
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Analyze My Performance
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Loading */}
      {loading && <AnalyzingState />}

      {/* Current result */}
      {current && !loading && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">Latest Report</h2>
            <p className="text-xs text-[#5A6372]">
              Generated{" "}
              {new Date(current.createdAt).toLocaleString("en-GB", {
                day: "numeric", month: "short", year: "numeric",
                hour: "2-digit", minute: "2-digit",
              })}
            </p>
          </div>
          <AnalysisGrid analysis={current} />
        </div>
      )}

      {/* Empty state */}
      {!current && !loading && (
        <EmptyState
          icon={Sparkles}
          title="No analysis yet"
          description="Run your first AI analysis to get a personalised coaching report based on your match history."
        />
      )}

      {/* History */}
      {pastAnalyses.length > 0 && !loading && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-white">Previous Reports</h2>
          <div className="space-y-2">
            {pastAnalyses.map((a) => (
              <HistoryItem key={a.id} analysis={a} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
