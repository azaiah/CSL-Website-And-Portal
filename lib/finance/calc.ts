/**
 * lib/finance/calc.ts
 * ---------------------------------------------------------------------------
 * Pure, testable finance calculations — no Supabase, no React, no side effects.
 * All date math is client-side and uses the same ISO yyyy-mm-dd vocabulary as
 * lib/health so the portal stays consistent.
 * ---------------------------------------------------------------------------
 */

import type {
  FinanceEntry,
  FinanceCategory,
  MonthlyPL,
  PeriodPreset,
  DateRange,
} from "./types";

// ── Period helpers ──────────────────────────────────────────────────────────

const pad = (n: number) => String(n).padStart(2, "0");

/** First day of a month as yyyy-mm-dd. */
function firstOfMonth(year: number, month: number): string {
  return `${year}-${pad(month)}-01`;
}

/** Last day of a month as yyyy-mm-dd. */
function lastOfMonth(year: number, month: number): string {
  const d = new Date(year, month, 0); // day 0 of next month = last day of this month
  return `${year}-${pad(month)}-${pad(d.getDate())}`;
}

/** Start / end of a quarter as yyyy-mm-dd. */
function quarterBounds(year: number, quarter: number): DateRange {
  const startMonth = (quarter - 1) * 3 + 1;
  const endMonth = quarter * 3;
  return {
    from: firstOfMonth(year, startMonth),
    to: lastOfMonth(year, endMonth),
  };
}

/**
 * Convert a preset into an explicit [from, to] range based on `today`.
 * `today` is required and must be an ISO date string; these presets are
 * meaningless without a known "today".
 */
export function rangeForPreset(
  preset: PeriodPreset,
  today: string,
  custom?: DateRange | null
): DateRange | null {
  if (preset === "allTime") return null;
  if (preset === "custom") return custom ?? null;

  const [y, m] = today.split("-").map(Number);
  const year = y;
  const month = m;

  switch (preset) {
    case "thisMonth":
      return { from: firstOfMonth(year, month), to: today };
    case "lastMonth": {
      const lm = month === 1 ? 12 : month - 1;
      const ly = month === 1 ? year - 1 : year;
      return { from: firstOfMonth(ly, lm), to: lastOfMonth(ly, lm) };
    }
    case "quarterToDate": {
      const quarter = Math.ceil(month / 3);
      return { from: quarterBounds(year, quarter).from, to: today };
    }
    case "yearToDate":
      return { from: `${year}-01-01`, to: today };
    default:
      return null;
  }
}

export function labelForPreset(preset: PeriodPreset): string {
  switch (preset) {
    case "thisMonth":
      return "This month";
    case "lastMonth":
      return "Last month";
    case "quarterToDate":
      return "Quarter to date";
    case "yearToDate":
      return "Year to date";
    case "allTime":
      return "All time";
    case "custom":
      return "Custom range";
  }
}

/** Keep only entries whose entry_date falls inside [from, to] (inclusive). */
export function filterByDateRange(
  entries: FinanceEntry[],
  range: DateRange | null
): FinanceEntry[] {
  if (!range) return entries;
  return entries.filter((e) => e.entry_date >= range.from && e.entry_date <= range.to);
}

// ── Aggregation helpers ────────────────────────────────────────────────────

export interface CategoryTotal {
  categoryId: string;
  name: string;
  kind: "expense" | "income";
  amount: number;
}

/**
 * Bucket id used when an entry's category no longer exists. finance_entries
 * has `category_id ... on delete set null`, so deleting a category orphans its
 * entries. Those entries still count toward plSummary(), so silently skipping
 * them here would make the category chart disagree with Net Profit with no
 * warning. They are surfaced as "Uncategorised" instead.
 */
export const UNCATEGORISED_ID = "__uncategorised__";

/**
 * Sum entries by category, largest first.
 *
 * Pass `kind` to scope the result to expenses or income. Charts should always
 * pass one: expenses and income are different measures, and putting them on a
 * single scale makes a large income bar flatten every expense beside it.
 *
 * Categories with no entries are omitted so the chart stays focused, but
 * entries whose category was deleted are NOT dropped — see UNCATEGORISED_ID.
 */
export function totalsByCategory(
  entries: FinanceEntry[],
  categories: FinanceCategory[],
  kind?: "expense" | "income"
): CategoryTotal[] {
  const scoped = kind ? entries.filter((e) => e.kind === kind) : entries;
  const map = new Map<string, CategoryTotal>();
  const catById = new Map(categories.map((c) => [c.id, c]));

  for (const e of scoped) {
    const cat = e.category_id ? catById.get(e.category_id) : undefined;
    // Keep orphans separated by kind so an uncategorised expense never lands in
    // the same bucket as uncategorised income.
    const id = cat ? cat.id : `${UNCATEGORISED_ID}:${e.kind}`;
    const existing = map.get(id);
    if (existing) {
      existing.amount += e.amount;
    } else {
      map.set(id, {
        categoryId: id,
        name: cat ? cat.name : "Uncategorised",
        kind: cat ? cat.kind : e.kind,
        amount: e.amount,
      });
    }
  }

  return Array.from(map.values()).sort((a, b) => b.amount - a.amount);
}

export interface PLSummary {
  income: number;
  expenses: number;
  net: number;
  margin: number; // 0–100, or 0 when income is 0
}

/** P&L summary from a set of entries. Net = income − expenses. */
export function plSummary(entries: FinanceEntry[]): PLSummary {
  const income = entries
    .filter((e) => e.kind === "income")
    .reduce((sum, e) => sum + e.amount, 0);
  const expenses = entries
    .filter((e) => e.kind === "expense")
    .reduce((sum, e) => sum + e.amount, 0);
  const net = income - expenses;
  const margin = income > 0 ? (net / income) * 100 : 0;
  return { income, expenses, net, margin };
}

/** Format a month label like "Jul 2026" from an ISO yyyy-mm-dd first-of-month. */
export function formatMonthLabel(monthISO: string): string {
  const d = new Date(monthISO + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

export interface MonthOverMonthResult {
  currentMonth: string;
  previousMonth: string;
  currentNet: number;
  previousNet: number;
  delta: number; // absolute dollar change
  percentChange: number | null; // null when previousNet is 0
}

/**
 * Compare the most recent completed month to the one before it. Used for the
 * Net Profit month-over-month delta. Falls back to the latest available month
 * when the current calendar month has no data yet.
 */
export function monthOverMonth(
  monthlyPL: MonthlyPL[],
  today: string
): MonthOverMonthResult | null {
  if (monthlyPL.length < 2) return null;

  // Sort ascending so we can reliably pick the last two months.
  const sorted = [...monthlyPL].sort((a, b) => a.month.localeCompare(b.month));
  const currentMonthISO = today.slice(0, 7) + "-01";

  // Prefer the current calendar month if it exists; otherwise use the latest
  // recorded month (useful early in a new month before entries are logged).
  let currentIndex = sorted.findIndex((m) => m.month === currentMonthISO);
  if (currentIndex < 0) currentIndex = sorted.length - 1;
  if (currentIndex < 1) return null;

  const current = sorted[currentIndex];
  const previous = sorted[currentIndex - 1];
  const delta = current.net - previous.net;
  const percentChange = previous.net !== 0 ? (delta / Math.abs(previous.net)) * 100 : null;

  return {
    currentMonth: current.month,
    previousMonth: previous.month,
    currentNet: current.net,
    previousNet: previous.net,
    delta,
    percentChange,
  };
}

/**
 * Parse a user-entered amount. Allows whole numbers and decimals. Returns the
 * numeric value or NaN if the input is invalid. Used by the form before values
 * are sent to Supabase.
 */
export function parseAmount(value: string): number {
  const cleaned = value.replace(/,/g, "").trim();
  if (cleaned === "") return NaN;
  const num = Number(cleaned);
  return Number.isFinite(num) && num >= 0 ? num : NaN;
}

/**
 * Convert a label into a snake_case key safe for JSONB and Supabase. Used when
 * a user creates a custom field so the key is deterministic and URL-safe.
 */
export function labelToKey(label: string): string {
  return label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .replace(/_+/g, "_");
}
