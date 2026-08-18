"use client";

/**
 * components/portal/dashboard-stats.tsx
 * ---------------------------------------------------------------------------
 * The four headline numbers on the dashboard.
 *
 * These used to be computed from the engine's static data at build time, which
 * was fine while nothing in the portal could be changed. It stopped being fine
 * the moment statuses became editable: marking a deal Lost has to remove it
 * from "Open opportunities", and marking a draft Sent has to move the outreach
 * figure — otherwise the dashboard keeps confidently reporting a version of
 * events that nobody in the business recognises.
 *
 * So this is a client component reading the same shared provider every other
 * view reads. One source, one answer.
 * ---------------------------------------------------------------------------
 */

import { useMemo } from "react";
import { Target, CheckCircle2, PenLine, DollarSign } from "lucide-react";
import { StatCard } from "@/components/portal/portal-ui";
import { useStatuses } from "@/lib/status-context";
import { opportunityStats } from "@/lib/data/opportunities";
import { isClosedStage } from "@/lib/data/pipeline";
import { formatCurrency } from "@/lib/utils";

export function DashboardStats() {
  const { resolvedOpportunities, outreachCounts } = useStatuses();

  const stats = useMemo(() => {
    const open = resolvedOpportunities.filter(
      (o) => !isClosedStage(o.status)
    ).length;

    // Lost work is not pipeline. Won work still is — it is contracted value.
    const pipelineValue = resolvedOpportunities
      .filter((o) => o.status !== "Lost")
      .reduce((sum, o) => sum + o.estValue, 0);

    const won = resolvedOpportunities.filter((o) => o.status === "Won").length;

    return { open, pipelineValue, won };
  }, [resolvedOpportunities]);

  const outreachHint =
    outreachCounts.sent === 0
      ? outreachCounts.approved > 0
        ? `${outreachCounts.approved} approved, none sent yet`
        : "None sent yet — approval needed"
      : `${outreachCounts.sent} sent · ${outreachCounts.responses} replied`;

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        label="Open opportunities"
        value={String(stats.open)}
        icon={Target}
        hint={
          stats.won > 0
            ? `${opportunityStats.newThisRun} added this week · ${stats.won} won`
            : `${opportunityStats.newThisRun} added this week`
        }
      />
      <StatCard
        label="Qualified leads"
        value={String(opportunityStats.qualified)}
        icon={CheckCircle2}
        hint="Fit score 80+"
      />
      <StatCard
        label="Outreach drafted"
        value={String(outreachCounts.drafted)}
        icon={PenLine}
        hint={outreachHint}
      />
      <StatCard
        label="Pipeline value"
        value={formatCurrency(stats.pipelineValue)}
        icon={DollarSign}
        hint="Est. contract value"
      />
    </div>
  );
}

/**
 * The outreach funnel on the weekly report, override-aware for the same
 * reason. The briefing's narrative is a snapshot of the run; these three
 * numbers are live, because they are the ones people act on.
 */
export function OutreachSummary() {
  const { outreachCounts: c } = useStatuses();
  const responseRate = c.sent > 0 ? Math.round((c.responses / c.sent) * 100) : 0;

  return (
    <>
      <div className="grid grid-cols-3 gap-2 text-center sm:gap-3">
        <Metric value={c.drafted} label="Drafted" />
        <Metric value={c.sent} label="Sent" />
        <Metric value={`${responseRate}%`} label="Response rate" />
      </div>
      <p className="mt-4 text-xs text-ink/50">
        {c.responses} response{c.responses === 1 ? "" : "s"} from {c.sent} sent.
        {c.awaitingApproval > 0 && (
          <>
            {" "}
            <strong className="font-semibold text-[#8a6c1f]">
              {c.awaitingApproval} still awaiting approval.
            </strong>
          </>
        )}
        {c.approved > 0 && ` ${c.approved} approved and ready to send.`}
      </p>
    </>
  );
}

function Metric({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="rounded-xl border border-navy/10 bg-surface px-1 py-3">
      <p className="text-xl font-bold text-navy-deep sm:text-2xl">{value}</p>
      <p className="text-xs text-ink/50">{label}</p>
    </div>
  );
}
