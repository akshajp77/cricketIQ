import Link from "next/link";
import { Trophy } from "lucide-react";

interface LegalLayoutProps {
  title: string;
  lastUpdated: string;
  /** Sticky table of contents rendered on desktop. */
  toc?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Shared shell for legal pages (Privacy, Terms). Provides the navbar,
 * title block, optional sticky TOC column, prose styling, and footer.
 */
export function LegalLayout({ title, lastUpdated, toc, children }: LegalLayoutProps) {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Faint dot-grid texture */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.03]"
        style={{
          backgroundImage: "radial-gradient(circle, #16a34a 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      {/* Navbar */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-black/50 border-b border-white/10">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
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
      </header>

      <main className="relative max-w-6xl mx-auto px-6 py-12 sm:py-16">
        {/* Title block */}
        <div className="border-b border-white/10 pb-8 mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">{title}</h1>
          <p className="mt-3 text-sm text-[#6B7280]">
            Last updated: <span className="text-[#9CA3AF]">{lastUpdated}</span>
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-10">
          {/* Sticky TOC (desktop only) */}
          {toc && (
            <aside className="hidden lg:block">
              <div className="sticky top-24">{toc}</div>
            </aside>
          )}

          {/* Content */}
          <article className="legal-prose max-w-3xl">{children}</article>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 mt-16">
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center">
              <Trophy className="w-3.5 h-3.5 text-black" />
            </div>
            <span className="font-semibold">CricketIQ</span>
          </div>
          <div className="flex items-center gap-5 text-sm text-white/40">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
            <span>© {new Date().getFullYear()} CricketIQ</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
