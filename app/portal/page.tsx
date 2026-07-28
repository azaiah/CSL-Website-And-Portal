import Link from "next/link";
import {
  Target,
  CheckCircle2,
  PenLine,
  DollarSign,
  ArrowRight,
  Bot,
} from "lucide-react";
import {
  StatCard,
  Phase1Banner,
  ComingOnlineBadge,
} from "@/components/portal/portal-ui";
import { opportunityStats } from "@/lib/data/opportunities";
import { weeklyReport } from "@/lib/data/weekly-report";
import { agents } from "@/lib/agents";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <p className="eyebrow">Overview</p>
        <h1 className="mt-1 text-2xl font-semibold text-navy-deep">
          Welcome to your lead-gen engine
        </h1>
        <p className="mt-1 text-sm text-ink/60">
          A live snapshot of opportunities and pipeline from the engine&apos;s
          latest weekly sweep.
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Open opportunities"
          value={String(opportunityStats.open)}
          icon={Target}
          hint={`${opportunityStats.newThisRun} added this week`}
        />
        <StatCard
          label="Qualified leads"
          value={String(opportunityStats.qualified)}
          icon={CheckCircle2}
          hint="Fit score 80+"
        />
        <StatCard
          label="Outreach drafted"
          value={String(weeklyReport.outreach.drafted)}
          icon={PenLine}
          hint={
            weeklyReport.outreach.sent === 0
              ? "None sent yet — approval needed"
              : `${weeklyReport.outreach.sent} sent`
          }
        />
        <StatCard
          label="Pipeline value"
          value={formatCurrency(opportunityStats.pipelineValue)}
          icon={DollarSign}
          hint="Est. contract value"
        />
      </div>

      <Phase1Banner />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Weekly highlights */}
        <div className="card lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-navy-deep">
              Latest weekly highlights
            </h2>
            <Link
              href="/portal/weekly-report"
              className="inline-flex items-center gap-1 text-sm font-semibold text-gold hover:underline"
            >
              Full report
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
          <p className="mt-1 text-xs text-ink/50">
            Week of {formatDate(weeklyReport.weekOf)}
          </p>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {weeklyReport.metrics.map((m) => (
              <div
                key={m.label}
                className="rounded-xl border border-navy/10 bg-surface p-4"
              >
                <p className="text-sm text-ink/60">{m.label}</p>
                <p className="mt-1 text-2xl font-bold text-navy-deep">{m.value}</p>
                {m.delta && (
                  <p className="mt-0.5 text-xs font-medium text-success">
                    {m.delta}
                  </p>
                )}
              </div>
            ))}
          </div>

          <div className="mt-6">
            <h3 className="text-sm font-semibold text-navy-deep">
              Top leads this week
            </h3>
            <ul className="mt-3 space-y-2">
              {weeklyReport.topLeads.map((lead) => (
                <li
                  key={lead.title}
                  className="flex items-center justify-between gap-4 rounded-lg border border-navy/5 px-3 py-2"
                >
                  {/* Wrap the lead title instead of cutting it off with an
                      ellipsis, so the whole name is readable on a phone. */}
                  <span className="min-w-0 break-words text-sm text-ink/80">
                    {lead.title}
                  </span>
                  <span className="shrink-0 rounded-full bg-navy-deep px-2 py-0.5 text-xs font-semibold text-gold">
                    {lead.fitScore}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* AI team snapshot */}
        <div className="card">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-gold" aria-hidden />
            <h2 className="text-lg font-semibold text-navy-deep">AI Team</h2>
          </div>
          <p className="mt-1 text-xs text-ink/50">
            Five agents, live and running weekly.
          </p>
          <ul className="mt-4 space-y-3">
            {agents.map((a) => (
              <li key={a.id} className="rounded-xl border border-navy/10 p-3">
                <p className="text-sm font-semibold text-navy-deep">{a.name}</p>
                {/* Show each agent's full purpose. It used to be clamped to two
                    lines, which hid the end of the sentence on narrow screens. */}
                <p className="mt-0.5 text-xs text-ink/60">{a.purpose}</p>
              </li>
            ))}
          </ul>
          <div className="mt-4">
            <ComingOnlineBadge />
          </div>
          <Link
            href="/portal/ai-team"
            className="btn-navy mt-5 w-full text-sm"
          >
            Meet the AI Team
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      </div>
    </div>
  );
}
