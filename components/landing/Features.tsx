"use client";

import {
  Brain,
  ClipboardList,
  LineChart,
  Sprout,
  TrendingUp,
  Trophy,
} from "lucide-react";
import { FadeIn, SectionHeading, SpotlightCard } from "./primitives";

const features = [
  {
    icon: LineChart,
    title: "Performance Analytics",
    desc: "Interactive charts and breakdowns across batting, bowling, and fielding reveal the patterns behind every score.",
  },
  {
    icon: Brain,
    title: "AI Coaching",
    desc: "An AI coach reads your match data and returns personalised strengths, weaknesses, and a training plan.",
  },
  {
    icon: ClipboardList,
    title: "Match Tracking",
    desc: "Log every innings in a fast, guided flow — runs, wickets, economy, dismissals, and fielding contributions.",
  },
  {
    icon: Sprout,
    title: "Player Development",
    desc: "Structured improvement areas and weekly focus goals turn raw insight into deliberate practice.",
  },
  {
    icon: TrendingUp,
    title: "Trend Detection",
    desc: "Form curves and rolling averages surface slumps and purple patches before they show up on the scoreboard.",
  },
  {
    icon: Trophy,
    title: "Career Progress",
    desc: "Your CricketIQ Rating tracks all-round progress season over season, in one honest number out of 100.",
  },
];

export function Features() {
  return (
    <section id="features" className="scroll-mt-20 px-6 py-24 sm:py-32">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          kicker="Features"
          title="Everything serious cricketers need to improve"
          sub="One platform for tracking, analysis, and coaching — built for players who treat their game like professionals do."
        />
        <div className="mt-16 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <FadeIn key={f.title} delay={(i % 3) * 0.08}>
              <SpotlightCard className="h-full">
                <div className="p-7">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10 transition-transform duration-300 group-hover:scale-110">
                    <f.icon className="h-5 w-5 text-emerald-400" />
                  </div>
                  <h3 className="mt-5 text-lg font-semibold text-white">
                    {f.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                    {f.desc}
                  </p>
                </div>
              </SpotlightCard>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
