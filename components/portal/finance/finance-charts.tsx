"use client";

/**
 * components/portal/finance/finance-charts.tsx
 * ---------------------------------------------------------------------------
 * Three finance charts, hand-drawn as SVG. No charting library.
 *
 * Colour rules come from lib/chart-tokens.ts and are not stylistic:
 *
 *  - Marks are CHART.series1 (#245691) and CHART.series2 (#C19A3E). Brand navy
 *    #16365C is NOT used - at bar scale it reads as near-black rather than a hue.
 *  - Green-vs-red never encodes profit and loss inside a chart. Measured
 *    separation is deltaE 6.1 under deuteranopia, against 16.6 for navy-vs-red.
 *    The net profit line is therefore a single navy line against a drawn zero
 *    baseline: the reader gets sign from the geometry, not from hue.
 *  - Chart 3 uses ONE colour for every bar. Service levels are nominal
 *    categories carrying a single measure, so a per-category palette would
 *    imply a distinction that the data does not contain.
 *
 * Every chart ships direct value labels and a table view, which is what makes
 * the gold series legible at 2.64:1.
 * ---------------------------------------------------------------------------
 */

import { useMemo } from "react";
import { CHART } from "@/lib/chart-tokens";
import { formatMoney } from "@/lib/quotes/format";
import { formatMonthLabel } from "@/lib/finance/calc";
import type { MonthlyPL } from "@/lib/finance/types";
import type { ServiceLevelSummary } from "@/lib/quotes/types";
import { ChartShell, ChartTable } from "./chart-shell";

/** The true minus sign used for negative figures, matching the KPI cards. */
const MINUS = "\u2212";

/**
 * Months shown at once. Direct value labels are the accessibility relief for
 * the gold series, so the window is capped at the point where those labels
 * would start to collide rather than letting the axis run indefinitely.
 */
const MAX_MONTHS = 6;

/**
 * Ceiling on rendered chart height.
 *
 * The SVGs scale to their container width, so on a full-width card a 480x300
 * viewBox stretched to 560px tall - mostly empty space with one labelled point
 * floating in it. Capping the height letterboxes the chart instead, which keeps
 * the marks at a sensible size whatever the column width.
 */
const CHART_MAX_H = "max-h-[320px]";

/**
 * Compact money for a chart label. Cents are kept below $1,000 because at that
 * scale they are most of the number - a $61.65 run must not read as "$62".
 * Above $1,000 the label abbreviates and the table view carries the exact figure.
 */
function labelMoney(value: number): string {
  const abs = Math.abs(value);
  const sign = value < 0 ? MINUS : "";
  if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(1)}m`;
  if (abs >= 1_000) return `${sign}$${(abs / 1_000).toFixed(1)}k`;
  return `${sign}$${abs.toFixed(2)}`;
}

/** "Jul 26" - short enough for an axis, still unambiguous across a year end. */
function shortMonth(monthISO: string): string {
  const d = new Date(monthISO + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
}

interface FinanceChartsProps {
  monthlyPL: MonthlyPL[];
  serviceLevels: ServiceLevelSummary[];
}

export function FinanceCharts({ monthlyPL, serviceLevels }: FinanceChartsProps) {
  // monthlyPL arrives ascending from the view; take the most recent window.
  const months = useMemo(
    () => [...monthlyPL].sort((a, b) => a.month.localeCompare(b.month)).slice(-MAX_MONTHS),
    [monthlyPL]
  );

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="lg:col-span-2">
        <RevenueVsExpenses months={months} />
      </div>
      <NetProfitByMonth months={months} />
      <RevenueByServiceLevel rows={serviceLevels} />
    </div>
  );
}

/* -- 1. Revenue vs expenses --------------------------------------------- */

function RevenueVsExpenses({ months }: { months: MonthlyPL[] }) {
  const W = 720;
  const H = 300;
  const TOP = 30; // room for the value labels above each bar
  const BOTTOM = 40; // room for month labels
  const plotH = H - TOP - BOTTOM;
  const baselineY = H - BOTTOM;

  const max = Math.max(0, ...months.map((m) => Math.max(m.income, m.expenses)));
  const scale = max > 0 ? plotH / max : 0;

  const groupW = months.length > 0 ? W / months.length : W;
  const barW = Math.min(groupW * 0.26, 44);
  const gap = 8;

  return (
    <ChartShell
      title="Revenue vs expenses by month"
      caption="Revenue includes delivered job billing, which is never copied into the entry list."
      isEmpty={months.length === 0 || max === 0}
      emptyMessage="No income or expenses recorded yet. Log an entry, or mark a job Delivered with a billed amount, and this fills in."
      table={
        <ChartTable headers={["Month", "Revenue", "Expenses"]}>
          {months.map((m) => (
            <tr key={m.month}>
              <td className="px-3 py-2 text-ink/70">{formatMonthLabel(m.month)}</td>
              <td className="px-3 py-2 text-right font-medium text-navy-deep">
                {formatMoney(m.income)}
              </td>
              <td className="px-3 py-2 text-right font-medium text-navy-deep">
                {formatMoney(m.expenses)}
              </td>
            </tr>
          ))}
        </ChartTable>
      }
    >
      {/* Legend. Shape and position are identical for both series, so the
          swatch is doing real work here - hence the text label beside each. */}
      <div className="mb-2 flex flex-wrap items-center gap-4 text-xs text-ink/70">
        <LegendSwatch colour={CHART.series1} label="Revenue" />
        <LegendSwatch colour={CHART.series2} label="Expenses" />
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        className={`h-auto w-full ${CHART_MAX_H}`}
        role="img"
        aria-label={`Revenue versus expenses for the last ${months.length} months. Switch to the table view for exact figures.`}
      >
        <line
          x1={0}
          y1={baselineY}
          x2={W}
          y2={baselineY}
          stroke={CHART.axis}
          strokeWidth={1}
        />

        {months.map((m, i) => {
          const centre = i * groupW + groupW / 2;
          const incomeH = m.income * scale;
          const expenseH = m.expenses * scale;
          const incomeX = centre - barW - gap / 2;
          const expenseX = centre + gap / 2;

          return (
            <g key={m.month}>
              <rect
                x={incomeX}
                y={baselineY - incomeH}
                width={barW}
                height={incomeH}
                fill={CHART.series1}
                rx={2}
              />
              <text
                x={incomeX + barW / 2}
                y={baselineY - incomeH - 6}
                textAnchor="middle"
                fontSize={9.5}
                fontWeight={600}
                fill={CHART.series1}
              >
                {labelMoney(m.income)}
              </text>

              <rect
                x={expenseX}
                y={baselineY - expenseH}
                width={barW}
                height={expenseH}
                fill={CHART.series2}
                rx={2}
              />
              {/* Gold is below the 3:1 mark floor, so its label is drawn in a
                  darker tone of the same hue to stay readable as text. */}
              <text
                x={expenseX + barW / 2}
                y={baselineY - expenseH - 6}
                textAnchor="middle"
                fontSize={9.5}
                fontWeight={600}
                fill="#8a6c1f"
              >
                {labelMoney(m.expenses)}
              </text>

              <text
                x={centre}
                y={baselineY + 18}
                textAnchor="middle"
                fontSize={11}
                fill={CHART.textMuted}
              >
                {shortMonth(m.month)}
              </text>
            </g>
          );
        })}
      </svg>
    </ChartShell>
  );
}

/* -- 2. Net profit by month --------------------------------------------- */

function NetProfitByMonth({ months }: { months: MonthlyPL[] }) {
  const W = 480;
  const H = 300;
  const TOP = 32;
  const BOTTOM = 40;
  const LEFT = 18;
  const RIGHT = 18;
  const plotH = H - TOP - BOTTOM;
  const plotW = W - LEFT - RIGHT;

  // Zero is always inside the scale, so the baseline is meaningful and a loss
  // is visibly below it. Without this a month of losses would look like growth.
  const values = months.map((m) => m.net);
  const max = Math.max(0, ...values);
  const min = Math.min(0, ...values);
  const span = max - min || 1;

  const y = (v: number) => TOP + ((max - v) / span) * plotH;
  const x = (i: number) =>
    months.length === 1 ? LEFT + plotW / 2 : LEFT + (i / (months.length - 1)) * plotW;

  const zeroY = y(0);
  const points = months.map((m, i) => ({ ...m, cx: x(i), cy: y(m.net) }));

  return (
    <ChartShell
      title="Net profit by month"
      caption="One line against a drawn zero. Below the line is a loss — read the position, not a colour."
      isEmpty={months.length === 0}
      emptyMessage="No months recorded yet. Net profit appears once there is at least one income or expense."
      table={
        <ChartTable headers={["Month", "Net profit"]}>
          {months.map((m) => (
            <tr key={m.month}>
              <td className="px-3 py-2 text-ink/70">{formatMonthLabel(m.month)}</td>
              <td className="px-3 py-2 text-right font-medium text-navy-deep">
                {m.net < 0 ? MINUS : ""}
                {formatMoney(Math.abs(m.net))}
              </td>
            </tr>
          ))}
        </ChartTable>
      }
    >
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className={`h-auto w-full ${CHART_MAX_H}`}
        role="img"
        aria-label={`Net profit for the last ${months.length} months. Switch to the table view for exact figures.`}
      >
        {/* Zero baseline, drawn solid and labelled so it is unmistakable. */}
        <line
          x1={LEFT}
          y1={zeroY}
          x2={W - RIGHT}
          y2={zeroY}
          stroke={CHART.axis}
          strokeWidth={1}
        />
        <text x={LEFT} y={zeroY - 4} fontSize={9} fill={CHART.textMuted}>
          0
        </text>

        {points.length > 1 && (
          <polyline
            points={points.map((p) => `${p.cx},${p.cy}`).join(" ")}
            fill="none"
            stroke={CHART.series1}
            strokeWidth={2.5}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        )}

        {points.map((p) => {
          const negative = p.net < 0;
          return (
            <g key={p.month}>
              <circle cx={p.cx} cy={p.cy} r={4} fill={CHART.series1} />
              {/* Label away from the line: above a profit, below a loss, so it
                  never overlaps the stroke it belongs to. */}
              <text
                x={p.cx}
                y={negative ? p.cy + 16 : p.cy - 11}
                textAnchor="middle"
                fontSize={10}
                fontWeight={600}
                fill={CHART.series1}
              >
                {labelMoney(p.net)}
              </text>
              <text
                x={p.cx}
                y={H - BOTTOM + 26}
                textAnchor="middle"
                fontSize={11}
                fill={CHART.textMuted}
              >
                {shortMonth(p.month)}
              </text>
            </g>
          );
        })}
      </svg>
    </ChartShell>
  );
}

/* -- 3. Revenue by service level ---------------------------------------- */

function RevenueByServiceLevel({ rows }: { rows: ServiceLevelSummary[] }) {
  // Sorted by the measure, largest first - that is the comparison the chart is
  // for. Zero-revenue levels stay in, because "STAT earned nothing" is a fact
  // worth seeing rather than a row to hide.
  const sorted = useMemo(
    () => [...rows].sort((a, b) => b.revenue - a.revenue),
    [rows]
  );

  const W = 480;
  const ROW_H = 34;
  const LABEL_W = 74;
  const VALUE_W = 76;
  const H = Math.max(sorted.length * ROW_H + 10, 60);
  const barMaxW = W - LABEL_W - VALUE_W;

  const max = Math.max(0, ...sorted.map((r) => r.revenue));
  const scale = max > 0 ? barMaxW / max : 0;

  return (
    <ChartShell
      title="Revenue by service level"
      caption="One colour: these are categories of a single measure, so a palette would imply a difference that is not there."
      isEmpty={sorted.length === 0 || max === 0}
      emptyMessage="No billed revenue by service level yet. A job contributes here once it is marked Delivered with a billed amount."
      table={
        <ChartTable headers={["Service", "Runs", "Revenue"]}>
          {sorted.map((r) => (
            <tr key={r.service_code}>
              <td className="px-3 py-2 text-ink/70">
                {r.service_code} - {r.service_name}
              </td>
              <td className="px-3 py-2 text-right text-ink/70">{r.run_count}</td>
              <td className="px-3 py-2 text-right font-medium text-navy-deep">
                {formatMoney(r.revenue)}
              </td>
            </tr>
          ))}
        </ChartTable>
      }
    >
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className={`h-auto w-full ${CHART_MAX_H}`}
        role="img"
        aria-label="Billed revenue by service level, highest first. Switch to the table view for exact figures."
      >
        {sorted.map((r, i) => {
          const rowY = i * ROW_H + 5;
          const barH = 18;
          const barY = rowY + (ROW_H - barH) / 2 - 5;
          const barW = r.revenue * scale;

          return (
            <g key={r.service_code}>
              <text
                x={0}
                y={barY + barH / 2 + 4}
                fontSize={11}
                fontWeight={600}
                fill={CHART.textMuted}
              >
                {r.service_code}
              </text>
              <rect
                x={LABEL_W}
                y={barY}
                width={barW}
                height={barH}
                fill={CHART.series1}
                rx={2}
              />
              {/* Value at the bar end, which is where the eye already is. */}
              <text
                x={LABEL_W + barW + 6}
                y={barY + barH / 2 + 4}
                fontSize={10.5}
                fontWeight={600}
                fill={CHART.series1}
              >
                {labelMoney(r.revenue)}
              </text>
            </g>
          );
        })}
      </svg>
    </ChartShell>
  );
}

function LegendSwatch({ colour, label }: { colour: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className="h-2.5 w-2.5 shrink-0 rounded-sm"
        style={{ backgroundColor: colour }}
        aria-hidden
      />
      {label}
    </span>
  );
}
