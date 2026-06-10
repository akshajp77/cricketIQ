import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import {
  calcBattingStats,
  calcBowlingStats,
  calcFieldingStats,
  getFormTrend,
  getSparklineData,
  type FullMatch,
} from "@/lib/stats";
import { calculateCricketIQRating } from "@/lib/rating";
import { StatCard } from "@/components/dashboard/StatCard";
import { RatingGauge } from "@/components/dashboard/RatingGauge";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { EmptyState } from "@/components/ui/empty-state";
import Link from "next/link";
import {
  Activity,
  Target,
  Shield,
  TrendingUp,
  Plus,
  Flame,
  Hand,
  ClipboardList,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

// Discipline accents — consistent with the RatingGauge breakdown:
// batting = emerald, bowling = amber, fielding = sky, form/volume = violet
const ACCENT = {
  batting: "#10B981",
  bowling: "#F59E0B",
  fielding: "#38BDF8",
  form: "#A78BFA",
};

function getResultStyle(result: string) {
  if (result === "Won") return "bg-emerald-500/10 text-emerald-400";
  if (result === "Lost") return "bg-red-500/10 text-red-400";
  return "bg-amber-500/10 text-amber-400";
}

function getPerformanceBorder(runs: number): string {
  if (runs >= 50) return "border-l-2 border-emerald-400";
  if (runs >= 30) return "border-l-2 border-emerald-500/40";
  if (runs < 15) return "border-l-2 border-red-500/40";
  return "border-l-2 border-transparent";
}

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/signin");

  const matches = await prisma.match.findMany({
    where: { userId: session.user.id },
    include: { batting: true, bowling: true, fielding: true },
    orderBy: { date: "desc" },
  });

  const fm = matches as FullMatch[];
  const batting = calcBattingStats(fm);
  const bowling = calcBowlingStats(fm);
  const fielding = calcFieldingStats(fm);
  const trend = getFormTrend(fm);
  const rating = calculateCricketIQRating(fm);

  const sparklines = {
    runs: getSparklineData(fm, "runs"),
    wickets: getSparklineData(fm, "wickets"),
    economy: getSparklineData(fm, "economy"),
  };

  const recentMatches = matches.slice(0, 5);

  if (matches.length === 0) {
    return (
      <div className="mx-auto max-w-3xl p-6 pt-16">
        <EmptyState
          icon={ClipboardList}
          title="Your scorecard is empty"
          description="Log your first match to unlock your CricketIQ Rating, performance trends, and AI coaching insights."
          action={
            <Button
              asChild
              className="bg-emerald-500 font-semibold text-black shadow-lg shadow-emerald-500/20 hover:bg-emerald-400"
            >
              <Link href="/matches/new">
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Match
              </Link>
            </Button>
          }
        />
      </div>
    );
  }

  const firstName = session.user.name?.split(" ")[0] ?? "Player";

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6">
      <PageHeader
        kicker="Overview"
        title={`Welcome back, ${firstName}`}
        description={
          <span>
            {matches.length} {matches.length === 1 ? "match" : "matches"} tracked
            <span className="mx-1.5 text-[#3A4150]">·</span>
            Form:{" "}
            <span
              className={cn("font-medium", {
                "text-emerald-400": trend.direction === "up",
                "text-red-400": trend.direction === "down",
                "text-amber-400": trend.direction === "stable",
              })}
            >
              {trend.label}
            </span>
          </span>
        }
      />

      {/* Rating + stat grid */}
      <div className="grid grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-4">
        {/* CricketIQ Rating */}
        <div className="rounded-xl border border-[#1B212C] bg-[#0C1015] p-5 lg:col-span-1">
          <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6B7484]">
            CricketIQ Rating
          </p>
          <RatingGauge breakdown={rating} />
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:col-span-3">
          <StatCard
            title="Batting Avg"
            value={batting.battingAvg}
            decimals={2}
            icon={<Activity className="h-4 w-4" style={{ color: ACCENT.batting }} />}
            iconColor={ACCENT.batting}
            sparklineData={sparklines.runs}
            trend={trend}
            subStats={[
              { label: "Runs", value: batting.totalRuns },
              { label: "HS", value: batting.highestScore },
            ]}
          />
          <StatCard
            title="Strike Rate"
            value={batting.strikeRate}
            decimals={1}
            icon={<Flame className="h-4 w-4" style={{ color: ACCENT.batting }} />}
            iconColor={ACCENT.batting}
            sparklineData={sparklines.runs}
            subStats={[
              { label: "Balls", value: batting.totalBalls },
              { label: "4s/6s", value: `${batting.totalFours}/${batting.totalSixes}` },
            ]}
          />
          <StatCard
            title="Innings"
            value={batting.innings}
            icon={<TrendingUp className="h-4 w-4" style={{ color: ACCENT.form }} />}
            iconColor={ACCENT.form}
            subStats={[
              { label: "50s", value: batting.fifties },
              { label: "100s", value: batting.hundreds },
            ]}
          />
          <StatCard
            title="Wickets"
            value={bowling.totalWickets}
            icon={<Target className="h-4 w-4" style={{ color: ACCENT.bowling }} />}
            iconColor={ACCENT.bowling}
            sparklineData={sparklines.wickets}
            subStats={[
              { label: "Best", value: bowling.bestFigures },
              { label: "Avg", value: bowling.bowlingAvg.toFixed(1) },
            ]}
          />
          <StatCard
            title="Economy"
            value={bowling.economy}
            decimals={2}
            icon={<Shield className="h-4 w-4" style={{ color: ACCENT.bowling }} />}
            iconColor={ACCENT.bowling}
            sparklineData={sparklines.economy}
            subStats={[
              { label: "Overs", value: bowling.totalOvers.toFixed(1) },
              { label: "Maidens", value: bowling.totalMaidens },
            ]}
          />
          <StatCard
            title="Catches"
            value={fielding.totalCatches}
            icon={<Hand className="h-4 w-4" style={{ color: ACCENT.fielding }} />}
            iconColor={ACCENT.fielding}
            subStats={[
              { label: "Run Outs", value: fielding.totalRunOuts },
              { label: "Stumpings", value: fielding.totalStumpings },
            ]}
          />
        </div>
      </div>

      {/* Recent Matches */}
      <div className="overflow-hidden rounded-xl border border-[#1B212C] bg-[#0C1015]">
        <div className="flex items-center justify-between border-b border-[#161B24] px-5 py-4">
          <h3 className="text-sm font-semibold text-white">Recent Matches</h3>
          <Link
            href="/matches"
            className="group flex items-center gap-1 text-xs font-medium text-emerald-400 transition-colors hover:text-emerald-300"
          >
            View all
            <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
        <div className="divide-y divide-[#161B24]">
          {recentMatches.map((match: FullMatch) => (
            <Link
              key={match.id}
              href={`/matches/${match.id}`}
              className={cn(
                "flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-white/[0.02]",
                getPerformanceBorder(match.batting?.runs ?? 0)
              )}
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-medium text-white">
                    vs {match.opponent}
                  </p>
                  <span className="flex-shrink-0 rounded border border-[#1B212C] bg-white/[0.02] px-1.5 py-px text-[10px] font-medium text-[#6B7484]">
                    {match.format}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-[#6B7484]">
                  {formatDate(match.date)}
                  {match.venue ? ` · ${match.venue}` : ""}
                </p>
              </div>
              <div className="flex flex-shrink-0 items-center gap-5">
                <div className="text-right">
                  <p className="stat-mono text-sm font-bold tabular-nums text-white">
                    {match.batting?.runs ?? 0}
                    <span className="text-[#5A6372]">
                      ({match.batting?.balls ?? 0})
                    </span>
                  </p>
                  <p className="text-[10px] uppercase tracking-wider text-[#5A6372]">
                    Bat
                  </p>
                </div>
                <div className="hidden text-right sm:block">
                  <p className="stat-mono text-sm font-bold tabular-nums text-white">
                    {match.bowling?.wickets ?? 0}/{match.bowling?.runsConceded ?? 0}
                  </p>
                  <p className="text-[10px] uppercase tracking-wider text-[#5A6372]">
                    Bowl
                  </p>
                </div>
                <span
                  className={cn(
                    "w-14 rounded-full px-2 py-1 text-center text-[11px] font-semibold",
                    getResultStyle(match.result)
                  )}
                >
                  {match.result}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
