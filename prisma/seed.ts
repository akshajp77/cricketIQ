import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import "dotenv/config";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  // Create demo user
  const hashedPassword = await bcrypt.hash("password123", 12);
  const user = await prisma.user.upsert({
    where: { email: "demo@cricketiq.com" },
    update: {},
    create: {
      email: "demo@cricketiq.com",
      name: "Arjun Sharma",
      password: hashedPassword,
    },
  });

  // Create player profile
  await prisma.playerProfile.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      userId: user.id,
      age: 24,
      battingStyle: "Right-hand",
      bowlingStyle: "Medium Fast",
      teamName: "Mumbai Hawks",
      bio: "Opening batsman and medium-pace all-rounder. Passionate about improving every game.",
      onboardingDone: true,
    },
  });

  // Clean existing matches for demo user
  await prisma.match.deleteMany({ where: { userId: user.id } });

  const now = new Date("2026-05-31");

  type MatchRow = {
    days: number; opp: string; fmt: string; result: string;
    bat: [number, number, number, number, string, number];
    bowl: [number, number, number, number, number, number];
    field: [number, number, number];
  };

  // 20 matches spanning 6 months
  const matchData: MatchRow[] = [
    // Matches 1-7: decent form, building up
    { days: 180, opp: "Royal Challengers", fmt: "T20", result: "Won",    bat: [45, 38, 5, 1, "Caught",    1], bowl: [4, 28, 1, 0, 2, 0], field: [1, 0, 0] },
    { days: 165, opp: "Delhi Daredevils",  fmt: "ODI", result: "Lost",   bat: [62, 74, 7, 1, "Bowled",    1], bowl: [8, 52, 2, 0, 3, 1], field: [2, 0, 0] },
    { days: 152, opp: "Punjab Kings",      fmt: "T20", result: "Won",    bat: [33, 29, 3, 1, "LBW",       1], bowl: [3, 19, 2, 1, 1, 0], field: [0, 1, 0] },
    { days: 140, opp: "Rajasthan Royals",  fmt: "ODI", result: "Won",    bat: [88, 96, 9, 2, "Run Out",   2], bowl: [7, 41, 1, 1, 2, 0], field: [1, 0, 0] },
    { days: 128, opp: "Hyderabad SunRise", fmt: "T20", result: "Lost",   bat: [21, 20, 2, 0, "Caught",    1], bowl: [4, 35, 0, 0, 4, 1], field: [2, 0, 0] },
    { days: 115, opp: "Chennai SuperK",    fmt: "ODI", result: "Won",    bat: [74, 82, 8, 1, "Stumped",   1], bowl: [9, 48, 3, 1, 1, 0], field: [1, 1, 0] },
    { days: 103, opp: "Kolkata Knights",   fmt: "T20", result: "Won",    bat: [56, 42, 5, 2, "Not Out",   1], bowl: [4, 24, 1, 0, 2, 0], field: [0, 0, 0] },
    // Matches 8-10: dip in form
    { days: 91,  opp: "Lucknow Giants",    fmt: "T20", result: "Lost",   bat: [8,  12, 1, 0, "Bowled",    1], bowl: [3, 34, 0, 0, 5, 2], field: [0, 0, 0] },
    { days: 79,  opp: "Gujarat Titans",    fmt: "ODI", result: "Lost",   bat: [12, 18, 1, 0, "LBW",       1], bowl: [6, 58, 0, 0, 6, 1], field: [1, 0, 0] },
    { days: 67,  opp: "Delhi Daredevils",  fmt: "T20", result: "Lost",   bat: [7,  10, 0, 0, "Caught",    1], bowl: [4, 39, 1, 0, 3, 1], field: [0, 0, 0] },
    // Matches 11-13: recovery
    { days: 55,  opp: "Royal Challengers", fmt: "ODI", result: "Won",    bat: [44, 58, 5, 0, "Caught",    2], bowl: [8, 44, 2, 1, 1, 0], field: [2, 0, 0] },
    { days: 48,  opp: "Mumbai Indians",    fmt: "T20", result: "Draw",   bat: [38, 30, 4, 1, "Not Out",   1], bowl: [4, 27, 1, 0, 0, 0], field: [1, 1, 0] },
    { days: 41,  opp: "Punjab Kings",      fmt: "ODI", result: "Won",    bat: [58, 66, 6, 1, "Run Out",   1], bowl: [7, 38, 3, 2, 1, 0], field: [0, 0, 0] },
    // Matches 14-17: hot streak
    { days: 34,  opp: "Rajasthan Royals",  fmt: "T20", result: "Won",    bat: [92, 62, 8, 4, "Not Out",   1], bowl: [4, 20, 3, 1, 0, 0], field: [1, 0, 0] },
    { days: 28,  opp: "Hyderabad SunRise", fmt: "ODI", result: "Won",    bat: [112,118,11, 3, "Not Out",   1], bowl: [9, 44, 4, 2, 1, 0], field: [2, 1, 0] },
    { days: 22,  opp: "Chennai SuperK",    fmt: "T20", result: "Won",    bat: [78, 52, 7, 3, "Not Out",   1], bowl: [4, 22, 2, 1, 1, 0], field: [1, 0, 0] },
    { days: 17,  opp: "Kolkata Knights",   fmt: "ODI", result: "Won",    bat: [84, 91, 9, 2, "Bowled",    1], bowl: [8, 39, 3, 1, 0, 0], field: [3, 0, 0] },
    // Matches 18-20: strong bowling, good form
    { days: 12,  opp: "Lucknow Giants",    fmt: "T20", result: "Won",    bat: [47, 36, 4, 2, "Caught",    1], bowl: [4, 18, 3, 1, 0, 0], field: [1, 1, 0] },
    { days: 7,   opp: "Gujarat Titans",    fmt: "ODI", result: "Won",    bat: [69, 75, 7, 1, "Not Out",   1], bowl: [8, 36, 4, 2, 2, 0], field: [2, 0, 0] },
    { days: 2,   opp: "Mumbai Indians",    fmt: "T20", result: "Won",    bat: [55, 41, 5, 2, "Not Out",   1], bowl: [4, 21, 3, 1, 1, 0], field: [1, 0, 0] },
  ];

  const venues = [
    "Wankhede Stadium, Mumbai",
    "Eden Gardens, Kolkata",
    "M. Chinnaswamy Stadium, Bengaluru",
    "Feroz Shah Kotla, Delhi",
    "Sawai Mansingh Stadium, Jaipur",
    "Rajiv Gandhi Stadium, Hyderabad",
    "MA Chidambaram Stadium, Chennai",
    "Narendra Modi Stadium, Ahmedabad",
    "Punjab Cricket Association Stadium, Mohali",
    "BRSABV Ekana Stadium, Lucknow",
  ];

  const createdMatches: { id: string; days: number; rating?: number }[] = [];

  for (let i = 0; i < matchData.length; i++) {
    const d = matchData[i];
    const date = new Date(now);
    date.setDate(date.getDate() - d.days);

    const match = await prisma.match.create({
      data: {
        userId: user.id,
        opponent: d.opp,
        date,
        format: d.fmt,
        venue: venues[i % venues.length],
        result: d.result,
        notes: i % 4 === 0 ? "Good team performance overall. Focused on running between wickets." : undefined,
        batting: {
          create: {
            runs: d.bat[0],
            balls: d.bat[1],
            fours: d.bat[2],
            sixes: d.bat[3],
            dismissalType: d.bat[4],
            position: d.bat[5],
          },
        },
        bowling: {
          create: {
            overs: d.bowl[0],
            runsConceded: d.bowl[1],
            wickets: d.bowl[2],
            maidens: d.bowl[3],
            wides: d.bowl[4],
            noBalls: d.bowl[5],
          },
        },
        fielding: {
          create: {
            catches: d.field[0],
            runOuts: d.field[1],
            stumpings: d.field[2],
          },
        },
      },
    });

    createdMatches.push({ id: match.id, days: d.days });
  }

  // Generate rating history snapshots (cumulative after each match)
  const allMatches = await prisma.match.findMany({
    where: { userId: user.id },
    include: { batting: true, bowling: true, fielding: true },
    orderBy: { date: "asc" },
  });

  const { calculateCricketIQRating } = await import("../lib/rating");

  for (let i = 2; i <= allMatches.length; i++) {
    const subset = allMatches.slice(0, i);
    const breakdown = calculateCricketIQRating(subset as any);
    const matchDate = new Date(allMatches[i - 1].date);
    matchDate.setHours(23, 0, 0, 0);

    await prisma.ratingHistory.create({
      data: {
        userId: user.id,
        date: matchDate,
        rating: breakdown.total,
        breakdown: breakdown as any,
      },
    });
  }

  console.log(
    `Seeded ${matchData.length} matches for user: ${user.email}`
  );
  console.log("Demo credentials: demo@cricketiq.com / password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
