"use client";

import { useCountUp } from "@/hooks/useCountUp";
import { cn } from "@/lib/utils";
import { LineChart, Line, ResponsiveContainer, Tooltip } from "recharts";
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

export function StatCard({
  title,
  value,
  decimals = 0,
  suffix,
  prefix,
  icon,
  iconColor = "#00D4AA",
  sparklineData,
  trend,
  subStats,
}: StatCardProps) {
  const animated = useCountUp(value, 1500, decimals);

  return (
    <div className="relative overflow-hidden rounded-xl border border-[#1F2937] bg-[#111827] p-5 hover:border-[#00D4AA]/30 transition-all duration-300 group">
      <div
        className="absolute -top-8 -right-8 w-24 h-24 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ background: `radial-gradient(circle, ${iconColor}15 0%, transparent 70%)` }}
      />

      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-xs text-[#6B7280] font-medium uppercase tracking-wider">{title}</p>
          <p className="text-2xl font-bold text-white mt-1 stat-mono">
            {prefix}{decimals > 0 ? animated.toFixed(decimals) : Math.round(animated)}{suffix}
          </p>
        </div>
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: `${iconColor}20` }}
        >
          {icon}
        </div>
      </div>

      {sparklineData && sparklineData.length > 0 && (
        <div className="h-10 mt-2 mb-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={sparklineData}>
              <Line
                type="monotone"
                dataKey="v"
                stroke={iconColor}
                strokeWidth={1.5}
                dot={false}
                isAnimationActive={false}
              />
              <Tooltip
                contentStyle={{ background: "#0A0F1E", border: "1px solid #1F2937", borderRadius: "6px", fontSize: "11px" }}
                labelFormatter={() => ""}
                formatter={(v) => [(v as number).toFixed(decimals), title]}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {subStats && subStats.length > 0 && (
        <div className="flex gap-3 mt-2 flex-wrap">
          {subStats.map((s) => (
            <div key={s.label} className="flex items-center gap-1">
              <span className="text-xs text-[#6B7280]">{s.label}:</span>
              <span className="text-xs font-semibold text-[#F9FAFB] stat-mono">{s.value}</span>
            </div>
          ))}
        </div>
      )}

      {trend && (
        <div className={cn("mt-2 inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full", {
          "bg-emerald-500/15 text-emerald-400": trend.direction === "up",
          "bg-red-500/15 text-red-400": trend.direction === "down",
          "bg-amber-500/15 text-amber-400": trend.direction === "stable",
        })}>
          {trend.label}
        </div>
      )}
    </div>
  );
}
