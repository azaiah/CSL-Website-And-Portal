import {
  FileBarChart,
  TrendingUp,
  Send,
  CalendarClock,
  ArrowRightCircle,
  Sparkles,
  AlertTriangle,
} from "lucide-react";
import { PortalPageHeader, SampleDataRibbon } from "@/components/portal/portal-ui";
import { OpportunityButton } from "@/components/portal/opportunity-trigger";
import { weeklyReport } from "@/lib/data/weekly-report";
import { formatDate } from "@/lib/utils";

export default function WeeklyReportPage() {
  const r = weeklyReport;
  const responseRate =
    r.outreach.sent > 0
      ? Math.round((r.outreach.responses / r.outreach.sent) * 100)
      : 0;

  return (
    <div className="space-y-6">
      <PortalPageHeader
        title="Weekly Report"
        subtitle={`Compiled by the Weekly Briefing agent. Live briefing for the week of ${formatDate(r.weekOf)}.`}
        icon={FileBarChart}
      />
      <SampleDataRibbon />

      {/* Summary */}
      <div className="card">
        <p className="text-sm leading-relaxed text-ink/75">{r.summary}</p>
      </div>

      {/* Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {r.metrics.map((m) => (
          <div key={m.label} className="card">
            <p className="text-sm text-ink/60">{m.label}</p>
            <p className="mt-1 text-3xl font-bold text-navy-deep">{m.value}</p>
            {m.delta && (
              <p className="mt-0.5 flex items-center gap-1 text-xs font-medium text-success">
                <TrendingUp className="h-3.5 w-3.5" aria-hidden />
                {m.delta}
              </p>
            )}
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* New opportunities */}
        <Card title="New opportunities found" icon={Sparkles}>
          <ul className="divide-y divide-navy/5">
            {r.newOpportunities.map((o) => (
              <li key={o.title} className="flex items-center justify-between gap-3 py-2.5">
                <div className="min-w-0">
                  {/* Wrap long opportunity names so they stay fully readable. */}
                  <OpportunityButton opportunityId={o.opportunityId}>
                    <span className="break-words text-sm font-medium text-navy-deep">
                      {o.title}
                    </span>
                  </OpportunityButton>
                  <p className="text-xs text-ink/50">{o.source}</p>
                </div>
                <span className="shrink-0 rounded-full bg-navy-deep px-2 py-0.5 text-xs font-semibold text-gold">
                  {o.fitScore}
                </span>
              </li>
            ))}
          </ul>
        </Card>

        {/* Top leads */}
        <Card title="Top-scored leads" icon={TrendingUp}>
          <ul className="space-y-3">
            {r.topLeads.map((l) => (
              <li key={l.title} className="rounded-xl border border-navy/10 p-3">
                <div className="flex items-start justify-between gap-3">
                  <OpportunityButton opportunityId={l.opportunityId}>
                    <span className="break-words text-sm font-medium text-navy-deep">
                      {l.title}
                    </span>
                  </OpportunityButton>
                  <span className="shrink-0 rounded-full bg-success/10 px-2 py-0.5 text-xs font-semibold text-success">
                    {l.fitScore}
                  </span>
                </div>
                <p className="mt-1 text-xs text-ink/60">{l.note}</p>
              </li>
            ))}
          </ul>
        </Card>

        {/* Outreach */}
        <Card title="Outreach & response rates" icon={Send}>
          <div className="grid grid-cols-3 gap-2 text-center sm:gap-3">
            <Metric value={r.outreach.drafted} label="Drafted" />
            <Metric value={r.outreach.sent} label="Sent" />
            <Metric value={`${responseRate}%`} label="Response rate" />
          </div>
          <p className="mt-4 text-xs text-ink/50">
            {r.outreach.responses} response
            {r.outreach.responses === 1 ? "" : "s"} from {r.outreach.sent} sent.
            All outreach is drafted for human approval before sending.
          </p>
        </Card>

        {/* Deadlines */}
        <Card title="Upcoming deadlines" icon={CalendarClock}>
          <ul className="divide-y divide-navy/5">
            {r.deadlines.map((d) => (
              <li key={d.title} className="flex items-center justify-between gap-3 py-2.5">
                {/* Wrap the deadline name so the whole task is visible. */}
                <span className="min-w-0 break-words text-sm text-ink/80">
                  {d.title}
                </span>
                <span className="shrink-0 text-xs font-semibold text-navy">
                  {formatDate(d.dueDate)}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {/* Corrections — what this run changed about last run's findings. Shown
          because a research engine that silently overwrites its own mistakes is
          not trustworthy; the client should see what moved and why. */}
      {r.corrections && r.corrections.length > 0 && (
        <Card title="Corrections to last week's findings" icon={AlertTriangle}>
          <ul className="space-y-3">
            {r.corrections.map((c) => (
              <li
                key={c.item}
                className="rounded-xl border border-gold/30 bg-gold/5 p-3"
              >
                <p className="text-sm font-semibold text-[#8a6c1f]">{c.item}</p>
                <p className="mt-1 text-xs leading-relaxed text-ink/70">
                  {c.detail}
                </p>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Recommended moves */}
      <Card title="Recommended next moves" icon={ArrowRightCircle}>
        <ol className="space-y-2.5">
          {r.recommendedMoves.map((m, i) => (
            <li key={m} className="flex items-start gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gold text-xs font-bold text-navy-deep">
                {i + 1}
              </span>
              <span className="text-sm text-ink/75">{m}</span>
            </li>
          ))}
        </ol>
      </Card>
    </div>
  );
}

function Card({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: typeof Send;
  children: React.ReactNode;
}) {
  return (
    <section className="card">
      <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-navy-deep">
        <Icon className="h-5 w-5 text-gold" aria-hidden />
        {title}
      </h2>
      {children}
    </section>
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
