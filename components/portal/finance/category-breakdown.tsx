"use client";

import { BarChart3 } from "lucide-react";
import { formatCurrency, cn } from "@/lib/utils";
import type { FinanceEntry, FinanceCategory } from "@/lib/finance/types";
import { totalsByCategory } from "@/lib/finance/calc";

interface CategoryBreakdownProps {
  entries: FinanceEntry[];
  categories: FinanceCategory[];
}

export function CategoryBreakdown({ entries, categories }: CategoryBreakdownProps) {
  const totals = totalsByCategory(entries, categories);
  const max = totals.length > 0 ? totals[0].amount : 0;

  return (
    <div className="card">
      <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-navy-deep">
        <BarChart3 className="h-5 w-5 text-gold" aria-hidden />
        Category breakdown
      </h2>

      {totals.length === 0 ? (
        <p className="py-4 text-center text-sm text-ink/50">
          No entries in this period.
        </p>
      ) : (
        <div className="space-y-4">
          {totals.map((t) => {
            const width = max > 0 ? (t.amount / max) * 100 : 0;
            return (
              <div key={t.categoryId} className="group">
                <div className="flex items-center justify-between text-sm">
                  <span className="break-words font-medium text-navy-deep">
                    {t.name}
                  </span>
                  <span
                    className={cn(
                      "shrink-0 pl-3 font-semibold",
                      t.kind === "income" ? "text-success" : "text-red-600"
                    )}
                  >
                    {formatCurrency(t.amount)}
                  </span>
                </div>
                <div className="mt-1.5 h-2.5 w-full overflow-hidden rounded-full bg-surface">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-500",
                      t.kind === "income" ? "bg-success" : "bg-red-500"
                    )}
                    style={{ width: `${width}%` }}
                    aria-label={`${t.name}: ${formatCurrency(t.amount)}`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
