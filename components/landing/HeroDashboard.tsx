"use client";

import { useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  Crosshair,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";
import {
  aiInsights,
  battingStats,
  bowlingStats,
  cricketIQRating,
  ratingTrend,
  recentMatches,
} from "./data";
import { areaPath, scalePoints, smoothPath } from "./chart-utils";

// ── Interactive performance trend chart ──────────────────────────────────────

const CHART_W = 560;
const CHART_H = 170;

function TrendChart() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState<number | null>(null);

  const pts = useMemo(
    () => scalePoints(ratingTrend.map((d) => d.value), CHART_W, CHART_H, 14),
    []
  );
  const line = useMemo(() => smoothPath(pts), [pts]);
  const area = useMemo(() => areaPath(pts, CHART_H), [pts]);

  const onMove = (e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((e.clientX - rect.left) / rect.width) * CHART_W;
    let nearest = 0;
    for (let i = 1; i < pts.length; i++) {
      if (Math.abs(pts[i].x - x) < Math.abs(pts[nearest].x - x)) nearest = i;
    }
    setHover(nearest);
  };

  const h = hover !== null ? { pt: pts[hover], d: ratingTrend[hover] } : null;

  return (
    <div
      ref={containerRef}
      className="relative"
      onMouseMove={onMove}
      onMouseLeave={() => setHover(null)}
    >
      <svg
        viewBox={`0 0 ${CHART_W} ${CHART_H}`}
        className="w-full"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* horizontal gridlines */}
        {[0.25, 0.5, 0.75].map((f) => (
          <line
            key={f}
            x1="0"
            x2={CHART_W}
            y1={CHART_H * f}
            y2={CHART_H * f}
            stroke="rgba(255,255,255,0.05)"
            strokeWidth="1"
          />
        ))}
        <motion.path
          d={area}
          fill="url(#trendFill)"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.9 }}
        />
        <motion.path
          d={line}
          fill="none"
          stroke="#10b981"
          strokeWidth="2.5"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.6, delay: 0.5, ease: "easeInOut" }}
        />
        {h && (
          <>
            <line
              x1={h.pt.x}
              x2={h.pt.x}
              y1="0"
              y2={CHART_H}
              stroke="rgba(16,185,129,0.3)"
              strokeWidth="1"
              strokeDasharray="3 3"
            />
            <circle cx={h.pt.x} cy={h.pt.y} r="5" fill="#10b981" />
            <circle cx={h.pt.x} cy={h.pt.y} r="9" fill="rgba(16,185,129,0.25)" />
          </>
        )}
      </svg>
      {h && (
        <div
          className="pointer-events-none absolute -top-1 z-10 -translate-x-1/2 rounded-lg border border-white/10 bg-[#0c0e12] px-2.5 py-1.5 shadow-xl"
          style={{ left: `${(h.pt.x / CHART_W) * 100}%` }}
        >
          <p className="whitespace-nowrap text-[10px] text-zinc-400">{h.d.label}</p>
          <p className="font-mono text-xs font-semibold text-emerald-400">
            IQ {h.d.value}
          </p>
        </div>
      )}
    </div>
  );
}

// ── CricketIQ rating ring ─────────────────────────────────────────────────────

function RatingRing() {
  return (
    <div className="relative mx-auto h-[120px] w-[120px]">
      <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
        <circle
          cx="60"
          cy="60"
          r="52"
          fill="none"
          stroke="rgba(255,255,255,0.07)"
          strokeWidth="9"
        />
        <motion.circle
          cx="60"
          cy="60"
          r="52"
          fill="none"
          stroke="url(#ringGrad)"
          strokeWidth="9"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: cricketIQRating / 100 }}
          viewport={{ once: true }}
          transition={{ duration: 1.8, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
        />
        <defs>
          <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#34d399" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-mono text-3xl font-bold text-white">
          {cricketIQRating}
        </span>
        <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
          / 100
        </span>
      </div>
    </div>
  );
}

// ── Small building blocks ─────────────────────────────────────────────────────

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between">
      <span className="text-[11px] text-zinc-500">{label}</span>
      <span className="font-mono text-sm font-semibold text-white">{value}</span>
    </div>
  );
}

function PanelTitle({
  icon: Icon,
  children,
  accent = "text-emerald-400",
}: {
  icon: React.ElementType;
  children: React.ReactNode;
  accent?: string;
}) {
  return (
    <div className="mb-3 flex items-center gap-2">
      <Icon className={`h-3.5 w-3.5 ${accent}`} />
      <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
        {children}
      </span>
    </div>
  );
}

const panel =
  "rounded-xl border border-white/[0.07] bg-white/[0.03] p-4";

// ── The dashboard mockup ──────────────────────────────────────────────────────

export function HeroDashboard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 60, rotateX: 14 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ duration: 1.1, delay: 0.5, ease: [0.21, 0.47, 0.32, 0.98] }}
      style={{ transformPerspective: 1200 }}
      className="relative mx-auto mt-16 w-full max-w-6xl"
    >
      {/* glow under the dashboard */}
      <div className="pointer-events-none absolute -inset-x-12 -bottom-24 top-1/3 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.16),transparent_65%)] blur-2xl" />

      {/* floating badges */}
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-5 right-4 z-20 hidden items-center gap-2 rounded-full border border-emerald-500/30 bg-[#0a0d11]/90 px-3.5 py-2 shadow-xl shadow-black/40 backdrop-blur md:flex"
      >
        <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
        <span className="text-xs font-medium text-white">
          +9 rating this month
        </span>
      </motion.div>
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute -left-4 bottom-16 z-20 hidden items-center gap-2 rounded-full border border-white/10 bg-[#0a0d11]/90 px-3.5 py-2 shadow-xl shadow-black/40 backdrop-blur lg:flex"
      >
        <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
        <span className="text-xs font-medium text-white">New AI report ready</span>
      </motion.div>

      {/* window frame */}
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0a0c10]/95 shadow-[0_40px_120px_-20px_rgba(0,0,0,0.8),0_0_60px_-15px_rgba(16,185,129,0.15)] backdrop-blur">
        {/* chrome bar */}
        <div className="flex items-center justify-between border-b border-white/[0.07] px-4 py-3">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
          </div>
          <div className="hidden items-center gap-2 rounded-md border border-white/[0.07] bg-white/[0.03] px-3 py-1 sm:flex">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            <span className="font-mono text-[11px] text-zinc-500">
              app.cricketiq.io/dashboard
            </span>
          </div>
          <div className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400">
              Live
            </span>
          </div>
        </div>

        {/* dashboard body */}
        <div className="grid grid-cols-1 gap-4 p-4 sm:p-5 lg:grid-cols-12">
          {/* left: stats + trend + matches */}
          <div className="space-y-4 lg:col-span-8">
            <div className="grid grid-cols-2 gap-4">
              {/* Batting card */}
              <div className={panel}>
                <PanelTitle icon={Target}>Batting</PanelTitle>
                <p className="font-mono text-2xl font-bold text-white sm:text-3xl">
                  {battingStats.runs}
                  <span className="ml-1.5 text-xs font-medium text-zinc-500">
                    runs
                  </span>
                </p>
                <div className="mt-3 space-y-1.5">
                  <StatRow label="Average" value={battingStats.average} />
                  <StatRow label="Strike Rate" value={battingStats.strikeRate} />
                </div>
              </div>
              {/* Bowling card */}
              <div className={panel}>
                <PanelTitle icon={Crosshair}>Bowling</PanelTitle>
                <p className="font-mono text-2xl font-bold text-white sm:text-3xl">
                  {bowlingStats.wickets}
                  <span className="ml-1.5 text-xs font-medium text-zinc-500">
                    wickets
                  </span>
                </p>
                <div className="mt-3 space-y-1.5">
                  <StatRow label="Economy" value={bowlingStats.economy} />
                  <StatRow label="Best" value={bowlingStats.bestFigures} />
                </div>
              </div>
            </div>

            {/* trend chart */}
            <div className={panel}>
              <div className="mb-2 flex items-center justify-between">
                <PanelTitle icon={BarChart3}>Performance Trend</PanelTitle>
                <span className="font-mono text-[10px] text-zinc-600">
                  LAST 10 MATCHES
                </span>
              </div>
              <TrendChart />
            </div>

            {/* recent matches */}
            <div className="grid grid-cols-3 gap-4">
              {recentMatches.map((m) => (
                <div key={m.opponent} className={`${panel} !p-3`}>
                  <div className="flex items-center justify-between">
                    <span
                      className={`flex h-5 w-5 items-center justify-center rounded-md text-[10px] font-bold ${
                        m.result === "W"
                          ? "bg-emerald-500/15 text-emerald-400"
                          : "bg-red-500/15 text-red-400"
                      }`}
                    >
                      {m.result}
                    </span>
                    <span className="font-mono text-[10px] text-emerald-400/80">
                      {m.delta}
                    </span>
                  </div>
                  <p className="mt-2 truncate text-[11px] text-zinc-500">
                    vs {m.opponent}
                  </p>
                  <p className="font-mono text-sm font-semibold text-white">
                    {m.score}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* right: rating + AI coach */}
          <div className="space-y-4 lg:col-span-4">
            <div className={`${panel} text-center`}>
              <PanelTitle icon={TrendingUp}>CricketIQ Rating</PanelTitle>
              <RatingRing />
              <p className="mt-2 text-[11px] text-zinc-500">
                Top 8% of club batters
              </p>
            </div>

            <div className={panel}>
              <div className="mb-3 flex items-center justify-between">
                <PanelTitle icon={Sparkles}>AI Coach</PanelTitle>
                <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-emerald-400">
                  New
                </span>
              </div>
              <div className="space-y-3 text-left">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" />
                  <p className="text-xs leading-relaxed text-zinc-300">
                    {aiInsights.strengths[0]}
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-400" />
                  <p className="text-xs leading-relaxed text-zinc-300">
                    {aiInsights.weaknesses[0]}
                  </p>
                </div>
                <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/[0.06] p-2.5">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400">
                    This week&apos;s focus
                  </p>
                  <ul className="mt-1.5 space-y-1">
                    {aiInsights.recommendations.map((r) => (
                      <li
                        key={r}
                        className="flex items-center gap-1.5 text-[11px] text-zinc-300"
                      >
                        <span className="h-1 w-1 rounded-full bg-emerald-400" />
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
