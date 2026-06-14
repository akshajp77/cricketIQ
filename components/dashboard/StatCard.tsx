"use client";

import { useCountUp } from "@/hooks/useCountUp";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { ReactNode } from "react";

interface StatCardProps {
  title: string;
  value: number;
  decimals?: number;
  suffix?: string;
  prefix?: string;
  icon: ReactNode;
  iconColor?: string;
  sparklineData?: Array<{ v: number }>;
  trend?: { label: string; direction: "up" | "down" | "stable" };
  subStats?: Array<{ label: string; value: string | number }>;
}

function Sparkline({ data, color }: { data: Array<{ v: number }>; color: string }) {
  const W = 120;
  const H = 32;
  const values = data.map((d) => d.v);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const pts = values.map((v, i) => ({
    x: (i / Math.max(values.length - 1, 1)) * W,
    y: 3 + (H - 6) * (1 - (v - min) / span),
  }));
  const d = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");
  const last = pts[pts.length - 1];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-8 w-full" preserveAspectRatio="none">
      <path d={d} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
      {last && <circle cx={last.x} cy={last.y} r="2.5" fill={color} />}
    </svg>
  );
}

export function StatCard({
  title,
  value,
  decimals = 0,
  suffix,
  prefix,
  icon,
  iconColor = "#10B981",
  sparklineData,
  trend,
  subStats,
}: StatCardProps) {
  const animated = useCountUp(value, 1500, decimals);
  const TrendIcon =
    trend?.direction === "up"
      ? TrendingUp
      : trend?.direction === "down"
        ? TrendingDown
        : Minus;

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-xl border border-hairline bg-surface p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-hairline-strong hover:shadow-[0_8px_30px_-12px_rgba(0,0,0,0.6)]">
      <div
        className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{ background: `radial-gradient(circle, ${iconColor}14 0%, transparent 70%)` }}
      />

      <div className="mb-3 flex items-start justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-muted">
            {title}
          </p>
          <p className="stat-mono mt-1.5 text-[26px] font-bold leading-none tabular-nums text-white">
            {prefix}
            {decimals > 0 ? animated.toFixed(decimals) : Math.round(animated)}
            {suffix}
          </p>
        </div>
        <div
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg"
          style={{ background: `${iconColor}14`, border: `1px solid ${iconColor}26` }}
        >
          {icon}
        </div>
      </div>

      {sparklineData && sparklineData.length > 1 && (
        <div className="my-2">
          <Sparkline data={sparklineData} color={iconColor} />
        </div>
      )}

      <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1.5 pt-3">
        {subStats?.map((s) => (
          <div key={s.label} className="flex items-baseline gap-1">
            <span className="text-[11px] text-ink-muted">{s.label}</span>
            <span className="stat-mono text-xs font-semibold text-[#D7DCE4]">{s.value}</span>
          </div>
        ))}
        {trend && (
          <span
            className={cn(
              "ml-auto inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium",
              {
                "bg-emerald-500/10 text-emerald-400": trend.direction === "up",
                "bg-red-500/10 text-red-400": trend.direction === "down",
                "bg-amber-500/10 text-amber-400": trend.direction === "stable",
              }
            )}
          >
            <TrendIcon className="h-3 w-3" />
            {trend.label}
          </span>
        )}
      </div>
    </div>
  );
}
