"use client";

import { DollarSign, ArrowDownCircle, TrendingUp, Percent } from "lucide-react";
import { StatCard } from "@/components/portal/portal-ui";
import { formatCurrency } from "@/lib/utils";
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

  const netHint = () => {
    if (!mom) return `${formatCurrency(income)} income − ${formatCurrency(expenses)} expenses`;
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
      <StatCard
        label="Net Profit"
        value={formatCurrency(net)}
        icon={TrendingUp}
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
