"use client";

/**
 * components/portal/jobs/job-footer-strip.tsx
 * ---------------------------------------------------------------------------
 * The six numbers that say whether this run was worth driving. All six come
 * from the job_financials view, so none of them is recomputed in the browser.
 *
 * Variance (billed − quoted) is shown even when it is ugly. The client's sheet
 * has no equivalent, so a run quoted at $80 and billed at $61.65 currently
 * looks like a normal $61.65 job and the $18.35 is never questioned. It is
 * signed, labelled AND coloured, so the sign carries the meaning on its own.
 * Nothing here auto-corrects the billed amount to match the quote — a
 * difference is a fact about the job, not an error to paper over.
 * ---------------------------------------------------------------------------
 */

import { TrendingDown, TrendingUp } from "lucide-react";
import { CHART } from "@/lib/chart-tokens";
import { formatMoney } from "@/lib/quotes/format";
import type { JobFinancials } from "@/lib/quotes/types";

export function JobFooterStrip({ financials }: { financials: JobFinancials | null }) {
  if (!financials) {
    return (
      <div className="card">
        <p className="text-sm text-ink/55">
          Job economics load from the job_financials view. Save the job to see them.
        </p>
      </div>
    );
  }

  const f = financials;
  const hasQuote = f.quoted_total !== null;
  // Only meaningful against a quote. An urgent run dispatched without one has
  // nothing to vary from, so the cell says so instead of showing the billed
  // amount as if the whole of it were an overrun.
  const variance = hasQuote ? f.billed_vs_quoted : null;

  return (
    <div className="card">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-base font-semibold text-navy-deep">Job economics</h2>
        <p className="text-xs text-ink/50">Live from job_financials</p>
      </div>

      <dl className="mt-4 grid gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <Figure label="Billed" value={formatMoney(f.revenue)} />

        <Figure
          label="Quoted"
          value={hasQuote ? formatMoney(f.quoted_total!) : "No quote"}
          hint={hasQuote ? undefined : "Dispatched directly"}
        />

        <Variance amount={variance} />

        <Figure
          label="Fuel"
          value={formatMoney(f.fuel_cost)}
          hint="Calculated by the database"
        />

        <Figure
          label="Other costs"
          value={formatMoney(f.attributed_cost)}
          hint="Overhead excluded"
        />

        {/* The headline. Signed and coloured, with the sign doing the work. */}
        <Figure
          label="Job margin"
          value={`${f.job_margin < 0 ? "−" : ""}${formatMoney(Math.abs(f.job_margin))}`}
          valueStyle={{
            color: f.job_margin < 0 ? CHART.deltaDown : CHART.deltaUp,
          }}
          hint="Billed − fuel − costs"
        />
      </dl>
    </div>
  );
}

function Figure({
  label,
  value,
  hint,
  valueStyle,
}: {
  label: string;
  value: string;
  hint?: string;
  valueStyle?: React.CSSProperties;
}) {
  return (
    <div className="min-w-0">
      <dt className="text-xs font-semibold uppercase tracking-wide text-ink/50">{label}</dt>
      <dd
        className="mt-1 break-words text-lg font-bold tabular-nums text-navy-deep"
        style={valueStyle}
      >
        {value}
      </dd>
      {hint && <p className="mt-0.5 break-words text-xs text-ink/45">{hint}</p>}
    </div>
  );
}

function Variance({ amount }: { amount: number | null }) {
  if (amount === null) {
    return <Figure label="Variance" value="—" hint="Nothing to compare" />;
  }

  // Exact match is the common, uninteresting case: no colour, no alarm.
  if (Math.abs(amount) < 0.005) {
    return <Figure label="Variance" value={formatMoney(0)} hint="Billed as quoted" />;
  }

  const over = amount > 0;
  const Icon = over ? TrendingUp : TrendingDown;

  return (
    <div className="min-w-0">
      <dt className="text-xs font-semibold uppercase tracking-wide text-ink/50">Variance</dt>
      <dd
        className="mt-1 flex items-center gap-1.5 text-lg font-bold tabular-nums"
        style={{ color: over ? CHART.deltaUp : CHART.deltaDown }}
      >
        <Icon className="h-4 w-4 shrink-0" aria-hidden />
        <span className="break-words">
          {over ? "+" : "−"}
          {formatMoney(Math.abs(amount))}
        </span>
      </dd>
      {/* The word, so colour is never the only signal. */}
      <p className="mt-0.5 break-words text-xs text-ink/45">
        Billed {over ? "above" : "below"} quote
      </p>
    </div>
  );
}
