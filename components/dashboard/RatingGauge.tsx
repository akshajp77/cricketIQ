"use client";

import { RadialBarChart, RadialBar, ResponsiveContainer } from "recharts";
import { useCountUp } from "@/hooks/useCountUp";
import { getRatingLabel, getRatingColor } from "@/lib/rating";
import type { RatingBreakdown } from "@/lib/rating";

interface RatingGaugeProps {
  breakdown: RatingBreakdown;
}

export function RatingGauge({ breakdown }: RatingGaugeProps) {
  const animatedTotal = useCountUp(breakdown.total, 1800, 1);
  const color = getRatingColor(breakdown.total);
  const label = getRatingLabel(breakdown.total);

  const data = [{ name: "Rating", value: breakdown.total, fill: color }];

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-44 h-44">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            cx="50%"
            cy="50%"
            innerRadius="70%"
            outerRadius="95%"
            startAngle={220}
            endAngle={-40}
            data={[{ value: 100, fill: "#1F2937" }, ...data]}
          >
            <RadialBar dataKey="value" background={false} cornerRadius={8} />
          </RadialBarChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold stat-mono" style={{ color }}>{animatedTotal.toFixed(1)}</span>
          <span className="text-xs text-[#6B7280] mt-0.5">{label}</span>
        </div>
      </div>

      {/* Breakdown */}
      <div className="w-full space-y-2 mt-4">
        {[
          { label: "Batting", value: breakdown.batting, max: 40, color: "#00D4AA" },
          { label: "Bowling", value: breakdown.bowling, max: 35, color: "#F59E0B" },
          { label: "Fielding", value: breakdown.fielding, max: 10, color: "#8B5CF6" },
          { label: "Form", value: breakdown.form, max: 15, color: "#EC4899" },
        ].map((item) => (
          <div key={item.label}>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-[#6B7280]">{item.label}</span>
              <span className="font-mono font-semibold" style={{ color: item.color }}>
                {item.value.toFixed(1)} / {item.max}
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-[#1F2937] overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-1000"
                style={{ width: `${(item.value / item.max) * 100}%`, background: item.color }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
