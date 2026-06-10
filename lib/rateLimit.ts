import { prisma } from "@/lib/prisma";

function getISOWeekAndYear(): { weekNumber: number; year: number } {
  const now = new Date();
  // Work in UTC to ensure consistent week boundaries (Monday midnight UTC = reset)
  const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  // ISO 8601: set to Thursday of current week (day 4), then week 1 = that Thursday's year
  const day = d.getUTCDay() || 7; // Sunday (0) → 7
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNumber = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return { weekNumber, year: d.getUTCFullYear() };
}

/** Check and consume one use. Returns allowed=false without incrementing if over limit. */
export async function checkRateLimit(
  userId: string,
  limit = 1
): Promise<{ allowed: boolean; remaining: number; limit: number }> {
  const { weekNumber, year } = getISOWeekAndYear();

  return prisma.$transaction(async (tx) => {
    // Create record with count=0 if it doesn't exist yet; no-op update if it does
    const record = await tx.apiUsage.upsert({
      where: { userId_weekNumber_year: { userId, weekNumber, year } },
      create: { userId, weekNumber, year, count: 0 },
      update: {},
    });

    if (record.count >= limit) {
      return { allowed: false, remaining: 0, limit };
    }

    await tx.apiUsage.update({
      where: { userId_weekNumber_year: { userId, weekNumber, year } },
      data: { count: { increment: 1 } },
    });

    return { allowed: true, remaining: limit - record.count - 1, limit };
  });
}

/** Read-only peek at remaining uses for the current week — does not increment. */
export async function peekRateLimit(
  userId: string,
  limit = 1
): Promise<{ remaining: number; limit: number }> {
  const { weekNumber, year } = getISOWeekAndYear();
  const record = await prisma.apiUsage.findUnique({
    where: { userId_weekNumber_year: { userId, weekNumber, year } },
  });
  const used = record?.count ?? 0;
  return { remaining: Math.max(0, limit - used), limit };
}
