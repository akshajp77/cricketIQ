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
import Link from "next/link";
import {
  Activity,
  Target,
  Shield,
  TrendingUp,
  Plus,
  Flame,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

// Bat icon fallback since lucide may not have it
import { Swords } from "lucide-react";

function getResultColor(result: string) {
  if (result === "Won") return "text-emerald-400 bg-emerald-400/10";
  if (result === "Lost") return "text-red-400 bg-red-400/10";
  return "text-amber-400 bg-amber-400/10";
}

function getPerformanceColor(runs: number): string {
  if (runs >= 50) return "border-l-2 border-emerald-500";
  if (runs >= 30) return "border-l-2 border-[#00D4AA]";
  if (runs < 15) return "border-l-2 border-red-500";
  return "border-l-2 border-[#1F2937]";
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
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 px-6">
        <div className="w-16 h-16 rounded-2xl bg-[#00D4AA]/10 flex items-center justify-center">
          <Swords className="w-8 h-8 text-[#00D4AA]" />
        </div>
        <div className="text-center">
          <h2 className="text-xl font-semibold text-white">No matches yet</h2>
          <p className="text-[#6B7280] mt-1">Add your first match to start tracking your performance</p>
        </div>
        <Button asChild className="bg-[#00D4AA] text-[#0A0F1E] hover:bg-[#00D4AA]/90 font-semibold">
          <Link href="/matches/new">
            <Plus className="w-4 h-4 mr-2" />
            Add First Match
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl">
      {/* Welcome header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">
            Hey, {session.user.name?.split(" ")[0]} 👋
          </h2>
          <p className="text-[#6B7280] text-sm mt-0.5">
            {matches.length} matches tracked · Form: {" "}
            <span className={cn("font-medium", { "text-emerald-400": trend.direction === "up", "text-red-400": trend.direction === "down", "text-amber-400": trend.direction === "stable" })}>
              {trend.label}
            </span>
          </p>
        </div>
        <Button asChild size="sm" className="bg-[#00D4AA] text-[#0A0F1E] hover:bg-[#00D4AA]/90 font-semibold hidden sm:flex">
          <Link href="/matches/new">
            <Plus className="w-4 h-4 mr-1" />
            New Match
          </Link>
        </Button>
      </div>

      {/* Rating + Batting Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* CricketIQ Rating */}
        <div className="lg:col-span-1 rounded-xl border border-[#1F2937] bg-[#111827] p-5">
          <p className="text-xs text-[#6B7280] font-medium uppercase tracking-wider mb-4">CricketIQ Rating</p>
          <RatingGauge breakdown={rating} />
        </div>

        {/* Batting Cards */}
        <div className="lg:col-span-3 grid grid-cols-2 sm:grid-cols-3 gap-4">
          <StatCard
            title="Batting Avg"
            value={batting.battingAvg}
            decimals={2}
            icon={<Activity className="w-5 h-5" style={{ color: "#00D4AA" }} />}
            iconColor="#00D4AA"
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
            icon={<Flame className="w-5 h-5" style={{ color: "#F59E0B" }} />}
            iconColor="#F59E0B"
            sparklineData={sparklines.runs}
            subStats={[
              { label: "Balls", value: batting.totalBalls },
              { label: "4s/6s", value: `${batting.totalFours}/${batting.totalSixes}` },
            ]}
          />
          <StatCard
            title="Innings"
            value={batting.innings}
            icon={<TrendingUp className="w-5 h-5" style={{ color: "#8B5CF6" }} />}
            iconColor="#8B5CF6"
            subStats={[
              { label: "50s", value: batting.fifties },
              { label: "100s", value: batting.hundreds },
            ]}
          />
          <StatCard
            title="Wickets"
            value={bowling.totalWickets}
            icon={<Target className="w-5 h-5" style={{ color: "#EC4899" }} />}
            iconColor="#EC4899"
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
            icon={<Shield className="w-5 h-5" style={{ color: "#06B6D4" }} />}
            iconColor="#06B6D4"
            sparklineData={sparklines.economy}
            subStats={[
              { label: "Overs", value: bowling.totalOvers.toFixed(1) },
              { label: "Maidens", value: bowling.totalMaidens },
            ]}
          />
          <StatCard
            title="Catches"
            value={fielding.totalCatches}
            icon={<Swords className="w-5 h-5" style={{ color: "#F97316" }} />}
            iconColor="#F97316"
            subStats={[
              { label: "Run Outs", value: fielding.totalRunOuts },
              { label: "Stumpings", value: fielding.totalStumpings },
            ]}
          />
        </div>
      </div>

      {/* Recent Matches */}
      <div className="rounded-xl border border-[#1F2937] bg-[#111827] overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1F2937]">
          <h3 className="font-semibold text-white">Recent Matches</h3>
          <Link href="/matches" className="text-xs text-[#00D4AA] hover:underline">View all →</Link>
        </div>
        <div className="divide-y divide-[#1F2937]">
          {recentMatches.map((match: FullMatch) => (
            <Link key={match.id} href={`/matches/${match.id}`} className={cn("flex items-center gap-4 px-5 py-3 hover:bg-[#1F2937]/40 transition-colors", getPerformanceColor(match.batting?.runs ?? 0))}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-white truncate">vs {match.opponent}</p>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#1F2937] text-[#6B7280] flex-shrink-0">{match.format}</span>
                </div>
                <p className="text-xs text-[#6B7280] mt-0.5">{formatDate(match.date)} · {match.venue}</p>
              </div>
              <div className="flex items-center gap-4 flex-shrink-0">
                <div className="text-right">
                  <p className="text-sm font-bold text-white stat-mono">{match.batting?.runs ?? 0}</p>
                  <p className="text-[10px] text-[#6B7280]">runs</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-white stat-mono">{match.bowling?.wickets ?? 0}/{(match.bowling?.runsConceded ?? 0)}</p>
                  <p className="text-[10px] text-[#6B7280]">bowl</p>
                </div>
                <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", getResultColor(match.result))}>
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
