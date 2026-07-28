/**
 * lib/finance/types.ts
 * ---------------------------------------------------------------------------
 * TypeScript mirrors of the finance tables in Supabase. Keep these in sync
 * with the SQL schema so the UI cannot drift from the database.
 *
 * Tables:
 *   - finance_categories   (expense / income categories)
 *   - finance_field_defs   (user-defined custom fields, no migrations)
 *   - finance_entries      (individual transactions)
 *   - finance_monthly_pl   (materialized view of P&L by month)
 * ---------------------------------------------------------------------------
 */

export type FinanceKind = "expense" | "income";

export type FieldType =
  | "text"
  | "number"
  | "currency"
  | "date"
  | "select"
  | "boolean";

export type AppliesTo = "expense" | "income" | "both";

/** Expense or income category. `kind` is enforced unique(name, kind) in SQL. */
export interface FinanceCategory {
  id: string;
  name: string;
  kind: FinanceKind;
  sort_order: number;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Custom field definition. The `key` is the JSONB key inside
 * finance_entries.custom_fields. Adding a field = inserting a row here,
 * never a column migration.
 */
export interface FieldDef {
  id: string;
  key: string;
  label: string;
  field_type: FieldType;
  /** Options for select fields. Stored as JSONB array in Supabase. */
  options: string[] | null;
  required: boolean;
  applies_to: AppliesTo;
  sort_order: number;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

/** Single expense or income entry. */
export interface FinanceEntry {
  id: string;
  entry_date: string; // ISO yyyy-mm-dd
  kind: FinanceKind;
  /** Null when the category was deleted — the SQL uses `on delete set null`.
      Code must handle orphans rather than assume a category always exists. */
  category_id: string | null;
  description: string;
  amount: number; // numeric(12, 2), always positive; sign comes from kind
  opportunity_id: string | null;
  /** Keyed by FieldDef.key. */
  custom_fields: Record<string, unknown>;
  notes: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

/** One row from the finance_monthly_pl view. */
export interface MonthlyPL {
  month: string; // ISO yyyy-mm-dd, first of the month
  income: number;
  expenses: number;
  net: number;
}

/** Shape used by every Supabase read/write helper in this module. */
export type FinanceResult<T> = {
  data: T | null;
  error: { message: string } | null;
};

/** Period selector options. Custom uses explicit start/end dates. */
export type PeriodPreset =
  | "thisMonth"
  | "lastMonth"
  | "quarterToDate"
  | "yearToDate"
  | "allTime"
  | "custom";

export interface DateRange {
  from: string;
  to: string;
}

export interface PeriodState {
  preset: PeriodPreset;
  range: DateRange | null;
}
