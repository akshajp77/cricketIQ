"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { SessionProvider, useSession } from "next-auth/react";
import {
  ClipboardList,
  Gauge,
  Sparkles,
  LineChart,
  ArrowRight,
  Trophy,
  Brain,
  Target,
  TrendingUp,
} from "lucide-react";

// ─── Scroll reveal hook ──────────────────────────────────────────────────────

function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          obs.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-700 ease-out ${
        shown ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      } ${className}`}
    >
      {children}
    </div>
  );
}

// ─── Landing ─────────────────────────────────────────────────────────────────

function Landing() {
  const router = useRouter();
  const { status } = useSession();
  const [scrolled, setScrolled] = useState(false);

  // Redirect signed-in users to their dashboard
  useEffect(() => {
    if (status === "authenticated") router.replace("/dashboard");
  }, [status, router]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="relative min-h-screen bg-[#0a0a0a] text-white overflow-x-hidden">
      {/* Faint dot-grid texture */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "radial-gradient(circle, #16a34a 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      {/* ── Navbar ── */}
      <nav
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
          scrolled
            ? "backdrop-blur-xl bg-black/50 border-b border-white/10"
            : "bg-transparent border-b border-transparent"
        }`}
      >
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <Trophy className="w-4 h-4 text-black" />
            </div>
            <span className="text-lg font-bold tracking-tight">CricketIQ</span>
          </Link>
          <Link
            href="/auth/signin"
            className="px-4 py-2 text-sm font-medium rounded-lg border border-white/15 text-white/80 hover:text-white hover:border-white/30 hover:bg-white/5 transition-all"
          >
            Sign In
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative min-h-screen flex items-center justify-center px-6 pt-16">
        {/* Animated gradient orb */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="w-[600px] h-[600px] max-w-[90vw] max-h-[90vw] rounded-full bg-gradient-to-br from-emerald-500/20 via-green-600/10 to-transparent blur-3xl animate-pulse-slow" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <Reveal>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-8 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-medium">
              <Sparkles className="w-3.5 h-3.5" />
              AI-Powered Cricket Analytics
            </div>
          </Reveal>

          <Reveal delay={100}>
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight leading-[1.05]">
              Know your game.
              <br />
              <span className="bg-gradient-to-r from-emerald-400 to-green-500 bg-clip-text text-transparent">
                Master your craft.
              </span>
            </h1>
          </Reveal>

          <Reveal delay={200}>
            <p className="mt-6 max-w-xl mx-auto text-base sm:text-lg text-white/50 leading-relaxed">
              Log every innings, get a CricketIQ Rating out of 100, and unlock
              AI coaching that turns your match data into a sharper game.
            </p>
          </Reveal>

          <Reveal delay={300}>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/auth/signup"
                className="group w-full sm:w-auto px-7 py-3.5 rounded-xl bg-emerald-500 text-black font-semibold shadow-lg shadow-emerald-500/30 hover:bg-emerald-400 hover:shadow-emerald-400/40 transition-all flex items-center justify-center gap-2"
              >
                Get Started Free
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <a
                href="#how-it-works"
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl border border-white/15 text-white/80 font-semibold hover:text-white hover:border-white/30 hover:bg-white/5 transition-all"
              >
                See How It Works
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Social proof line ── */}
      <section className="px-6 py-16 border-y border-white/5">
        <Reveal>
          <p className="max-w-3xl mx-auto text-center text-lg sm:text-xl text-white/40 font-light tracking-wide">
            Track every innings. Understand every match. Improve every season.
          </p>
        </Reveal>
      </section>

      {/* ── How It Works ── */}
      <section id="how-it-works" className="px-6 py-24 sm:py-32">
        <div className="max-w-6xl mx-auto">
          <Reveal>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-center">
              Three steps to better cricket.
            </h2>
          </Reveal>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                n: "01",
                icon: ClipboardList,
                title: "Log Your Match",
                desc: "Record batting, bowling, and fielding in a quick guided flow after every game.",
              },
              {
                n: "02",
                icon: Gauge,
                title: "Get Your CricketIQ Rating",
                desc: "A single 0–100 score distils your all-round performance into one honest number.",
              },
              {
                n: "03",
                icon: Brain,
                title: "Unlock AI Insights",
                desc: "Personalised coaching pinpoints your strengths, gaps, and what to train next.",
              },
            ].map((step, i) => (
              <Reveal key={step.n} delay={i * 120}>
                <div className="relative h-full rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-8 hover:border-emerald-500/30 hover:bg-white/[0.07] transition-all">
                  <span className="text-5xl font-bold bg-gradient-to-b from-white/20 to-white/5 bg-clip-text text-transparent">
                    {step.n}
                  </span>
                  <div className="mt-4 w-11 h-11 rounded-xl bg-emerald-500/15 flex items-center justify-center">
                    <step.icon className="w-5 h-5 text-emerald-400" />
                  </div>
                  <h3 className="mt-5 text-xl font-semibold">{step.title}</h3>
                  <p className="mt-2 text-sm text-white/50 leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="px-6 py-24 sm:py-32 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <Reveal>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-center max-w-3xl mx-auto">
              Everything you need to understand your game.
            </h2>
          </Reveal>

          <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[
              {
                icon: ClipboardList,
                color: "#16a34a",
                title: "Match Tracking",
                desc: "Detailed scorecards for every innings — runs, wickets, economy, and dismissals, all in one place.",
              },
              {
                icon: Gauge,
                color: "#16a34a",
                title: "CricketIQ Rating",
                desc: "A weighted 0–100 score across batting, bowling, fielding, and form that tracks your real progress.",
              },
              {
                icon: Sparkles,
                color: "#16a34a",
                title: "AI Coach",
                desc: "Gemini-powered analysis reads your data and returns a training plan and match strategy built for you.",
              },
              {
                icon: LineChart,
                color: "#16a34a",
                title: "Performance Analytics",
                desc: "Interactive trends, heatmaps, and breakdowns reveal the patterns behind your scores.",
              },
            ].map((f, i) => (
              <Reveal key={f.title} delay={i * 100}>
                <div className="group h-full rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-7 hover:border-emerald-500/30 hover:bg-white/[0.07] transition-all">
                  <div className="w-11 h-11 rounded-xl bg-emerald-500/15 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <f.icon className="w-5 h-5 text-emerald-400" />
                  </div>
                  <h3 className="mt-5 text-lg font-semibold">{f.title}</h3>
                  <p className="mt-2 text-sm text-white/50 leading-relaxed">
                    {f.desc}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Rating showcase ── */}
      <section className="px-6 py-24 sm:py-32 border-t border-white/5">
        <div className="max-w-4xl mx-auto">
          <Reveal>
            <div className="relative rounded-3xl border border-emerald-500/20 bg-gradient-to-b from-emerald-500/[0.07] to-white/[0.02] backdrop-blur p-10 sm:p-16 text-center overflow-hidden">
              {/* glow */}
              <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-emerald-500/20 blur-3xl" />

              <div className="relative z-10">
                <p className="text-xs font-medium uppercase tracking-widest text-emerald-400">
                  Your differentiator
                </p>

                <div className="mt-6 flex items-center justify-center gap-3">
                  <span className="text-7xl sm:text-8xl font-bold stat-mono bg-gradient-to-b from-emerald-300 to-green-600 bg-clip-text text-transparent">
                    100
                  </span>
                </div>
                <p className="mt-2 text-sm text-white/40 font-mono">
                  the CricketIQ Rating scale
                </p>

                <h3 className="mt-8 text-2xl sm:text-3xl font-bold">
                  One number that tells the whole story.
                </h3>
                <p className="mt-4 max-w-xl mx-auto text-white/50 leading-relaxed">
                  Your rating blends batting, bowling, fielding, and recent form
                  into a single honest score — so you always know exactly where
                  you stand, and watch it climb as you improve.
                </p>

                <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-sm">
                  <div className="flex items-center gap-2 text-white/60">
                    <Target className="w-4 h-4 text-emerald-400" /> Batting & Bowling
                  </div>
                  <div className="flex items-center gap-2 text-white/60">
                    <TrendingUp className="w-4 h-4 text-emerald-400" /> Form-weighted
                  </div>
                  <div className="flex items-center gap-2 text-white/60">
                    <Gauge className="w-4 h-4 text-emerald-400" /> Tracked over time
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="px-6 py-24 sm:py-32">
        <Reveal>
          <div className="relative max-w-5xl mx-auto rounded-3xl overflow-hidden bg-gradient-to-br from-emerald-700 via-green-800 to-[#0a0a0a] border border-emerald-500/20 p-12 sm:p-20 text-center">
            <div className="pointer-events-none absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
            <div className="relative z-10">
              <h2 className="text-3xl sm:text-5xl font-bold tracking-tight">
                Your innings data is waiting.
              </h2>
              <p className="mt-4 text-white/70 text-lg">
                Start for free — no credit card required.
              </p>
              <Link
                href="/auth/signup"
                className="group inline-flex items-center gap-2 mt-10 px-8 py-4 rounded-xl bg-white text-black font-semibold shadow-xl shadow-black/30 hover:bg-white/90 transition-all"
              >
                Create Your Account
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ── Footer ── */}
      <footer className="px-6 py-10 border-t border-white/10">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-center sm:text-left">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center">
              <Trophy className="w-3.5 h-3.5 text-black" />
            </div>
            <span className="font-semibold">CricketIQ</span>
            <span className="text-white/30 text-sm hidden sm:inline">
              — AI cricket analytics
            </span>
          </div>
          <p className="text-white/30 text-sm">
            © {new Date().getFullYear()} CricketIQ
          </p>
        </div>
      </footer>
    </div>
  );
}

export default function Page() {
  return (
    <SessionProvider>
      <Landing />
    </SessionProvider>
  );
}
