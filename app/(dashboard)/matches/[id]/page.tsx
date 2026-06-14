import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { ChevronLeft, Activity, Target, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

function DisciplineCard({
  icon: Icon,
  title,
  accent,
  headline,
  sub,
  rows,
}: {
  icon: React.ElementType;
  title: string;
  accent: string;
  headline: string;
  sub: string;
  rows: Array<{ label: string; value: string | number; highlight?: boolean }>;
}) {
  return (
    <div className="rounded-xl border border-hairline bg-surface p-5">
      <div className="mb-4 flex items-center gap-2">
        <div
          className="flex h-7 w-7 items-center justify-center rounded-lg"
          style={{ background: `${accent}14`, border: `1px solid ${accent}26` }}
        >
          <Icon className="h-3.5 w-3.5" style={{ color: accent }} />
        </div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-muted">
          {title}
        </p>
      </div>
      <p className="stat-mono text-3xl font-bold tabular-nums text-white">{headline}</p>
      <p className="mt-0.5 text-sm text-ink-muted">{sub}</p>
      <div className="mt-4 space-y-2 border-t border-hairline-subtle pt-4 text-sm">
        {rows.map((r) => (
          <div key={r.label} className="flex justify-between">
            <span className="text-ink-muted">{r.label}</span>
            <span
              className="stat-mono tabular-nums"
              style={r.highlight ? { color: accent, fontWeight: 600 } : { color: "#fff" }}
            >
              {r.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default async function MatchDetailPage({ params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/signin");

  const match = await prisma.match.findFirst({
    where: { id: params.id, userId: session.user.id },
    include: { batting: true, bowling: true, fielding: true },
  });

  if (!match) notFound();

  const economy = match.bowling && match.bowling.overs > 0
    ? (match.bowling.runsConceded / match.bowling.overs).toFixed(2)
    : "—";
  const sr = match.batting && match.batting.balls > 0
    ? ((match.batting.runs / match.batting.balls) * 100).toFixed(1)
    : "—";

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div>
        <Button asChild variant="ghost" size="sm" className="-ml-2 mb-3 text-ink-secondary hover:text-white">
          <Link href="/matches">
            <ChevronLeft className="mr-1 h-4 w-4" />
            Match History
          </Link>
        </Button>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              vs {match.opponent}
            </h1>
            <p className="mt-1 text-sm text-ink-secondary">
              {formatDate(match.date)}
              {match.venue ? ` · ${match.venue}` : ""}
            </p>
          </div>
          <div className="flex gap-2">
            <Badge variant="outline">{match.format}</Badge>
            <Badge variant={match.result === "Won" ? "success" : match.result === "Lost" ? "danger" : "warning"}>
              {match.result}
            </Badge>
          </div>
        </div>
      </div>

      {match.notes && (
        <div className="rounded-xl border border-hairline bg-surface p-4">
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-muted">
            Notes
          </p>
          <p className="text-sm leading-relaxed text-[#D7DCE4]">{match.notes}</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <DisciplineCard
          icon={Activity}
          title="Batting"
          accent="#10B981"
          headline={`${match.batting?.runs ?? 0}`}
          sub={`${match.batting?.balls ?? 0} balls faced`}
          rows={[
            { label: "Fours", value: match.batting?.fours ?? 0 },
            { label: "Sixes", value: match.batting?.sixes ?? 0 },
            { label: "Strike Rate", value: sr, highlight: true },
            { label: "Dismissal", value: match.batting?.dismissalType ?? "—" },
          ]}
        />
        <DisciplineCard
          icon={Target}
          title="Bowling"
          accent="#F59E0B"
          headline={`${match.bowling?.wickets ?? 0}/${match.bowling?.runsConceded ?? 0}`}
          sub={`${match.bowling?.overs ?? 0} overs bowled`}
          rows={[
            { label: "Economy", value: economy, highlight: true },
            { label: "Maidens", value: match.bowling?.maidens ?? 0 },
            { label: "Wides", value: match.bowling?.wides ?? 0 },
            { label: "No Balls", value: match.bowling?.noBalls ?? 0 },
          ]}
        />
        <DisciplineCard
          icon={Shield}
          title="Fielding"
          accent="#38BDF8"
          headline={`${(match.fielding?.catches ?? 0) + (match.fielding?.runOuts ?? 0) + (match.fielding?.stumpings ?? 0)}`}
          sub="total dismissals"
          rows={[
            { label: "Catches", value: match.fielding?.catches ?? 0 },
            { label: "Run Outs", value: match.fielding?.runOuts ?? 0 },
            { label: "Stumpings", value: match.fielding?.stumpings ?? 0 },
          ]}
        />
      </div>
    </div>
  );
}
