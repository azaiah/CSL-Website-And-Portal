/**
 * components/portal/printable-document.tsx
 * ---------------------------------------------------------------------------
 * Renders engine-written content as a printable page.
 *
 * The portal has no AI inside it, so a "Download PDF" button cannot invent a
 * document. But the content does not need to live inside a binary either — the
 * engine already wrote it as structured data. Rendering that data to a print
 * stylesheet and letting the browser's "Save as PDF" do the rest costs zero
 * kilobytes, adds no dependency, and can never go stale against the data it
 * came from.
 *
 * Deliberately NOT a client component: these pages prerender at build time and
 * nothing here needs state. The print button and the ?auto=1 handler are the
 * only interactive parts, and they live in print-controls.tsx.
 * ---------------------------------------------------------------------------
 */

import type {
  GeneratedDocument,
  DocBlock,
  DocSection,
} from "@/lib/data/generated-docs";
import {
  OUTREACH_STATUS_LABEL,
  type OutreachRecord,
} from "@/lib/data/outreach";
import { company } from "@/lib/company-brain";
import { formatDate } from "@/lib/utils";

/* ────────────────────────────── Shared chrome ───────────────────────────── */

/**
 * Header and footer are shared so a printed call script and a printed bid
 * packet are recognisably the same company's paperwork.
 */
function PrintHeader({
  title,
  subtitle,
  generatedISO,
}: {
  title: string;
  subtitle?: string;
  generatedISO: string;
}) {
  return (
    <header className="print-header border-b-2 border-navy pb-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">
            {company.name}
          </p>
          <h1 className="mt-1 break-words text-xl font-bold leading-snug text-navy-deep">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-1 break-words text-sm text-ink/70">{subtitle}</p>
          )}
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element -- next/image
            injects lazy-loading and srcset that browsers skip when printing;
            a plain img is what actually appears on paper. */}
        <img
          src="/logo.png"
          alt={company.name}
          width={64}
          height={64}
          className="h-16 w-16 shrink-0 object-contain"
        />
      </div>
      <p className="mt-3 text-xs text-ink/55">
        Generated {generatedISO} by the DataIsData engine for {company.name}
      </p>
    </header>
  );
}

function PrintFooter() {
  return (
    <footer className="print-footer mt-8 border-t border-navy/20 pt-4 text-xs text-ink/60">
      <p className="font-semibold text-navy-deep">{company.domain}</p>
      <p className="mt-0.5 break-words">
        {company.contact.name} — {company.contact.title} ·{" "}
        {company.contact.phone} · {company.contact.email}
      </p>
    </footer>
  );
}

/** Page shell: constrains width on screen, full bleed on paper. */
function PrintPage({ children }: { children: React.ReactNode }) {
  return (
    <article className="print-page mx-auto max-w-3xl bg-white p-8 text-ink sm:p-10">
      {children}
    </article>
  );
}

/* ──────────────────────────── Generated document ────────────────────────── */

const calloutTone: Record<
  Extract<DocBlock, { kind: "callout" }>["tone"],
  string
> = {
  info: "border-navy/40 bg-navy/5",
  warning: "border-gold bg-gold/10",
  critical: "border-red-400 bg-red-50",
};

const calloutTitleTone: Record<
  Extract<DocBlock, { kind: "callout" }>["tone"],
  string
> = {
  info: "text-navy-deep",
  warning: "text-[#8a6c1f]",
  critical: "text-red-700",
};

function Block({ block }: { block: DocBlock }) {
  switch (block.kind) {
    case "paragraph":
      return (
        <p className="mt-2 break-words text-sm leading-relaxed text-ink/85">
          {block.text}
        </p>
      );

    case "bullets":
      return (
        <ul className="mt-2 space-y-1.5">
          {block.items.map((item) => (
            <li
              key={item}
              className="flex gap-2 break-words text-sm leading-relaxed text-ink/85"
            >
              <span aria-hidden className="text-gold">
                •
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      );

    case "numbered":
      return (
        <ol className="mt-2 space-y-1.5">
          {block.items.map((item, i) => (
            <li
              key={item}
              className="flex gap-2 break-words text-sm leading-relaxed text-ink/85"
            >
              <span className="font-semibold text-navy">{i + 1}.</span>
              <span>{item}</span>
            </li>
          ))}
        </ol>
      );

    case "checklist":
      // An open square glyph rather than a styled div, so the box survives
      // printing and can actually be ticked with a pen.
      return (
        <ul className="mt-2 space-y-1.5">
          {block.items.map((item) => (
            <li
              key={item}
              className="flex gap-2 break-words text-sm leading-relaxed text-ink/85"
            >
              <span aria-hidden className="font-mono text-base leading-tight text-navy">
                &#9744;
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      );

    case "fields":
      return (
        <dl className="mt-2 divide-y divide-navy/10 border-y border-navy/10">
          {block.fields.map((f) => (
            <div
              key={f.label}
              className={
                // A blank only Darren can fill is highlighted in gold and shows
                // its placeholder verbatim, so what is missing is obvious on
                // paper without cross-referencing anything.
                f.needsInput
                  ? "grid gap-1 bg-gold/10 px-2 py-2 sm:grid-cols-[minmax(0,14rem)_1fr] sm:gap-4"
                  : "grid gap-1 px-2 py-2 sm:grid-cols-[minmax(0,14rem)_1fr] sm:gap-4"
              }
            >
              <dt className="break-words text-xs font-semibold uppercase tracking-wide text-ink/60">
                {f.label}
              </dt>
              <dd
                className={
                  f.needsInput
                    ? "break-words text-sm font-semibold text-[#8a6c1f]"
                    : "break-words text-sm text-ink/85"
                }
              >
                {f.value}
              </dd>
            </div>
          ))}
        </dl>
      );

    case "callout":
      return (
        <div
          className={`print-callout mt-3 rounded-lg border-l-4 p-3 ${calloutTone[block.tone]}`}
        >
          <p
            className={`break-words text-sm font-bold ${calloutTitleTone[block.tone]}`}
          >
            {block.title}
          </p>
          <p className="mt-1 break-words text-sm leading-relaxed text-ink/85">
            {block.text}
          </p>
        </div>
      );
  }
}

function Section({ section }: { section: DocSection }) {
  return (
    <section className="print-section mt-6">
      <h2 className="break-words border-b border-navy/15 pb-1 text-base font-bold text-navy-deep">
        {section.heading}
      </h2>
      {section.blocks.map((block, i) => (
        <Block key={`${section.heading}-${i}`} block={block} />
      ))}
    </section>
  );
}

export function PrintableDocument({
  document,
}: {
  document: GeneratedDocument;
}) {
  const d = document;

  return (
    <PrintPage>
      <PrintHeader
        title={d.title}
        subtitle={d.subtitle}
        generatedISO={d.generatedISO}
      />

      <section className="print-section mt-5">
        <p className="break-words text-sm leading-relaxed text-ink/85">
          {d.summary}
        </p>
      </section>

      {d.nextSteps.length > 0 && (
        <section className="print-section mt-5 rounded-lg border border-gold/40 bg-gold/5 p-4">
          <h2 className="text-sm font-bold uppercase tracking-wide text-[#8a6c1f]">
            What to do next
          </h2>
          <ol className="mt-2 space-y-1.5">
            {d.nextSteps.map((s, i) => (
              <li
                key={s}
                className="flex gap-2 break-words text-sm leading-relaxed text-ink/85"
              >
                <span className="font-semibold text-navy">{i + 1}.</span>
                <span>{s}</span>
              </li>
            ))}
          </ol>
        </section>
      )}

      {d.sections.map((section) => (
        <Section key={section.heading} section={section} />
      ))}

      <PrintFooter />
    </PrintPage>
  );
}

/* ───────────────────────────── Outreach record ──────────────────────────── */

export function PrintableOutreach({ record }: { record: OutreachRecord }) {
  const r = record;
  const hasContact =
    r.contactName || r.contactRole || r.contactPhone || r.contactEmail;

  return (
    <PrintPage>
      <PrintHeader
        title={r.subject}
        subtitle={`${r.channel === "call" ? "Call script" : `Outreach — ${r.channel}`} · ${r.id}`}
        generatedISO={r.draftedISO}
      />

      <section className="print-section mt-5">
        <dl className="grid gap-2 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-ink/55">
              Channel
            </dt>
            <dd className="mt-0.5 text-sm font-medium capitalize text-navy-deep">
              {r.channel}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-ink/55">
              Status
            </dt>
            <dd className="mt-0.5 break-words text-sm font-medium text-navy-deep">
              {OUTREACH_STATUS_LABEL[r.status]}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-ink/55">
              Drafted
            </dt>
            <dd className="mt-0.5 text-sm font-medium text-navy-deep">
              {formatDate(r.draftedISO)}
            </dd>
          </div>
          {r.sentISO && (
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-ink/55">
                Sent
              </dt>
              <dd className="mt-0.5 text-sm font-medium text-navy-deep">
                {formatDate(r.sentISO)}
              </dd>
            </div>
          )}
        </dl>
      </section>

      {hasContact && (
        <section className="print-section mt-5 rounded-lg border border-navy/15 bg-navy/5 p-4">
          <h2 className="text-sm font-bold uppercase tracking-wide text-navy-deep">
            Contact
          </h2>
          <div className="mt-2 space-y-1 text-sm text-ink/85">
            {r.contactName && (
              <p className="break-words font-semibold">{r.contactName}</p>
            )}
            {r.contactRole && <p className="break-words">{r.contactRole}</p>}
            {r.contactPhone && <p className="break-words">{r.contactPhone}</p>}
            {r.contactEmail && <p className="break-words">{r.contactEmail}</p>}
          </div>
        </section>
      )}

      <section className="print-section mt-5">
        <h2 className="break-words border-b border-navy/15 pb-1 text-base font-bold text-navy-deep">
          {r.channel === "call" ? "Script" : "Subject"}
        </h2>
        {r.channel !== "call" && (
          <p className="mt-2 break-words text-sm font-semibold text-navy-deep">
            {r.subject}
          </p>
        )}
        {/* whitespace-pre-wrap so the draft's own line breaks and indentation
            survive — a call script read off a page depends on them. */}
        <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-relaxed text-ink/85">
          {r.body}
        </p>
      </section>

      {/* Internal commentary is marked .no-print so it can be read on screen
          but never lands on a page that might be handed to a client. */}
      {r.notes && (
        <section className="no-print mt-6 rounded-lg border border-dashed border-red-300 bg-red-50 p-4">
          <h2 className="text-sm font-bold uppercase tracking-wide text-red-700">
            Notes — internal, do not send
          </h2>
          <p className="mt-1.5 break-words text-sm leading-relaxed text-ink/80">
            {r.notes}
          </p>
        </section>
      )}

      <PrintFooter />
    </PrintPage>
  );
}
