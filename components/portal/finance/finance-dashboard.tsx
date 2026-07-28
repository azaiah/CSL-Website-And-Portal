"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { AlertTriangle, Wallet, Loader2, SlidersHorizontal } from "lucide-react";
import { todayISO } from "@/lib/health";
import { cn } from "@/lib/utils";
import type {
  FinanceEntry,
  FinanceCategory,
  FieldDef,
  MonthlyPL,
  PeriodPreset,
  PeriodState,
  FinanceKind,
} from "@/lib/finance/types";
import {
  rangeForPreset,
  labelForPreset,
  filterByDateRange,
} from "@/lib/finance/calc";
import {
  listEntries,
  listCategories,
  listFieldDefs,
  getMonthlyPL,
  createEntry,
  updateEntry,
  deleteEntry,
  createCategory,
  createFieldDef,
  archiveFieldDef,
} from "@/lib/finance/queries";
import { opportunities } from "@/lib/data/opportunities";
import { PLSummary } from "./pl-summary";
import { CategoryBreakdown } from "./category-breakdown";
import { EntryTable } from "./entry-table";
import { EntryForm } from "./entry-form";
import { FieldManager } from "./field-manager";

const PRESETS: PeriodPreset[] = [
  "thisMonth",
  "lastMonth",
  "quarterToDate",
  "yearToDate",
  "allTime",
  "custom",
];

export function FinanceDashboard() {
  // Client-only "today" so static generation never freezes a stale date.
  const [today, setToday] = useState<string | null>(null);
  useEffect(() => setToday(todayISO()), []);

  const [entries, setEntries] = useState<FinanceEntry[]>([]);
  const [categories, setCategories] = useState<FinanceCategory[]>([]);
  const [fieldDefs, setFieldDefs] = useState<FieldDef[]>([]);
  const [monthlyPL, setMonthlyPL] = useState<MonthlyPL[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [period, setPeriod] = useState<PeriodState>({
    preset: "thisMonth",
    range: null,
  });
  const [kindFilter, setKindFilter] = useState<"all" | FinanceKind>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<FinanceEntry | null>(null);
  const [fieldManagerOpen, setFieldManagerOpen] = useState(false);

  const range = useMemo(
    () => rangeForPreset(period.preset, today ?? todayISO(), period.range),
    [period, today]
  );

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);

    const [entriesRes, categoriesRes, fieldsRes, plRes] = await Promise.all([
      listEntries(),
      listCategories(),
      listFieldDefs(),
      getMonthlyPL(),
    ]);

    const firstError =
      entriesRes.error ||
      categoriesRes.error ||
      fieldsRes.error ||
      plRes.error;
    if (firstError) {
      setError(firstError.message);
      setLoading(false);
      return;
    }

    setEntries(entriesRes.data ?? []);
    setCategories(categoriesRes.data ?? []);
    setFieldDefs(fieldsRes.data ?? []);
    setMonthlyPL(plRes.data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!today) return;
    loadAll();
  }, [today, loadAll]);

  const filteredEntries = useMemo(() => {
    let r = filterByDateRange(entries, range);
    if (kindFilter !== "all") r = r.filter((e) => e.kind === kindFilter);
    if (categoryFilter !== "all") r = r.filter((e) => e.category_id === categoryFilter);
    return r;
  }, [entries, range, kindFilter, categoryFilter]);

  const handleCreateEntry = useCallback(
    async (draft: Omit<FinanceEntry, "id" | "created_at" | "updated_at" | "created_by">) => {
      const tempId = `temp-${Date.now()}`;
      const optimistic: FinanceEntry = {
        ...draft,
        id: tempId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: null,
      };
      setEntries((prev) => [optimistic, ...prev]);

      const { data, error } = await createEntry(draft);

      if (error || !data) {
        setEntries((prev) => prev.filter((e) => e.id !== tempId));
        setError(error?.message ?? "Could not create entry.");
        return false;
      }
      setEntries((prev) => prev.map((e) => (e.id === tempId ? data : e)));
      return true;
    },
    []
  );

  const handleUpdateEntry = useCallback(
    async (id: string, draft: Omit<FinanceEntry, "id" | "created_at" | "updated_at" | "created_by">) => {
      let previous: FinanceEntry | null = null;
      setEntries((prev) =>
        prev.map((e) => {
          if (e.id !== id) return e;
          previous = e;
          return { ...e, ...draft, updated_at: new Date().toISOString() };
        })
      );

      const { data, error } = await updateEntry(id, draft);

      if (error || !data) {
        if (previous) {
          setEntries((prev) => prev.map((e) => (e.id === id ? previous! : e)));
        }
        setError(error?.message ?? "Could not update entry.");
        return false;
      }
      setEntries((prev) => prev.map((e) => (e.id === id ? data : e)));
      return true;
    },
    []
  );

  const handleDeleteEntry = useCallback(async (id: string) => {
    let removed: FinanceEntry | null = null;
    setEntries((prev) => prev.filter((e) => (e.id === id ? ((removed = e), false) : true)));

    const { error } = await deleteEntry(id);
    if (error) {
      if (removed) setEntries((prev) => [...prev, removed!]);
      setError(error.message);
      return false;
    }
    return true;
  }, []);

  const handleCreateCategory = useCallback(
    async (category: Omit<FinanceCategory, "id" | "created_at" | "updated_at">) => {
      const { data, error } = await createCategory(category);
      if (error || !data) {
        setError(error?.message ?? "Could not create category.");
        return null;
      }
      setCategories((prev) => [...prev, data].sort((a, b) => a.sort_order - b.sort_order));
      return data;
    },
    []
  );

  const handleCreateFieldDef = useCallback(
    async (field: Omit<FieldDef, "id" | "created_at" | "updated_at">) => {
      const { data, error } = await createFieldDef({
        key: field.key,
        label: field.label,
        field_type: field.field_type,
        options: field.options,
        required: field.required,
        applies_to: field.applies_to,
        sort_order: field.sort_order,
        is_archived: field.is_archived,
      });
      if (error || !data) {
        setError(error?.message ?? "Could not create field.");
        return null;
      }
      setFieldDefs((prev) => [...prev, data].sort((a, b) => a.sort_order - b.sort_order));
      return data;
    },
    []
  );

  const handleArchiveFieldDef = useCallback(async (id: string) => {
    const { data, error } = await archiveFieldDef(id, true);
    if (error) {
      setError(error.message);
      return false;
    }
    setFieldDefs((prev) => prev.filter((f) => f.id !== id));
    return true;
  }, []);

  const openNewEntry = useCallback(() => {
    setSelectedEntry(null);
    setDrawerOpen(true);
  }, []);

  const openEditEntry = useCallback((entry: FinanceEntry) => {
    setSelectedEntry(entry);
    setDrawerOpen(true);
  }, []);

  const closeDrawer = useCallback(() => {
    setDrawerOpen(false);
    setSelectedEntry(null);
  }, []);

  if (!today) return null;

  if (error && error.includes("not connected")) {
    return <NotConnectedPanel message={error} />;
  }

  return (
    <div className="space-y-6">
      {/* Period + filters */}
      <div className="card">
        <div className="flex flex-col flex-wrap gap-4 lg:flex-row lg:items-end">
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((preset) => (
              <button
                key={preset}
                onClick={() => setPeriod({ preset, range: null })}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                  period.preset === preset
                    ? "bg-navy-deep text-white"
                    : "bg-surface text-navy-deep hover:bg-navy/10"
                )}
              >
                {labelForPreset(preset)}
              </button>
            ))}
          </div>

          {period.preset === "custom" && (
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="date"
                value={period.range?.from ?? ""}
                max={period.range?.to ?? today}
                onChange={(e) =>
                  setPeriod((p) => ({
                    ...p,
                    range: { from: e.target.value, to: p.range?.to ?? today },
                  }))
                }
                className="rounded-xl border border-navy/15 px-3 py-2 text-sm"
              />
              <span className="text-ink/50">to</span>
              <input
                type="date"
                value={period.range?.to ?? ""}
                min={period.range?.from}
                max={today}
                onChange={(e) =>
                  setPeriod((p) => ({
                    ...p,
                    range: { from: p.range?.from ?? today, to: e.target.value },
                  }))
                }
                className="rounded-xl border border-navy/15 px-3 py-2 text-sm"
              />
            </div>
          )}

          <div className="ml-auto flex flex-wrap items-center gap-3">
            <select
              value={kindFilter}
              onChange={(e) => setKindFilter(e.target.value as "all" | FinanceKind)}
              className="rounded-xl border border-navy/15 bg-white px-3 py-2 text-sm"
            >
              <option value="all">All kinds</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="rounded-xl border border-navy/15 bg-white px-3 py-2 text-sm"
            >
              <option value="all">All categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            <button
              onClick={() => setFieldManagerOpen(true)}
              className="btn-ghost text-sm"
              aria-label="Customise fields"
            >
              <SlidersHorizontal className="h-4 w-4" aria-hidden />
              Customise fields
            </button>
            <button onClick={openNewEntry} className="btn-navy text-sm">
              <Wallet className="h-4 w-4" aria-hidden />
              Add entry
            </button>
          </div>
        </div>

        {range && (
          <p className="mt-4 text-xs text-ink/50">
            Showing {range.from} — {range.to}
          </p>
        )}
      </div>

      {/* Error banner */}
      {error && !error.includes("not connected") && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            <div>
              <p className="font-semibold">Could not load finance data</p>
              <p className="mt-0.5">{error}</p>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-12 text-ink/50">
          <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
          <span className="text-sm">Loading finance data…</span>
        </div>
      ) : (
        <>
          <PLSummary entries={filteredEntries} monthlyPL={monthlyPL} today={today} />

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <EntryTable
                entries={filteredEntries}
                categories={categories}
                fieldDefs={fieldDefs}
                onEdit={openEditEntry}
                onDelete={handleDeleteEntry}
              />
            </div>
            <div>
              <CategoryBreakdown entries={filteredEntries} categories={categories} />
            </div>
          </div>
        </>
      )}

      <EntryForm
        open={drawerOpen}
        onClose={closeDrawer}
        entry={selectedEntry}
        categories={categories}
        fieldDefs={fieldDefs}
        opportunities={opportunities}
        onSubmit={async (entryData) =>
          selectedEntry
            ? handleUpdateEntry(selectedEntry.id, entryData)
            : handleCreateEntry(entryData)
        }
        onCreateCategory={handleCreateCategory}
      />

      <FieldManager
        open={fieldManagerOpen}
        onClose={() => setFieldManagerOpen(false)}
        fieldDefs={fieldDefs}
        onCreate={handleCreateFieldDef}
        onArchive={handleArchiveFieldDef}
      />
    </div>
  );
}

function NotConnectedPanel({ message }: { message: string }) {
  return (
    <div className="card mt-6 text-center">
      <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
        <AlertTriangle className="h-6 w-6" aria-hidden />
      </span>
      <h2 className="mt-4 text-lg font-semibold text-navy-deep">Finance database not connected</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-ink/60">{message}</p>
      <p className="mt-4 text-xs text-ink/40">
        Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your environment, then
        refresh.
      </p>
    </div>
  );
}
