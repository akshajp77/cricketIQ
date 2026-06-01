import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const match = await prisma.match.findFirst({
    where: { id: params.id, userId: session.user.id },
  });

  if (!match) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const balls = await req.json();
    const created = await prisma.ballEvent.createMany({
      data: balls.map((b: {
        over: number;
        ball: number;
        runs?: number;
        extras?: number;
        wicket?: boolean;
        wicketType?: string;
        battingPlayerId?: string;
        bowlingPlayerId?: string;
        shotRegion?: string;
      }) => ({
        matchId: params.id,
        over: b.over,
        ball: b.ball,
        runs: b.runs ?? 0,
        extras: b.extras ?? 0,
        wicket: b.wicket ?? false,
        wicketType: b.wicketType,
        battingPlayerId: b.battingPlayerId,
        bowlingPlayerId: b.bowlingPlayerId,
        shotRegion: b.shotRegion,
      })),
    });

    return NextResponse.json({ count: created.count }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to save ball events" }, { status: 500 });
  }
}
