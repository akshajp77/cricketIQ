"use client";

import Link from "next/link";
import { Mail, Trophy } from "lucide-react";

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.55v-2.17c-3.2.7-3.87-1.36-3.87-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.19 1.76 1.19 1.03 1.76 2.69 1.25 3.34.95.1-.74.4-1.25.72-1.54-2.55-.29-5.24-1.28-5.24-5.68 0-1.26.45-2.28 1.18-3.09-.12-.29-.51-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.78 0c2.2-1.49 3.16-1.18 3.16-1.18.63 1.59.24 2.76.12 3.05.74.81 1.18 1.83 1.18 3.09 0 4.41-2.69 5.38-5.26 5.66.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.55A11.51 11.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M18.25 2h3.32l-7.26 8.3L22.85 22h-6.69l-5.24-6.85L4.93 22H1.6l7.77-8.88L1.15 2h6.86l4.74 6.26L18.25 2Zm-1.17 18.01h1.84L6.99 3.88H5.02l12.06 16.13Z" />
    </svg>
  );
}

const columns = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "#features" },
      { label: "Analytics", href: "#analytics" },
      { label: "AI Coach", href: "#ai-coach" },
      { label: "Pricing", href: "#pricing" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "#about" },
      { label: "How It Works", href: "#how-it-works" },
      { label: "Contact", href: "mailto:hello@cricketiq.app" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
    ],
  },
];

export function Footer() {
  return (
    <footer id="about" className="scroll-mt-20 border-t border-white/[0.08] px-6 pb-10 pt-16">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-green-600">
                <Trophy className="h-4 w-4 text-black" />
              </div>
              <span className="text-lg font-bold tracking-tight text-white">
                Cricket<span className="text-emerald-400">IQ</span>
              </span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-zinc-500">
              AI-powered cricket analytics. We help cricketers understand their
              performance, identify weaknesses, and improve faster — from club
              grounds to academies.
            </p>
            <div className="mt-6 flex items-center gap-3">
              {[
                { icon: GithubIcon, href: "https://github.com", label: "GitHub" },
                { icon: XIcon, href: "https://x.com", label: "X (Twitter)" },
                { icon: Mail, href: "mailto:hello@cricketiq.app", label: "Email" },
              ].map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.03] text-zinc-400 transition-colors hover:border-emerald-500/30 hover:text-emerald-400"
                >
                  <s.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 md:col-span-7">
            {columns.map((col) => (
              <div key={col.title}>
                <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  {col.title}
                </p>
                <ul className="mt-4 space-y-3">
                  {col.links.map((l) => (
                    <li key={l.label}>
                      {l.href.startsWith("/") ? (
                        <Link
                          href={l.href}
                          className="text-sm text-zinc-500 transition-colors hover:text-white"
                        >
                          {l.label}
                        </Link>
                      ) : (
                        <a
                          href={l.href}
                          className="text-sm text-zinc-500 transition-colors hover:text-white"
                        >
                          {l.label}
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-white/[0.06] pt-7 sm:flex-row">
          <p className="text-xs text-zinc-600">
            © {new Date().getFullYear()} CricketIQ. All rights reserved.
          </p>
          <p className="font-mono text-[11px] text-zinc-700">
            Built for cricketers, by cricketers.
          </p>
        </div>
      </div>
    </footer>
  );
}
