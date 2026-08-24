"use client";

/**
 * components/portal/dashboard-ops-stats.tsx
 * ---------------------------------------------------------------------------
 * The client's "Dashboard & Summary" tab, rebuilt from views.
 *
 * On his spreadsheet these six cells are formulas over the CLIENT REPOSITORY
 * sheet, and the Net Profit Margin one currently reads #REF! because a column
 * it pointed at was moved. Every figure here is read from job_financials or
 * finance_monthly_pl instead, so there is no formula to break and nothing to
 * refresh by hand.
 *
 * Follows the components/portal/dashboard-stats.tsx pattern: a client component
 * reading live data, because a dashboard that reports a version of events
 * nobody recognises is worse than no dashboard.
 * ---------------------------------------------------------------------------
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  PackageCheck,
  Navigation,
  DollarSign,
  Route,
  Fuel,
  Percent,
} from "lucide-react";
import { StatCard } from "@/components/portal/portal-ui";
import { CHART } from "@/lib/chart-tokens";
// formatMoney rather than the shared formatCurrency, which rounds cents away —
// a $61.65 run must not be reported as $62 on the dashboard.
import { formatMoney, formatMiles } from "@/lib/quotes/format";
import { getJobFinancials, getServiceLevelSummary } from "@/lib/quotes/queries";
import { getMonthlyPL } from "@/lib/finance/queries";
import type { JobFinancials, ServiceLevelSummary } from "@/lib/quotes/types";
import type { MonthlyPL } from "@/lib/finance/types";
import type { JobStatus } from "@/lib/quotes/types";
import { isNotConnected } from "@/components/portal/data-states";

/** Statuses where the run is physically underway. */
const IN_TRANSIT: JobStatus[] = ["Picked Up", "In Transit"];

export function DashboardOpsStats() {
  const [jobs, setJobs] = useState<JobFinancials[]>([]);
  const [services, setServices] = useState<ServiceLevelSummary[]>([]);
  const [monthlyPL, setMonthlyPL] = useState<MonthlyPL[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const [jobsRes, servicesRes, plRes] = await Promise.all([
      getJobFinancials(),
      getServiceLevelSummary(),
      getMonthlyPL(),
    ]);

    const firstError = jobsRes.error || servicesRes.error || plRes.error;
    if (firstError) {
      setError(firstError.message);
      setLoading(false);
      return;
    }

    setJobs(jobsRes.data ?? []);
    setServices(servicesRes.data ?? []);
    setMonthlyPL(plRes.data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const stats = useMemo(() => {
    let delivered = 0;
    let inTransit = 0;
    let revenue = 0;
    let miles = 0;
    let fuel = 0;

    for (const j of jobs) {
      if (j.delivery_status === "Delivered") {
        delivered += 1;
        // Only delivered runs contribute revenue, matching finance_ledger.
        revenue += j.revenue;
      }
      if (IN_TRANSIT.includes(j.delivery_status)) inTransit += 1;
      miles += j.total_miles ?? 0;
      fuel += j.fuel_cost;
    }

    // The whole-business margin, over every month the ledger knows about.
    const income = monthlyPL.reduce((s, m) => s + m.income, 0);
    const net = monthlyPL.reduce((s, m) => s + m.net, 0);
    const margin = income > 0 ? (net / income) * 100 : null;

    return { delivered, inTransit, revenue, miles, fuel, net, margin };
  }, [jobs, monthlyPL]);

  // A missing database is not the dashboard's problem to explain — the finance
  // and jobs pages already say so clearly. Staying quiet beats a broken card.
  if (isNotConnected(error) || (error && !loading)) return null;
  if (loading) return null;

  const marginIsLoss = stats.net < 0;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-navy-deep">Operations & summary</h2>
        <p className="mt-0.5 text-sm text-ink/60">
          Live from the job and ledger views — nothing here is a stored total.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard
          label="Completed deliveries"
          value={String(stats.delivered)}
          icon={PackageCheck}
          hint={`${jobs.length} job${jobs.length === 1 ? "" : "s"} logged`}
        />
        <StatCard
          label="Active in transit"
          value={String(stats.inTransit)}
          icon={Navigation}
          hint="Picked up or on the road"
        />
        <StatCard
          label="Billed revenue"
          value={formatMoney(stats.revenue)}
          icon={DollarSign}
          hint="Delivered runs only"
        />
        <StatCard
          label="Miles driven"
          value={formatMiles(stats.miles)}
          icon={Route}
          hint="Across every logged run"
        />
        <StatCard
          label="Fuel spend"
          value={formatMoney(stats.fuel)}
          icon={Fuel}
          hint="Calculated from gallons"
        />
        {/*
          The cell that reads #REF! on his spreadsheet. Sign, arrow-free icon
          and colour together, the same rule as the finance Net Profit card:
          colour is reinforcement, never the only signal.
        */}
        <StatCard
          label="Net profit margin"
          value={
            stats.margin === null
              ? "—"
              : `${marginIsLoss ? "−" : "+"}${Math.abs(stats.margin).toFixed(1)}%`
          }
          valueStyle={
            stats.margin === null
              ? undefined
              : { color: marginIsLoss ? CHART.deltaDown : CHART.deltaUp }
          }
          icon={Percent}
          hint={
            stats.margin === null
              ? "No income recorded yet"
              : `${stats.net < 0 ? "−" : "+"}${formatMoney(
                  Math.abs(stats.net)
                )} net of everything`
          }
        />
      </div>

      <ServiceLevelTable rows={services} />
    </div>
  );
}

function ServiceLevelTable({ rows }: { rows: ServiceLevelSummary[] }) {
  // Every service level is in the view, including ones with no runs, so an
  // empty state only applies when the rate card itself is empty.
  if (rows.length === 0) return null;

  return (
    <div className="card overflow-x-auto p-0">
      <table className="w-full min-w-[44rem] text-sm">
        <caption className="px-4 pt-4 text-left text-sm font-semibold text-navy-deep">
          Service level breakdown
          <span className="mt-0.5 block text-xs font-normal text-ink/55">
            From the service_level_summary view. A level with no runs still
            appears, so an unused service is visible rather than absent.
          </span>
        </caption>
        <thead>
          <tr className="border-b border-navy/10 text-left text-xs uppercase tracking-wide text-ink/50">
            <th scope="col" className="px-4 py-3 font-semibold">Service</th>
            <th scope="col" className="px-4 py-3 text-right font-semibold">Runs</th>
            <th scope="col" className="px-4 py-3 text-right font-semibold">Delivered</th>
            <th scope="col" className="px-4 py-3 text-right font-semibold">Revenue</th>
            <th scope="col" className="px-4 py-3 text-right font-semibold">Avg per run</th>
            <th scope="col" className="px-4 py-3 text-right font-semibold">Miles</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr
              key={r.service_code}
              className="border-b border-navy/5 last:border-0 hover:bg-surface"
            >
              <td className="px-4 py-3">
                <span className="font-semibold text-navy-deep">{r.service_code}</span>
                <span className="block break-words text-xs text-ink/55">
                  {r.service_name}
                </span>
              </td>
              <td className="px-4 py-3 text-right tabular-nums text-ink/70">
                {r.run_count}
              </td>
              <td className="px-4 py-3 text-right tabular-nums text-ink/70">
                {r.delivered_count}
              </td>
              <td className="px-4 py-3 text-right tabular-nums font-semibold text-navy-deep">
                {formatMoney(r.revenue)}
              </td>
              <td className="px-4 py-3 text-right tabular-nums text-ink/70">
                {r.delivered_count === 0 ? "—" : formatMoney(r.avg_revenue_per_run)}
              </td>
              <td className="px-4 py-3 text-right tabular-nums text-ink/70">
                {formatMiles(r.miles)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
