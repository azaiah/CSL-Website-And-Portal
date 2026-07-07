import type { ReactNode } from "react";
import { Radio, FlaskConical, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { AGENT_STATUS_LABEL } from "@/lib/agents";

/** "Coming online — Phase 1 build" status badge for agents. */
export function ComingOnlineBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-gold/40 bg-gold/10 px-3 py-1 text-xs font-semibold text-[#8a6c1f]",
        className
      )}
    >
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-gold" />
      </span>
      {AGENT_STATUS_LABEL}
    </span>
  );
}

/** "Sample data — engine activating" ribbon shown atop mock-data pages. */
export function SampleDataRibbon({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-xl border border-gold/40 bg-gold/10 px-4 py-2.5 text-sm text-[#8a6c1f]",
        className
      )}
    >
      <FlaskConical className="h-4 w-4 shrink-0" aria-hidden />
      <span>
        <strong className="font-semibold">Sample data — engine activating.</strong>{" "}
        These are illustrative mock records. Live results appear once the Phase 1
        agents come online.
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
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-navy-deep text-gold">
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
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  hint?: string;
}) {
  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-ink/60">{label}</span>
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gold/15 text-gold">
          <Icon className="h-5 w-5" aria-hidden />
        </span>
      </div>
      <p className="mt-3 text-3xl font-bold text-navy-deep">{value}</p>
      {hint && <p className="mt-1 text-xs text-ink/50">{hint}</p>}
    </div>
  );
}

/** Phase 1 status banner shown on the dashboard. */
export function Phase1Banner() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-navy/10 bg-navy-deep p-6 text-white">
      <div
        className="pointer-events-none absolute inset-0 opacity-50"
        style={{
          background:
            "radial-gradient(50% 90% at 90% 0%, rgba(193,154,62,0.25), transparent 60%)",
        }}
        aria-hidden
      />
      <div className="relative flex items-start gap-4">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gold/15 text-gold">
          <Radio className="h-6 w-6" aria-hidden />
        </span>
        <div>
          <h2 className="text-lg font-semibold text-white">
            Phase 1: the engine is being activated
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-white/75">
            Your lead-generation engine is fully built and previewed with sample
            data. The five AI agents are described and ready — live scanning,
            scoring, and outreach switch on in the next phase without changing this
            interface.
          </p>
        </div>
      </div>
    </div>
  );
}
