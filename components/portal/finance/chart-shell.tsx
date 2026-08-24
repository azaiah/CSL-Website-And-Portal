"use client";

/**
 * components/portal/finance/chart-shell.tsx
 * ---------------------------------------------------------------------------
 * The frame every finance chart sits in: heading, caption, chart/table toggle,
 * and an empty state.
 *
 * The toggle is not a nicety. Brand gold measures 2.64:1 on white, under the
 * 3:1 floor for a data mark, so any chart using it owes the reader a
 * non-colour way to read the same numbers. Rather than give one chart a table
 * and not the others, every chart gets one — it is also the only way to read an
 * exact figure, since bar labels are abbreviated once values pass $1,000.
 * ---------------------------------------------------------------------------
 */

import { useState, type ReactNode } from "react";
import { BarChart3, Table2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChartShellProps {
  title: string;
  /** One line explaining what the chart is for, or how to read it. */
  caption?: string;
  /** True when there is nothing to plot. */
  isEmpty: boolean;
  /** Must say what is MISSING, not just "no data". */
  emptyMessage: string;
  /** The chart itself. */
  children: ReactNode;
  /** The same numbers as a table. */
  table: ReactNode;
}

export function ChartShell({
  title,
  caption,
  isEmpty,
  emptyMessage,
  children,
  table,
}: ChartShellProps) {
  const [view, setView] = useState<"chart" | "table">("chart");

  return (
    <div className="card">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-base font-semibold text-navy-deep">{title}</h3>
          {caption && (
            <p className="mt-0.5 break-words text-xs text-ink/55">{caption}</p>
          )}
        </div>

        {/* Hidden when empty: there is nothing to switch between. */}
        {!isEmpty && (
          <div
            className="inline-flex shrink-0 rounded-full bg-surface p-1"
            role="group"
            aria-label={`${title} view`}
          >
            <ToggleBtn
              active={view === "chart"}
              onClick={() => setView("chart")}
              icon={<BarChart3 className="h-3.5 w-3.5" aria-hidden />}
              label="Chart"
            />
            <ToggleBtn
              active={view === "table"}
              onClick={() => setView("table")}
              icon={<Table2 className="h-3.5 w-3.5" aria-hidden />}
              label="Table"
            />
          </div>
        )}
      </div>

      <div className="mt-4">
        {isEmpty ? (
          <p className="rounded-xl border border-dashed border-navy/15 bg-surface px-4 py-8 text-center text-sm text-ink/55">
            {emptyMessage}
          </p>
        ) : view === "chart" ? (
          children
        ) : (
          <div className="min-w-0 overflow-x-auto">{table}</div>
        )}
      </div>
    </div>
  );
}

function ToggleBtn({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
        active
          ? "bg-navy-deep text-white"
          : "text-ink/60 hover:text-navy-deep"
      )}
    >
      {icon}
      {label}
    </button>
  );
}

/** Shared table styling so all three chart tables match. */
export function ChartTable({
  headers,
  children,
}: {
  headers: string[];
  children: ReactNode;
}) {
  return (
    <table className="w-full min-w-[360px] text-left text-sm">
      <thead className="border-b border-navy/10 text-xs uppercase tracking-wide text-ink/60">
        <tr>
          {headers.map((h, i) => (
            <th
              key={h}
              className={cn("px-3 py-2 font-semibold", i > 0 && "text-right")}
            >
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-navy/5">{children}</tbody>
    </table>
  );
}
