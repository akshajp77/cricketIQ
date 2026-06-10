"use client";

import { Counter, FadeIn } from "./primitives";
import { metrics } from "./data";

export function Metrics() {
  return (
    <section className="border-y border-white/[0.06] bg-white/[0.015] px-6 py-16">
      <div className="mx-auto max-w-6xl">
        <FadeIn>
          <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-zinc-600">
            Trusted by players and academies across the world
          </p>
        </FadeIn>
        <div className="mt-10 grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-4">
          {metrics.map((m, i) => (
            <FadeIn key={m.label} delay={i * 0.08} className="text-center">
              <p className="font-mono text-3xl font-bold text-white sm:text-4xl">
                <Counter to={m.value} suffix={m.suffix} />
              </p>
              <p className="mt-2 text-sm text-zinc-500">{m.label}</p>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
