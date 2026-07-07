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
import { credentials, codes } from "@/lib/company-brain";

const agentIcons: Record<string, LucideIcon> = {
  "opportunity-finder": Search,
  "lead-qualifier": Filter,
  "outreach-writer": PenLine,
  "application-assistant": FileText,
  "weekly-briefing": CalendarRange,
};

export default function AiTeamPage() {
  return (
    <div className="space-y-8">
      <PortalPageHeader
        title="AI Team"
        subtitle="Five specialized agents that will find, qualify, and pursue medical-delivery contracts for CSL. Each is described below and previewed with sample data — live AI activates in the next phase."
        icon={Bot}
        action={<ComingOnlineBadge />}
      />

      {/* Company Brain — shared foundation */}
      <section className="relative overflow-hidden rounded-2xl border border-navy/10 bg-navy-deep p-7 text-white">
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
          <div className="grid shrink-0 grid-cols-3 gap-3 sm:gap-4">
            {[
              { label: "Credentials", value: credentials.length },
              { label: "Proc. codes", value: codes.length },
              { label: "Service radius", value: "25mi" },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-center"
              >
                <p className="text-2xl font-bold text-gold">{s.value}</p>
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
  return (
    <article className="card flex flex-col">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-navy-deep text-gold">
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
    </article>
  );
}
