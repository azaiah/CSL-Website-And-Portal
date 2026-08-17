/**
 * components/portal/source-links.tsx
 * ---------------------------------------------------------------------------
 * Renders the citations behind a finding.
 *
 * This exists because of one question: when Darren calls a laboratory manager
 * and is asked "how did you find us?", he needs a better answer than "our
 * system found you". Showing the actual page the engine read — the practice's
 * own laboratory services page, the eVA solicitation, the SAM.gov search —
 * turns a cold call into a specific, credible one.
 *
 * It is also the audit trail. An engine that produces findings nobody can check
 * is asking to be believed; one that cites every source can be verified in a
 * click, including when it is wrong.
 *
 * Records added before run 4 (2026-08-17) predate the citation rule. Rather
 * than hide that, the component says so plainly — an honest gap is worth more
 * than a silent one.
 * ---------------------------------------------------------------------------
 */

import { ExternalLink, BookOpen } from "lucide-react";
import type { SourceKind, SourceLink } from "@/lib/data/opportunities";
import { formatDate, cn } from "@/lib/utils";

/** Short human label per source kind, shown as a chip on each citation. */
const KIND_LABEL: Record<SourceKind, string> = {
  solicitation: "Solicitation",
  award: "Award",
  registry: "Registry",
  organization: "Their own site",
  regulation: "Regulation",
  directory: "Directory",
  news: "News",
  search: "Live search",
};

const KIND_STYLE: Record<SourceKind, string> = {
  solicitation: "bg-purple-100 text-purple-700",
  award: "bg-blue-100 text-blue-700",
  registry: "bg-navy/10 text-navy",
  organization: "bg-success/10 text-success",
  regulation: "bg-gold/15 text-[#8a6c1f]",
  directory: "bg-navy/10 text-navy/70",
  news: "bg-ink/10 text-ink/60",
  search: "bg-gold/15 text-[#8a6c1f]",
};

export function SourceLinks({
  sources,
  /** True when the record predates the citation rule. */
  predatesRule = false,
  className,
}: {
  sources?: SourceLink[];
  predatesRule?: boolean;
  className?: string;
}) {
  const has = Boolean(sources && sources.length > 0);

  return (
    <section className={className}>
      <h3 className="flex items-center gap-2 text-sm font-semibold text-navy-deep">
        <BookOpen className="h-4 w-4 text-gold" aria-hidden />
        Where this came from
        {has && (
          <span className="rounded-full bg-navy/10 px-1.5 text-xs font-bold text-navy">
            {sources!.length}
          </span>
        )}
      </h3>

      {!has ? (
        <p className="mt-2 rounded-xl border border-dashed border-navy/15 p-4 text-xs leading-relaxed text-ink/50">
          {predatesRule ? (
            <>
              This record was found before the engine began citing its sources
              (run&nbsp;4, 17&nbsp;August&nbsp;2026). The finding itself was
              verified at the time — but the specific URLs were not recorded, so
              they are not shown here rather than being reconstructed after the
              fact. Every record from run&nbsp;4 onward carries its citations.
            </>
          ) : (
            <>No sources have been recorded for this record.</>
          )}
        </p>
      ) : (
        <>
          <p className="mt-1 text-xs text-ink/50">
            The pages the engine actually opened. Use these when someone asks
            how CSL found them.
          </p>
          <ul className="mt-3 space-y-2.5">
            {sources!.map((s) => (
              <li
                key={`${s.url}-${s.label}`}
                className="rounded-xl border border-navy/10 bg-white p-3"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={cn(
                      "inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
                      KIND_STYLE[s.kind]
                    )}
                  >
                    {KIND_LABEL[s.kind]}
                  </span>
                  <span className="text-[10px] text-ink/40">
                    opened {formatDate(s.retrievedISO)}
                  </span>
                </div>

                <a
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1.5 inline-flex items-start gap-1.5 break-words text-sm font-semibold text-navy-deep hover:text-gold hover:underline"
                >
                  <span className="break-all">{s.label}</span>
                  <ExternalLink
                    className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold"
                    aria-hidden
                  />
                </a>

                {s.note && (
                  <p className="mt-1.5 break-words text-xs leading-relaxed text-ink/65">
                    {s.note}
                  </p>
                )}

                {/* The bare URL, shown so it can be read aloud or pasted into
                    an email without opening it first. */}
                <p className="mt-1.5 break-all font-mono text-[10px] text-ink/35">
                  {s.url}
                </p>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
