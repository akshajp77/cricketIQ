"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Bot,
  Sparkles,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  Target,
  Dumbbell,
  Swords,
  Brain,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

interface AIAnalysis {
  id: string;
  createdAt: string;
  strengths: string[];
  weaknesses: string[];
  improvements: string[];
  trainingPlan: string;
  matchStrategy: string;
  rating: number;
}

function AnalysisCard({
  icon: Icon,
  title,
  color,
  items,
}: {
  icon: typeof Bot;
  title: string;
  color: string;
  items?: string[];
}) {
  return (
    <div className={`rounded-xl border p-5`} style={{ borderColor: `${color}30`, background: `${color}08` }}>
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${color}20` }}>
          <Icon className="w-4 h-4" style={{ color }} />
        </div>
        <h3 className="font-semibold text-white text-sm">{title}</h3>
      </div>
      {items && (
        <ul className="space-y-2">
          {items.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-[#D1D5DB]">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: color }} />
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function TrainingCard({ plan }: { plan: string }) {
  const weeks = plan.split("\n").filter((l) => l.trim());
  return (
    <div className="rounded-xl border border-[#F59E0B]/30 bg-[#F59E0B]/05 p-5">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 rounded-lg bg-[#F59E0B]/20 flex items-center justify-center">
          <Dumbbell className="w-4 h-4 text-[#F59E0B]" />
        </div>
        <h3 className="font-semibold text-white text-sm">Training Recommendations</h3>
      </div>
      <div className="space-y-2">
        {weeks.map((week, i) => (
          <div key={i} className="text-sm text-[#D1D5DB] flex items-start gap-2">
            <span className="text-[#F59E0B] font-mono text-xs mt-0.5 flex-shrink-0">
              {week.startsWith("Week") ? "›" : " "}
            </span>
            {week}
          </div>
        ))}
      </div>
    </div>
  );
}

function PastAnalysis({ analysis }: { analysis: AIAnalysis }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="rounded-xl border border-[#1F2937] bg-[#111827] overflow-hidden">
      <button
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-[#1F2937]/40 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#00D4AA]/10 flex items-center justify-center">
            <Brain className="w-4 h-4 text-[#00D4AA]" />
          </div>
          <div className="text-left">
            <p className="text-sm font-medium text-white">Analysis Report</p>
            <p className="text-xs text-[#6B7280]">{formatDate(analysis.createdAt)} · Rating: {analysis.rating.toFixed(1)}</p>
          </div>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-[#6B7280]" /> : <ChevronDown className="w-4 h-4 text-[#6B7280]" />}
      </button>
      {expanded && (
        <div className="px-5 pb-5 space-y-4 border-t border-[#1F2937]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <AnalysisCard icon={TrendingUp} title="Strengths" color="#00D4AA" items={analysis.strengths} />
            <AnalysisCard icon={Target} title="Areas to Improve" color="#F59E0B" items={analysis.weaknesses} />
          </div>
          <TrainingCard plan={analysis.trainingPlan} />
          <div className="rounded-xl border border-[#8B5CF6]/30 bg-[#8B5CF6]/05 p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-[#8B5CF6]/20 flex items-center justify-center">
                <Swords className="w-4 h-4 text-[#8B5CF6]" />
              </div>
              <h3 className="font-semibold text-white text-sm">Next Match Strategy</h3>
            </div>
            <p className="text-sm text-[#D1D5DB] leading-relaxed">{analysis.matchStrategy}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AICoachPage() {
  const [loading, setLoading] = useState(false);
  const [current, setCurrent] = useState<AIAnalysis | null>(null);
  const [history, setHistory] = useState<AIAnalysis[]>([]);

  useEffect(() => {
    fetch("/api/ai-coach")
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load analyses");
        return r.json();
      })
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setCurrent(data[0]);
          setHistory(data);
        }
      })
      .catch(() => toast.error("Failed to load analysis history"));
  }, []);

  async function handleAnalyze() {
    setLoading(true);
    setCurrent(null);
    try {
      const res = await fetch("/api/ai-coach", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setCurrent(data);
        setHistory((h) => [data, ...h.filter((x) => x.id !== data.id)]);
        toast.success("Analysis complete!");
      } else {
        toast.error(data.error ?? "Analysis failed");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 max-w-4xl space-y-6">
      {/* Hero section with AI Orb */}
      <div className="relative rounded-2xl border border-[#1F2937] bg-gradient-to-br from-[#111827] to-[#0A0F1E] overflow-hidden p-8">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full opacity-10 animate-pulse-slow" style={{ background: "radial-gradient(circle, #00D4AA 0%, transparent 70%)" }} />
        </div>

        <div className="relative z-10 flex flex-col items-center text-center gap-6">
          {/* AI Orb */}
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#00D4AA] to-[#0093A8] flex items-center justify-center shadow-lg shadow-[#00D4AA]/40 animate-pulse-slow">
              <Bot className="w-12 h-12 text-[#0A0F1E]" />
            </div>
            {/* Orbiting ring */}
            <div className="absolute inset-0 rounded-full border-2 border-[#00D4AA]/30 animate-spin" style={{ animationDuration: "8s" }} />
            <div className="absolute inset-[-8px] rounded-full border border-[#00D4AA]/15 animate-spin" style={{ animationDuration: "12s", animationDirection: "reverse" }} />
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white">AI Performance Coach</h2>
            <p className="text-[#9CA3AF] mt-2 max-w-lg">
              Our AI analyzes your complete match history, identifies patterns, and generates a personalized coaching plan to elevate your game.
            </p>
          </div>

          <Button
            onClick={handleAnalyze}
            disabled={loading}
            className="bg-[#00D4AA] text-[#0A0F1E] hover:bg-[#00D4AA]/90 font-semibold text-base px-8 py-6"
            size="lg"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-[#0A0F1E] border-t-transparent rounded-full animate-spin mr-2" />
                Analyzing Performance...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                Analyze My Performance
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Current Analysis */}
      {loading && (
        <div className="rounded-2xl border border-[#1F2937] bg-[#111827] p-8">
          <div className="flex flex-col items-center gap-4">
            {/* Spinning cricket ball animation */}
            <div className="relative w-16 h-16">
              <div className="w-16 h-16 rounded-full border-4 border-[#00D4AA]/30 animate-spin border-t-[#00D4AA]" />
              <div className="absolute inset-0 flex items-center justify-center text-2xl">🏏</div>
            </div>
            <p className="text-white font-medium">Analyzing your cricket data...</p>
            <p className="text-[#6B7280] text-sm">Reviewing match history, trends, and patterns</p>
          </div>
        </div>
      )}

      {current && !loading && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Latest Analysis</h3>
            <span className="text-xs text-[#6B7280]">{formatDate(current.createdAt)}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AnalysisCard icon={TrendingUp} title="Strengths" color="#00D4AA" items={current.strengths} />
            <AnalysisCard icon={Target} title="Areas to Improve" color="#F59E0B" items={current.weaknesses} />
          </div>

          <AnalysisCard icon={Sparkles} title="Improvement Recommendations" color="#8B5CF6" items={current.improvements} />

          <TrainingCard plan={current.trainingPlan} />

          <div className="rounded-xl border border-[#EC4899]/30 bg-[#EC4899]/05 p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-[#EC4899]/20 flex items-center justify-center">
                <Swords className="w-4 h-4 text-[#EC4899]" />
              </div>
              <h3 className="font-semibold text-white text-sm">Next Match Strategy</h3>
            </div>
            <p className="text-sm text-[#D1D5DB] leading-relaxed">{current.matchStrategy}</p>
          </div>
        </div>
      )}

      {/* Analysis History */}
      {history.length > 1 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-white">Analysis History</h3>
          <div className="space-y-2">
            {history.slice(1).map((analysis) => (
              <PastAnalysis key={analysis.id} analysis={analysis} />
            ))}
          </div>
        </div>
      )}

      {history.length === 0 && !loading && !current && (
        <div className="text-center py-8 text-[#6B7280] text-sm">
          No analyses yet. Click &quot;Analyze My Performance&quot; to get started.
        </div>
      )}
    </div>
  );
}
