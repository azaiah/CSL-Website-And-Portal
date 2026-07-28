import type { ReactNode } from "react";
import { Radio, Satellite, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { AGENT_STATUS_LABEL } from "@/lib/agents";
import { ENGINE_META } from "@/lib/data/engine-meta";

/** "Live — engine running" status badge for agents. */
export function ComingOnlineBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-success/40 bg-success/10 px-3 py-1 text-xs font-semibold text-success",
        className
      )}
    >
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
      </span>
      {AGENT_STATUS_LABEL}
    </span>
  );
}

/** "Live data" ribbon shown atop engine-data pages. */
export function SampleDataRibbon({ className }: { className?: string }) {
  const lastRun = new Date(ENGINE_META.lastRunISO + "T12:00:00").toLocaleDateString(
    "en-US",
    { month: "long", day: "numeric", year: "numeric" }
  );
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-xl border border-success/40 bg-success/10 px-4 py-2.5 text-sm text-success",
        className
      )}
    >
      <Satellite className="h-4 w-4 shrink-0" aria-hidden />
      <span>
        <strong className="font-semibold">Live data.</strong>{" "}
        Real opportunities found and scored by the AI engine — last sweep {lastRun}.{" "}
        {ENGINE_META.cadence}.
      </span>
    </div>
  );
}

/** Page title + subtitle used at the top of each portal page. */
export function PortalPageHeader({
  title,
  subtitle,
  icon: Icon,
  action,
}: {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 border-b border-navy/10 pb-6 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex items-start gap-4">
        {Icon && (
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl icon-tile">
            <Icon className="h-6 w-6" aria-hidden />
          </span>
        )}
        <div>
          <h1 className="text-2xl font-semibold text-navy-deep">{title}</h1>
          {subtitle && (
            <p className="mt-1 max-w-2xl text-sm text-ink/60">{subtitle}</p>
          )}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

/** Summary stat card for the dashboard. */
export function StatCard({
  label,
  value,
  icon: Icon,
  hint,
  valueStyle,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  hint?: string;
  /** Optional inline colour for the value, e.g. profit vs loss. Colour must
      never be the only signal — pair it with a sign or an icon. */
  valueStyle?: React.CSSProperties;
}) {
  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-ink/60">{label}</span>
        <span className="icon-tile-gold h-9 w-9 rounded-lg">
          <Icon className="h-5 w-5" aria-hidden />
        </span>
      </div>
      <p className="mt-3 text-3xl font-bold tabular-nums text-navy-deep" style={valueStyle}>
        {value}
      </p>
      {hint && <p className="mt-1 text-xs text-ink/50">{hint}</p>}
    </div>
  );
}

/** Engine status banner shown on the dashboard. */
export function Phase1Banner() {
  return (
    <div className="grain relative overflow-hidden rounded-2xl border border-navy/10 bg-navy-deep p-6 text-white">
      <div className="bg-grid-dark mask-fade absolute inset-0 opacity-50" aria-hidden />
      <div
        className="pointer-events-none absolute inset-0 opacity-50"
        style={{
          background:
            "radial-gradient(50% 90% at 90% 0%, rgba(193,154,62,0.25), transparent 60%)",
        }}
        aria-hidden
      />
      <div className="relative flex items-start gap-4">
        <span className="icon-tile-gold h-11 w-11 shrink-0">
          <Radio className="h-6 w-6" aria-hidden />
        </span>
        <div>
          <h2 className="text-lg font-semibold text-white">
            The engine is live
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-white/75">
            All five AI agents are running. The latest sweep covered SAM.gov and
            federal VA contracting, Virginia eVA and state-local procurement, the
            Medicaid NEMT broker network, and 30+ Richmond-area health systems,
            labs, and pharmacies — every opportunity in this portal is a real,
            verified finding. Outreach is drafted for approval before anything is
            sent.
          </p>
        </div>
      </div>
    </div>
  );
}
