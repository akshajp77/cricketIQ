import { NextResponse } from "next/server";
import OpenAI from "openai";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  calcBattingStats,
  calcBowlingStats,
  type FullMatch,
} from "@/lib/stats";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const SYSTEM_PROMPT = `You are an elite cricket performance coach. Analyze the player's statistics and provide a structured analysis.
Respond in valid JSON only with this exact structure:
{
  "strengths": ["string", "string", "string"],
  "weaknesses": ["string", "string", "string"],
  "improvements": ["string", "string", "string"],
  "trainingPlan": "string (2-3 sentences)",
  "matchStrategy": "string (2-3 sentences)"
}`;

function buildUserPrompt(
  name: string,
  batting: ReturnType<typeof calcBattingStats>,
  bowling: ReturnType<typeof calcBowlingStats>,
  last10: FullMatch[],
  last5Avg: number
): string {
  const matchLines = last10
    .slice()
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .map((m, i) => {
      const eco =
        (m.bowling?.overs ?? 0) > 0
          ? ((m.bowling?.runsConceded ?? 0) / (m.bowling?.overs ?? 1)).toFixed(2)
          : "N/A";
      return `${i + 1}. vs ${m.opponent} (${m.format}, ${m.result}): ` +
        `Bat ${m.batting?.runs ?? 0}(${m.batting?.balls ?? 0}) ${m.batting?.dismissalType ?? ""} | ` +
        `Bowl ${m.bowling?.wickets ?? 0}/${m.bowling?.runsConceded ?? 0} in ${m.bowling?.overs ?? 0} ov (eco ${eco})`;
    })
    .join("\n");

  return `Player: ${name}

CAREER BATTING
Matches: ${batting.matches} | Innings: ${batting.innings} | Runs: ${batting.totalRuns}
Average: ${batting.battingAvg.toFixed(2)} | Strike Rate: ${batting.strikeRate.toFixed(2)}
Highest: ${batting.highestScore} | 50s: ${batting.fifties} | 100s: ${batting.hundreds}

CAREER BOWLING
Wickets: ${bowling.totalWickets} | Economy: ${bowling.economy.toFixed(2)}
Average: ${bowling.bowlingAvg.toFixed(2)} | Best: ${bowling.bestFigures}

LAST 10 MATCHES
${matchLines}

FORM
Last-5 batting average: ${last5Avg.toFixed(2)} vs career average: ${batting.battingAvg.toFixed(2)}
Trend: ${last5Avg > batting.battingAvg * 1.05 ? "Improving" : last5Avg < batting.battingAvg * 0.95 ? "Below par" : "Consistent"}`;
}

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
      { error: "Add at least 3 matches before requesting AI analysis." },
      { status: 400 }
    );
  }

  const fm = matches as FullMatch[];
  const batting = calcBattingStats(fm);
  const bowling = calcBowlingStats(fm);

  const last5 = fm.slice(0, 5);
  const last5Runs = last5.reduce((s, m) => s + (m.batting?.runs ?? 0), 0);
  const last5Innings = last5.filter(
    (m) => m.batting?.dismissalType !== "Did Not Bat"
  ).length;
  const last5Avg = last5Innings > 0 ? last5Runs / last5Innings : batting.battingAvg;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true },
  });

  const userPrompt = buildUserPrompt(
    user?.name ?? "Player",
    batting,
    bowling,
    fm.slice(0, 10),
    last5Avg
  );

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
    });

    const raw = completion.choices[0].message.content ?? "{}";
    const parsed = JSON.parse(raw) as {
      strengths: string[];
      weaknesses: string[];
      improvements: string[];
      trainingPlan: string;
      matchStrategy: string;
    };

    const analysis = await prisma.aIAnalysis.create({
      data: {
        userId: session.user.id,
        strengths: parsed.strengths ?? [],
        weaknesses: parsed.weaknesses ?? [],
        improvements: parsed.improvements ?? [],
        trainingPlan: parsed.trainingPlan ?? "",
        matchStrategy: parsed.matchStrategy ?? "",
        rating: 0,
      },
    });

    return NextResponse.json(analysis);
  } catch (err) {
    console.error("OpenAI error:", err);
    return NextResponse.json(
      { error: "AI analysis failed. Check your OPENAI_API_KEY and try again." },
      { status: 500 }
    );
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
