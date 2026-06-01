import type { FullMatch } from "./stats";
import {
  calcBattingStats,
  calcBowlingStats,
  calcFieldingStats,
} from "./stats";

export interface RatingBreakdown {
  batting: number;
  bowling: number;
  fielding: number;
  form: number;
  total: number;
}

export function calculateCricketIQRating(matches: FullMatch[]): RatingBreakdown {
  if (matches.length === 0) {
    return { batting: 0, bowling: 0, fielding: 0, form: 0, total: 0 };
  }

  const batting = calcBattingStats(matches);
  const bowling = calcBowlingStats(matches);
  const fielding = calcFieldingStats(matches);

  // Batting (40pts): avg/60*20 + SR/150*10 + consistency*10
  const avgScore = Math.min((batting.battingAvg / 60) * 20, 20);
  const srScore = Math.min((batting.strikeRate / 150) * 10, 10);
  const consistencyScore = Math.min(
    ((batting.fifties + batting.hundreds * 2) / Math.max(batting.innings, 1)) * 20,
    10
  );
  const battingScore = avgScore + srScore + consistencyScore;

  // Bowling (35pts): wickets_per_match*5 + economy_score*15 + SR_score*15
  const wicketsScore = Math.min(bowling.wicketsPerMatch * 5, 10);
  const economyScore = Math.min(
    bowling.economy > 0 ? Math.max(0, (10 - bowling.economy) / 10) * 15 : 0,
    15
  );
  const bowlingSRScore = Math.min(
    bowling.bowlingSR > 0 ? Math.max(0, (30 - bowling.bowlingSR) / 30) * 15 : 0,
    15
  );
  const bowlingScore = wicketsScore + economyScore + bowlingSRScore;

  // Fielding (10pts): (catches + runouts*1.5 + stumpings*2) / matches * 10
  const fieldingIndex =
    (fielding.totalCatches +
      fielding.totalRunOuts * 1.5 +
      fielding.totalStumpings * 2) /
    Math.max(matches.length, 1);
  const fieldingScore = Math.min(fieldingIndex * 10, 10);

  // Form (15pts): last5_avg / career_avg * 15
  const sorted = [...matches].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  const last5 = sorted.slice(0, 5);
  const last5Innings = last5.filter(
    (m) =>
      m.batting?.dismissalType !== "Did Not Bat" &&
      m.batting?.dismissalType !== "Not Out"
  );
  const last5Runs = last5.reduce((s, m) => s + (m.batting?.runs ?? 0), 0);
  const last5Avg =
    last5Innings.length > 0 ? last5Runs / last5Innings.length : batting.battingAvg;
  const formScore = Math.min(
    batting.battingAvg > 0 ? (last5Avg / batting.battingAvg) * 15 : 7.5,
    15
  );

  const total = Math.min(
    Math.max(battingScore + bowlingScore + fieldingScore + formScore, 0),
    100
  );

  return {
    batting: Math.round(battingScore * 10) / 10,
    bowling: Math.round(bowlingScore * 10) / 10,
    fielding: Math.round(fieldingScore * 10) / 10,
    form: Math.round(formScore * 10) / 10,
    total: Math.round(total * 10) / 10,
  };
}

export function getRatingLabel(rating: number): string {
  if (rating >= 85) return "Elite";
  if (rating >= 70) return "Excellent";
  if (rating >= 55) return "Good";
  if (rating >= 40) return "Average";
  if (rating >= 25) return "Developing";
  return "Beginner";
}

export function getRatingColor(rating: number): string {
  if (rating >= 85) return "#00D4AA";
  if (rating >= 70) return "#10B981";
  if (rating >= 55) return "#F59E0B";
  if (rating >= 40) return "#F97316";
  return "#EF4444";
}
