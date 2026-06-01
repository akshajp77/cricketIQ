import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculateCricketIQRating } from "@/lib/rating";
import type { FullMatch } from "@/lib/stats";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [matches, history] = await Promise.all([
    prisma.match.findMany({
      where: { userId: session.user.id },
      include: { batting: true, bowling: true, fielding: true },
    }),
    prisma.ratingHistory.findMany({
      where: { userId: session.user.id },
      orderBy: { date: "asc" },
    }),
  ]);

  const current = calculateCricketIQRating(matches as FullMatch[]);

  return NextResponse.json({
    current,
    history: history.map((h: { date: Date; rating: number; breakdown: unknown }) => ({
      date: new Date(h.date).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
      }),
      rating: h.rating,
      breakdown: h.breakdown,
    })),
  });
}
