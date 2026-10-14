/**
 * components/portal/sweep-log.tsx
 * ---------------------------------------------------------------------------
 * The run log: every sweep the engine has carried out, newest first, with the
 * date and time it ran and how many records it added to each board.
 *
 * It exists so that "when was this found?" always has a dated answer on the
 * page itself. Runs before 10/14 recorded a date only and are shown that way;
 * no time is invented for them.
 * ---------------------------------------------------------------------------
 */

import { History } from "lucide-react";
import {
  SWEEPS,
  formatSweepStamp,
  opportunities,
} from "@/lib/data/opportunities";
import { VET_SWEEPS, vetLeads } from "@/lib/data/vet-leads";
import { cn } from "@/lib/utils";

export function SweepLog({ className }: { className?: string }) {
  const latestIso = SWEEPS[SWEEPS.length - 1].iso;
  const rows = [...SWEEPS].reverse().map((s) => {
    const vet = VET_SWEEPS.find((v) => v.iso === s.iso);
    return {
      key: s.iso,
      label: s.label,
      stamp: formatSweepStamp(s),
      timed: Boolean(s.startedAt),
      opps: opportunities.filter((o) => o.addedISO === s.iso).length,
      vets: vet ? vetLeads.filter((l) => l.addedISO === vet.iso).length : null,
      latest: s.iso === latestIso,
    };
  });

  return (
    <section className={cn("card", className)} aria-labelledby="sweep-log-title">
      <h2
        id="sweep-log-title"
        className="flex items-center gap-2 text-base font-semibold text-navy-deep"
      >
        <History className="h-4 w-4 text-gold" aria-hidden />
        Sweep log
      </h2>
      <p className="mt-1 text-sm text-ink/60">
        Every run of the engine, with when it ran and what it added. Times are
        Eastern. Runs before 10/14 recorded a date only.
      </p>
      <div className="mt-3 min-w-0 overflow-x-auto">
        <table className="w-full min-w-[520px] text-left text-sm">
          <thead className="border-b border-navy/10 text-xs uppercase tracking-wide text-ink/55">
            <tr>
              <th className="py-2 pr-3 font-semibold">Sweep</th>
              <th className="py-2 pr-3 font-semibold">Ran</th>
              <th className="py-2 pr-3 text-right font-semibold">New opportunities</th>
              <th className="py-2 text-right font-semibold">New vet leads</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-navy/5">
            {rows.map((r) => (
              <tr key={r.key}>
                <td className="py-2 pr-3">
                  <span
                    className={cn(
                      "inline-flex rounded-full px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide",
                      r.latest ? "bg-gold text-navy-deep" : "bg-navy/10 text-navy/70"
                    )}
                  >
                    {r.latest ? `New · ${r.label}` : r.label}
                  </span>
                </td>
                <td className="break-words py-2 pr-3 text-ink/75">{r.stamp}</td>
                <td className="py-2 pr-3 text-right tabular-nums text-ink/75">{r.opps}</td>
                <td className="py-2 text-right tabular-nums text-ink/75">
                  {r.vets === null ? "—" : r.vets}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
