"use client";

import {
  CircleDot,
  Film,
  ScanLine,
  Search,
  Users,
} from "lucide-react";
import { FadeIn, SectionHeading, SpotlightCard } from "./primitives";

const roadmap = [
  {
    icon: CircleDot,
    title: "Ball-by-Ball Analytics",
    desc: "Wagon wheels, pitch maps, and phase analysis from full ball-by-ball scoring.",
    eta: "Q3 2026",
  },
  {
    icon: Film,
    title: "Video Analysis",
    desc: "Upload match footage and get AI-tagged highlights of every shot and delivery.",
    eta: "Q4 2026",
  },
  {
    icon: ScanLine,
    title: "Shot Classification",
    desc: "Computer vision identifies your shot types and maps productivity by region.",
    eta: "Q4 2026",
  },
  {
    icon: Users,
    title: "Team Analytics",
    desc: "Squad dashboards for clubs and academies — selection backed by data.",
    eta: "2027",
  },
  {
    icon: Search,
    title: "AI Scouting Reports",
    desc: "Shareable, verified player profiles for trials, selection, and recruitment.",
    eta: "2027",
  },
];

export function Roadmap() {
  return (
    <section className="border-t border-white/[0.06] px-6 py-24 sm:py-32">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          kicker="Roadmap"
          title="Where CricketIQ is headed"
          sub="We're building the full intelligence stack for cricket — from grassroots scorecards to computer-vision scouting."
        />
        <div className="mt-16 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {roadmap.map((r, i) => (
            <FadeIn key={r.title} delay={(i % 3) * 0.08}>
              <SpotlightCard className="h-full">
                <div className="flex h-full flex-col p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04]">
                      <r.icon className="h-[18px] w-[18px] text-emerald-400" />
                    </div>
                    <span className="rounded-full border border-emerald-500/25 bg-emerald-500/[0.07] px-2.5 py-1 font-mono text-[10px] font-medium uppercase tracking-wider text-emerald-400">
                      {r.eta}
                    </span>
                  </div>
                  <h3 className="mt-4 font-semibold text-white">{r.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                    {r.desc}
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
