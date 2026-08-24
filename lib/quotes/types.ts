/**
 * lib/quotes/types.ts
 * ---------------------------------------------------------------------------
 * TypeScript mirrors of the customers / quotes / jobs tables in Supabase. Keep
 * these in sync with supabase/migrations/004_finance_flow.sql so the UI cannot
 * drift from the database.
 *
 * Tables:
 *   - service_rates    (rate matrix, one row per service level)
 *   - rate_settings    (scalar surcharges and thresholds, key/value)
 *   - lookup_values    (every dropdown vocabulary, in one table)
 *   - vehicles         (the fleet — one row per real vehicle)
 *   - customers        (stored once; quotes and jobs reference them)
 *   - quotes           (inputs + frozen rate snapshot + computed totals)
 *   - jobs             (one row per run)
 *
 * Views:
 *   - job_financials        (per-job revenue, cost and margin)
 *   - customer_summary      (per-customer rollup — step 3 of the flow chart)
 *   - service_level_summary (the dashboard's breakdown by service level)
 *
 * Money is numeric(12,2) in Postgres and a plain `number` here. Format at the
 * edge; never store a formatted string.
 * ---------------------------------------------------------------------------
 */

/** The four service levels. Matches the check constraint on service_rates. */
export type ServiceCode = "ODC" | "SDR" | "STAT" | "GEN";

/** Quote outcome. Draft and Sent exist because a quote exists before it is sent. */
export type QuoteStatus = "Draft" | "Sent" | "Pending" | "Won" | "Lost";

/** Delivery status on a job. Superset of the client's lookup tab and his live rows. */
export type JobStatus =
  | "Scheduled"
  | "Picked Up"
  | "In Transit"
  | "Delivered"
  | "Delayed"
  | "On Hold"
  | "Cancelled";

/* ────────────────────────────── Reference data ──────────────────────────── */

/** One row of the rate matrix. Editable from Settings, so a rate fix is not a migration. */
export interface ServiceRate {
  service_code: ServiceCode;
  service_name: string;
  base_pickup_fee: number;
  per_mile_rate: number;
  per_stop_fee: number;
  is_quotable: boolean;
  sort_order: number;
  updated_at: string;
}

/**
 * A scalar surcharge or threshold. Key/value so adding a surcharge is an
 * insert rather than a migration. `unit` is constrained in SQL.
 */
export interface RateSetting {
  key: string;
  label: string;
  value: number;
  unit: "usd" | "usd_per_mile" | "usd_per_minute" | "miles" | "minutes" | "percent";
  /** Nullable in SQL — the seed leaves it set, but nothing enforces that. */
  note: string | null;
  updated_at: string;
}

/**
 * What quotes.rate_snapshot holds: the rate card in force when the quote was
 * calculated, frozen. When a rate changes in November, October's won quotes
 * must not silently reprice — see the migration header.
 *
 * `settings` is the rate_settings table collapsed to key -> value.
 */
export interface RateSnapshot {
  rate: ServiceRate;
  settings: Record<string, number>;
}

/**
 * One dropdown option. `kind` is unconstrained text in SQL, so it is typed as
 * string here rather than a union the database does not enforce. Seeded kinds:
 * delivery_type, delay_reason, fuel_type, vehicle_type, hazard_class, time_slot.
 *
 * Note: this table has no created_at column.
 */
export interface LookupValue {
  id: string;
  kind: string;
  value: string;
  label: string;
  sort_order: number;
  is_archived: boolean;
}

/** A real vehicle. CSL runs one today; rows are added when vehicles are bought. */
export interface Vehicle {
  id: string;
  label: string;
  vehicle_type: string | null;
  fuel_type: "Gas" | "Electric";
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

/* ──────────────────────────────── Customers ─────────────────────────────── */

/**
 * A customer, stored once. `uid` has a sequence default ('CUST-0001') and must
 * never be written from application code.
 */
export interface Customer {
  id: string;
  uid: string;
  name: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  delivery_type: string | null;
  notes: string | null;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

/* ────────────────────────────────── Quotes ──────────────────────────────── */

/**
 * The quote inputs, mirroring the client's Quote Calculator tab one for one.
 * Used as the argument to computeQuote().
 *
 * `adjustment_pct` is a fraction, not a percent: -0.15 … +0.15 in 0.05 steps.
 */
export interface QuoteInputs {
  service_code: ServiceCode;
  stops: number;
  route_miles: number;
  extra_miles: number;
  tolls_parking: number;
  cold_chain: boolean;
  off_hours: boolean;
  wait_minutes: number;
  adjustment_pct: number;
}

/**
 * One row of the "Detailed Cost Breakdown" table.
 *
 * `basis` is the human explanation of how `amount` was reached — e.g.
 * "14.2 miles @ $1.65/mi" — and is "N/A" when the component does not apply.
 * Zero-value rows are still emitted: the client reads this table top to bottom
 * and a disappearing row reads as a bug.
 */
export interface QuoteLineItem {
  key: string;
  label: string;
  basis: string;
  amount: number;
}

/** What computeQuote() returns. Stored on the quote so it reads back identically. */
export interface QuoteComputation {
  lineItems: QuoteLineItem[];
  serviceSubtotal: number;
  adjustmentAmount: number;
  total: number;
}

/** A quote row. `uid` has a sequence default ('Q-2026-001') — never write it. */
export interface Quote {
  id: string;
  uid: string;
  customer_id: string;

  // Inputs
  service_code: ServiceCode;
  stops: number;
  route_miles: number;
  extra_miles: number;
  tolls_parking: number;
  cold_chain: boolean;
  off_hours: boolean;
  wait_minutes: number;
  adjustment_pct: number;

  /** Frozen rate card. Not null in SQL. */
  rate_snapshot: RateSnapshot;

  // Computed and stored
  line_items: QuoteLineItem[];
  service_subtotal: number;
  adjustment_amount: number;
  total: number;

  // Outcome
  status: QuoteStatus;
  quoted_on: string;
  decided_on: string | null;
  notes: string | null;

  created_at: string;
  updated_at: string;
  created_by: string | null;
}

/* ─────────────────────────────────── Jobs ───────────────────────────────── */

/**
 * One run. `uid` has a sequence default ('RT-2026-001') — never write it.
 *
 * `fuel_cost` is a GENERATED column (gallons x price, rounded to 2). It is
 * readable but must never be written; Postgres rejects the write.
 */
export interface Job {
  id: string;
  uid: string;
  customer_id: string;
  /** Nullable: an urgent run can be dispatched without a quote. */
  quote_id: string | null;

  // Service
  delivery_type: string | null;
  service_code: ServiceCode;
  delivery_status: JobStatus;
  delay_reason: string | null;
  delay_notes: string | null;
  delivery_notes: string | null;

  // Schedule
  pickup_date: string | null;
  /** Postgres `time`, e.g. "14:30:00". */
  pickup_time: string | null;
  pickup_location: string | null;
  dropoff_date: string | null;
  dropoff_time: string | null;
  dropoff_location: string | null;
  recipient_names: string | null;
  time_slot: string | null;

  // Revenue — defaults from the accepted quote's total, but editable.
  billed_amount: number | null;

  // Route & vehicle
  vehicle_id: string | null;
  odometer_start: number | null;
  odometer_end: number | null;
  total_miles: number | null;

  // Fuel for this run
  fuel_gallons: number | null;
  cost_per_gallon: number | null;
  /** GENERATED ALWAYS — read only. */
  fuel_cost: number;

  // Cold chain
  cold_chain_logged: boolean;
  pickup_temp_f: number | null;
  dropoff_temp_f: number | null;

  // Chain of custody
  coc_required: boolean;
  coc_number: string | null;
  coc_pickup_person: string | null;
  coc_pickup_at: string | null;
  coc_pickup_location: string | null;
  coc_handoff_person: string | null;
  coc_handoff_at: string | null;
  coc_handoff_location: string | null;
  hazard_class: string | null;
  hazard_class_other: string | null;

  created_at: string;
  updated_at: string;
  created_by: string | null;
}

/* ─────────────────────────────────── Views ──────────────────────────────── */

/**
 * One row of job_financials. Revenue, fuel and attributed cost are coalesced
 * to 0 in SQL, so they are never null. `quoted_total` comes from a LEFT JOIN
 * and `job_date` / `total_miles` are nullable columns, so those three can be.
 *
 * `attributed_cost` excludes overhead: fixed costs are real money but are not
 * attributable to one run.
 */
export interface JobFinancials {
  job_id: string;
  uid: string;
  customer_id: string;
  quote_id: string | null;
  service_code: ServiceCode;
  delivery_status: JobStatus;
  job_date: string | null;
  revenue: number;
  quoted_total: number | null;
  billed_vs_quoted: number;
  fuel_cost: number;
  attributed_cost: number;
  job_margin: number;
  total_miles: number | null;
}

/** One row of customer_summary. `win_rate_pct` is null until a quote is decided. */
export interface CustomerSummary {
  customer_id: string;
  uid: string;
  name: string;
  phone: string | null;
  email: string | null;
  delivery_type: string | null;
  is_archived: boolean;
  quotes_total: number;
  quotes_won: number;
  quotes_lost: number;
  quotes_open: number;
  won_quote_value: number;
  jobs_total: number;
  jobs_delivered: number;
  revenue: number;
  cost_to_csl: number;
  miles: number;
  last_job_date: string | null;
  job_margin: number;
  win_rate_pct: number | null;
}

/** One row of service_level_summary. Every service level appears, even at zero runs. */
export interface ServiceLevelSummary {
  service_code: ServiceCode;
  service_name: string;
  sort_order: number;
  run_count: number;
  delivered_count: number;
  revenue: number;
  avg_revenue_per_run: number;
  miles: number;
}
