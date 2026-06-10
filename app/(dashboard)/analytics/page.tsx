"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  AreaChart, Area,
  LineChart, Line,
  BarChart, Bar,
  ComposedChart,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ReferenceLine,
} from "recharts";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/dashboard/PageHeader";

type FilterKey = "5" | "10" | "20" | "all";

interface AnalyticsData {
  charts: {
    runs: Array<{ match: number; date: string; runs: number }>;
    avg: Array<{ match: number; date: string; avg: number }>;
    sr: Array<{ match: number; date: string; sr: number }>;
    wickets: Array<{ match: number; date: string; wickets: number }>;
    economy: Array<{ match: number; date: string; economy: number }>;
    allRound: Array<{ match: number; date: string; runs: number; wickets: number }>;
    ratingOverTime: Array<{ date: string; rating: number }>;
  };
  dismissals: Array<{ name: string; value: number }>;
  heatmap: Array<{ date: string; runs: number; result: string }>;
  boundaryPct: number;
  careerAvg: number;
  stats: { batting: Record<string, number>; bowling: Record<string, number> };
}

// Restrained semantic palette: batting = emerald, bowling = amber,
// fielding/secondary = sky, tertiary = violet.
const C = {
  batting: "#10B981",
  bowling: "#F59E0B",
  sky: "#38BDF8",
  violet: "#A78BFA",
  danger: "#EF4444",
  grid: "#161B24",
  axis: "#5A6372",
};

const PIE_COLORS = [C.batting, C.bowling, C.sky, C.violet, C.danger, "#6B7484"];

const tooltipContentStyle = {
  background: "#0C1015",
  border: "1px solid #1B212C",
  borderRadius: "10px",
  color: "#F9FAFB",
  fontSize: "12px",
  boxShadow: "0 12px 32px rgba(0,0,0,0.5)",
};

const axisTick = { fill: C.axis, fontSize: 10 };

function ChartCard({
  title,
  meta,
  children,
  className,
}: {
  title: string;
  meta?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-xl border border-[#1B212C] bg-[#0C1015] p-5 transition-colors hover:border-[#222936] ${className ?? ""}`}
    >
      <div className="mb-4 flex items-baseline justify-between gap-3">
        <p className="text-sm font-semibold text-white">{title}</p>
        {meta && (
          <p className="font-mono text-[10px] uppercase tracking-wider text-[#5A6372]">
            {meta}
          </p>
        )}
      </div>
      {children}
    </div>
  );
}

function SectionTitle({ kicker, title }: { kicker: string; title: string }) {
  return (
    <div className="pt-2">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-400">
        {kicker}
      </p>
      <h2 className="mt-1 text-lg font-bold tracking-tight text-white">{title}</h2>
    </div>
  );
}

function LoadingGrid() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-[#1B212C] bg-[#0C1015] p-5">
            <Skeleton className="mb-4 h-4 w-40" />
            <Skeleton className="h-[200px] w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  const [filter, setFilter] = useState<FilterKey>("all");
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await fetch(`/api/analytics?last=${filter}`);
        if (!res.ok) throw new Error("Failed to load analytics");
        const json = await res.json();
        setData(json);
      } catch {
        toast.error("Failed to load analytics");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [filter]);

  const rangeLabel =
    filter === "all" ? "All time" : `Last ${filter} matches`;

  // Heatmap color tiers
  function heatColor(runs: number) {
    if (runs === 0) return "#161B24";
    if (runs < 20) return "#064e3b";
    if (runs < 40) return "#065f46";
    if (runs < 60) return "#047857";
    if (runs < 100) return "#059669";
    return "#10b981";
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6">
      <PageHeader
        kicker="Analytics"
        title="Performance Analytics"
        description="Trends and breakdowns across every innings you've logged."
        actions={
          <Tabs value={filter} onValueChange={(v) => setFilter(v as FilterKey)}>
            <TabsList>
              <TabsTrigger value="5">Last 5</TabsTrigger>
              <TabsTrigger value="10">Last 10</TabsTrigger>
              <TabsTrigger value="20">Last 20</TabsTrigger>
              <TabsTrigger value="all">All Time</TabsTrigger>
            </TabsList>
          </Tabs>
        }
      />

      {loading || !data ? (
        <LoadingGrid />
      ) : (
        <>
          {/* Chart grid */}
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            {/* 1. Runs Over Time */}
            <ChartCard title="Runs Over Time" meta={rangeLabel}>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={data.charts.runs}>
                  <defs>
                    <linearGradient id="runsGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={C.batting} stopOpacity={0.25} />
                      <stop offset="95%" stopColor={C.batting} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={C.grid} vertical={false} />
                  <XAxis dataKey="date" tick={axisTick} tickLine={false} axisLine={false} />
                  <YAxis tick={axisTick} tickLine={false} axisLine={false} width={32} />
                  <Tooltip contentStyle={tooltipContentStyle} formatter={(v) => [v as number, "Runs"]} />
                  <Area type="monotone" dataKey="runs" stroke={C.batting} strokeWidth={2} fill="url(#runsGrad)" dot={{ fill: C.batting, r: 2.5, strokeWidth: 0 }} activeDot={{ r: 4 }} />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* 2. Batting Average Over Time */}
            <ChartCard title="Batting Average Over Time" meta={rangeLabel}>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={data.charts.avg}>
                  <CartesianGrid strokeDasharray="3 3" stroke={C.grid} vertical={false} />
                  <XAxis dataKey="date" tick={axisTick} tickLine={false} axisLine={false} />
                  <YAxis tick={axisTick} tickLine={false} axisLine={false} width={32} />
                  <Tooltip contentStyle={tooltipContentStyle} formatter={(v) => [(v as number).toFixed(2), "Average"]} />
                  <ReferenceLine y={data.careerAvg} stroke={C.bowling} strokeDasharray="4 4" label={{ value: "Career", fill: C.bowling, fontSize: 10 }} />
                  <Line type="monotone" dataKey="avg" stroke={C.batting} strokeWidth={2} dot={{ fill: C.batting, r: 2.5, strokeWidth: 0 }} activeDot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* 3. Strike Rate Over Time */}
            <ChartCard title="Strike Rate Over Time" meta={rangeLabel}>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={data.charts.sr}>
                  <CartesianGrid strokeDasharray="3 3" stroke={C.grid} vertical={false} />
                  <XAxis dataKey="date" tick={axisTick} tickLine={false} axisLine={false} />
                  <YAxis tick={axisTick} tickLine={false} axisLine={false} width={32} />
                  <Tooltip contentStyle={tooltipContentStyle} formatter={(v) => [(v as number).toFixed(1), "Strike Rate"]} />
                  <ReferenceLine y={100} stroke={C.axis} strokeDasharray="3 3" />
                  <Line type="monotone" dataKey="sr" stroke={C.violet} strokeWidth={2} dot={{ fill: C.violet, r: 2.5, strokeWidth: 0 }} activeDot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* 4. Wickets Per Match */}
            <ChartCard title="Wickets Per Match" meta={rangeLabel}>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={data.charts.wickets}>
                  <CartesianGrid strokeDasharray="3 3" stroke={C.grid} vertical={false} />
                  <XAxis dataKey="date" tick={axisTick} tickLine={false} axisLine={false} />
                  <YAxis tick={axisTick} tickLine={false} axisLine={false} allowDecimals={false} width={32} />
                  <Tooltip contentStyle={tooltipContentStyle} cursor={{ fill: "rgba(255,255,255,0.03)" }} formatter={(v) => [v as number, "Wickets"]} />
                  <Bar dataKey="wickets" fill={C.bowling} opacity={0.85} radius={[3, 3, 0, 0]} maxBarSize={28} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* 5. Economy Rate Over Time */}
            <ChartCard title="Economy Rate Over Time" meta={rangeLabel}>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={data.charts.economy}>
                  <CartesianGrid strokeDasharray="3 3" stroke={C.grid} vertical={false} />
                  <XAxis dataKey="date" tick={axisTick} tickLine={false} axisLine={false} />
                  <YAxis tick={axisTick} tickLine={false} axisLine={false} width={32} />
                  <Tooltip contentStyle={tooltipContentStyle} formatter={(v) => [(v as number).toFixed(2), "Economy"]} />
                  <ReferenceLine y={7} stroke={C.batting} strokeDasharray="4 4" label={{ value: "Good (7.0)", fill: C.batting, fontSize: 10 }} />
                  <Line type="monotone" dataKey="economy" stroke={C.bowling} strokeWidth={2} dot={{ fill: C.bowling, r: 2.5, strokeWidth: 0 }} activeDot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* 6. All-Round Contribution */}
            <ChartCard title="All-Round Contribution" meta={rangeLabel}>
              <ResponsiveContainer width="100%" height={200}>
                <ComposedChart data={data.charts.allRound}>
                  <CartesianGrid strokeDasharray="3 3" stroke={C.grid} vertical={false} />
                  <XAxis dataKey="date" tick={axisTick} tickLine={false} axisLine={false} />
                  <YAxis yAxisId="left" tick={axisTick} tickLine={false} axisLine={false} width={32} />
                  <YAxis yAxisId="right" orientation="right" tick={axisTick} tickLine={false} axisLine={false} width={28} />
                  <Tooltip contentStyle={tooltipContentStyle} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                  <Legend wrapperStyle={{ fontSize: 11, color: "#8A93A3" }} iconType="circle" iconSize={7} />
                  <Bar yAxisId="left" dataKey="runs" fill={C.batting} opacity={0.75} radius={[2, 2, 0, 0]} maxBarSize={24} name="Runs" />
                  <Line yAxisId="right" type="monotone" dataKey="wickets" stroke={C.bowling} strokeWidth={2} dot={{ fill: C.bowling, r: 2.5, strokeWidth: 0 }} name="Wickets" />
                </ComposedChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          {/* Breakdown section */}
          <SectionTitle kicker="Breakdown" title="Shot & Bowling Breakdown" />
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {/* Dismissal distribution */}
            <ChartCard title="Dismissal Distribution">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={data.dismissals}
                    cx="50%"
                    cy="50%"
                    innerRadius={52}
                    outerRadius={78}
                    dataKey="value"
                    nameKey="name"
                    paddingAngle={3}
                    stroke="#0C1015"
                    strokeWidth={2}
                  >
                    {data.dismissals.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipContentStyle} />
                  <Legend wrapperStyle={{ fontSize: 10, color: "#8A93A3" }} iconType="circle" iconSize={7} />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* Boundary Percentage */}
            <ChartCard title="Boundary Percentage">
              <div className="flex h-[200px] flex-col items-center justify-center gap-3">
                <div className="relative h-32 w-32">
                  <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
                    <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
                    <circle
                      cx="60" cy="60" r="50" fill="none"
                      stroke={C.batting} strokeWidth="10"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 50}`}
                      strokeDashoffset={`${2 * Math.PI * 50 * (1 - data.boundaryPct / 100)}`}
                      style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.22, 1, 0.36, 1)" }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <p className="stat-mono text-2xl font-bold tabular-nums text-white">
                      {data.boundaryPct.toFixed(1)}
                      <span className="text-sm text-emerald-400">%</span>
                    </p>
                  </div>
                </div>
                <p className="text-xs text-[#6B7484]">of balls hit for boundaries</p>
              </div>
            </ChartCard>

            {/* Dismissal type breakdown */}
            <ChartCard title="Dismissal Type Breakdown">
              <ResponsiveContainer width="100%" height={200}>
                <BarChart layout="vertical" data={data.dismissals.slice(0, 6)} margin={{ left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={C.grid} horizontal={false} />
                  <XAxis type="number" tick={axisTick} tickLine={false} axisLine={false} />
                  <YAxis type="category" dataKey="name" tick={{ fill: "#8A93A3", fontSize: 10 }} tickLine={false} axisLine={false} width={64} />
                  <Tooltip contentStyle={tooltipContentStyle} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                  <Bar dataKey="value" radius={[0, 3, 3, 0]} fill={C.bowling} opacity={0.85} maxBarSize={16} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          {/* Performance Heatmap */}
          <ChartCard title="Performance Heatmap" meta="Each cell = one match, colored by runs">
            <div className="flex flex-wrap gap-1.5">
              {data.heatmap.map((h, i) => (
                <div
                  key={i}
                  title={`${h.date}: ${h.runs} runs (${h.result})`}
                  className="h-5 w-5 cursor-pointer rounded-[4px] transition-all hover:scale-110 hover:ring-1 hover:ring-white/40"
                  style={{ background: heatColor(h.runs) }}
                />
              ))}
            </div>
            <div className="mt-4 flex items-center gap-2">
              <span className="text-[11px] text-[#5A6372]">Less</span>
              {[0, 15, 35, 55, 80].map((r) => (
                <div key={r} className="h-3.5 w-3.5 rounded-[3px]" style={{ background: heatColor(r) }} />
              ))}
              <span className="text-[11px] text-[#5A6372]">More</span>
            </div>
          </ChartCard>

          {/* CricketIQ Rating Over Time */}
          {data.charts.ratingOverTime && data.charts.ratingOverTime.length > 1 && (
            <ChartCard title="CricketIQ Rating Over Time" meta="0–100 scale">
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={data.charts.ratingOverTime}>
                  <defs>
                    <linearGradient id="ratingGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={C.batting} stopOpacity={0.2} />
                      <stop offset="95%" stopColor={C.batting} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={C.grid} vertical={false} />
                  <XAxis dataKey="date" tick={axisTick} tickLine={false} axisLine={false} />
                  <YAxis domain={[0, 100]} tick={axisTick} tickLine={false} axisLine={false} width={32} />
                  <Tooltip
                    contentStyle={tooltipContentStyle}
                    formatter={(v) => [`${(v as number).toFixed(1)}`, "Rating"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="rating"
                    stroke={C.batting}
                    strokeWidth={2.5}
                    fill="url(#ratingGrad)"
                    dot={{ fill: C.batting, r: 2.5, strokeWidth: 0 }}
                    activeDot={{ r: 5 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>
          )}
        </>
      )}
    </div>
  );
}
