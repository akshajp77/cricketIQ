"use client";

import { Brain, ClipboardList, Rocket } from "lucide-react";
import { FadeIn, SectionHeading } from "./primitives";

const steps = [
  {
    n: "01",
    icon: ClipboardList,
    title: "Record Matches",
    desc: "Log batting, bowling, and fielding in a guided two-minute flow after every game — no spreadsheets.",
  },
  {
    n: "02",
    icon: Brain,
    title: "Analyze Performance",
    desc: "CricketIQ computes your rating, trends, and breakdowns the moment your scorecard is in.",
  },
  {
    n: "03",
    icon: Rocket,
    title: "Improve Faster",
    desc: "Your AI coach turns the data into weekly focus areas and match strategy, so practice has purpose.",
  },
];

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="scroll-mt-20 border-t border-white/[0.06] px-6 py-24 sm:py-32"
    >
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          kicker="How It Works"
          title="From scorecard to game plan in three steps"
        />
        <div className="relative mt-16 grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-8">
          {/* connector line */}
          <div className="pointer-events-none absolute left-0 right-0 top-7 hidden h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent md:block" />
          {steps.map((s, i) => (
            <FadeIn key={s.n} delay={i * 0.12} className="relative">
              <div className="relative z-10 flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-500/25 bg-[#0a0c10] shadow-[0_0_30px_rgba(16,185,129,0.15)]">
                <s.icon className="h-6 w-6 text-emerald-400" />
              </div>
              <span className="absolute right-0 top-0 font-mono text-5xl font-bold text-white/[0.05]">
                {s.n}
              </span>
              <h3 className="mt-6 text-xl font-semibold text-white">{s.title}</h3>
              <p className="mt-2.5 text-sm leading-relaxed text-zinc-400">
                {s.desc}
              </p>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
