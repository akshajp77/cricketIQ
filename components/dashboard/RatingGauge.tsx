"use client";

import { useCountUp } from "@/hooks/useCountUp";
import { getRatingLabel, getRatingColor } from "@/lib/rating";
import type { RatingBreakdown } from "@/lib/rating";

interface RatingGaugeProps {
  breakdown: RatingBreakdown;
}

const SEGMENTS = [
  { key: "batting", label: "Batting", max: 40, color: "#10B981" },
  { key: "bowling", label: "Bowling", max: 35, color: "#F59E0B" },
  { key: "fielding", label: "Fielding", max: 10, color: "#38BDF8" },
  { key: "form", label: "Form", max: 15, color: "#A78BFA" },
] as const;

export function RatingGauge({ breakdown }: RatingGaugeProps) {
  const animatedTotal = useCountUp(breakdown.total, 1800, 1);
  const color = getRatingColor(breakdown.total);
  const label = getRatingLabel(breakdown.total);

  // 270° arc gauge
  const R = 52;
  const C = 2 * Math.PI * R;
  const arcFraction = 0.75;
  const arcLen = C * arcFraction;
  const filled = arcLen * Math.min(breakdown.total, 100) / 100;

  return (
    <div className="flex flex-col items-center">
      <div className="relative h-40 w-40">
        <svg viewBox="0 0 120 120" className="h-full w-full rotate-[135deg]">
          <circle
            cx="60"
            cy="60"
            r={R}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="9"
            strokeLinecap="round"
            strokeDasharray={`${arcLen} ${C}`}
          />
          <circle
            cx="60"
            cy="60"
            r={R}
            fill="none"
            stroke={color}
            strokeWidth="9"
            strokeLinecap="round"
            strokeDasharray={`${filled} ${C}`}
            style={{ transition: "stroke-dasharray 1.4s cubic-bezier(0.22, 1, 0.36, 1)" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="stat-mono text-[34px] font-bold leading-none tabular-nums" style={{ color }}>
            {animatedTotal.toFixed(1)}
          </span>
          <span className="mt-1.5 rounded-full border border-hairline bg-white/[0.03] px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-ink-secondary">
            {label}
          </span>
        </div>
      </div>

      {/* Breakdown */}
      <div className="mt-5 w-full space-y-2.5">
        {SEGMENTS.map((item) => {
          const value = breakdown[item.key];
          return (
            <div key={item.label}>
              <div className="mb-1 flex items-baseline justify-between text-xs">
                <span className="text-ink-secondary">{item.label}</span>
                <span className="font-mono tabular-nums text-[#D7DCE4]">
                  {value.toFixed(1)}
                  <span className="text-ink-faint"> / {item.max}</span>
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.05]">
                <div
                  className="h-full rounded-full transition-[width] duration-1000 ease-out"
                  style={{ width: `${(value / item.max) * 100}%`, background: item.color }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
