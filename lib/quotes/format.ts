/**
 * lib/quotes/format.ts
 * ---------------------------------------------------------------------------
 * Display formatting for the customers / quotes / jobs pages.
 *
 * lib/utils.ts already has formatCurrency, but it rounds to whole dollars.
 * Quote money is numeric(12,2) and the client reads it to the cent — a quote
 * that says $61.65 on the estimator and $62 on the list is a support call. So
 * these helpers always show cents.
 * ---------------------------------------------------------------------------
 */

import type { CSSProperties } from "react";

/**
 * "$1,234.56". Negatives get a leading minus outside the dollar sign
 * ("-$40.90") rather than parentheses, which read as a footnote on a phone.
 */
export function formatMoney(value: number): string {
  const abs = Math.abs(value);
  const body = abs.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${value < 0 ? "-" : ""}$${body}`;
}

/** Brand red for a loss. Paired with a minus sign — never colour alone. */
export const MONEY_NEGATIVE = "#C0392B";

/**
 * Inline colour for a margin figure. Returns undefined at or above zero so the
 * value keeps the surrounding text colour rather than being needlessly green.
 */
export function marginStyle(value: number): CSSProperties | undefined {
  return value < 0 ? { color: MONEY_NEGATIVE } : undefined;
}

/** "62.5%" / "—" when there is nothing decided yet to compute a rate from. */
export function formatPercent(value: number | null): string {
  if (value === null || !Number.isFinite(value)) return "—";
  return `${value.toFixed(1)}%`;
}

/**
 * Clean a decimal field as it is typed: digits and at most ONE decimal point.
 *
 * The single-point rule matters more than it looks. Number.parseFloat("1.652.50")
 * returns 1.652 without complaint, so a field that tolerates two points can
 * silently save a rate nobody typed — which is exactly how a wrong per-mile
 * rate gets into the rate card.
 */
export function sanitizeDecimal(raw: string): string {
  const cleaned = raw.replace(/[^0-9.]/g, "");
  const parts = cleaned.split(".");
  if (parts.length <= 2) return cleaned;
  // Keep the first point, drop the rest: "1.652.50" -> "1.65250".
  return `${parts[0]}.${parts.slice(1).join("")}`;
}

/** Miles to one decimal, matching the numeric(12,1) the views return. */
export function formatMiles(value: number | null): string {
  if (value === null || !Number.isFinite(value)) return "—";
  return value.toLocaleString("en-US", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
}
