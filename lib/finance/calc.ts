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

/**
 * The bits of a job_financials row these helpers need.
 *
 * Declared structurally rather than imported from lib/quotes/types so that
 * lib/finance keeps no dependency on the quotes module. JobFinancials satisfies
 * this shape, so it can be passed straight in.
 */
export interface JobMarginRow {
  revenue: number;
  fuel_cost: number;
  attributed_cost: number;
  job_margin: number;
  job_date: string | null;
  delivery_status: string;
}

/**
 * The status at which the finance_ledger view starts counting a job's revenue.
 * A scheduled run is not money yet; billing it before it is delivered would
 * book revenue that could still be cancelled.
 */
export const REVENUE_RECOGNISED_AT = "Delivered";

/**
 * Jobs whose revenue the ledger recognises: delivered, billed, and dated.
 *
 * These three conditions mirror the WHERE clause on the job half of
 * finance_ledger exactly. Any drift here shows up as the Income card
 * disagreeing with the monthly P&L directly beneath it.
 */
export function revenueRecognisedJobs<T extends JobMarginRow>(rows: T[]): T[] {
  return rows.filter(
    (r) =>
      r.delivery_status === REVENUE_RECOGNISED_AT &&
      r.revenue > 0 &&
      r.job_date !== null
  );
}

export interface JobMarginSummary {
  /** Billed revenue on the jobs in scope. */
  revenue: number;
  /** Generated in Postgres from gallons x price per gallon. */
  fuelCost: number;
  /** Job-attributable expense entries. Overhead is excluded in SQL. */
  attributedCost: number;
  /** revenue − fuel − attributed. NOT net profit; overhead is not in here. */
  jobMargin: number;
  jobCount: number;
}

/**
 * Roll up per-job economics.
 *
 * Kept separate from plSummary() on purpose, because it answers a different
 * question. plSummary asks "did the business make money", which has to include
 * insurance and the phone bill. This asks "did the RUNS make money", which must
 * not — overhead is real but belongs to the month, not to any one delivery.
 *
 * Conflating the two is why the client's spreadsheet cannot tell him whether a
 * $61.65 run was worth driving.
 */
export function jobMarginSummary(rows: JobMarginRow[]): JobMarginSummary {
  let revenue = 0;
  let fuelCost = 0;
  let attributedCost = 0;
  let jobMargin = 0;

  for (const r of rows) {
    revenue += r.revenue;
    fuelCost += r.fuel_cost;
    attributedCost += r.attributed_cost;
    jobMargin += r.job_margin;
  }

  return { revenue, fuelCost, attributedCost, jobMargin, jobCount: rows.length };
}

/**
 * Keep only jobs whose job_date falls inside [from, to]. Undated jobs drop.
 *
 * Generic so callers keep the full JobFinancials row rather than having it
 * narrowed to the handful of fields these helpers happen to read.
 */
export function filterJobsByDateRange<T extends JobMarginRow>(
  rows: T[],
  range: DateRange | null
): T[] {
  if (!range) return rows;
  return rows.filter(
    (r) => r.job_date !== null && r.job_date >= range.from && r.job_date <= range.to
  );
}

export interface LedgerSummary {
  /** Manual income entries PLUS delivered job revenue. */
  income: number;
  /** Every expense entry, overhead included. */
  expenses: number;
  /** income − expenses. This one is "everything". */
  net: number;
  margin: number;
}

/**
 * The whole-business figures, matching what the finance_ledger view produces.
 *
 * Job revenue is deliberately NOT copied into finance_entries — migration 004's
 * header explains that a copy drifts the first time someone edits the job and
 * forgets the entry. So revenue has to be added back here, or the Income card
 * on the finance page disagrees with the monthly P&L underneath it.
 *
 * plSummary() is left exactly as it was; this is the ledger-aware sibling.
 *
 * `jobRows` is filtered through revenueRecognisedJobs() here rather than by the
 * caller, so a caller cannot accidentally book a scheduled job as income.
 */
export function ledgerSummary(
  entries: FinanceEntry[],
  jobRows: JobMarginRow[]
): LedgerSummary {
  const entryTotals = plSummary(entries);
  const jobRevenue = revenueRecognisedJobs(jobRows).reduce(
    (sum, r) => sum + r.revenue,
    0
  );

  const income = entryTotals.income + jobRevenue;
  const expenses = entryTotals.expenses;
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
