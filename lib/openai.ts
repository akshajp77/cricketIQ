import OpenAI from "openai";

let _openai: OpenAI | null = null;

export function getOpenAI(): OpenAI {
  if (!_openai) {
    _openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY ?? "placeholder",
    });
  }
  return _openai;
}

export function buildCricketAnalysisPrompt(data: {
  playerName: string;
  careerStats: {
    matches: number;
    totalRuns: number;
    battingAvg: number;
    strikeRate: number;
    highestScore: number;
    fifties: number;
    hundreds: number;
    totalWickets: number;
    bowlingAvg: number;
    economy: number;
    bestFigures: string;
    catches: number;
    rating: number;
  };
  recentMatches: Array<{
    date: string;
    opponent: string;
    format: string;
    result: string;
    runs: number;
    balls: number;
    wickets: number;
    overs: number;
    economy: number;
  }>;
  trends: {
    last5Avg: number;
    careerAvg: number;
    last5WicketsPerMatch: number;
    formTrend: string;
  };
}): string {
  return `You are CricketIQ AI, a world-class cricket performance analyst and coach.

Analyze this player's comprehensive cricket data and provide actionable, specific insights.

PLAYER: ${data.playerName}

CAREER STATISTICS:
- Matches: ${data.careerStats.matches}
- Total Runs: ${data.careerStats.totalRuns}
- Batting Average: ${data.careerStats.battingAvg.toFixed(2)}
- Strike Rate: ${data.careerStats.strikeRate.toFixed(2)}
- Highest Score: ${data.careerStats.highestScore}
- 50s/100s: ${data.careerStats.fifties}/${data.careerStats.hundreds}
- Total Wickets: ${data.careerStats.totalWickets}
- Bowling Average: ${data.careerStats.bowlingAvg.toFixed(2)}
- Economy Rate: ${data.careerStats.economy.toFixed(2)}
- Best Figures: ${data.careerStats.bestFigures}
- Catches: ${data.careerStats.catches}
- CricketIQ Rating: ${data.careerStats.rating.toFixed(1)}/100

RECENT 10 MATCHES:
${data.recentMatches
  .map(
    (m, i) =>
      `${i + 1}. vs ${m.opponent} (${m.format}) - ${m.result} | Bat: ${m.runs}(${m.balls}) | Bowl: ${m.wickets}/${(m.overs * 6 * m.economy).toFixed(0)} (${m.overs} overs, eco: ${m.economy.toFixed(2)})`
  )
  .join("\n")}

PERFORMANCE TRENDS:
- Last 5 matches avg: ${data.trends.last5Avg.toFixed(2)} (career: ${data.trends.careerAvg.toFixed(2)})
- Last 5 wickets per match: ${data.trends.last5WicketsPerMatch.toFixed(2)}
- Current form: ${data.trends.formTrend}

Provide a comprehensive performance analysis in the following exact JSON format:
{
  "strengths": ["strength 1", "strength 2", "strength 3", "strength 4"],
  "weaknesses": ["weakness 1", "weakness 2", "weakness 3"],
  "improvements": ["improvement 1", "improvement 2", "improvement 3", "improvement 4"],
  "trainingPlan": "Week 1: [specific drills]\\nWeek 2: [specific drills]\\nWeek 3: [specific drills]\\nWeek 4: [review and match simulation]",
  "matchStrategy": "Detailed match strategy covering batting approach, bowling plans, and field placement recommendations based on the data patterns."
}

Be specific, data-driven, and actionable. Reference actual statistics in your analysis.`;
}
