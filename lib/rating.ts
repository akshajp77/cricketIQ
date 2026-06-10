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

function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  return Math.min(Math.max(value, min), max);
}

export function calculateCricketIQRating(matches: FullMatch[]): RatingBreakdown {
  if (matches.length === 0) {
    return { batting: 0, bowling: 0, fielding: 0, form: 0, total: 0 };
  }

  const batting = calcBattingStats(matches);
  const bowling = calcBowlingStats(matches);
  const fielding = calcFieldingStats(matches);

  // ── BATTING (max 40) ───────────────────────────────────────────────────────
  const avgScore       = clamp(batting.battingAvg / 50, 0, 1) * 20;
  const srScore        = clamp(batting.strikeRate / 140, 0, 1) * 12;
  const milestones     = clamp((batting.fifties + batting.hundreds * 2) / 10, 0, 1) * 8;
  const battingScore   = clamp(avgScore + srScore + milestones, 0, 40);

  // ── BOWLING (max 35) ───────────────────────────────────────────────────────
  const wktScore   = clamp(bowling.wicketsPerMatch / 2, 0, 1) * 15;
  // lower economy = better; range [0,10] → score [0,12]
  const ecoScore   = clamp((10 - bowling.economy) / 6, 0, 1) * 12;
  // lower bowling avg = better; range [0,40] → score [0,8]
  const bowlAvg    = clamp((40 - bowling.bowlingAvg) / 30, 0, 1) * 8;
  const bowlingScore = clamp(wktScore + ecoScore + bowlAvg, 0, 35);

  // ── FIELDING (max 10) ──────────────────────────────────────────────────────
  const fieldingIndex =
    (fielding.totalCatches + fielding.totalRunOuts * 1.5) /
    Math.max(matches.length, 1);
  const fieldingScore = clamp(fieldingIndex * 10, 0, 10);

  // ── FORM (max 15) ─────────────────────────────────────────────────────────
  const sorted = [...matches].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  const last5 = sorted.slice(0, 5);
  const last5Batting = last5.filter(
    (m) => m.batting?.dismissalType !== "Did Not Bat"
  );
  const last5Runs = last5.reduce((s, m) => s + (m.batting?.runs ?? 0), 0);
  const last5Avg  = last5Batting.length > 0 ? last5Runs / last5Batting.length : 0;

  let formScore: number;
  if (batting.battingAvg > 0 && last5Avg > 0) {
    formScore = clamp((last5Avg / batting.battingAvg) * 15, 0, 15);
  } else {
    formScore = 7.5; // default for brand-new players
  }

  const total = clamp(battingScore + bowlingScore + fieldingScore + formScore, 0, 100);

  return {
    batting:  Math.round(battingScore  * 10) / 10,
    bowling:  Math.round(bowlingScore  * 10) / 10,
    fielding: Math.round(fieldingScore * 10) / 10,
    form:     Math.round(formScore     * 10) / 10,
    total:    Math.round(total         * 10) / 10,
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
  if (rating >= 85) return "#10B981";
  if (rating >= 70) return "#10B981";
  if (rating >= 55) return "#F59E0B";
  if (rating >= 40) return "#F97316";
  return "#EF4444";
}
