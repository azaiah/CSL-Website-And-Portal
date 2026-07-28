/**
 * lib/finance/queries.ts
 * ---------------------------------------------------------------------------
 * All Supabase reads/writes for the finance tracker in one place. Reuses the
 * existing browser client from lib/supabase/client.ts. Every function returns
 * {data, error} so the UI never has to catch a thrown exception.
 *
 * If Supabase environment variables are missing, every call returns a clear
 * "Finance database not connected" error instead of crashing the page.
 * ---------------------------------------------------------------------------
 */

import { createClient } from "@/lib/supabase/client";
import type {
  FinanceEntry,
  FinanceCategory,
  FieldDef,
  MonthlyPL,
  FinanceKind,
  FieldType,
  AppliesTo,
  FinanceResult,
} from "./types";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const MISSING_CONNECTION = {
  message: "Finance database not connected — Supabase environment variables are missing.",
};

function getClient() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return null;
  return createClient();
}

function notConnected<T>(): FinanceResult<T> {
  return { data: null, error: MISSING_CONNECTION };
}

// ── Entries ─────────────────────────────────────────────────────────────────

export interface ListEntriesFilters {
  from?: string | null;
  to?: string | null;
  kind?: FinanceKind | null;
  categoryId?: string | null;
}

export async function listEntries(
  filters: ListEntriesFilters = {}
): Promise<FinanceResult<FinanceEntry[]>> {
  const c = getClient();
  if (!c) return notConnected<FinanceEntry[]>();

  let q = c.from("finance_entries").select("*");
  if (filters.from) q = q.gte("entry_date", filters.from);
  if (filters.to) q = q.lte("entry_date", filters.to);
  if (filters.kind) q = q.eq("kind", filters.kind);
  if (filters.categoryId) q = q.eq("category_id", filters.categoryId);
  q = q.order("entry_date", { ascending: false });

  const { data, error } = await q;
  if (error) return { data: null, error: { message: error.message } };
  return { data: (data ?? []) as FinanceEntry[], error: null };
}

type EntryInsert = {
  entry_date: string;
  kind: FinanceKind;
  /** Nullable, matching `on delete set null` on the column. */
  category_id: string | null;
  description: string;
  amount: number;
  opportunity_id?: string | null;
  custom_fields?: Record<string, unknown>;
  notes?: string | null;
};

export async function createEntry(
  entry: EntryInsert
): Promise<FinanceResult<FinanceEntry>> {
  const c = getClient();
  if (!c) return notConnected<FinanceEntry>();

  const { data, error } = await c
    .from("finance_entries")
    .insert(entry)
    .select()
    .single();
  if (error) return { data: null, error: { message: error.message } };
  return { data: data as FinanceEntry, error: null };
}

type EntryUpdate = Partial<EntryInsert>;

export async function updateEntry(
  id: string,
  entry: EntryUpdate
): Promise<FinanceResult<FinanceEntry>> {
  const c = getClient();
  if (!c) return notConnected<FinanceEntry>();

  const { data, error } = await c
    .from("finance_entries")
    .update(entry)
    .eq("id", id)
    .select()
    .single();
  if (error) return { data: null, error: { message: error.message } };
  return { data: data as FinanceEntry, error: null };
}

export async function deleteEntry(id: string): Promise<FinanceResult<null>> {
  const c = getClient();
  if (!c) return notConnected<null>();

  const { error } = await c.from("finance_entries").delete().eq("id", id);
  if (error) return { data: null, error: { message: error.message } };
  return { data: null, error: null };
}

// ── Categories ──────────────────────────────────────────────────────────────

export async function listCategories(): Promise<FinanceResult<FinanceCategory[]>> {
  const c = getClient();
  if (!c) return notConnected<FinanceCategory[]>();

  const { data, error } = await c
    .from("finance_categories")
    .select("*")
    .eq("is_archived", false)
    .order("sort_order", { ascending: true });
  if (error) return { data: null, error: { message: error.message } };
  return { data: (data ?? []) as FinanceCategory[], error: null };
}

export async function createCategory(
  category: Omit<FinanceCategory, "id" | "created_at" | "updated_at">
): Promise<FinanceResult<FinanceCategory>> {
  const c = getClient();
  if (!c) return notConnected<FinanceCategory>();

  const { data, error } = await c
    .from("finance_categories")
    .insert(category)
    .select()
    .single();
  if (error) return { data: null, error: { message: error.message } };
  return { data: data as FinanceCategory, error: null };
}

// ── Custom field definitions ────────────────────────────────────────────────

export async function listFieldDefs(): Promise<FinanceResult<FieldDef[]>> {
  const c = getClient();
  if (!c) return notConnected<FieldDef[]>();

  const { data, error } = await c
    .from("finance_field_defs")
    .select("*")
    .eq("is_archived", false)
    .order("sort_order", { ascending: true });
  if (error) return { data: null, error: { message: error.message } };
  return { data: (data ?? []) as FieldDef[], error: null };
}

type FieldDefInsert = {
  key: string;
  label: string;
  field_type: FieldType;
  options?: string[] | null;
  required: boolean;
  applies_to: AppliesTo;
  sort_order?: number;
  is_archived?: boolean;
};

export async function createFieldDef(
  field: FieldDefInsert
): Promise<FinanceResult<FieldDef>> {
  const c = getClient();
  if (!c) return notConnected<FieldDef>();

  const { data, error } = await c
    .from("finance_field_defs")
    .insert(field)
    .select()
    .single();
  if (error) return { data: null, error: { message: error.message } };
  return { data: data as FieldDef, error: null };
}

export async function archiveFieldDef(
  id: string,
  isArchived: boolean
): Promise<FinanceResult<FieldDef>> {
  const c = getClient();
  if (!c) return notConnected<FieldDef>();

  const { data, error } = await c
    .from("finance_field_defs")
    .update({ is_archived: isArchived })
    .eq("id", id)
    .select()
    .single();
  if (error) return { data: null, error: { message: error.message } };
  return { data: data as FieldDef, error: null };
}

// ── Monthly P&L view ────────────────────────────────────────────────────────

export async function getMonthlyPL(): Promise<FinanceResult<MonthlyPL[]>> {
  const c = getClient();
  if (!c) return notConnected<MonthlyPL[]>();

  const { data, error } = await c
    .from("finance_monthly_pl")
    .select("*")
    .order("month", { ascending: true });
  if (error) return { data: null, error: { message: error.message } };
  return { data: (data ?? []) as MonthlyPL[], error: null };
}
