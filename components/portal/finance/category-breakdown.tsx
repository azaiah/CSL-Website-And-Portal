"use client";

import { useMemo, useState } from "react";
import { BarChart3, Table2, BarChart2 } from "lucide-react";
import { formatCurrency, cn } from "@/lib/utils";
import { CHART } from "@/lib/chart-tokens";
import type { FinanceEntry, FinanceCategory, FinanceKind } from "@/lib/finance/types";
import { totalsByCategory } from "@/lib/finance/calc";

interface CategoryBreakdownProps {
  entries: FinanceEntry[];
  categories: FinanceCategory[];
}

/**
 * Spending (or income) by category.
 *
 * Two deliberate choices worth keeping:
 *
 * 1. ONE KIND AT A TIME. Expenses and income are different measures. Rendering
 *    them on a shared scale means a single large invoice flattens every expense
 *    bar next to it, which is the same failure the original spreadsheet chart
 *    had. The toggle switches measure rather than mixing them.
 *
 * 2. ONE COLOUR FOR EVERY BAR. This is nominal categorical data with a single
 *    measure — each row already names its category, and the bar length already
 *    encodes the amount. Giving every category its own colour spends the
 *    identity channel re-encoding what length shows, which reads as noise. The
 *    hovered bar shifts to gold; nothing else varies.
 */
export function CategoryBreakdown({ entries, categories }: CategoryBreakdownProps) {
  const [kind, setKind] = useState<FinanceKind>("expense");
  const [asTable, setAsTable] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);

  const totals = useMemo(
    () => totalsByCategory(entries, categories, kind),
    [entries, categories, kind]
  );

  const max = totals.length > 0 ? totals[0].amount : 0;
  const sum = totals.reduce((s, t) => s + t.amount, 0);
  const label = kind === "expense" ? "Expenses" : "Income";

  const summary =
    totals.length > 0
      ? `${label} by category. Largest: ${totals[0].name} at ${formatCurrency(
          totals[0].amount
        )}, ${((totals[0].amount / sum) * 100).toFixed(0)} percent of ${formatCurrency(
          sum
        )} total across ${totals.length} categories.`
      : `No ${label.toLowerCase()} recorded in this period.`;

  return (
    <div className="card">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-base font-semibold text-navy-deep">
          <BarChart3 className="h-5 w-5 text-gold" aria-hidden />
          {label} by category
        </h2>

        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-navy/15 p-0.5" role="group" aria-label="Measure">
            {(["expense", "income"] as FinanceKind[]).map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => setKind(k)}
                aria-pressed={kind === k}
                className={cn(
                  "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                  kind === k
                    ? "bg-navy-deep text-white"
                    : "text-navy hover:bg-surface"
                )}
              >
                {k === "expense" ? "Expenses" : "Income"}
              </button>
            ))}
          </div>

          {/* Required accessibility relief, not a nicety: the brand gold used
              elsewhere in the palette sits below the 3:1 contrast floor, so the
              same figures must be readable as text. */}
          <button
            type="button"
            onClick={() => setAsTable((v) => !v)}
            aria-pressed={asTable}
            title={asTable ? "Show chart" : "Show as table"}
            className="inline-flex items-center gap-1.5 rounded-lg border border-navy/15 px-2.5 py-1.5 text-xs font-medium text-navy transition-colors hover:bg-surface"
          >
            {asTable ? (
              <>
                <BarChart2 className="h-3.5 w-3.5" aria-hidden />
                Chart
              </>
            ) : (
              <>
                <Table2 className="h-3.5 w-3.5" aria-hidden />
                Table
              </>
            )}
          </button>
        </div>
      </div>

      {totals.length === 0 ? (
        <p className="py-6 text-center text-sm text-ink/50">
          No {label.toLowerCase()} entries in this period.
        </p>
      ) : asTable ? (
        <div className="min-w-0 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <caption className="sr-only">{summary}</caption>
            <thead className="border-b border-navy/10 text-xs uppercase tracking-wide text-ink/60">
              <tr>
                <th scope="col" className="py-2 pr-3 font-semibold">Category</th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">Amount</th>
                <th scope="col" className="py-2 text-right font-semibold">Share</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy/5">
              {totals.map((t) => (
                <tr key={t.categoryId}>
                  <th scope="row" className="break-words py-2 pr-3 font-medium text-navy-deep">
                    {t.name}
                  </th>
                  <td className="py-2 pr-3 text-right tabular-nums text-ink/80">
                    {formatCurrency(t.amount)}
                  </td>
                  <td className="py-2 text-right tabular-nums text-ink/60">
                    {sum > 0 ? `${((t.amount / sum) * 100).toFixed(1)}%` : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-navy/15">
                <th scope="row" className="py-2 pr-3 font-semibold text-navy-deep">Total</th>
                <td className="py-2 pr-3 text-right font-semibold tabular-nums text-navy-deep">
                  {formatCurrency(sum)}
                </td>
                <td className="py-2 text-right tabular-nums text-ink/60">100%</td>
              </tr>
            </tfoot>
          </table>
        </div>
      ) : (
        <figure className="m-0">
          <div className="relative space-y-3.5" role="img" aria-label={summary}>
            {/* Gridlines at 25/50/75/100% of the largest bar, behind the data. */}
            <div className="pointer-events-none absolute inset-0" aria-hidden>
              {[25, 50, 75, 100].map((pct) => (
                <div
                  key={pct}
                  className="absolute top-0 h-full border-l"
                  style={{ left: `${pct}%`, borderColor: CHART.gridline }}
                />
              ))}
            </div>

            {totals.map((t) => {
              const width = max > 0 ? (t.amount / max) * 100 : 0;
              const isHovered = hovered === t.categoryId;
              return (
                <div
                  key={t.categoryId}
                  className="relative"
                  onMouseEnter={() => setHovered(t.categoryId)}
                  onMouseLeave={() => setHovered(null)}
                >
                  <div className="flex items-baseline justify-between gap-3 text-sm">
                    <span className="break-words font-medium text-navy-deep">
                      {t.name}
                    </span>
                    {/* Values wear text colour, not the series colour — the bar
                        beside them already carries the identity. */}
                    <span className="shrink-0 font-semibold tabular-nums text-ink/80">
                      {formatCurrency(t.amount)}
                      {sum > 0 && (
                        <span className="ml-1.5 font-normal text-ink/45">
                          {((t.amount / sum) * 100).toFixed(0)}%
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="mt-1.5 h-2.5 w-full rounded-sm bg-surface">
                    <div
                      className="h-full rounded-sm transition-all duration-500"
                      style={{
                        width: `${width}%`,
                        backgroundColor: isHovered ? CHART.series2 : CHART.series1,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <figcaption className="mt-4 border-t border-navy/10 pt-2 text-xs text-ink/50">
            {totals.length} {totals.length === 1 ? "category" : "categories"} ·{" "}
            {formatCurrency(sum)} total
          </figcaption>
        </figure>
      )}
    </div>
  );
}
