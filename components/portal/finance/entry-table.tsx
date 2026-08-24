"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpDown, Trash2, Pencil } from "lucide-react";
import { formatDate, cn } from "@/lib/utils";
/*
  formatMoney, not formatCurrency. The shared formatCurrency helper rounds to
  whole dollars, which turned a $3.50 toll into "$4" in the ledger. This table
  is the record of what was actually spent, so it has to show the cents the
  user typed. Same reason pl-summary.tsx uses formatMoney.
*/
import { formatMoney } from "@/lib/quotes/format";
import type { FinanceEntry, FinanceCategory, FieldDef } from "@/lib/finance/types";
import type { Job } from "@/lib/quotes/types";

type SortKey = "date" | "amount";

interface EntryTableProps {
  entries: FinanceEntry[];
  categories: FinanceCategory[];
  fieldDefs: FieldDef[];
  /** Used to resolve job_id to a UID. Optional so existing callers still work. */
  jobs?: Job[];
  onEdit: (entry: FinanceEntry) => void;
  onDelete: (id: string) => Promise<boolean>;
}

export function EntryTable({
  entries,
  categories,
  fieldDefs,
  jobs = [],
  onEdit,
  onDelete,
}: EntryTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const categoryById = useMemo(
    () => new Map(categories.map((c) => [c.id, c])),
    [categories]
  );

  const jobById = useMemo(() => new Map(jobs.map((j) => [j.id, j])), [jobs]);

  const activeFields = useMemo(
    () => fieldDefs.filter((f) => !f.is_archived),
    [fieldDefs]
  );

  const rows = useMemo(() => {
    const sorted = [...entries].sort((a, b) => {
      let cmp = 0;
      if (sortKey === "date") cmp = a.entry_date.localeCompare(b.entry_date);
      else cmp = a.amount - b.amount;
      return sortDir === "asc" ? cmp : -cmp;
    });
    return sorted;
  }, [entries, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  async function handleDelete(entry: FinanceEntry) {
    if (!window.confirm(`Delete “${entry.description}” for ${formatMoney(entry.amount)}?`)) return;
    setDeletingId(entry.id);
    await onDelete(entry.id);
    setDeletingId(null);
  }

  function renderCustomFieldValue(field: FieldDef, value: unknown): string {
    if (value === null || value === undefined) return "—";
    if (field.field_type === "boolean") return value ? "Yes" : "No";
    if (field.field_type === "currency") return formatMoney(Number(value) || 0);
    if (field.field_type === "number") return String(value);
    if (field.field_type === "date") return formatDate(String(value));
    return String(value);
  }

  return (
    <div className="card">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-semibold text-navy-deep">Entries</h2>
        <p className="text-sm text-ink/50">
          {rows.length} {rows.length === 1 ? "entry" : "entries"}
        </p>
      </div>

      <div className="min-w-0 overflow-x-auto rounded-2xl border border-navy/10 bg-white shadow-card">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-navy/10 bg-surface text-xs uppercase tracking-wide text-ink/60">
            <tr>
              <th className="px-4 py-3 font-semibold">
                <SortBtn label="Date" active={sortKey === "date"} onClick={() => toggleSort("date")} />
              </th>
              <th className="px-4 py-3 font-semibold">Kind</th>
              <th className="px-4 py-3 font-semibold">Category</th>
              <th className="px-4 py-3 font-semibold">Description</th>
              <th className="px-4 py-3 font-semibold">
                <SortBtn label="Amount" active={sortKey === "amount"} onClick={() => toggleSort("amount")} />
              </th>
              <th className="px-4 py-3 font-semibold">Job</th>
              {activeFields.map((field) => (
                <th key={field.id} className="px-4 py-3 font-semibold">
                  {field.label}
                </th>
              ))}
              <th className="px-4 py-3 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-navy/5">
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={7 + activeFields.length}
                  className="px-4 py-8 text-center text-sm text-ink/50"
                >
                  No entries match the current filters.
                </td>
              </tr>
            ) : (
              rows.map((entry) => {
                // category_id is null when the category was deleted; show the entry
                // as Uncategorised rather than blank, so the money stays visible.
                const cat = entry.category_id
                  ? categoryById.get(entry.category_id)
                  : undefined;
                return (
                  <tr
                    key={entry.id}
                    className={cn(
                      "cursor-pointer transition-colors hover:bg-surface",
                      deletingId === entry.id && "opacity-50"
                    )}
                    onClick={() => onEdit(entry)}
                  >
                    <td className="whitespace-nowrap px-4 py-3 text-ink/70">
                      {formatDate(entry.entry_date)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold",
                          entry.kind === "income"
                            ? "bg-success/10 text-success"
                            : "bg-red-100 text-red-700"
                        )}
                      >
                        {entry.kind}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-ink/70">
                      {cat ? cat.name : "Uncategorised"}
                    </td>
                    <td className="max-w-xs px-4 py-3">
                      <p className="break-words font-medium text-navy-deep">
                        {entry.description}
                      </p>
                      {entry.notes && (
                        <p className="break-words text-xs text-ink/50">{entry.notes}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 font-semibold text-navy-deep">
                      {formatMoney(entry.amount)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      {entry.job_id ? (
                        <Link
                          href={`/portal/jobs/${entry.job_id}`}
                          // The row itself opens the editor, so this link has to
                          // stop the click from reaching it.
                          onClick={(e) => e.stopPropagation()}
                          className="font-semibold text-navy hover:text-[#8a6c1f] hover:underline"
                        >
                          {jobById.get(entry.job_id)?.uid ?? "View job"}
                        </Link>
                      ) : entry.is_overhead ? (
                        <span className="text-xs font-medium text-[#8a6c1f]">Overhead</span>
                      ) : (
                        <span className="text-ink/40">—</span>
                      )}
                    </td>
                    {activeFields.map((field) => (
                      <td key={field.id} className="px-4 py-3 text-ink/70">
                        {renderCustomFieldValue(field, entry.custom_fields?.[field.key])}
                      </td>
                    ))}
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(entry);
                        }}
                        className="mr-2 inline-flex rounded-lg p-1.5 text-ink/50 hover:bg-surface hover:text-navy-deep"
                        aria-label="Edit entry"
                      >
                        <Pencil className="h-4 w-4" aria-hidden />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(entry);
                        }}
                        className="inline-flex rounded-lg p-1.5 text-ink/50 hover:bg-red-50 hover:text-red-600"
                        aria-label="Delete entry"
                      >
                        <Trash2 className="h-4 w-4" aria-hidden />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SortBtn({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn("inline-flex items-center gap-1 hover:text-navy", active && "text-navy")}
    >
      {label}
      <ArrowUpDown className="h-3.5 w-3.5" aria-hidden />
    </button>
  );
}
