"use client";

import { motion, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";

// ── FadeIn: viewport-triggered entrance used across every section ────────────

export function FadeIn({
  children,
  delay = 0,
  y = 24,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ── Section heading with kicker ──────────────────────────────────────────────

export function SectionHeading({
  kicker,
  title,
  sub,
  align = "center",
}: {
  kicker: string;
  title: React.ReactNode;
  sub?: string;
  align?: "center" | "left";
}) {
  const centered = align === "center";
  return (
    <FadeIn className={centered ? "text-center" : ""}>
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">
        {kicker}
      </p>
      <h2
        className={`mt-3 text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white text-balance ${
          centered ? "mx-auto max-w-3xl" : "max-w-2xl"
        }`}
      >
        {title}
      </h2>
      {sub && (
        <p
          className={`mt-4 text-base sm:text-lg text-zinc-400 leading-relaxed ${
            centered ? "mx-auto max-w-2xl" : "max-w-xl"
          }`}
        >
          {sub}
        </p>
      )}
    </FadeIn>
  );
}

// ── SpotlightCard: cursor-tracking radial highlight ──────────────────────────

export function SpotlightCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: -200, y: -200 });
  const [hovering, setHovering] = useState(false);

  return (
    <div
      ref={ref}
      onMouseMove={(e) => {
        const r = ref.current?.getBoundingClientRect();
        if (r) setPos({ x: e.clientX - r.left, y: e.clientY - r.top });
      }}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      className={`group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03] transition-colors duration-300 hover:border-emerald-500/30 ${className}`}
    >
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-300"
        style={{
          opacity: hovering ? 1 : 0,
          background: `radial-gradient(280px circle at ${pos.x}px ${pos.y}px, rgba(16,185,129,0.10), transparent 70%)`,
        }}
      />
      <div className="relative">{children}</div>
    </div>
  );
}

// ── Counter: eased count-up for the metrics band ─────────────────────────────

export function Counter({
  to,
  suffix = "",
  duration = 1600,
}: {
  to: number;
  suffix?: string;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const [val, setVal] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let raf: number;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 4);
      setVal(Math.round(to * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, to, duration]);

  return (
    <span ref={ref} className="tabular-nums">
      {val.toLocaleString()}
      {suffix}
    </span>
  );
}
