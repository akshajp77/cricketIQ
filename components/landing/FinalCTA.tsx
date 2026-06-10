"use client";

import Link from "next/link";
import { ArrowRight, Play } from "lucide-react";
import { FadeIn } from "./primitives";

export function FinalCTA() {
  return (
    <section className="px-6 py-24 sm:py-32">
      <FadeIn>
        <div className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl border border-emerald-500/20 bg-[#0a0c10] p-12 text-center sm:p-20">
          {/* layered glows */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.18),transparent_55%)]" />
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.15]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)",
              backgroundSize: "48px 48px",
              maskImage:
                "radial-gradient(ellipse at center, black 30%, transparent 75%)",
              WebkitMaskImage:
                "radial-gradient(ellipse at center, black 30%, transparent 75%)",
            }}
          />
          <div className="relative">
            <h2 className="text-balance text-3xl font-bold tracking-tight text-white sm:text-5xl">
              Ready to elevate your game?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-balance text-zinc-400 sm:text-lg">
              Start tracking your cricket performance today and unlock
              AI-powered insights after your very first match.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/auth/signup"
                className="group flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-8 py-4 text-[15px] font-semibold text-black shadow-[0_8px_30px_rgba(16,185,129,0.35)] transition-all hover:bg-emerald-400 sm:w-auto"
              >
                Start Tracking
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <a
                href="#analytics"
                className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-white/[0.12] bg-white/[0.03] px-8 py-4 text-[15px] font-semibold text-zinc-200 transition-all hover:border-white/25 hover:bg-white/[0.06] sm:w-auto"
              >
                <Play className="h-3.5 w-3.5 fill-current" />
                Watch Demo
              </a>
            </div>
            <p className="mt-6 text-xs text-zinc-600">
              Free during early access · Set up in under two minutes
            </p>
          </div>
        </div>
      </FadeIn>
    </section>
  );
}
