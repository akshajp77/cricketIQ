import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculateCricketIQRating } from "@/lib/rating";
import type { FullMatch } from "@/lib/stats";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const match = await prisma.match.findFirst({
    where: { id: params.id, userId: session.user.id },
    include: { batting: true, bowling: true, fielding: true },
  });

  if (!match) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(match);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const existing = await prisma.match.findFirst({
    where: { id: params.id, userId: session.user.id },
  });

  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const body = await req.json();
    const { matchInfo, batting, bowling, fielding } = body;

    const match = await prisma.match.update({
      where: { id: params.id },
      data: {
        opponent: matchInfo.opponent,
        date: new Date(matchInfo.date),
        format: matchInfo.format,
        venue: matchInfo.venue,
        result: matchInfo.result,
        notes: matchInfo.notes,
        batting: {
          upsert: {
            create: { runs: batting.runs, balls: batting.balls, fours: batting.fours, sixes: batting.sixes, dismissalType: batting.dismissalType, position: batting.position },
            update: { runs: batting.runs, balls: batting.balls, fours: batting.fours, sixes: batting.sixes, dismissalType: batting.dismissalType, position: batting.position },
          },
        },
        bowling: {
          upsert: {
            create: { overs: bowling.overs, runsConceded: bowling.runsConceded, wickets: bowling.wickets, maidens: bowling.maidens, wides: bowling.wides, noBalls: bowling.noBalls },
            update: { overs: bowling.overs, runsConceded: bowling.runsConceded, wickets: bowling.wickets, maidens: bowling.maidens, wides: bowling.wides, noBalls: bowling.noBalls },
          },
        },
        fielding: {
          upsert: {
            create: { catches: fielding.catches, runOuts: fielding.runOuts, stumpings: fielding.stumpings },
            update: { catches: fielding.catches, runOuts: fielding.runOuts, stumpings: fielding.stumpings },
          },
        },
      },
      include: { batting: true, bowling: true, fielding: true },
    });

    return NextResponse.json(match);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to update match" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const existing = await prisma.match.findFirst({
    where: { id: params.id, userId: session.user.id },
  });

  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.match.delete({ where: { id: params.id } });

  // Recalculate rating after deletion
  const allMatches = await prisma.match.findMany({
    where: { userId: session.user.id },
    include: { batting: true, bowling: true, fielding: true },
  });

  if (allMatches.length > 0) {
    const breakdown = calculateCricketIQRating(allMatches as FullMatch[]);
    await prisma.ratingHistory.create({
      data: {
        userId: session.user.id,
        rating: breakdown.total,
        breakdown: breakdown as unknown as Record<string, number>,
      },
    });
  }

  return NextResponse.json({ success: true });
}
