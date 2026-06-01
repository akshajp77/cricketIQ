import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculateCricketIQRating } from "@/lib/rating";
import type { FullMatch } from "@/lib/stats";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = req.nextUrl;
  const format = searchParams.get("format");
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const opponent = searchParams.get("opponent");
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = parseInt(searchParams.get("limit") ?? "20");

  const where: Record<string, unknown> = { userId: session.user.id };
  if (format) where.format = format;
  if (opponent) where.opponent = { contains: opponent, mode: "insensitive" };
  if (from || to) {
    where.date = {};
    if (from) (where.date as Record<string, unknown>).gte = new Date(from);
    if (to) (where.date as Record<string, unknown>).lte = new Date(to);
  }

  const [matches, total] = await Promise.all([
    prisma.match.findMany({
      where,
      include: { batting: true, bowling: true, fielding: true },
      orderBy: { date: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.match.count({ where }),
  ]);

  return NextResponse.json({ matches, total, page, limit });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { matchInfo, batting, bowling, fielding } = body;

    const match = await prisma.match.create({
      data: {
        userId: session.user.id,
        opponent: matchInfo.opponent,
        date: new Date(matchInfo.date),
        format: matchInfo.format,
        venue: matchInfo.venue,
        result: matchInfo.result,
        notes: matchInfo.notes,
        batting: {
          create: {
            runs: batting.runs ?? 0,
            balls: batting.balls ?? 0,
            fours: batting.fours ?? 0,
            sixes: batting.sixes ?? 0,
            dismissalType: batting.dismissalType ?? "Did Not Bat",
            position: batting.position ?? null,
          },
        },
        bowling: {
          create: {
            overs: bowling.overs ?? 0,
            runsConceded: bowling.runsConceded ?? 0,
            wickets: bowling.wickets ?? 0,
            maidens: bowling.maidens ?? 0,
            wides: bowling.wides ?? 0,
            noBalls: bowling.noBalls ?? 0,
          },
        },
        fielding: {
          create: {
            catches: fielding.catches ?? 0,
            runOuts: fielding.runOuts ?? 0,
            stumpings: fielding.stumpings ?? 0,
          },
        },
      },
      include: { batting: true, bowling: true, fielding: true },
    });

    // Recalculate rating
    const allMatches = await prisma.match.findMany({
      where: { userId: session.user.id },
      include: { batting: true, bowling: true, fielding: true },
    });

    const breakdown = calculateCricketIQRating(allMatches as FullMatch[]);
    await prisma.ratingHistory.create({
      data: {
        userId: session.user.id,
        rating: breakdown.total,
        breakdown: breakdown as unknown as Record<string, number>,
      },
    });

    return NextResponse.json({ match, rating: breakdown }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to create match" }, { status: 500 });
  }
}
