import {
  Bot,
  Brain,
  Search,
  Filter,
  PenLine,
  FileText,
  CalendarRange,
  ArrowRight,
  ArrowDownToLine,
  ArrowUpFromLine,
  Database,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import {
  PortalPageHeader,
  ComingOnlineBadge,
} from "@/components/portal/portal-ui";
import { agents, type Agent } from "@/lib/agents";
import { company, credentials, codes } from "@/lib/company-brain";

const agentIcons: Record<string, LucideIcon> = {
  "opportunity-finder": Search,
  "lead-qualifier": Filter,
  "outreach-writer": PenLine,
  "application-assistant": FileText,
  "weekly-briefing": CalendarRange,
};

/** Where each agent's live output lives in the portal. */
const agentOutputLink: Record<string, { href: string; label: string }> = {
  "opportunity-finder": { href: "/portal/opportunities", label: "View live opportunities" },
  "lead-qualifier": { href: "/portal/opportunities", label: "View scored opportunities" },
  "outreach-writer": { href: "/portal/documents", label: "View outreach drafts" },
  "application-assistant": { href: "/portal/documents", label: "View pre-filled applications" },
  "weekly-briefing": { href: "/portal/weekly-report", label: "View this week's briefing" },
};

export default function AiTeamPage() {
  return (
    <div className="space-y-8">
      <PortalPageHeader
        title="AI Team"
        subtitle="Five specialized agents actively finding, qualifying, and pursuing medical-delivery contracts for CSL. The engine is live — first sweep completed July 21, 2026, refreshed weekly. Every opportunity in this portal is a real finding."
        icon={Bot}
        action={<ComingOnlineBadge />}
      />

      {/* Company Brain — shared foundation */}
      <section className="grain relative overflow-hidden rounded-2xl border border-navy/10 bg-navy-deep p-7 text-white">
        <div className="bg-grid-dark mask-fade absolute inset-0 opacity-50" aria-hidden />
        <div
          className="pointer-events-none absolute inset-0 opacity-50"
          style={{
            background:
              "radial-gradient(45% 90% at 92% 10%, rgba(193,154,62,0.25), transparent 60%)",
          }}
          aria-hidden
        />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 text-gold-light">
              <Brain className="h-5 w-5" aria-hidden />
              <span className="text-xs font-semibold uppercase tracking-[0.16em]">
                Shared foundation
              </span>
            </div>
            <h2 className="mt-3 text-xl font-semibold text-white">
              The Company Brain powers every agent
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-white/75">
              Not an agent itself — the Company Brain is the secure, single source
              of truth about CSL: credentials, procurement codes, service area,
              insurance, and capability-statement content. Every agent reads from
              it, so outreach and applications are always accurate and consistent.
            </p>
            <Link
              href="/portal/company-brain"
              className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-gold hover:underline"
            >
              Open the Company Brain
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
          <div className="grid grid-cols-3 gap-2 sm:gap-4 lg:shrink-0">
            {[
              { label: "Credentials", value: credentials.length },
              { label: "Proc. codes", value: codes.length },
              { label: "Service radius", value: `${company.serviceArea.radiusMiles}mi` },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-xl border border-white/10 bg-white/5 px-2 py-3 text-center sm:px-4"
              >
                <p className="text-xl font-bold text-gold sm:text-2xl">{s.value}</p>
                <p className="mt-0.5 text-xs text-white/60">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Agent cards */}
      <div className="grid gap-6 lg:grid-cols-2">
        {agents.map((agent) => (
          <AgentCard
            key={agent.id}
            agent={agent}
            Icon={agentIcons[agent.id] ?? Bot}
          />
        ))}
      </div>
    </div>
  );
}

function AgentCard({ agent, Icon }: { agent: Agent; Icon: LucideIcon }) {
  const output = agentOutputLink[agent.id];
  return (
    <article className="card flex flex-col">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl icon-tile">
            <Icon className="h-6 w-6" aria-hidden />
          </span>
          <div>
            <h3 className="text-lg font-semibold text-navy-deep">{agent.name}</h3>
            <p className="mt-1 text-sm text-ink/60">{agent.purpose}</p>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <ComingOnlineBadge />
      </div>

      <p className="mt-4 text-sm leading-relaxed text-ink/75">
        {agent.phase1Description}
      </p>

      {agent.sources && (
        <div className="mt-5">
          <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-ink/50">
            <Database className="h-3.5 w-3.5" aria-hidden />
            Sources it will scan
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {agent.sources.map((s) => (
              <span key={s} className="badge-pill">
                {s}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="mt-5 grid gap-4 rounded-xl border border-navy/10 bg-surface p-4 sm:grid-cols-2">
        <div>
          <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-ink/50">
            <ArrowDownToLine className="h-3.5 w-3.5" aria-hidden />
            Inputs
          </p>
          <ul className="mt-2 space-y-1.5">
            {agent.inputs.map((i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-ink/75">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-navy" aria-hidden />
                {i}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-ink/50">
            <ArrowUpFromLine className="h-3.5 w-3.5" aria-hidden />
            Outputs
          </p>
          <ul className="mt-2 space-y-1.5">
            {agent.outputs.map((o) => (
              <li key={o} className="flex items-start gap-2 text-xs text-ink/75">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-gold" aria-hidden />
                {o}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {output && (
        <Link
          href={output.href}
          className="mt-4 inline-flex items-center gap-1.5 self-start rounded-lg bg-navy-deep px-3 py-2 text-xs font-semibold text-gold-light hover:bg-navy"
        >
          {output.label}
          <ArrowRight className="h-3.5 w-3.5" aria-hidden />
        </Link>
      )}
    </article>
  );
}
