import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  calcBattingStats,
  calcBowlingStats,
  type FullMatch,
} from "@/lib/stats";

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
      return (
        `${i + 1}. vs ${m.opponent} (${m.format}, ${m.result}): ` +
        `Bat ${m.batting?.runs ?? 0}(${m.batting?.balls ?? 0}) ${m.batting?.dismissalType ?? ""} | ` +
        `Bowl ${m.bowling?.wickets ?? 0}/${m.bowling?.runsConceded ?? 0} in ${m.bowling?.overs ?? 0} ov (eco ${eco})`
      );
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
Trend: ${
    last5Avg > batting.battingAvg * 1.05
      ? "Improving"
      : last5Avg < batting.battingAvg * 0.95
      ? "Below par"
      : "Consistent"
  }`;
}

// Strip markdown code fences if Gemini wraps JSON in ```json ... ```
function extractJson(text: string): string {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenced) return fenced[1].trim();
  return text.trim();
}

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check API key before making any calls
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "GEMINI_API_KEY is not set. Add it to your environment variables." },
      { status: 500 }
    );
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
  const last5Avg =
    last5Innings > 0 ? last5Runs / last5Innings : batting.battingAvg;

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

  // Initialise inside the handler so env vars are guaranteed to be loaded
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash-lite",
    systemInstruction: SYSTEM_PROMPT,
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.7,
    },
  });

  let raw: string;
  try {
    const result = await model.generateContent(userPrompt);
    raw = result.response.text();
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Gemini API error:", message);
    return NextResponse.json(
      { error: `Gemini API error: ${message}` },
      { status: 500 }
    );
  }

  let parsed: {
    strengths: string[];
    weaknesses: string[];
    improvements: string[];
    trainingPlan: string;
    matchStrategy: string;
  };

  try {
    parsed = JSON.parse(extractJson(raw));
  } catch {
    console.error("Failed to parse Gemini response:", raw);
    return NextResponse.json(
      { error: "Gemini returned an unexpected response format. Please try again." },
      { status: 500 }
    );
  }

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
