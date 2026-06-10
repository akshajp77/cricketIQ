"use client";

import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { FadeIn, SectionHeading } from "./primitives";

const included = [
  "Unlimited match tracking",
  "CricketIQ Rating & full analytics",
  "AI coaching reports",
  "Batting, bowling & fielding breakdowns",
];

export function Pricing() {
  return (
    <section
      id="pricing"
      className="scroll-mt-20 border-t border-white/[0.06] px-6 py-24 sm:py-32"
    >
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          kicker="Pricing"
          title="Free while we're in early access"
          sub="Every feature, every insight — free for early players. Pro plans for academies and teams arrive with team analytics."
        />
        <FadeIn delay={0.15} className="mt-12">
          <div className="relative mx-auto max-w-2xl overflow-hidden rounded-2xl border border-emerald-500/25 bg-gradient-to-b from-emerald-500/[0.07] to-white/[0.02] p-8 sm:p-10">
            <div className="pointer-events-none absolute -top-20 left-1/2 h-56 w-56 -translate-x-1/2 rounded-full bg-emerald-500/15 blur-3xl" />
            <div className="relative flex flex-col items-center text-center">
              <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-emerald-400">
                Early Access
              </span>
              <p className="mt-5 font-mono text-5xl font-bold text-white">
                $0
                <span className="ml-1 text-base font-medium text-zinc-500">
                  / forever for early users
                </span>
              </p>
              <ul className="mt-7 grid grid-cols-1 gap-x-8 gap-y-3 text-left sm:grid-cols-2">
                {included.map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-zinc-300">
                    <Check className="h-4 w-4 shrink-0 text-emerald-400" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/auth/signup"
                className="group mt-8 flex items-center gap-2 rounded-xl bg-emerald-500 px-7 py-3.5 text-sm font-semibold text-black shadow-lg shadow-emerald-500/30 transition-all hover:bg-emerald-400"
              >
                Claim Early Access
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
