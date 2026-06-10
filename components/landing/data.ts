// Realistic demo data powering the landing-page product showcases.

export const ratingTrend = [
  { label: "vs Houston CC", value: 58 },
  { label: "vs Bay Strikers", value: 63 },
  { label: "vs Dallas Lions", value: 61 },
  { label: "vs Metro Titans", value: 67 },
  { label: "vs Austin Kings", value: 72 },
  { label: "vs River Hawks", value: 69 },
  { label: "vs Houston CC", value: 76 },
  { label: "vs Bay Strikers", value: 81 },
  { label: "vs Metro Titans", value: 86 },
  { label: "vs Dallas Lions", value: 92 },
];

export const recentMatches = [
  { opponent: "Dallas Lions", score: "58 (34)", result: "W", delta: "+6 IQ" },
  { opponent: "Metro Titans", score: "72 (49)", result: "W", delta: "+5 IQ" },
  { opponent: "Austin Kings", score: "31 (18)", result: "L", delta: "+2 IQ" },
] as const;

export const battingStats = {
  runs: "1,842",
  average: "42.8",
  strikeRate: "136.4",
};

export const bowlingStats = {
  wickets: "87",
  economy: "6.1",
  bestFigures: "5/24",
};

export const cricketIQRating = 92;

export const aiInsights = {
  strengths: ["Excellent against pace bowling", "Strong finisher in death overs"],
  weaknesses: ["Strike rate drops against spin", "Slow starts in powerplay"],
  recommendations: [
    "Increase sweep-shot practice",
    "Focus on strike rotation in middle overs",
  ],
};

// ── Deep-dive: batting ──
export const runProgression = [24, 41, 38, 56, 49, 67, 58, 74, 72, 88];
export const averageProgression = [24.0, 32.5, 34.3, 39.8, 41.6, 45.8, 44.1, 47.9, 49.2, 52.4];
export const strikeRateProgression = [104, 112, 109, 121, 118, 127, 124, 131, 129, 136];

// ── Deep-dive: bowling ──
export const wicketsPerMatch = [1, 3, 2, 0, 4, 2, 3, 1, 5, 3];
export const economyTrend = [7.8, 7.2, 7.4, 6.9, 6.4, 6.6, 6.2, 6.3, 5.8, 6.1];

// ── Deep-dive: fielding ──
export const fieldingStats = {
  catches: 34,
  runOuts: 11,
  contributionScore: 8.4,
};

export const metrics = [
  { value: 10000, suffix: "+", label: "Matches Analyzed" },
  { value: 5000, suffix: "+", label: "AI Reports Generated" },
  { value: 1000, suffix: "+", label: "Active Players" },
  { value: 40, suffix: "+", label: "Academies & Clubs" },
];
