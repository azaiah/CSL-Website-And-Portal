"use client";

import {
  DollarSign,
  ArrowDownCircle,
  TrendingUp,
  TrendingDown,
  Truck,
} from "lucide-react";
import { StatCard } from "@/components/portal/portal-ui";
/*
  formatMoney, not formatCurrency: the shared helper is capped at zero decimal
  places, which turned a $61.65 run into "$62" on the card while the charts
  underneath showed $61.65. On jobs priced in the tens of dollars the cents are
  a real part of the number, so the headline has to carry them too.
*/
import { formatMoney } from "@/lib/quotes/format";
import { CHART } from "@/lib/chart-tokens";
import type { FinanceEntry, MonthlyPL } from "@/lib/finance/types";
import {
  ledgerSummary,
  jobMarginSummary,
  revenueRecognisedJobs,
  monthOverMonth,
  formatMonthLabel,
  type JobMarginRow,
} from "@/lib/finance/calc";

interface PLSummaryProps {
  entries: FinanceEntry[];
  monthlyPL: MonthlyPL[];
  today: string;
  /**
   * Rows from job_financials, already scoped to the selected period. Optional
   * so the component still renders if a caller has not wired jobs up yet.
   */
  jobRows?: JobMarginRow[];
}

export function PLSummary({ entries, monthlyPL, today, jobRows = [] }: PLSummaryProps) {
  /*
    Two different questions, two different numbers — this is the whole point of
    this row and the reason the client's spreadsheet has #REF! in its Net Profit
    Margin cell.

    Net profit  = every dollar in and out, insurance and phone bill included.
    Job margin  = did the RUNS pay for themselves. Overhead is excluded, because
                  it belongs to the month rather than to any single delivery.

    They are supposed to diverge. Adding a $420 insurance cost moves net profit
    and must leave job margin alone.
  */
  const { income, expenses, net, margin } = ledgerSummary(entries, jobRows);
  const jobs = jobMarginSummary(jobRows);

  const mom = monthOverMonth(monthlyPL, today);
  const isLoss = net < 0;
  const jobLoss = jobs.jobMargin < 0;

  // Income is entries plus delivered job revenue, so say where it came from —
  // otherwise a $61.65 figure with no matching income entry looks like a bug.
  const recognised = revenueRecognisedJobs(jobRows);
  const jobRevenue = recognised.reduce((sum, r) => sum + r.revenue, 0);

  const incomeHint = () => {
    const manual = entries.filter((e) => e.kind === "income").length;
    if (jobRevenue === 0) return `${manual} income entries`;
    return `incl. ${formatMoney(jobRevenue)} from ${recognised.length} delivered ${
      recognised.length === 1 ? "job" : "jobs"
    }`;
  };

  /*
    Margin % used to have its own card. Job margin took that slot, so the
    percentage rides along here — it is a ratio OF net profit, so this is
    arguably where it belonged anyway.
  */
  const netHint = () => {
    // toFixed emits an ASCII hyphen; the rest of this card uses a true minus
    // sign, and mixing the two looks like a rendering fault.
    const marginPart =
      income > 0
        ? `${margin < 0 ? "−" : ""}${Math.abs(margin).toFixed(1)}% margin`
        : "no income yet";
    if (!mom) return `${marginPart} · ${formatMoney(expenses)} out`;

    const sign = mom.delta >= 0 ? "+" : "−";
    const percent =
      mom.percentChange !== null ? `${sign}${mom.percentChange.toFixed(1)}%` : "—";
    return `${marginPart} · ${sign}${formatMoney(
      Math.abs(mom.delta)
    )} vs ${formatMonthLabel(mom.previousMonth)} (${percent})`;
  };

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        label="Income"
        value={formatMoney(income)}
        icon={DollarSign}
        hint={incomeHint()}
      />
      <StatCard
        label="Expenses"
        value={formatMoney(expenses)}
        icon={ArrowDownCircle}
        hint={(() => {
          // Singular/plural, so a lone entry does not read "1 expense entries".
          const n = entries.filter((e) => e.kind === "expense").length;
          return `${n} expense ${n === 1 ? "entry" : "entries"}`;
        })()}
      />

      {/*
        Job margin sits beside Net Profit rather than replacing it. No green or
        red here: this is a per-run operating figure, not the headline, and
        reserving the profit/loss colours for one number keeps them meaningful.
        A negative still reads unambiguously because of the minus sign.
      */}
      <StatCard
        label="Job margin"
        value={`${jobLoss ? "−" : ""}${formatMoney(Math.abs(jobs.jobMargin))}`}
        icon={Truck}
        hint={
          jobs.jobCount === 0
            ? "No jobs in this period"
            : `${jobs.jobCount} ${jobs.jobCount === 1 ? "job" : "jobs"} · overhead excluded`
        }
      />

      {/*
        Net Profit is the one number on this page that must read as good or bad
        at a glance. It previously rendered with a fixed up-arrow and no colour,
        so a $3,000 loss looked identical to a $3,000 profit until you noticed
        the minus sign.

        Three signals now carry the meaning together — an explicit +/− sign, the
        arrow direction, and the colour — so it survives being read quickly, in
        greyscale, or by someone who cannot distinguish red from green. Colour
        alone is never the signal. (Green/red is correct HERE, on a number with
        an icon; it is not used on chart marks, where the two hues measure only
        ΔE 6.1 apart under deuteranopia.)
      */}
      <StatCard
        label="Net profit"
        value={`${isLoss ? "−" : "+"}${formatMoney(Math.abs(net))}`}
        valueStyle={{ color: isLoss ? CHART.deltaDown : CHART.deltaUp }}
        icon={isLoss ? TrendingDown : TrendingUp}
        hint={netHint()}
      />
    </div>
  );
}
