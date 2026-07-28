/**
 * lib/chart-tokens.ts
 * ---------------------------------------------------------------------------
 * The portal's chart colours, in one place.
 *
 * These are NOT arbitrary. They were validated against the six standard
 * data-viz checks (lightness band, chroma floor, colour-vision separation,
 * normal-vision floor, contrast) on the portal's white card surface. Two
 * results are worth knowing before anyone changes them:
 *
 * 1. Brand navy #16365C is NOT usable as a chart colour. Its OKLCH lightness is
 *    0.33 against a legal band of 0.43–0.77, and its chroma is 0.077 against a
 *    floor of 0.10 — at bar scale it reads as near-black rather than as a hue.
 *    `series1` below is the same hue stepped into the legal band, so it still
 *    reads as CSL navy but survives being a data mark.
 *
 * 2. Green-versus-red is NOT usable as a chart encoding. Measured separation
 *    for #1E8E5A vs #C0392B is ΔE 6.1 under deuteranopia, against 16.6 for
 *    navy vs red. Profit/loss bars therefore use navy/red. Green and red are
 *    reserved for KPI *numbers*, where a +/- sign and an arrow icon carry the
 *    meaning and colour is only reinforcement.
 *
 * Brand gold sits at 2.64:1 on white, below the 3:1 floor for marks. Any chart
 * that uses it must ship visible value labels and a table view as the relief.
 * ---------------------------------------------------------------------------
 */

export const CHART = {
  /** Primary series — CSL navy hue, stepped into a legal chart lightness band. */
  series1: "#245691",
  /** Secondary series — brand gold, exact. Requires direct labels (2.64:1). */
  series2: "#C19A3E",
  /** Tertiary series — brand success, exact. */
  series3: "#1E8E5A",

  /** Diverging poles for charts. Never green/red here. */
  positive: "#245691",
  negative: "#C0392B",
  midpoint: "#E4E6EA",

  /** KPI delta text only — always paired with a sign and an icon. */
  deltaUp: "#166F47",
  deltaDown: "#C0392B",

  gridline: "#E5E7EB",
  axis: "#C9CDD6",
  textMuted: "#6B7280",
} as const;
