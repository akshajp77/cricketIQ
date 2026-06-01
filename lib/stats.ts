import type {
  Match,
  BattingPerf,
  BowlingPerf,
  FieldingPerf,
} from "@/app/generated/prisma/client";

export type FullMatch = Match & {
  batting: BattingPerf | null;
  bowling: BowlingPerf | null;
  fielding: FieldingPerf | null;
};

export function calcBattingStats(matches: FullMatch[]) {
  const innings = matches.filter(
    (m) => m.batting && m.batting.dismissalType !== "Did Not Bat"
  );
  const dismissed = innings.filter(
    (m) => m.batting?.dismissalType !== "Not Out"
  );

  const totalRuns = innings.reduce((sum, m) => sum + (m.batting?.runs ?? 0), 0);
  const totalBalls = innings.reduce(
    (sum, m) => sum + (m.batting?.balls ?? 0),
    0
  );
  const totalFours = innings.reduce(
    (sum, m) => sum + (m.batting?.fours ?? 0),
    0
  );
  const totalSixes = innings.reduce(
    (sum, m) => sum + (m.batting?.sixes ?? 0),
    0
  );
  const highestScore = Math.max(...innings.map((m) => m.batting?.runs ?? 0), 0);

  const battingAvg =
    dismissed.length > 0 ? totalRuns / dismissed.length : totalRuns;
  const strikeRate = totalBalls > 0 ? (totalRuns / totalBalls) * 100 : 0;

  const fifties = innings.filter(
    (m) =>
      (m.batting?.runs ?? 0) >= 50 && (m.batting?.runs ?? 0) < 100
  ).length;
  const hundreds = innings.filter((m) => (m.batting?.runs ?? 0) >= 100).length;

  return {
    matches: matches.length,
    innings: innings.length,
    totalRuns,
    totalBalls,
    totalFours,
    totalSixes,
    highestScore,
    battingAvg,
    strikeRate,
    fifties,
    hundreds,
    dismissedCount: dismissed.length,
  };
}

export function calcBowlingStats(matches: FullMatch[]) {
  const bowlingMatches = matches.filter(
    (m) => m.bowling && m.bowling.overs > 0
  );

  const totalWickets = bowlingMatches.reduce(
    (sum, m) => sum + (m.bowling?.wickets ?? 0),
    0
  );
  const totalOvers = bowlingMatches.reduce(
    (sum, m) => sum + (m.bowling?.overs ?? 0),
    0
  );
  const totalRuns = bowlingMatches.reduce(
    (sum, m) => sum + (m.bowling?.runsConceded ?? 0),
    0
  );
  const totalMaidens = bowlingMatches.reduce(
    (sum, m) => sum + (m.bowling?.maidens ?? 0),
    0
  );

  const economy = totalOvers > 0 ? totalRuns / totalOvers : 0;
  const bowlingAvg = totalWickets > 0 ? totalRuns / totalWickets : 0;
  const bowlingSR =
    totalWickets > 0 ? (totalOvers * 6) / totalWickets : 0;

  // Best figures: most wickets, then least runs
  let bestFigures = "0/0";
  if (bowlingMatches.length > 0) {
    const best = bowlingMatches.reduce((prev, curr) => {
      const pw = prev.bowling?.wickets ?? 0;
      const cw = curr.bowling?.wickets ?? 0;
      if (cw > pw) return curr;
      if (cw === pw && (curr.bowling?.runsConceded ?? 999) < (prev.bowling?.runsConceded ?? 999))
        return curr;
      return prev;
    });
    bestFigures = `${best.bowling?.wickets ?? 0}/${best.bowling?.runsConceded ?? 0}`;
  }

  return {
    bowlingMatches: bowlingMatches.length,
    totalWickets,
    totalOvers,
    totalRuns,
    totalMaidens,
    economy,
    bowlingAvg,
    bowlingSR,
    bestFigures,
    wicketsPerMatch:
      bowlingMatches.length > 0 ? totalWickets / bowlingMatches.length : 0,
  };
}

export function calcFieldingStats(matches: FullMatch[]) {
  const totalCatches = matches.reduce(
    (sum, m) => sum + (m.fielding?.catches ?? 0),
    0
  );
  const totalRunOuts = matches.reduce(
    (sum, m) => sum + (m.fielding?.runOuts ?? 0),
    0
  );
  const totalStumpings = matches.reduce(
    (sum, m) => sum + (m.fielding?.stumpings ?? 0),
    0
  );

  return {
    totalCatches,
    totalRunOuts,
    totalStumpings,
    totalDismissals: totalCatches + totalRunOuts + totalStumpings,
  };
}

export function getFormTrend(matches: FullMatch[]): {
  label: string;
  direction: "up" | "down" | "stable";
  pct: number;
} {
  if (matches.length < 6)
    return { label: "Consistent", direction: "stable", pct: 0 };

  const sorted = [...matches].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  const last5 = sorted.slice(0, 5);
  const career = sorted;

  const last5Runs = last5.reduce((s, m) => s + (m.batting?.runs ?? 0), 0);
  const last5Innings = last5.filter(
    (m) => m.batting?.dismissalType !== "Did Not Bat"
  ).length;
  const last5Avg = last5Innings > 0 ? last5Runs / last5Innings : 0;

  const careerRuns = career.reduce((s, m) => s + (m.batting?.runs ?? 0), 0);
  const careerInnings = career.filter(
    (m) => m.batting?.dismissalType !== "Did Not Bat"
  ).length;
  const careerAvg = careerInnings > 0 ? careerRuns / careerInnings : 0;

  if (careerAvg === 0) return { label: "Consistent", direction: "stable", pct: 0 };

  const pct = ((last5Avg - careerAvg) / careerAvg) * 100;

  if (pct > 5) return { label: "↑ Improving", direction: "up", pct };
  if (pct < -5) return { label: "↓ Needs Improvement", direction: "down", pct };
  return { label: "→ Consistent", direction: "stable", pct };
}

export function getRunsOverTime(matches: FullMatch[]) {
  return [...matches]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((m, i) => ({
      match: i + 1,
      date: new Date(m.date).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
      }),
      runs: m.batting?.runs ?? 0,
      opponent: m.opponent,
      format: m.format,
    }));
}

export function getBattingAvgOverTime(matches: FullMatch[]) {
  const sorted = [...matches].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  let runningRuns = 0;
  let runningDismissals = 0;

  return sorted.map((m, i) => {
    if (
      m.batting?.dismissalType !== "Did Not Bat" &&
      m.batting?.dismissalType !== "Not Out"
    ) {
      runningRuns += m.batting?.runs ?? 0;
      runningDismissals++;
    } else if (m.batting?.dismissalType !== "Did Not Bat") {
      runningRuns += m.batting?.runs ?? 0;
    }

    return {
      match: i + 1,
      date: new Date(m.date).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
      }),
      avg: runningDismissals > 0 ? runningRuns / runningDismissals : 0,
    };
  });
}

export function getStrikeRateOverTime(matches: FullMatch[]) {
  return [...matches]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .filter((m) => m.batting?.dismissalType !== "Did Not Bat" && (m.batting?.balls ?? 0) > 0)
    .map((m, i) => ({
      match: i + 1,
      date: new Date(m.date).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
      }),
      sr:
        (m.batting?.balls ?? 0) > 0
          ? ((m.batting?.runs ?? 0) / (m.batting?.balls ?? 1)) * 100
          : 0,
    }));
}

export function getWicketsPerMatch(matches: FullMatch[]) {
  return [...matches]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((m, i) => ({
      match: i + 1,
      date: new Date(m.date).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
      }),
      wickets: m.bowling?.wickets ?? 0,
    }));
}

export function getEconomyOverTime(matches: FullMatch[]) {
  return [...matches]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .filter((m) => (m.bowling?.overs ?? 0) > 0)
    .map((m, i) => ({
      match: i + 1,
      date: new Date(m.date).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
      }),
      economy:
        (m.bowling?.overs ?? 0) > 0
          ? (m.bowling?.runsConceded ?? 0) / (m.bowling?.overs ?? 1)
          : 0,
    }));
}

export function getDismissalDistribution(matches: FullMatch[]) {
  const counts: Record<string, number> = {};
  matches.forEach((m) => {
    const d = m.batting?.dismissalType ?? "Did Not Bat";
    counts[d] = (counts[d] ?? 0) + 1;
  });
  return Object.entries(counts).map(([name, value]) => ({ name, value }));
}

export function getSparklineData(matches: FullMatch[], field: "runs" | "wickets" | "economy") {
  return [...matches]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10)
    .reverse()
    .map((m) => {
      if (field === "runs") return { v: m.batting?.runs ?? 0 };
      if (field === "wickets") return { v: m.bowling?.wickets ?? 0 };
      if (field === "economy")
        return {
          v:
            (m.bowling?.overs ?? 0) > 0
              ? (m.bowling?.runsConceded ?? 0) / (m.bowling?.overs ?? 1)
              : 0,
        };
      return { v: 0 };
    });
}
