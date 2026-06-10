"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Crosshair, Hand, Target } from "lucide-react";
import { FadeIn, SectionHeading } from "./primitives";
import { areaPath, scalePoints, smoothPath } from "./chart-utils";
import {
  averageProgression,
  economyTrend,
  fieldingStats,
  runProgression,
  strikeRateProgression,
  wicketsPerMatch,
} from "./data";

const W = 480;
const H = 180;

// ── Chart pieces ──────────────────────────────────────────────────────────────

function AreaChart({
  values,
  color = "#10b981",
  id,
}: {
  values: number[];
  color?: string;
  id: string;
}) {
  const pts = useMemo(() => scalePoints(values, W, H, 14), [values]);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0.33, 0.66].map((f) => (
        <line
          key={f}
          x1="0"
          x2={W}
          y1={H * f}
          y2={H * f}
          stroke="rgba(255,255,255,0.05)"
        />
      ))}
      <motion.path
        d={areaPath(pts, H)}
        fill={`url(#${id})`}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.9, delay: 0.5 }}
      />
      <motion.path
        d={smoothPath(pts)}
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.4, ease: "easeInOut" }}
      />
      {pts.map((p, i) => (
        <motion.circle
          key={i}
          cx={p.x}
          cy={p.y}
          r="3"
          fill="#0a0c10"
          stroke={color}
          strokeWidth="2"
          initial={{ opacity: 0, scale: 0 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.3, delay: 0.4 + i * 0.06 }}
        />
      ))}
    </svg>
  );
}

function BarsWithLine({
  bars,
  line,
  barColor = "rgba(16,185,129,0.55)",
  lineColor = "#fbbf24",
}: {
  bars: number[];
  line: number[];
  barColor?: string;
  lineColor?: string;
}) {
  const maxBar = Math.max(...bars);
  const barW = (W - 28) / bars.length;
  const linePts = useMemo(() => scalePoints(line, W, H, 22), [line]);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" preserveAspectRatio="none">
      {[0.33, 0.66].map((f) => (
        <line
          key={f}
          x1="0"
          x2={W}
          y1={H * f}
          y2={H * f}
          stroke="rgba(255,255,255,0.05)"
        />
      ))}
      {bars.map((v, i) => {
        const h = Math.max((v / maxBar) * (H - 36), 4);
        return (
          <motion.rect
            key={i}
            x={14 + i * barW + barW * 0.22}
            width={barW * 0.56}
            rx="3"
            fill={barColor}
            initial={{ height: 0, y: H - 8 }}
            whileInView={{ height: h, y: H - 8 - h }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: i * 0.05, ease: "easeOut" }}
          />
        );
      })}
      <motion.path
        d={smoothPath(linePts)}
        fill="none"
        stroke={lineColor}
        strokeWidth="2"
        strokeDasharray="5 4"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.4, delay: 0.4, ease: "easeInOut" }}
      />
    </svg>
  );
}

function ContributionGauge() {
  const score = fieldingStats.contributionScore; // out of 10
  return (
    <div className="relative mx-auto h-[140px] w-[140px]">
      <svg viewBox="0 0 140 140" className="h-full w-full -rotate-90">
        <circle
          cx="70"
          cy="70"
          r="58"
          fill="none"
          stroke="rgba(255,255,255,0.07)"
          strokeWidth="10"
        />
        <motion.circle
          cx="70"
          cy="70"
          r="58"
          fill="none"
          stroke="#10b981"
          strokeWidth="10"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: score / 10 }}
          viewport={{ once: true }}
          transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-mono text-3xl font-bold text-white">{score}</span>
        <span className="text-[10px] uppercase tracking-wider text-zinc-500">
          / 10 impact
        </span>
      </div>
    </div>
  );
}

// ── Layout pieces ─────────────────────────────────────────────────────────────

function ChartPanel({
  title,
  meta,
  children,
}: {
  title: string;
  meta: string;
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0a0c10] shadow-[0_24px_80px_-24px_rgba(0,0,0,0.8)]">
      <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-3.5">
        <span className="text-sm font-semibold text-white">{title}</span>
        <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-600">
          {meta}
        </span>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function MiniStat({
  label,
  value,
  trend,
}: {
  label: string;
  value: string;
  trend: string;
}) {
  return (
    <div className="rounded-xl border border-white/[0.07] bg-white/[0.03] px-4 py-3">
      <p className="text-[11px] text-zinc-500">{label}</p>
      <div className="mt-1 flex items-baseline gap-2">
        <span className="font-mono text-lg font-bold text-white">{value}</span>
        <span className="font-mono text-[11px] text-emerald-400">{trend}</span>
      </div>
    </div>
  );
}

function Block({
  reversed = false,
  icon: Icon,
  kicker,
  title,
  desc,
  bullets,
  chart,
}: {
  reversed?: boolean;
  icon: React.ElementType;
  kicker: string;
  title: string;
  desc: string;
  bullets: string[];
  chart: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16">
      <FadeIn className={reversed ? "lg:order-2" : ""}>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10">
          <Icon className="h-5 w-5 text-emerald-400" />
        </div>
        <p className="mt-5 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">
          {kicker}
        </p>
        <h3 className="mt-3 text-2xl font-bold tracking-tight text-white sm:text-3xl">
          {title}
        </h3>
        <p className="mt-4 leading-relaxed text-zinc-400">{desc}</p>
        <ul className="mt-6 space-y-3">
          {bullets.map((b) => (
            <li key={b} className="flex items-center gap-3 text-sm text-zinc-300">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
              {b}
            </li>
          ))}
        </ul>
      </FadeIn>
      <FadeIn delay={0.15} className={reversed ? "lg:order-1" : ""}>
        {chart}
      </FadeIn>
    </div>
  );
}

// ── Section ───────────────────────────────────────────────────────────────────

export function DeepDive() {
  return (
    <section
      id="analytics"
      className="scroll-mt-20 border-t border-white/[0.06] px-6 py-24 sm:py-32"
    >
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          kicker="Product Deep Dive"
          title="Pro-grade analytics for every part of your game"
          sub="The same depth of analysis professional teams rely on — batting, bowling, and fielding — built for club cricket."
        />

        <div className="mt-20 space-y-24 sm:space-y-32">
          <Block
            icon={Target}
            kicker="Batting Analytics"
            title="Watch your batting curve bend upward"
            desc="Run progression, rolling average, and strike-rate trends across every innings — see exactly when your form turned and what changed."
            bullets={[
              "Run progression, match by match",
              "Rolling average across the season",
              "Strike-rate trends by phase of innings",
            ]}
            chart={
              <div className="space-y-4">
                <ChartPanel title="Run Progression" meta="Last 10 innings">
                  <AreaChart values={runProgression} id="runsFill" />
                </ChartPanel>
                <div className="grid grid-cols-2 gap-4">
                  <MiniStat
                    label="Average"
                    value={`${averageProgression[averageProgression.length - 1]}`}
                    trend="+28.4"
                  />
                  <MiniStat
                    label="Strike Rate"
                    value={`${strikeRateProgression[strikeRateProgression.length - 1]}`}
                    trend="+32"
                  />
                </div>
              </div>
            }
          />

          <Block
            reversed
            icon={Crosshair}
            kicker="Bowling Analytics"
            title="Wickets are a pattern, not luck"
            desc="Wicket hauls plotted against your economy trend show whether you're attacking effectively or leaking runs — and which spells did the damage."
            bullets={[
              "Wickets per match, visualised",
              "Economy rate trend over the season",
              "Bowling impact metrics per spell",
            ]}
            chart={
              <div className="space-y-4">
                <ChartPanel title="Wickets vs Economy" meta="Last 10 matches">
                  <BarsWithLine bars={wicketsPerMatch} line={economyTrend} />
                  <div className="mt-3 flex items-center gap-5 text-[11px] text-zinc-500">
                    <span className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-sm bg-emerald-500/70" />
                      Wickets
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="h-0.5 w-4 rounded bg-amber-400" />
                      Economy
                    </span>
                  </div>
                </ChartPanel>
                <div className="grid grid-cols-2 gap-4">
                  <MiniStat label="Economy" value="6.1" trend="-1.7" />
                  <MiniStat label="Best Figures" value="5/24" trend="career best" />
                </div>
              </div>
            }
          />

          <Block
            icon={Hand}
            kicker="Fielding Analytics"
            title="The third discipline, finally measured"
            desc="Catches, run-outs, and a fielding contribution score quantify the part of your game most scorecards ignore."
            bullets={[
              "Catches and run-outs tracked per match",
              "Fielding contribution score out of 10",
              "Counts toward your CricketIQ Rating",
            ]}
            chart={
              <ChartPanel title="Fielding Contribution" meta="This season">
                <div className="grid grid-cols-2 items-center gap-6">
                  <ContributionGauge />
                  <div className="space-y-4">
                    <MiniStat
                      label="Catches"
                      value={`${fieldingStats.catches}`}
                      trend="+9"
                    />
                    <MiniStat
                      label="Run-outs"
                      value={`${fieldingStats.runOuts}`}
                      trend="+4"
                    />
                  </div>
                </div>
              </ChartPanel>
            }
          />
        </div>
      </div>
    </section>
  );
}
