export type Pt = { x: number; y: number };

const r2 = (n: number) => Math.round(n * 100) / 100;

/** Map a series of values into SVG coordinate space (y inverted). */
export function scalePoints(
  values: number[],
  width: number,
  height: number,
  pad = 10
): Pt[] {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const innerW = width - pad * 2;
  const innerH = height - pad * 2;
  return values.map((v, i) => ({
    x: r2(pad + (i / (values.length - 1)) * innerW),
    y: r2(pad + innerH - ((v - min) / span) * innerH),
  }));
}

/** Catmull-Rom → cubic bezier smooth line through all points. */
export function smoothPath(pts: Pt[]): string {
  if (pts.length < 2) return "";
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    d += ` C ${r2(p1.x + (p2.x - p0.x) / 6)} ${r2(p1.y + (p2.y - p0.y) / 6)}, ${r2(
      p2.x - (p3.x - p1.x) / 6
    )} ${r2(p2.y - (p3.y - p1.y) / 6)}, ${p2.x} ${p2.y}`;
  }
  return d;
}

/** Closed path under the smooth line, for gradient area fills. */
export function areaPath(pts: Pt[], height: number): string {
  if (pts.length < 2) return "";
  const last = pts[pts.length - 1];
  return `${smoothPath(pts)} L ${last.x} ${height} L ${pts[0].x} ${height} Z`;
}
