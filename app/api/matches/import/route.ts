import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculateCricketIQRating } from "@/lib/rating";
import type { FullMatch } from "@/lib/stats";

interface ImportMatch {
  date: string;
  opponent: string;
  format: string;
  runs: number;
  wickets: number;
  overs: number;
  dismissal: string;
  notes: string;
}

const VALID_FORMATS = ["T20", "ODI", "Test", "Custom"];
const VALID_DISMISSALS = [
  "Caught", "Bowled", "LBW", "Run Out", "Not Out", "Retired", "Did Not Bat",
];

function validateRow(m: ImportMatch, rowIndex: number): string | null {
  if (!m.date || isNaN(new Date(m.date).getTime())) return `Row ${rowIndex}: Invalid date`;
  if (!m.opponent?.trim()) return `Row ${rowIndex}: Opponent is required`;
  if (!VALID_FORMATS.includes(m.format)) return `Row ${rowIndex}: Invalid format "${m.format}"`;
  if (!Number.isInteger(m.runs) || m.runs < 0) return `Row ${rowIndex}: Runs must be a non-negative integer`;
  if (!Number.isInteger(m.wickets) || m.wickets < 0) return `Row ${rowIndex}: Wickets must be a non-negative integer`;
  if (typeof m.overs !== "number" || isNaN(m.overs) || m.overs < 0) return `Row ${rowIndex}: Invalid overs`;
  if (!VALID_DISMISSALS.includes(m.dismissal)) return `Row ${rowIndex}: Invalid dismissal "${m.dismissal}"`;
  return null;
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { matches: ImportMatch[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const matches = body?.matches;
  if (!Array.isArray(matches) || matches.length === 0) {
    return NextResponse.json({ error: "No matches provided" }, { status: 400 });
  }
  if (matches.length > 200) {
    return NextResponse.json({ error: "Maximum 200 matches per import" }, { status: 400 });
  }

  for (let i = 0; i < matches.length; i++) {
    const err = validateRow(matches[i], i + 1);
    if (err) return NextResponse.json({ error: err }, { status: 400 });
  }

  // Check for duplicates within the import batch
  const importKeys = new Set<string>();
  for (let i = 0; i < matches.length; i++) {
    const m = matches[i];
    const key = `${m.opponent.trim().toLowerCase()}|${new Date(m.date).toDateString()}`;
    if (importKeys.has(key)) {
      return NextResponse.json(
        { error: `Row ${i + 1}: Duplicate in this import — same date and opponent as an earlier row` },
        { status: 400 }
      );
    }
    importKeys.add(key);
  }

  // Check for duplicates against existing matches
  const existing = await prisma.match.findMany({
    where: { userId: session.user.id },
    select: { opponent: true, date: true },
  });
  const existingKeys = new Set(
    existing.map((m) => `${m.opponent.toLowerCase()}|${new Date(m.date).toDateString()}`)
  );
  for (let i = 0; i < matches.length; i++) {
    const m = matches[i];
    const key = `${m.opponent.trim().toLowerCase()}|${new Date(m.date).toDateString()}`;
    if (existingKeys.has(key)) {
      return NextResponse.json(
        { error: `Row ${i + 1}: A match vs "${m.opponent}" on this date already exists in your account` },
        { status: 400 }
      );
    }
  }

  try {
    await prisma.$transaction(async (tx) => {
      for (const m of matches) {
        await tx.match.create({
          data: {
            userId: session.user.id,
            opponent: m.opponent.trim(),
            date: new Date(m.date),
            format: m.format,
            result: "No Result",
            notes: m.notes || null,
            batting: {
              create: {
                runs: m.runs,
                balls: 0,
                fours: 0,
                sixes: 0,
                dismissalType: m.dismissal,
              },
            },
            bowling: {
              create: {
                overs: m.overs,
                runsConceded: 0,
                wickets: m.wickets,
                maidens: 0,
                wides: 0,
                noBalls: 0,
              },
            },
            fielding: {
              create: { catches: 0, runOuts: 0, stumpings: 0 },
            },
          },
        });
      }
    });

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

    return NextResponse.json({ success: true, imported: matches.length });
  } catch (e) {
    console.error("[import]", e);
    return NextResponse.json({ error: "Failed to import matches" }, { status: 500 });
  }
}
