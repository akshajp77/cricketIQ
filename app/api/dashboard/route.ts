import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  calcBattingStats,
  calcBowlingStats,
  calcFieldingStats,
  getFormTrend,
  getSparklineData,
  type FullMatch,
} from "@/lib/stats";
import { calculateCricketIQRating } from "@/lib/rating";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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

  const recentMatches = matches.slice(0, 5);

  return NextResponse.json({
    batting,
    bowling,
    fielding,
    trend,
    rating,
    recentMatches,
    sparklines: {
      runs: getSparklineData(fm, "runs"),
      wickets: getSparklineData(fm, "wickets"),
      economy: getSparklineData(fm, "economy"),
    },
  });
}
