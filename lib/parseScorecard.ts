// Parses CricClubs scorecards (CSV or XLSX) into structured player stats.

export interface ScorecardBatting {
  runs: number;
  balls: number;
  fours: number;
  sixes: number;
  dismissalType: string;
  didBat: boolean;
}

export interface ScorecardBowling {
  overs: number;
  runsConceded: number;
  wickets: number;
  maidens: number;
  wides: number;
  noBalls: number;
  dotBalls: number;
  didBowl: boolean;
}

export interface ScorecardMeta {
  rawTitle: string;
  date: string | null;       // ISO date string
  team1: string | null;
  team2: string | null;
  winnerTeam: string | null;
  winMargin: string | null;
}

export interface ScorecardPlayerMatch {
  name: string;              // as found in the scorecard
  batting: ScorecardBatting | null;
  bowling: ScorecardBowling | null;
}

export type ParseScorecardResult =
  | { ok: true; meta: ScorecardMeta; matches: ScorecardPlayerMatch[] }
  | { ok: false; error: string };

// ── helpers ──────────────────────────────────────────────────────────────────

function norm(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, " ");
}

function safeInt(s: string | undefined): number {
  const n = parseInt((s ?? "").trim(), 10);
  return isNaN(n) ? 0 : Math.max(0, n);
}

function safeFloat(s: string | undefined): number {
  const n = parseFloat((s ?? "").trim());
  return isNaN(n) ? 0 : Math.max(0, n);
}

function fuzzyMatch(query: string, target: string): boolean {
  const q = norm(query);
  const t = norm(target);
  if (!q || !t) return false;
  return t === q || t.includes(q) || q.includes(t);
}

function mapDismissal(howOut: string): string {
  const h = norm(howOut);
  if (!h || h === "did not bat" || h === "dnb" || h === "-") return "Did Not Bat";
  if (h === "not out" || h === "no") return "Not Out";
  if (h.startsWith("bowled") || h === "b") return "Bowled";
  if (
    h.startsWith("caught") ||
    h.startsWith("c ") ||
    h === "c&b" ||
    h.startsWith("c&b") ||
    h.startsWith("caught and bowled")
  )
    return "Caught";
  if (h === "lbw") return "LBW";
  if (h.startsWith("run out") || h === "ro") return "Run Out";
  if (h.startsWith("stumped") || h.startsWith("st ")) return "Caught";
  if (h.startsWith("hit wicket") || h === "hw") return "Bowled";
  if (h === "retired" || h.startsWith("retired")) return "Retired";
  return "Not Out"; // fallback
}

// ── row-to-grid conversion ────────────────────────────────────────────────────

async function fileToRows(file: File): Promise<string[][]> {
  const isExcel =
    file.name.endsWith(".xlsx") ||
    file.name.endsWith(".xls") ||
    file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
    file.type === "application/vnd.ms-excel";

  if (isExcel) {
    const { read, utils } = await import("xlsx");
    const buf = await file.arrayBuffer();
    const wb = read(buf, { type: "array" });
    const ws = wb.Sheets[wb.SheetNames[0]];
    const raw = utils.sheet_to_json<string[]>(ws, { header: 1, defval: "" });
    return raw.map((r) => r.map(String));
  }

  // CSV
  const { default: Papa } = await import("papaparse");
  const text = await file.text();
  const result = Papa.parse<string[]>(text, { header: false, skipEmptyLines: false });
  return result.data.map((r) => r.map(String));
}

// ── metadata parsing ──────────────────────────────────────────────────────────

function parseMatchMeta(rows: string[][]): ScorecardMeta {
  const titleLines = rows.slice(0, 5).map((r) =>
    r
      .map((c) => c.trim())
      .filter(Boolean)
      .join(" ")
  );
  const fullText = titleLines.join(" ");

  // Date: (MM/DD/YYYY) or (M/D/YYYY)
  let date: string | null = null;
  const dateMatch = fullText.match(/\((\d{1,2})\/(\d{1,2})\/(\d{4})\)/);
  if (dateMatch) {
    const [, mm, dd, yyyy] = dateMatch;
    const d = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
    if (!isNaN(d.getTime())) date = d.toISOString();
  }

  // Teams: "TeamA Vs TeamB" pattern
  let team1: string | null = null;
  let team2: string | null = null;
  const vsMatch = fullText.match(
    /([A-Za-z0-9 &'\-]+?)\s+[Vv]s?\.?\s+([A-Za-z0-9 &'\-]+?)(?:\s+(?:won|lost|tied|\d|\())/
  );
  if (vsMatch) {
    team1 = vsMatch[1].trim();
    team2 = vsMatch[2].trim();
  }

  // Winner & margin: "TeamName won by N runs/wickets"
  let winnerTeam: string | null = null;
  let winMargin: string | null = null;
  const wonMatch = fullText.match(
    /([A-Za-z0-9 &'\-]+?)\s+won\s+by\s+(\d+\s+(?:runs?|wickets?))/i
  );
  if (wonMatch) {
    winnerTeam = wonMatch[1].trim();
    winMargin = wonMatch[2].trim();
  }

  return { rawTitle: fullText.slice(0, 200), date, team1, team2, winnerTeam, winMargin };
}

// ── section parsing ───────────────────────────────────────────────────────────

interface Section {
  type: "batting" | "bowling";
  colIndex: Record<string, number>;
  dataRows: string[][];
}

const BATTING_END_MARKERS = new Set([
  "extras", "total", "fall of wickets", "fow", "did not bat", "bowling",
]);
const BOWLING_END_MARKERS = new Set([
  "extras", "total", "fall of wickets", "fow", "batting",
]);

function isBattingHeaderRow(row: string[]): boolean {
  return row.some((c) => norm(c) === "batsman" || norm(c) === "batman");
}

function isBowlingHeaderRow(row: string[]): boolean {
  return row.some((c) => norm(c) === "bowler");
}

function buildColIndex(headerRow: string[]): Record<string, number> {
  const idx: Record<string, number> = {};
  headerRow.forEach((c, i) => {
    const key = norm(c);
    if (key) idx[key] = i;
  });
  return idx;
}

function parseSections(rows: string[][]): Section[] {
  const sections: Section[] = [];
  let i = 0;

  while (i < rows.length) {
    const row = rows[i];
    const nonEmpty = row.map(norm).filter(Boolean);
    const firstCell = nonEmpty[0] ?? "";

    if (firstCell === "batting") {
      i++;
      while (i < rows.length && !isBattingHeaderRow(rows[i])) i++;
      if (i >= rows.length) break;
      const colIndex = buildColIndex(rows[i]);
      i++;
      const dataRows: string[][] = [];
      while (i < rows.length) {
        const r = rows[i];
        const fc = norm(r[0] ?? "");
        if (!fc || BATTING_END_MARKERS.has(fc)) break;
        dataRows.push(r);
        i++;
      }
      sections.push({ type: "batting", colIndex, dataRows });
      continue;
    }

    if (firstCell === "bowling") {
      i++;
      while (i < rows.length && !isBowlingHeaderRow(rows[i])) i++;
      if (i >= rows.length) break;
      const colIndex = buildColIndex(rows[i]);
      i++;
      const dataRows: string[][] = [];
      while (i < rows.length) {
        const r = rows[i];
        const fc = norm(r[0] ?? "");
        if (!fc || BOWLING_END_MARKERS.has(fc)) break;
        dataRows.push(r);
        i++;
      }
      sections.push({ type: "bowling", colIndex, dataRows });
      continue;
    }

    i++;
  }

  return sections;
}

// ── player extraction ─────────────────────────────────────────────────────────

function extractBatting(row: string[], col: Record<string, number>): ScorecardBatting {
  const get = (keys: string[]) => {
    for (const k of keys) {
      if (col[k] !== undefined) return row[col[k]] ?? "";
    }
    return "";
  };

  const howOut = get(["how out", "howout", "out"]);
  const runs = safeInt(get(["runs"]));
  const balls = safeInt(get(["balls", "b"]));
  const fours = safeInt(get(["fours", "4s"]));
  const sixes = safeInt(get(["sixers", "sixes", "6s"]));
  const dismissalType = mapDismissal(howOut);

  return {
    runs,
    balls,
    fours,
    sixes,
    dismissalType,
    didBat: dismissalType !== "Did Not Bat",
  };
}

function extractBowling(row: string[], col: Record<string, number>): ScorecardBowling {
  const get = (keys: string[]) => {
    for (const k of keys) {
      if (col[k] !== undefined) return row[col[k]] ?? "";
    }
    return "";
  };

  return {
    overs: safeFloat(get(["overs", "o"])),
    runsConceded: safeInt(get(["runs", "r"])),
    wickets: safeInt(get(["wickets", "wkts", "w"])),
    maidens: safeInt(get(["maidens", "m"])),
    wides: safeInt(get(["wides", "wd"])),
    noBalls: safeInt(get(["no balls", "noballs", "nb"])),
    dotBalls: safeInt(get(["dot balls", "dotballs", "dots", "db"])),
    didBowl: true,
  };
}

function findInSection(
  section: Section,
  playerName: string
): { row: string[]; name: string }[] {
  const nameCol =
    section.colIndex["batsman"] ??
    section.colIndex["batman"] ??
    section.colIndex["bowler"] ??
    0;
  const results: { row: string[]; name: string }[] = [];
  for (const row of section.dataRows) {
    const cellName = (row[nameCol] ?? "").trim();
    if (cellName && fuzzyMatch(playerName, cellName)) {
      results.push({ row, name: cellName });
    }
  }
  return results;
}

// ── main export ───────────────────────────────────────────────────────────────

export async function parseScorecard(
  file: File,
  playerName: string
): Promise<ParseScorecardResult> {
  if (!playerName.trim()) {
    return { ok: false, error: "Please enter your name as it appears in the scorecard." };
  }

  let rows: string[][];
  try {
    rows = await fileToRows(file);
  } catch {
    return {
      ok: false,
      error: "Failed to read the file. Please check it is a valid CSV or Excel file.",
    };
  }

  if (rows.length < 3) {
    return {
      ok: false,
      error: "File appears to be empty or too short to be a CricClubs scorecard.",
    };
  }

  const meta = parseMatchMeta(rows);
  const sections = parseSections(rows);

  if (sections.length === 0) {
    return {
      ok: false,
      error:
        'No batting or bowling sections found. Make sure this is a CricClubs scorecard with "Batting" and "Bowling" section headers.',
    };
  }

  // Search all sections for the player
  const battingCandidates: { name: string; batting: ScorecardBatting }[] = [];
  for (const section of sections) {
    if (section.type !== "batting") continue;
    for (const { row, name } of findInSection(section, playerName)) {
      battingCandidates.push({ name, batting: extractBatting(row, section.colIndex) });
    }
  }

  const bowlingCandidates: { name: string; bowling: ScorecardBowling }[] = [];
  for (const section of sections) {
    if (section.type !== "bowling") continue;
    for (const { row, name } of findInSection(section, playerName)) {
      bowlingCandidates.push({ name, bowling: extractBowling(row, section.colIndex) });
    }
  }

  if (battingCandidates.length === 0 && bowlingCandidates.length === 0) {
    return {
      ok: false,
      error: `Could not find "${playerName}" in the scorecard. Check the spelling or try a shorter version of the name (e.g., first name only).`,
    };
  }

  // Merge candidates by normalised name
  const byName = new Map<string, ScorecardPlayerMatch>();

  for (const { name, batting } of battingCandidates) {
    const key = norm(name);
    const existing = byName.get(key) ?? { name, batting: null, bowling: null };
    existing.batting = batting;
    byName.set(key, existing);
  }

  for (const { name, bowling } of bowlingCandidates) {
    const key = norm(name);
    const existing = byName.get(key) ?? { name, batting: null, bowling: null };
    existing.bowling = bowling;
    byName.set(key, existing);
  }

  return { ok: true, meta, matches: Array.from(byName.values()) };
}
