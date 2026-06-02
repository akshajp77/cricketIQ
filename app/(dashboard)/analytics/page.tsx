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

type FilterKey = "5" | "10" | "20" | "all";

interface AnalyticsData {
  charts: {
    runs: Array<{ match: number; date: string; runs: number }>;
    avg: Array<{ match: number; date: string; avg: number }>;
    sr: Array<{ match: number; date: string; sr: number }>;
    wickets: Array<{ match: number; date: string; wickets: number }>;
    economy: Array<{ match: number; date: string; economy: number }>;
    allRound: Array<{ match: number; date: string; runs: number; wickets: number }>;
  };
  dismissals: Array<{ name: string; value: number }>;
  heatmap: Array<{ date: string; runs: number; result: string }>;
  boundaryPct: number;
  careerAvg: number;
  stats: { batting: Record<string, number>; bowling: Record<string, number> };
}

const COLORS = ["#00D4AA", "#F59E0B", "#8B5CF6", "#EC4899", "#06B6D4", "#F97316"];

const tooltipStyle = {
  contentStyle: { background: "#111827", border: "1px solid #1F2937", borderRadius: "8px", color: "#F9FAFB" },
};

function ChartCard({ title, children, className }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl border border-[#1F2937] bg-[#111827] p-5 ${className ?? ""}`}>
      <p className="text-sm font-medium text-white mb-4">{title}</p>
      {children}
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

  if (loading || !data) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#00D4AA] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-[#6B7280] text-sm">Loading analytics...</p>
        </div>
      </div>
    );
  }

  const { charts, dismissals, heatmap, boundaryPct, careerAvg } = data;

  // Heatmap color tiers
  function heatColor(runs: number) {
    if (runs === 0) return "#1F2937";
    if (runs < 20) return "#064e3b";
    if (runs < 40) return "#065f46";
    if (runs < 60) return "#047857";
    if (runs < 100) return "#059669";
    return "#10b981";
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl">
      {/* Date range filter */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">Performance Analytics</h2>
        <Tabs value={filter} onValueChange={(v) => setFilter(v as FilterKey)}>
          <TabsList>
            <TabsTrigger value="5">Last 5</TabsTrigger>
            <TabsTrigger value="10">Last 10</TabsTrigger>
            <TabsTrigger value="20">Last 20</TabsTrigger>
            <TabsTrigger value="all">All Time</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Chart Grid: 6 charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. Runs Over Time */}
        <ChartCard title="Runs Over Time">
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={charts.runs} {...tooltipStyle}>
              <defs>
                <linearGradient id="runsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00D4AA" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#00D4AA" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" />
              <XAxis dataKey="date" tick={{ fill: "#6B7280", fontSize: 10 }} tickLine={false} />
              <YAxis tick={{ fill: "#6B7280", fontSize: 10 }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={tooltipStyle.contentStyle} formatter={(v) => [v as number, "Runs"]} />
              <Area type="monotone" dataKey="runs" stroke="#00D4AA" strokeWidth={2} fill="url(#runsGrad)" dot={{ fill: "#00D4AA", r: 3 }} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* 2. Batting Average Over Time */}
        <ChartCard title="Batting Average Over Time">
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={charts.avg}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" />
              <XAxis dataKey="date" tick={{ fill: "#6B7280", fontSize: 10 }} tickLine={false} />
              <YAxis tick={{ fill: "#6B7280", fontSize: 10 }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={tooltipStyle.contentStyle} formatter={(v) => [(v as number).toFixed(2), "Average"]} />
              <ReferenceLine y={careerAvg} stroke="#F59E0B" strokeDasharray="4 4" label={{ value: "Career", fill: "#F59E0B", fontSize: 10 }} />
              <Line type="monotone" dataKey="avg" stroke="#00D4AA" strokeWidth={2} dot={{ fill: "#00D4AA", r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* 3. Strike Rate Over Time */}
        <ChartCard title="Strike Rate Over Time">
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={charts.sr}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" />
              <XAxis dataKey="date" tick={{ fill: "#6B7280", fontSize: 10 }} tickLine={false} />
              <YAxis tick={{ fill: "#6B7280", fontSize: 10 }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={tooltipStyle.contentStyle} formatter={(v) => [(v as number).toFixed(1), "Strike Rate"]} />
              <ReferenceLine y={100} stroke="#6B7280" strokeDasharray="3 3" />
              <Line type="monotone" dataKey="sr" stroke="#8B5CF6" strokeWidth={2} dot={{ fill: "#8B5CF6", r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* 4. Wickets Per Match */}
        <ChartCard title="Wickets Per Match">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={charts.wickets}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" />
              <XAxis dataKey="date" tick={{ fill: "#6B7280", fontSize: 10 }} tickLine={false} />
              <YAxis tick={{ fill: "#6B7280", fontSize: 10 }} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip contentStyle={tooltipStyle.contentStyle} formatter={(v) => [v as number, "Wickets"]} />
              <Bar dataKey="wickets" fill="#EC4899" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* 5. Economy Rate Over Time */}
        <ChartCard title="Economy Rate Over Time">
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={charts.economy}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" />
              <XAxis dataKey="date" tick={{ fill: "#6B7280", fontSize: 10 }} tickLine={false} />
              <YAxis tick={{ fill: "#6B7280", fontSize: 10 }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={tooltipStyle.contentStyle} formatter={(v) => [(v as number).toFixed(2), "Economy"]} />
              <ReferenceLine y={7} stroke="#10B981" strokeDasharray="4 4" label={{ value: "Good (7.0)", fill: "#10B981", fontSize: 10 }} />
              <Line type="monotone" dataKey="economy" stroke="#F59E0B" strokeWidth={2} dot={{ fill: "#F59E0B", r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* 6. All-Round Contribution */}
        <ChartCard title="All-Round Contribution Index">
          <ResponsiveContainer width="100%" height={200}>
            <ComposedChart data={charts.allRound}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" />
              <XAxis dataKey="date" tick={{ fill: "#6B7280", fontSize: 10 }} tickLine={false} />
              <YAxis yAxisId="left" tick={{ fill: "#6B7280", fontSize: 10 }} tickLine={false} axisLine={false} />
              <YAxis yAxisId="right" orientation="right" tick={{ fill: "#6B7280", fontSize: 10 }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={tooltipStyle.contentStyle} />
              <Legend wrapperStyle={{ fontSize: 11, color: "#9CA3AF" }} />
              <Bar yAxisId="left" dataKey="runs" fill="#00D4AA" opacity={0.8} radius={[2, 2, 0, 0]} name="Runs" />
              <Line yAxisId="right" type="monotone" dataKey="wickets" stroke="#EC4899" strokeWidth={2} dot={{ fill: "#EC4899", r: 3 }} name="Wickets" />
            </ComposedChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Shot & Breakdown section */}
      <h3 className="text-lg font-semibold text-white mt-2">Shot & Bowling Breakdown</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Dismissal distribution */}
        <ChartCard title="Dismissal Distribution">
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={dismissals} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" nameKey="name" paddingAngle={3}>
                {dismissals.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle.contentStyle} />
              <Legend wrapperStyle={{ fontSize: 10, color: "#9CA3AF" }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Boundary Percentage */}
        <ChartCard title="Boundary Percentage">
          <div className="flex flex-col items-center justify-center h-[200px] gap-3">
            <div className="relative w-32 h-32">
              <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                <circle cx="60" cy="60" r="50" fill="none" stroke="#1F2937" strokeWidth="12" />
                <circle
                  cx="60" cy="60" r="50" fill="none"
                  stroke="#00D4AA" strokeWidth="12"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 50}`}
                  strokeDashoffset={`${2 * Math.PI * 50 * (1 - boundaryPct / 100)}`}
                  style={{ transition: "stroke-dashoffset 1s ease" }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-xl font-bold text-[#00D4AA] stat-mono">{boundaryPct.toFixed(1)}%</p>
              </div>
            </div>
            <p className="text-xs text-[#6B7280]">of balls hit for boundaries</p>
          </div>
        </ChartCard>

        {/* Wicket type / dismissal breakdown horizontal bar */}
        <ChartCard title="Dismissal Type Breakdown">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart layout="vertical" data={dismissals.slice(0, 6)} margin={{ left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" horizontal={false} />
              <XAxis type="number" tick={{ fill: "#6B7280", fontSize: 10 }} tickLine={false} axisLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fill: "#9CA3AF", fontSize: 10 }} tickLine={false} axisLine={false} width={60} />
              <Tooltip contentStyle={tooltipStyle.contentStyle} />
              <Bar dataKey="value" radius={[0, 3, 3, 0]} fill="#F59E0B" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Performance Heatmap */}
      <div className="rounded-xl border border-[#1F2937] bg-[#111827] p-5">
        <p className="text-sm font-medium text-white mb-4">Performance Heatmap</p>
        <p className="text-xs text-[#6B7280] mb-4">Each cell = a match day, colored by runs scored</p>
        <div className="flex flex-wrap gap-1.5">
          {heatmap.map((h, i) => (
            <div
              key={i}
              title={`${h.date}: ${h.runs} runs (${h.result})`}
              className="w-5 h-5 rounded-sm cursor-pointer hover:ring-1 hover:ring-white transition-all"
              style={{ background: heatColor(h.runs) }}
            />
          ))}
        </div>
        <div className="flex items-center gap-3 mt-3">
          <span className="text-xs text-[#6B7280]">Less</span>
          {[0, 15, 35, 55, 80].map((r) => (
            <div key={r} className="w-4 h-4 rounded-sm" style={{ background: heatColor(r) }} />
          ))}
          <span className="text-xs text-[#6B7280]">More</span>
        </div>
      </div>
    </div>
  );
}
