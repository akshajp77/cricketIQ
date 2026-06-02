"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Sparkles, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AIAnalysis {
  id: string;
  createdAt: string;
  strengths: string[];
  weaknesses: string[];
  improvements: string[];
  trainingPlan: string;
  matchStrategy: string;
}

// ─── Card ──────────────────────────────────────────────────────────────────

interface CardProps {
  title: string;
  accent: string;
  items?: string[];
  body?: string;
}

function AnalysisCard({ title, accent, items, body }: CardProps) {
  return (
    <div
      className="rounded-xl p-5 flex flex-col gap-3"
      style={{
        background: `${accent}10`,
        border: `1px solid ${accent}30`,
      }}
    >
      <p
        className="text-xs font-semibold uppercase tracking-widest"
        style={{ color: accent }}
      >
        {title}
      </p>
      {items && (
        <ul className="space-y-2">
          {items.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-[#D1D5DB]">
              <span
                className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0"
                style={{ background: accent }}
              />
              {item}
            </li>
          ))}
        </ul>
      )}
      {body && <p className="text-sm text-[#D1D5DB] leading-relaxed">{body}</p>}
    </div>
  );
}

// ─── History item ──────────────────────────────────────────────────────────

function HistoryItem({ analysis }: { analysis: AIAnalysis }) {
  const [open, setOpen] = useState(false);
  const date = new Date(analysis.createdAt).toLocaleString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });

  return (
    <div className="rounded-xl border border-[#1F2937] bg-[#111827] overflow-hidden">
      <button
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-[#1F2937]/50 transition-colors text-left"
        onClick={() => setOpen(!open)}
      >
        <div>
          <p className="text-sm font-medium text-white">{date}</p>
          <p className="text-xs text-[#6B7280] mt-0.5 truncate max-w-xs">
            {analysis.strengths[0] ?? "—"}
          </p>
        </div>
        {open ? (
          <ChevronUp className="w-4 h-4 text-[#6B7280] shrink-0" />
        ) : (
          <ChevronDown className="w-4 h-4 text-[#6B7280] shrink-0" />
        )}
      </button>

      {open && (
        <div className="px-5 pb-5 grid grid-cols-1 sm:grid-cols-2 gap-3 border-t border-[#1F2937]">
          <div className="pt-4 sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <AnalysisCard title="Strengths" accent="#10B981" items={analysis.strengths} />
            <AnalysisCard title="Weaknesses" accent="#EF4444" items={analysis.weaknesses} />
            <AnalysisCard title="How to Improve" accent="#F59E0B" items={analysis.improvements} />
            <AnalysisCard title="Training Plan" accent="#00D4AA" body={analysis.trainingPlan} />
            <AnalysisCard title="Match Strategy" accent="#00D4AA" body={analysis.matchStrategy} />
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────

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
    <div className="p-6 max-w-5xl space-y-8">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#00D4AA]" />
            <h2 className="text-2xl font-bold text-white">AI Coach</h2>
          </div>
          <p className="text-sm text-[#6B7280] mt-0.5">Powered by Gemini</p>
        </div>

        <Button
          onClick={handleAnalyze}
          disabled={loading}
          className="bg-[#00D4AA] text-[#0A0F1E] hover:bg-[#00D4AA]/90 font-semibold px-6"
          size="lg"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-[#0A0F1E]/40 border-t-[#0A0F1E] rounded-full animate-spin mr-2" />
              Analyzing your performance...
            </>
          ) : (
            <>
              🏏 Analyze My Performance
            </>
          )}
        </Button>
      </div>

      {/* ── Current result ── */}
      {current && !loading && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnalysisCard title="Strengths" accent="#10B981" items={current.strengths} />
            <AnalysisCard title="Weaknesses" accent="#EF4444" items={current.weaknesses} />
            <AnalysisCard title="How to Improve" accent="#F59E0B" items={current.improvements} />
            <AnalysisCard title="Training Plan" accent="#00D4AA" body={current.trainingPlan} />
            <AnalysisCard title="Match Strategy" accent="#00D4AA" body={current.matchStrategy} />
          </div>

          <p className="text-xs text-[#6B7280]">
            Last analyzed:{" "}
            {new Date(current.createdAt).toLocaleString("en-GB", {
              day: "numeric", month: "short", year: "numeric",
              hour: "2-digit", minute: "2-digit",
            })}
          </p>
        </div>
      )}

      {/* ── Empty state ── */}
      {!current && !loading && (
        <div className="rounded-xl border border-[#1F2937] bg-[#111827] p-12 text-center">
          <Sparkles className="w-10 h-10 text-[#00D4AA]/40 mx-auto mb-3" />
          <p className="text-white font-medium">No analysis yet</p>
          <p className="text-sm text-[#6B7280] mt-1">
            Click &ldquo;Analyze My Performance&rdquo; to get your first AI coaching report.
          </p>
        </div>
      )}

      {/* ── History ── */}
      {pastAnalyses.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm font-medium text-[#6B7280] uppercase tracking-wider">
            Previous Analyses
          </p>
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
