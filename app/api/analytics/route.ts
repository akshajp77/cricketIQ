import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  calcBattingStats,
  calcBowlingStats,
  calcFieldingStats,
  getFormTrend,
  getRunsOverTime,
  getBattingAvgOverTime,
  getStrikeRateOverTime,
  getWicketsPerMatch,
  getEconomyOverTime,
  getDismissalDistribution,
  type FullMatch,
} from "@/lib/stats";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = req.nextUrl;
  const last = searchParams.get("last"); // 5, 10, 20, or "all"

  const matches = await prisma.match.findMany({
    where: { userId: session.user.id },
    include: { batting: true, bowling: true, fielding: true },
    orderBy: { date: "desc" },
    take: last && last !== "all" ? parseInt(last) : undefined,
  });

  const chronological = [...matches].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const fm = chronological as FullMatch[];

  const batting = calcBattingStats(fm);
  const bowling = calcBowlingStats(fm);
  const fielding = calcFieldingStats(fm);
  const trend = getFormTrend(fm);

  const allRuns = getRunsOverTime(fm);
  const allAvg = getBattingAvgOverTime(fm);
  const allSR = getStrikeRateOverTime(fm);
  const allWickets = getWicketsPerMatch(fm);
  const allEco = getEconomyOverTime(fm);
  const dismissals = getDismissalDistribution(fm);

  // All-round contribution index
  const allRound = fm.map((m: FullMatch, i: number) => ({
    match: i + 1,
    date: new Date(m.date).toLocaleDateString("en-GB", { day: "numeric", month: "short" }),
    runs: m.batting?.runs ?? 0,
    wickets: m.bowling?.wickets ?? 0,
  }));

  // Heatmap data for calendar
  const heatmap = fm.map((m: FullMatch) => ({
    date: new Date(m.date).toISOString().split("T")[0],
    runs: m.batting?.runs ?? 0,
    result: m.result,
  }));

  // Boundary percentage
  const totalBalls = fm.reduce((s, m) => s + (m.batting?.balls ?? 0), 0);
  const boundaryBalls = fm.reduce(
    (s, m) => s + (m.batting?.fours ?? 0) + (m.batting?.sixes ?? 0),
    0
  );
  const boundaryPct = totalBalls > 0 ? (boundaryBalls / totalBalls) * 100 : 0;

  // Wicket type breakdown for bowling
  const wicketTypes: Record<string, number> = {};
  // We don't have per-ball data, so we use dismissal types as proxy
  dismissals.forEach((d) => {
    wicketTypes[d.name] = (wicketTypes[d.name] ?? 0) + d.value;
  });

  return NextResponse.json({
    stats: { batting, bowling, fielding },
    trend,
    charts: {
      runs: allRuns,
      avg: allAvg,
      sr: allSR,
      wickets: allWickets,
      economy: allEco,
      allRound,
    },
    dismissals,
    heatmap,
    boundaryPct,
    careerAvg: batting.battingAvg,
  });
}
