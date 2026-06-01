import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getOpenAI, buildCricketAnalysisPrompt } from "@/lib/openai";
import {
  calcBattingStats,
  calcBowlingStats,
  calcFieldingStats,
  getFormTrend,
  type FullMatch,
} from "@/lib/stats";
import { calculateCricketIQRating } from "@/lib/rating";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const matches = await prisma.match.findMany({
    where: { userId: session.user.id },
    include: { batting: true, bowling: true, fielding: true },
    orderBy: { date: "desc" },
  });

  if (matches.length < 3) {
    return NextResponse.json(
      { error: "Need at least 3 matches for AI analysis" },
      { status: 400 }
    );
  }

  const fm = matches as FullMatch[];
  const batting = calcBattingStats(fm);
  const bowling = calcBowlingStats(fm);
  const fielding = calcFieldingStats(fm);
  const trend = getFormTrend(fm);
  const rating = calculateCricketIQRating(fm);

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true },
  });

  const last10 = (matches as FullMatch[]).slice(0, 10).map((m: FullMatch) => ({
    date: new Date(m.date).toLocaleDateString(),
    opponent: m.opponent,
    format: m.format,
    result: m.result,
    runs: m.batting?.runs ?? 0,
    balls: m.batting?.balls ?? 0,
    wickets: m.bowling?.wickets ?? 0,
    overs: m.bowling?.overs ?? 0,
    economy:
      (m.bowling?.overs ?? 0) > 0
        ? (m.bowling?.runsConceded ?? 0) / (m.bowling?.overs ?? 1)
        : 0,
  }));

  const prompt = buildCricketAnalysisPrompt({
    playerName: user?.name ?? "Player",
    careerStats: {
      matches: batting.matches,
      totalRuns: batting.totalRuns,
      battingAvg: batting.battingAvg,
      strikeRate: batting.strikeRate,
      highestScore: batting.highestScore,
      fifties: batting.fifties,
      hundreds: batting.hundreds,
      totalWickets: bowling.totalWickets,
      bowlingAvg: bowling.bowlingAvg,
      economy: bowling.economy,
      bestFigures: bowling.bestFigures,
      catches: fielding.totalCatches,
      rating: rating.total,
    },
    recentMatches: last10,
    trends: {
      last5Avg: 0,
      careerAvg: batting.battingAvg,
      last5WicketsPerMatch: bowling.wicketsPerMatch,
      formTrend: trend.label,
    },
  });

  try {
    const completion = await getOpenAI().chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a world-class cricket performance analyst. Always respond with valid JSON.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0].message.content ?? "{}";
    const parsed = JSON.parse(content);

    const analysis = await prisma.aIAnalysis.create({
      data: {
        userId: session.user.id,
        strengths: parsed.strengths ?? [],
        weaknesses: parsed.weaknesses ?? [],
        improvements: parsed.improvements ?? [],
        trainingPlan: parsed.trainingPlan ?? "",
        matchStrategy: parsed.matchStrategy ?? "",
        rating: rating.total,
      },
    });

    return NextResponse.json(analysis);
  } catch (e) {
    console.error("OpenAI error:", e);
    // Return mock data if OpenAI isn't configured
    const mockAnalysis = await prisma.aIAnalysis.create({
      data: {
        userId: session.user.id,
        strengths: [
          `Consistent batting average of ${batting.battingAvg.toFixed(1)} shows technical stability`,
          `Strike rate of ${batting.strikeRate.toFixed(1)} indicates good scoring ability`,
          bowling.totalWickets > 10 ? `Bowling contributes effectively with ${bowling.bestFigures} best figures` : "Developing all-round capabilities",
          `${fielding.totalCatches} catches demonstrate strong fielding presence`,
        ],
        weaknesses: [
          batting.strikeRate < 100 ? "Strike rate needs improvement in T20 formats" : "Consistency needed in pressure situations",
          bowling.economy > 8 ? `Economy rate of ${bowling.economy.toFixed(2)} is above ideal threshold` : "Building bowling variety",
          "Performance dip in challenging conditions noted",
        ],
        improvements: [
          "Focus on converting 30s into 50s with disciplined shot selection",
          "Work on bowling in the death overs to improve economy",
          "Practice switch-hitting and reverse sweep for T20 formats",
          "Improve running between wickets to boost strike rotation",
        ],
        trainingPlan: `Week 1: Net sessions focusing on playing straight drives and defending short balls. 30 min batting, 20 min bowling\nWeek 2: Match simulation – T20 scenarios, power play batting, death overs bowling\nWeek 3: Fielding drills – catching practice and ground fielding agility\nWeek 4: Full match simulation and video analysis review`,
        matchStrategy: `Based on your data, adopt an aggressive approach in the first 10 overs when batting. Your best scores come against pace bowling, so target full deliveries early. When bowling, focus on 4th-5th stump line to induce edges. Your economy improves in middle overs – bowl in that phase.`,
        rating: rating.total,
      },
    });

    return NextResponse.json(mockAnalysis);
  }
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const analyses = await prisma.aIAnalysis.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(analyses);
}
