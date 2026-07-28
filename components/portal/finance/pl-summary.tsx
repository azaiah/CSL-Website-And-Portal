"use client";

import {
  DollarSign,
  ArrowDownCircle,
  TrendingUp,
  TrendingDown,
  Percent,
} from "lucide-react";
import { StatCard } from "@/components/portal/portal-ui";
import { formatCurrency } from "@/lib/utils";
import { CHART } from "@/lib/chart-tokens";
import type { FinanceEntry, MonthlyPL } from "@/lib/finance/types";
import { plSummary, monthOverMonth, formatMonthLabel } from "@/lib/finance/calc";

interface PLSummaryProps {
  entries: FinanceEntry[];
  monthlyPL: MonthlyPL[];
  today: string;
}

export function PLSummary({ entries, monthlyPL, today }: PLSummaryProps) {
  const { income, expenses, net, margin } = plSummary(entries);
  const mom = monthOverMonth(monthlyPL, today);
  const isLoss = net < 0;

  const netHint = () => {
    if (!mom)
      return `${formatCurrency(income)} income − ${formatCurrency(expenses)} expenses`;
    const sign = mom.delta >= 0 ? "+" : "−";
    const percent =
      mom.percentChange !== null ? `${sign}${mom.percentChange.toFixed(1)}%` : "—";
    return `${sign}${formatCurrency(Math.abs(mom.delta))} vs ${formatMonthLabel(
      mom.previousMonth
    )} (${percent})`;
  };

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        label="Income"
        value={formatCurrency(income)}
        icon={DollarSign}
        hint={`${entries.filter((e) => e.kind === "income").length} income entries`}
      />
      <StatCard
        label="Expenses"
        value={formatCurrency(expenses)}
        icon={ArrowDownCircle}
        hint={`${entries.filter((e) => e.kind === "expense").length} expense entries`}
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
        label="Net Profit"
        value={`${isLoss ? "−" : "+"}${formatCurrency(Math.abs(net))}`}
        valueStyle={{ color: isLoss ? CHART.deltaDown : CHART.deltaUp }}
        icon={isLoss ? TrendingDown : TrendingUp}
        hint={netHint()}
      />

      <StatCard
        label="Margin %"
        value={`${margin.toFixed(1)}%`}
        icon={Percent}
        hint={income > 0 ? "Net ÷ Income" : "No income in this period"}
      />
    </div>
  );
}
