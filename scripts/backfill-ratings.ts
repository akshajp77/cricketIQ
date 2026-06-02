import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { calculateCricketIQRating } from "../lib/rating";
import type { FullMatch } from "../lib/stats";
import "dotenv/config";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const user = await prisma.user.findUnique({
    where: { email: "demo@cricketiq.com" },
  });

  if (!user) {
    console.error("Demo user not found. Run npm run db:seed first.");
    process.exit(1);
  }

  // Clear existing rating history for a clean backfill
  await prisma.ratingHistory.deleteMany({ where: { userId: user.id } });
  console.log("Cleared existing rating history for demo user.");

  const matches = await prisma.match.findMany({
    where: { userId: user.id },
    include: { batting: true, bowling: true, fielding: true },
    orderBy: { date: "asc" },
  });

  if (matches.length === 0) {
    console.error("No matches found. Run npm run db:seed first.");
    process.exit(1);
  }

  console.log(`Backfilling ratings for ${matches.length} matches...`);

  for (let i = 1; i <= matches.length; i++) {
    const subset = matches.slice(0, i) as FullMatch[];
    const breakdown = calculateCricketIQRating(subset);

    // Use the date of the i-th match as the snapshot date
    const snapshotDate = new Date(matches[i - 1].date);
    snapshotDate.setHours(23, 30, 0, 0);

    await prisma.ratingHistory.create({
      data: {
        userId: user.id,
        date: snapshotDate,
        rating: breakdown.total,
        breakdown: breakdown as unknown as Record<string, number>,
      },
    });

    console.log(
      `  Match ${i}: rating ${breakdown.total.toFixed(1)} ` +
      `(bat ${breakdown.batting}, bowl ${breakdown.bowling}, ` +
      `field ${breakdown.fielding}, form ${breakdown.form})`
    );
  }

  console.log(`\nDone — inserted ${matches.length} rating snapshots.`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
