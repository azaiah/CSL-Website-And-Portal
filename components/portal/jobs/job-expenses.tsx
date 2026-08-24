"use client";

/**
 * components/portal/jobs/job-expenses.tsx
 * ---------------------------------------------------------------------------
 * Step 2 of the client's flow chart, in one panel.
 *
 * There is no separate job-costs table. These rows ARE finance_entries, with
 * job_id set — which is why a toll logged here is already in the finance
 * tracker, and why per-job margin and net profit can never disagree about it.
 * That is the single clearest reason the portal beats the spreadsheets: his
 * current process is "write it on the run sheet, then remember to key it into
 * the expense workbook", and the second half is where the money goes missing.
 * ---------------------------------------------------------------------------
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Plus, Receipt } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { todayISO } from "@/lib/health";
import { formatMoney, sanitizeDecimal } from "@/lib/quotes/format";
import { listJobExpenses, createJobExpense } from "@/lib/quotes/queries";
import { listCategories } from "@/lib/finance/queries";
import type { FinanceCategory, FinanceEntry } from "@/lib/finance/types";

interface JobExpensesProps {
  jobId: string;
  customerId: string;
  /** Called after a cost is saved so the footer strip can re-read the view. */
  onChanged: () => void;
  onError: (message: string) => void;
}

export function JobExpenses({ jobId, customerId, onChanged, onError }: JobExpensesProps) {
  const [expenses, setExpenses] = useState<FinanceEntry[]>([]);
  const [categories, setCategories] = useState<FinanceCategory[]>([]);
  const [loading, setLoading] = useState(true);

  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [categoryId, setCategoryId] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const [expensesRes, categoriesRes] = await Promise.all([
      listJobExpenses(jobId),
      listCategories(),
    ]);
    if (expensesRes.error) onError(expensesRes.error.message);
    else setExpenses(expensesRes.data ?? []);
    if (categoriesRes.data) setCategories(categoriesRes.data);
    setLoading(false);
  }, [jobId, onError]);

  useEffect(() => {
    load();
  }, [load]);

  // Only expense categories: this panel is the cost side by construction.
  const expenseCategories = useMemo(
    () => categories.filter((c) => c.kind === "expense"),
    [categories]
  );

  const categoryById = useMemo(
    () => new Map(categories.map((c) => [c.id, c])),
    [categories]
  );

  const total = useMemo(
    () => expenses.reduce((sum, e) => sum + e.amount, 0),
    [expenses]
  );

  function resetForm() {
    setCategoryId("");
    setAmount("");
    setNote("");
    setAdding(false);
  }

  async function handleSave() {
    const parsed = Number(amount);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      onError("Enter a cost amount greater than zero.");
      return;
    }

    const category = categoryById.get(categoryId);
    setSaving(true);
    const { data, error } = await createJobExpense(jobId, {
      entry_date: todayISO(),
      category_id: categoryId || null,
      // The description is what shows in the finance tracker, so it has to
      // stand on its own there without the job page for context.
      description: note.trim() || category?.name || "Job cost",
      amount: parsed,
      // Denormalised so the customer rollup does not need to join through jobs.
      customer_id: customerId,
      notes: note.trim() || null,
    });
    setSaving(false);

    if (error || !data) {
      onError(error?.message ?? "Could not save the cost.");
      return;
    }

    setExpenses((prev) => [data, ...prev]);
    resetForm();
    onChanged();
  }

  return (
    <div className="rounded-2xl border border-navy/10 bg-surface p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-navy-deep">
          <Receipt className="h-4 w-4 text-gold" aria-hidden />
          Costs on this run
        </h3>
        {!adding && (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="btn-ghost text-xs"
          >
            <Plus className="h-3.5 w-3.5" aria-hidden />
            Add cost
          </button>
        )}
      </div>

      {adding && (
        <div className="mt-4 grid gap-3 rounded-xl border border-navy/15 bg-white p-3 sm:grid-cols-[minmax(0,1fr)_7rem]">
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            aria-label="Cost category"
            className="rounded-xl border border-navy/15 bg-white px-3 py-2 text-sm sm:col-span-1"
          >
            <option value="">Select category</option>
            {expenseCategories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <span className="relative block">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-ink/50">
              $
            </span>
            <input
              type="text"
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(sanitizeDecimal(e.target.value))}
              placeholder="0.00"
              aria-label="Cost amount"
              className="w-full rounded-xl border border-navy/15 py-2 pl-7 pr-3 text-sm tabular-nums"
            />
          </span>

          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Note — e.g. toll on I-95"
            aria-label="Cost note"
            className="rounded-xl border border-navy/15 px-3 py-2 text-sm sm:col-span-2"
          />

          <div className="flex gap-2 sm:col-span-2">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="btn-navy text-xs"
            >
              {saving ? "Saving…" : "Save cost"}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="rounded-xl border border-navy/15 px-3 py-2 text-xs hover:bg-surface"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <p className="mt-4 text-xs text-ink/50">Loading costs…</p>
      ) : expenses.length === 0 ? (
        <p className="mt-4 text-xs text-ink/50">
          No costs logged yet. Tolls, parking, packaging and driver time go here — fuel is
          calculated from the gallons above, so it does not need an entry.
        </p>
      ) : (
        <>
          <ul className="mt-4 divide-y divide-navy/10">
            {expenses.map((e) => (
              <li key={e.id} className="flex items-start justify-between gap-3 py-2">
                <div className="min-w-0">
                  <p className="break-words text-sm font-medium text-navy-deep">
                    {e.description}
                  </p>
                  <p className="text-xs text-ink/50">
                    {formatDate(e.entry_date)}
                    {e.category_id && categoryById.get(e.category_id)
                      ? ` · ${categoryById.get(e.category_id)!.name}`
                      : ""}
                    {/* Should not happen from this panel, but if a cost was
                        flagged overhead elsewhere it is excluded from margin,
                        so say so rather than showing a number that does not add up. */}
                    {e.is_overhead ? " · overhead, excluded from job margin" : ""}
                  </p>
                </div>
                <span className="shrink-0 text-sm font-semibold tabular-nums text-navy-deep">
                  {formatMoney(e.amount)}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-2 flex items-center justify-between border-t border-navy/15 pt-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-ink/50">
              Logged costs
            </span>
            <span className="text-sm font-bold tabular-nums text-navy-deep">
              {formatMoney(total)}
            </span>
          </div>
        </>
      )}

      <p className="mt-3 break-words text-xs text-ink/50">
        These are finance entries.{" "}
        <Link href="/portal/finance" className="font-semibold text-navy hover:underline">
          Open the finance tracker
        </Link>{" "}
        and they are already there — same rows, no re-keying.
      </p>
    </div>
  );
}
