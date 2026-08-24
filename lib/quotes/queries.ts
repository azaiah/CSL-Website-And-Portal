/**
 * lib/quotes/queries.ts
 * ---------------------------------------------------------------------------
 * All Supabase reads/writes for customers, quotes and jobs in one place.
 * Reuses the existing browser client from lib/supabase/client.ts. Every
 * function returns {data, error} so the UI never has to catch a thrown
 * exception — the same contract as lib/finance/queries.ts.
 *
 * If Supabase environment variables are missing, every call returns a clear
 * "not connected" error instead of crashing the page.
 *
 * Three columns are never written from here, and the insert/update types below
 * exclude them so it cannot happen by accident:
 *   - customers.uid / quotes.uid / jobs.uid  — sequence defaults
 *   - jobs.fuel_cost                         — GENERATED ALWAYS
 * ---------------------------------------------------------------------------
 */

import { createClient } from "@/lib/supabase/client";
import type { FinanceEntry } from "@/lib/finance/types";
import type {
  Customer,
  Quote,
  QuoteStatus,
  Job,
  JobStatus,
  ServiceCode,
  ServiceRate,
  RateSetting,
  RateSnapshot,
  LookupValue,
  Vehicle,
  JobFinancials,
  CustomerSummary,
  ServiceLevelSummary,
} from "./types";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const MISSING_CONNECTION = {
  message: "Portal database not connected — Supabase environment variables are missing.",
};

/** Same shape as FinanceResult, kept local so lib/finance is untouched. */
export type QuoteResult<T> = {
  data: T | null;
  error: { message: string } | null;
};

/**
 * A finance_entries row carrying migration 004's job_id / customer_id /
 * quote_id / is_overhead columns.
 *
 * Those four now live on FinanceEntry itself, so this is a plain alias. It is
 * kept as a named export because it reads better at the call sites in this
 * file, and because re-declaring the columns here would give the codebase two
 * definitions of the same shape that could drift apart.
 */
export type JobFinanceEntry = FinanceEntry;

function getClient() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return null;
  return createClient();
}

function notConnected<T>(): QuoteResult<T> {
  return { data: null, error: MISSING_CONNECTION };
}

/** Flatten a Supabase error down to the message the UI shows. */
function fail<T>(error: { message: string }): QuoteResult<T> {
  return { data: null, error: { message: error.message } };
}

// ── Customers ───────────────────────────────────────────────────────────────

/** Writable customer columns. `uid` is a sequence default and excluded. */
type CustomerWritable = Partial<
  Omit<Customer, "id" | "uid" | "created_at" | "updated_at" | "created_by">
>;
type CustomerInsert = CustomerWritable & { name: string };

/** Archived customers are hidden by default so dropdowns stay short. */
export async function listCustomers(
  includeArchived = false
): Promise<QuoteResult<Customer[]>> {
  const c = getClient();
  if (!c) return notConnected<Customer[]>();

  let q = c.from("customers").select("*");
  if (!includeArchived) q = q.eq("is_archived", false);
  q = q.order("name", { ascending: true });

  const { data, error } = await q;
  if (error) return fail<Customer[]>(error);
  return { data: (data ?? []) as Customer[], error: null };
}

export async function getCustomer(id: string): Promise<QuoteResult<Customer>> {
  const c = getClient();
  if (!c) return notConnected<Customer>();

  const { data, error } = await c
    .from("customers")
    .select("*")
    .eq("id", id)
    .single();
  if (error) return fail<Customer>(error);
  return { data: data as Customer, error: null };
}

export async function createCustomer(
  customer: CustomerInsert
): Promise<QuoteResult<Customer>> {
  const c = getClient();
  if (!c) return notConnected<Customer>();

  const { data, error } = await c
    .from("customers")
    .insert(customer)
    .select()
    .single();
  if (error) return fail<Customer>(error);
  return { data: data as Customer, error: null };
}

export async function updateCustomer(
  id: string,
  customer: CustomerWritable
): Promise<QuoteResult<Customer>> {
  const c = getClient();
  if (!c) return notConnected<Customer>();

  const { data, error } = await c
    .from("customers")
    .update(customer)
    .eq("id", id)
    .select()
    .single();
  if (error) return fail<Customer>(error);
  return { data: data as Customer, error: null };
}

/**
 * Archive rather than delete. quotes.customer_id and jobs.customer_id are
 * `on delete restrict`, so a customer with history cannot be removed — and
 * should not be, because their jobs are the P&L.
 */
export async function archiveCustomer(
  id: string,
  isArchived: boolean
): Promise<QuoteResult<Customer>> {
  const c = getClient();
  if (!c) return notConnected<Customer>();

  const { data, error } = await c
    .from("customers")
    .update({ is_archived: isArchived })
    .eq("id", id)
    .select()
    .single();
  if (error) return fail<Customer>(error);
  return { data: data as Customer, error: null };
}

// ── Quotes ──────────────────────────────────────────────────────────────────

/** Writable quote columns. `uid` is a sequence default and excluded. */
type QuoteWritable = Partial<
  Omit<Quote, "id" | "uid" | "created_at" | "updated_at" | "created_by">
>;
type QuoteInsert = QuoteWritable & {
  customer_id: string;
  service_code: ServiceCode;
  /** jsonb NOT NULL with no default — a quote without a frozen rate is not a quote. */
  rate_snapshot: RateSnapshot;
};

export interface ListQuotesFilters {
  customerId?: string | null;
  status?: QuoteStatus | null;
  /** Both bounds apply to quoted_on, inclusive. */
  from?: string | null;
  to?: string | null;
}

export async function listQuotes(
  filters: ListQuotesFilters = {}
): Promise<QuoteResult<Quote[]>> {
  const c = getClient();
  if (!c) return notConnected<Quote[]>();

  let q = c.from("quotes").select("*");
  if (filters.customerId) q = q.eq("customer_id", filters.customerId);
  if (filters.status) q = q.eq("status", filters.status);
  if (filters.from) q = q.gte("quoted_on", filters.from);
  if (filters.to) q = q.lte("quoted_on", filters.to);
  q = q.order("quoted_on", { ascending: false });

  const { data, error } = await q;
  if (error) return fail<Quote[]>(error);
  return { data: (data ?? []) as Quote[], error: null };
}

export async function getQuote(id: string): Promise<QuoteResult<Quote>> {
  const c = getClient();
  if (!c) return notConnected<Quote>();

  const { data, error } = await c.from("quotes").select("*").eq("id", id).single();
  if (error) return fail<Quote>(error);
  return { data: data as Quote, error: null };
}

export async function createQuote(quote: QuoteInsert): Promise<QuoteResult<Quote>> {
  const c = getClient();
  if (!c) return notConnected<Quote>();

  const { data, error } = await c.from("quotes").insert(quote).select().single();
  if (error) return fail<Quote>(error);
  return { data: data as Quote, error: null };
}

export async function updateQuote(
  id: string,
  quote: QuoteWritable
): Promise<QuoteResult<Quote>> {
  const c = getClient();
  if (!c) return notConnected<Quote>();

  const { data, error } = await c
    .from("quotes")
    .update(quote)
    .eq("id", id)
    .select()
    .single();
  if (error) return fail<Quote>(error);
  return { data: data as Quote, error: null };
}

/**
 * Move a quote through Draft → Sent → Pending → Won/Lost.
 *
 * `decidedOn` is passed in rather than derived here: "today" belongs to the
 * calling component, which reads it from todayISO() inside a useEffect. A date
 * computed in this module would be baked in at build time and go stale.
 */
export async function setQuoteStatus(
  id: string,
  status: QuoteStatus,
  decidedOn?: string | null
): Promise<QuoteResult<Quote>> {
  const c = getClient();
  if (!c) return notConnected<Quote>();

  const patch: { status: QuoteStatus; decided_on?: string | null } = { status };
  if (decidedOn !== undefined) patch.decided_on = decidedOn;

  const { data, error } = await c
    .from("quotes")
    .update(patch)
    .eq("id", id)
    .select()
    .single();
  if (error) return fail<Quote>(error);
  return { data: data as Quote, error: null };
}

// ── Jobs ────────────────────────────────────────────────────────────────────

/**
 * Writable job columns. `uid` is a sequence default; `fuel_cost` is GENERATED
 * ALWAYS and Postgres rejects any write to it. Both are excluded here so the
 * compiler catches the mistake before the database does.
 */
type JobWritable = Partial<
  Omit<Job, "id" | "uid" | "fuel_cost" | "created_at" | "updated_at" | "created_by">
>;
type JobInsert = JobWritable & {
  customer_id: string;
  service_code: ServiceCode;
};

export interface ListJobsFilters {
  customerId?: string | null;
  status?: JobStatus | null;
  /** Both bounds apply to pickup_date, inclusive. */
  from?: string | null;
  to?: string | null;
}

export async function listJobs(
  filters: ListJobsFilters = {}
): Promise<QuoteResult<Job[]>> {
  const c = getClient();
  if (!c) return notConnected<Job[]>();

  let q = c.from("jobs").select("*");
  if (filters.customerId) q = q.eq("customer_id", filters.customerId);
  if (filters.status) q = q.eq("delivery_status", filters.status);
  if (filters.from) q = q.gte("pickup_date", filters.from);
  if (filters.to) q = q.lte("pickup_date", filters.to);
  q = q.order("pickup_date", { ascending: false });

  const { data, error } = await q;
  if (error) return fail<Job[]>(error);
  return { data: (data ?? []) as Job[], error: null };
}

export async function getJob(id: string): Promise<QuoteResult<Job>> {
  const c = getClient();
  if (!c) return notConnected<Job>();

  const { data, error } = await c.from("jobs").select("*").eq("id", id).single();
  if (error) return fail<Job>(error);
  return { data: data as Job, error: null };
}

export async function createJob(job: JobInsert): Promise<QuoteResult<Job>> {
  const c = getClient();
  if (!c) return notConnected<Job>();

  const { data, error } = await c.from("jobs").insert(job).select().single();
  if (error) return fail<Job>(error);
  return { data: data as Job, error: null };
}

export async function updateJob(
  id: string,
  job: JobWritable
): Promise<QuoteResult<Job>> {
  const c = getClient();
  if (!c) return notConnected<Job>();

  const { data, error } = await c
    .from("jobs")
    .update(job)
    .eq("id", id)
    .select()
    .single();
  if (error) return fail<Job>(error);
  return { data: data as Job, error: null };
}

export async function setJobStatus(
  id: string,
  status: JobStatus
): Promise<QuoteResult<Job>> {
  const c = getClient();
  if (!c) return notConnected<Job>();

  const { data, error } = await c
    .from("jobs")
    .update({ delivery_status: status })
    .eq("id", id)
    .select()
    .single();
  if (error) return fail<Job>(error);
  return { data: data as Job, error: null };
}

// ── Service rates ───────────────────────────────────────────────────────────

export async function listServiceRates(): Promise<QuoteResult<ServiceRate[]>> {
  const c = getClient();
  if (!c) return notConnected<ServiceRate[]>();

  const { data, error } = await c
    .from("service_rates")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) return fail<ServiceRate[]>(error);
  return { data: (data ?? []) as ServiceRate[], error: null };
}

/** Correcting a rate is an update, never a migration. */
export async function updateServiceRate(
  serviceCode: ServiceCode,
  patch: Partial<Omit<ServiceRate, "service_code" | "updated_at">>
): Promise<QuoteResult<ServiceRate>> {
  const c = getClient();
  if (!c) return notConnected<ServiceRate>();

  const { data, error } = await c
    .from("service_rates")
    .update(patch)
    .eq("service_code", serviceCode)
    .select()
    .single();
  if (error) return fail<ServiceRate>(error);
  return { data: data as ServiceRate, error: null };
}

// ── Rate settings ───────────────────────────────────────────────────────────

export async function listRateSettings(): Promise<QuoteResult<RateSetting[]>> {
  const c = getClient();
  if (!c) return notConnected<RateSetting[]>();

  const { data, error } = await c
    .from("rate_settings")
    .select("*")
    .order("key", { ascending: true });
  if (error) return fail<RateSetting[]>(error);
  return { data: (data ?? []) as RateSetting[], error: null };
}

export async function updateRateSetting(
  key: string,
  value: number
): Promise<QuoteResult<RateSetting>> {
  const c = getClient();
  if (!c) return notConnected<RateSetting>();

  const { data, error } = await c
    .from("rate_settings")
    .update({ value })
    .eq("key", key)
    .select()
    .single();
  if (error) return fail<RateSetting>(error);
  return { data: data as RateSetting, error: null };
}

// ── Lookup values ───────────────────────────────────────────────────────────

/** Pass `kind` to scope to one dropdown; omit it to load every vocabulary. */
export async function listLookupValues(
  kind?: string
): Promise<QuoteResult<LookupValue[]>> {
  const c = getClient();
  if (!c) return notConnected<LookupValue[]>();

  let q = c.from("lookup_values").select("*").eq("is_archived", false);
  if (kind) q = q.eq("kind", kind);
  q = q.order("sort_order", { ascending: true });

  const { data, error } = await q;
  if (error) return fail<LookupValue[]>(error);
  return { data: (data ?? []) as LookupValue[], error: null };
}

export async function createLookupValue(
  lookup: Omit<LookupValue, "id" | "is_archived"> & { is_archived?: boolean }
): Promise<QuoteResult<LookupValue>> {
  const c = getClient();
  if (!c) return notConnected<LookupValue>();

  const { data, error } = await c
    .from("lookup_values")
    .insert(lookup)
    .select()
    .single();
  if (error) return fail<LookupValue>(error);
  return { data: data as LookupValue, error: null };
}

/**
 * Archive rather than delete: jobs store the lookup's text value, so removing
 * the row would leave existing jobs describing a vocabulary that no longer
 * exists.
 */
export async function archiveLookupValue(
  id: string,
  isArchived: boolean
): Promise<QuoteResult<LookupValue>> {
  const c = getClient();
  if (!c) return notConnected<LookupValue>();

  const { data, error } = await c
    .from("lookup_values")
    .update({ is_archived: isArchived })
    .eq("id", id)
    .select()
    .single();
  if (error) return fail<LookupValue>(error);
  return { data: data as LookupValue, error: null };
}

// ── Vehicles ────────────────────────────────────────────────────────────────

/** Active only — a dropdown should not offer a vehicle CSL has sold. */
export async function listVehicles(): Promise<QuoteResult<Vehicle[]>> {
  const c = getClient();
  if (!c) return notConnected<Vehicle[]>();

  const { data, error } = await c
    .from("vehicles")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });
  if (error) return fail<Vehicle[]>(error);
  return { data: (data ?? []) as Vehicle[], error: null };
}

// ── Views ───────────────────────────────────────────────────────────────────

/** Pass `customerId` for one customer's rollup; omit it for the whole book. */
export async function getCustomerSummary(
  customerId?: string
): Promise<QuoteResult<CustomerSummary[]>> {
  const c = getClient();
  if (!c) return notConnected<CustomerSummary[]>();

  let q = c.from("customer_summary").select("*");
  if (customerId) q = q.eq("customer_id", customerId);
  q = q.order("name", { ascending: true });

  const { data, error } = await q;
  if (error) return fail<CustomerSummary[]>(error);
  return { data: (data ?? []) as CustomerSummary[], error: null };
}

export interface JobFinancialsFilters {
  jobId?: string | null;
  customerId?: string | null;
}

export async function getJobFinancials(
  filters: JobFinancialsFilters = {}
): Promise<QuoteResult<JobFinancials[]>> {
  const c = getClient();
  if (!c) return notConnected<JobFinancials[]>();

  let q = c.from("job_financials").select("*");
  if (filters.jobId) q = q.eq("job_id", filters.jobId);
  if (filters.customerId) q = q.eq("customer_id", filters.customerId);
  q = q.order("job_date", { ascending: false });

  const { data, error } = await q;
  if (error) return fail<JobFinancials[]>(error);
  return { data: (data ?? []) as JobFinancials[], error: null };
}

export async function getServiceLevelSummary(): Promise<
  QuoteResult<ServiceLevelSummary[]>
> {
  const c = getClient();
  if (!c) return notConnected<ServiceLevelSummary[]>();

  const { data, error } = await c
    .from("service_level_summary")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) return fail<ServiceLevelSummary[]>(error);
  return { data: (data ?? []) as ServiceLevelSummary[], error: null };
}

// ── Job expenses (these write finance_entries) ──────────────────────────────

/**
 * Costs booked against one run. These are ordinary finance_entries rows with
 * job_id set — logging a cost against a job IS logging it in the finance
 * tracker, because it is the same table.
 */
export async function listJobExpenses(
  jobId: string
): Promise<QuoteResult<JobFinanceEntry[]>> {
  const c = getClient();
  if (!c) return notConnected<JobFinanceEntry[]>();

  const { data, error } = await c
    .from("finance_entries")
    .select("*")
    .eq("job_id", jobId)
    .order("entry_date", { ascending: false });
  if (error) return fail<JobFinanceEntry[]>(error);
  return { data: (data ?? []) as JobFinanceEntry[], error: null };
}

export interface JobExpenseInput {
  entry_date: string;
  /** Nullable, matching `on delete set null` on finance_entries.category_id. */
  category_id: string | null;
  description: string;
  amount: number;
  /** Denormalised alongside job_id so customer rollups can skip the join. */
  customer_id?: string | null;
  /**
   * Fixed overhead is real money but is not attributable to one run. Job margin
   * excludes it; net profit includes it. Defaults to false because anything
   * logged against a specific job is, by definition, attributable to it.
   */
  is_overhead?: boolean;
  notes?: string | null;
  custom_fields?: Record<string, unknown>;
}

/** `kind` is fixed to 'expense' here — this is the cost side by construction. */
export async function createJobExpense(
  jobId: string,
  expense: JobExpenseInput
): Promise<QuoteResult<JobFinanceEntry>> {
  const c = getClient();
  if (!c) return notConnected<JobFinanceEntry>();

  const { data, error } = await c
    .from("finance_entries")
    .insert({ ...expense, job_id: jobId, kind: "expense" })
    .select()
    .single();
  if (error) return fail<JobFinanceEntry>(error);
  return { data: data as JobFinanceEntry, error: null };
}
