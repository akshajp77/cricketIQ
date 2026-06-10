"use client";

import {
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  FileText,
  Shield,
  Sparkles,
  Swords,
  TrendingUp,
} from "lucide-react";
import { FadeIn, SectionHeading } from "./primitives";

const improvementAreas = [
  { label: "Strike rate vs spin", current: 64, note: "Priority" },
  { label: "Powerplay scoring", current: 72, note: "Improving" },
  { label: "Strike rotation, overs 7–15", current: 78, note: "On track" },
];

const strategy = [
  {
    icon: Swords,
    title: "Against pace-heavy attacks",
    text: "Take the attacking option early — your control percentage vs pace is elite (91%). Target square boundaries.",
  },
  {
    icon: Shield,
    title: "When spin comes on",
    text: "Use the sweep and reverse-sweep to disrupt length. Aim for 5+ singles per over instead of forcing boundaries.",
  },
];

export function AICoachShowcase() {
  return (
    <section
      id="ai-coach"
      className="scroll-mt-20 border-t border-white/[0.06] px-6 py-24 sm:py-32"
    >
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          kicker="AI Coach"
          title="A coach that has watched every ball you've faced"
          sub="After every match, CricketIQ's AI reads your full history and produces a personalised report — strengths, gaps, and a concrete plan."
        />

        <FadeIn delay={0.15} className="mt-16">
          <div className="relative">
            {/* glow */}
            <div className="pointer-events-none absolute -inset-x-8 -bottom-16 top-1/2 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.12),transparent_65%)] blur-2xl" />

            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0a0c10] shadow-[0_40px_120px_-30px_rgba(0,0,0,0.8)]">
              {/* report header */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.07] px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-green-600">
                    <Sparkles className="h-[18px] w-[18px] text-black" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">
                      AI Coach Report — A. Sharma
                    </p>
                    <p className="text-[11px] text-zinc-500">
                      Generated from 42 matches · 2.3s
                    </p>
                  </div>
                </div>
                <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-[11px] font-medium text-emerald-400">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                  Analysis complete
                </span>
              </div>

              <div className="grid grid-cols-1 gap-px bg-white/[0.05] lg:grid-cols-5">
                {/* main column */}
                <div className="space-y-6 bg-[#0a0c10] p-6 lg:col-span-3">
                  {/* summary */}
                  <div>
                    <div className="mb-2.5 flex items-center gap-2">
                      <FileText className="h-3.5 w-3.5 text-zinc-500" />
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                        Player Summary
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed text-zinc-300">
                      An aggressive top-order batter in career-best form.
                      Rating has climbed{" "}
                      <span className="font-semibold text-emerald-400">
                        +34 points
                      </span>{" "}
                      over ten matches, driven by elite numbers against pace.
                      The clear ceiling on the next level:{" "}
                      <span className="font-semibold text-amber-400">
                        scoring speed against spin
                      </span>{" "}
                      in the middle overs.
                    </p>
                  </div>

                  {/* strengths / weaknesses */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.05] p-4">
                      <p className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-emerald-400">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Strengths
                      </p>
                      <ul className="space-y-2.5">
                        {[
                          "Excellent against pace bowling — SR 148",
                          "Death-over finishing, 9.2 RPO",
                        ].map((s) => (
                          <li key={s} className="text-xs leading-relaxed text-zinc-300">
                            {s}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="rounded-xl border border-amber-500/20 bg-amber-500/[0.05] p-4">
                      <p className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-amber-400">
                        <AlertTriangle className="h-3.5 w-3.5" /> Weaknesses
                      </p>
                      <ul className="space-y-2.5">
                        {[
                          "Strike rate drops to 96 against spin",
                          "Dot-ball pressure in overs 7–12",
                        ].map((s) => (
                          <li key={s} className="text-xs leading-relaxed text-zinc-300">
                            {s}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* improvement areas */}
                  <div>
                    <div className="mb-3 flex items-center gap-2">
                      <TrendingUp className="h-3.5 w-3.5 text-zinc-500" />
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                        Improvement Areas
                      </span>
                    </div>
                    <div className="space-y-3.5">
                      {improvementAreas.map((a) => (
                        <div key={a.label}>
                          <div className="mb-1.5 flex items-center justify-between text-xs">
                            <span className="text-zinc-300">{a.label}</span>
                            <span className="font-mono text-zinc-500">
                              {a.current}%{" "}
                              <span className="text-emerald-400">· {a.note}</span>
                            </span>
                          </div>
                          <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400"
                              style={{ width: `${a.current}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* strategy column */}
                <div className="space-y-4 bg-[#0a0c10] p-6 lg:col-span-2">
                  <div className="flex items-center gap-2">
                    <Swords className="h-3.5 w-3.5 text-zinc-500" />
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                      Match Strategy
                    </span>
                  </div>
                  {strategy.map((s) => (
                    <div
                      key={s.title}
                      className="rounded-xl border border-white/[0.07] bg-white/[0.03] p-4 transition-colors hover:border-emerald-500/25"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10">
                          <s.icon className="h-3.5 w-3.5 text-emerald-400" />
                        </div>
                        <p className="text-xs font-semibold text-white">{s.title}</p>
                      </div>
                      <p className="mt-2.5 text-xs leading-relaxed text-zinc-400">
                        {s.text}
                      </p>
                    </div>
                  ))}
                  <div className="rounded-xl border border-emerald-500/25 bg-gradient-to-b from-emerald-500/10 to-transparent p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-emerald-400">
                      This week&apos;s training plan
                    </p>
                    <ul className="mt-2.5 space-y-2">
                      {[
                        "3 × 20-min sweep-shot sessions vs spin",
                        "Strike-rotation drills: target 70% singles",
                        "Powerplay simulation, 2 × 6-over blocks",
                      ].map((t) => (
                        <li
                          key={t}
                          className="flex items-start gap-2 text-xs text-zinc-300"
                        >
                          <ChevronRight className="mt-0.5 h-3 w-3 shrink-0 text-emerald-400" />
                          {t}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
