"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Play, Sparkles } from "lucide-react";
import { HeroDashboard } from "./HeroDashboard";

const ease = [0.21, 0.47, 0.32, 0.98] as const;

export function Hero() {
  return (
    <section className="relative overflow-hidden px-6 pb-28 pt-32 sm:pt-40">
      {/* backdrop: grid + top glow */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          maskImage:
            "radial-gradient(ellipse 80% 60% at 50% 0%, black 40%, transparent 100%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 80% 60% at 50% 0%, black 40%, transparent 100%)",
        }}
      />
      <div className="pointer-events-none absolute left-1/2 top-[-220px] h-[480px] w-[800px] max-w-full -translate-x-1/2 rounded-full bg-emerald-500/[0.12] blur-[120px]" />

      <div className="relative mx-auto max-w-4xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease }}
          className="inline-flex items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-500/[0.08] px-4 py-1.5 text-xs font-medium text-emerald-300"
        >
          <Sparkles className="h-3.5 w-3.5" />
          AI-Powered Cricket Analytics
          <span className="hidden text-emerald-500/60 sm:inline">·</span>
          <span className="hidden text-emerald-400/80 sm:inline">
            Now in early access
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease }}
          className="mt-7 text-balance text-4xl font-bold leading-[1.04] tracking-tight text-white sm:text-6xl md:text-7xl"
        >
          Every match tells a story.
          <br />
          <span className="bg-gradient-to-r from-emerald-300 via-emerald-400 to-green-500 bg-clip-text text-transparent">
            Now you can read it.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease }}
          className="mx-auto mt-6 max-w-2xl text-balance text-base leading-relaxed text-zinc-400 sm:text-lg"
        >
          CricketIQ turns your scorecards into professional-grade analytics and
          AI coaching — so club players, academies, and coaches can see exactly
          what&apos;s working, what isn&apos;t, and what to train next.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3, ease }}
          className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <Link
            href="/auth/signup"
            className="group flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-8 py-4 text-[15px] font-semibold text-black shadow-[0_8px_30px_rgba(16,185,129,0.35)] transition-all hover:bg-emerald-400 hover:shadow-[0_8px_40px_rgba(16,185,129,0.5)] sm:w-auto"
          >
            Get Started
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <a
            href="#analytics"
            className="group flex w-full items-center justify-center gap-2.5 rounded-xl border border-white/[0.12] bg-white/[0.03] px-8 py-4 text-[15px] font-semibold text-zinc-200 transition-all hover:border-white/25 hover:bg-white/[0.06] hover:text-white sm:w-auto"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 transition-colors group-hover:bg-emerald-500/20">
              <Play className="h-3 w-3 fill-current" />
            </span>
            Watch Demo
          </a>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.45 }}
          className="mt-5 text-xs text-zinc-600"
        >
          Free during early access · No credit card required
        </motion.p>
      </div>

      <HeroDashboard />
    </section>
  );
}
