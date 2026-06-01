import type { BallEvent } from "@/app/generated/prisma/client";

export function getShotDistribution(balls: BallEvent[]) {
  const regions: Record<string, number> = {
    offside: 0,
    onside: 0,
    straight: 0,
  };
  balls.forEach((b) => {
    if (b.shotRegion && regions[b.shotRegion] !== undefined) {
      regions[b.shotRegion]++;
    }
  });
  return Object.entries(regions).map(([region, count]) => ({ region, count }));
}

export function getStrikeRateVsSpin(
  balls: BallEvent[],
  _spinBowlerIds: string[]
) {
  // Placeholder: compare SR against identified spin bowlers
  const spinBalls = balls.filter((b) =>
    _spinBowlerIds.includes(b.bowlingPlayerId ?? "")
  );
  const totalRuns = spinBalls.reduce((s, b) => s + b.runs, 0);
  const sr = spinBalls.length > 0 ? (totalRuns / spinBalls.length) * 100 : 0;
  return { spinBalls: spinBalls.length, strikeRate: sr };
}

export function getWicketOverDistribution(balls: BallEvent[]) {
  const distribution: Record<number, number> = {};
  balls
    .filter((b) => b.wicket)
    .forEach((b) => {
      const phase =
        b.over <= 6 ? 1 : b.over <= 15 ? 2 : b.over <= 40 ? 3 : 4;
      distribution[phase] = (distribution[phase] ?? 0) + 1;
    });
  return [
    { phase: "Powerplay (1-6)", wickets: distribution[1] ?? 0 },
    { phase: "Middle (7-15)", wickets: distribution[2] ?? 0 },
    { phase: "Late (16-40)", wickets: distribution[3] ?? 0 },
    { phase: "Death (41+)", wickets: distribution[4] ?? 0 },
  ];
}

export function getRunsByShotRegion(balls: BallEvent[]) {
  const totals: Record<string, number> = {
    offside: 0,
    onside: 0,
    straight: 0,
  };
  balls.forEach((b) => {
    if (b.shotRegion && totals[b.shotRegion] !== undefined) {
      totals[b.shotRegion] += b.runs;
    }
  });
  return Object.entries(totals).map(([region, runs]) => ({ region, runs }));
}
