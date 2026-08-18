"use client";

/**
 * components/portal/opportunity-detail.tsx
 * ---------------------------------------------------------------------------
 * THE opportunity detail view. One component, rendered in three places: the
 * modal opened from the table, the modal opened from the pipeline board, and
 * the standalone /portal/opportunities/[id] page.
 *
 * It is deliberately presentational — no modal chrome, no positioning, no
 * close button — because the moment this owned its own overlay it could only
 * live in one of those places. The wrapper supplies the chrome; this supplies
 * the content.
 *
 * Everything shown here is joined from the existing sources of truth:
 * sweepFor() for the W1/W2 chip, healthFor() for the deadline vocabulary,
 * documentsForOpportunity() and outreachForOpportunity() for the linked
 * records. Nothing about state or dates is recomputed locally.
 * ---------------------------------------------------------------------------
 */

import { useEffect, useRef, useState } from "react";
import {
  MapPin,
  Calendar,
  Building2,
  Lightbulb,
  AlertCircle,
  ArrowUpDown,
  FileText,
  Download,
  Eye,
  ArrowLeft,
  Send,
  Copy,
  Check,
  Link2,
  Hash,
  Layers,
  Phone,
  Mail,
  User,
  FileWarning,
  FileSpreadsheet,
} from "lucide-react";
import {
  sweepFor,
  LATEST_RUN_ISO,
  predatesSourceCitations,
  type Opportunity,
} from "@/lib/data/opportunities";
import {
  documentsForOpportunity,
  type PortalDocument,
} from "@/lib/data/documents";
import {
  outreachForOpportunity,
  type OutreachRecord,
  type OutreachStatus,
} from "@/lib/data/outreach";
import {
  generatedDocsForOpportunity,
  type GeneratedDocument,
} from "@/lib/data/generated-docs";
import { PrintableDocument } from "@/components/portal/printable-document";
import { SourceLinks } from "@/components/portal/source-links";
import { NotesThread } from "@/components/portal/notes-thread";
import { StatusControl } from "@/components/portal/status-control";
import { useStatuses } from "@/lib/status-context";
import {
  OPPORTUNITY_STATUS_OPTIONS,
  opportunityStatusStyle,
  DOCUMENT_STATUS_OPTIONS,
  documentStatusStyle,
  OUTREACH_STATUS_OPTIONS,
  outreachStatusStyle,
} from "@/lib/status-options";
import { healthFor, todayISO } from "@/lib/health";
import { formatCurrency, formatDate, cn } from "@/lib/utils";

/**
 * Re-exported for the opportunities table, which has imported it from here
 * since before the status vocabulary was centralised. The values now live in
 * lib/status-options so the editable dropdowns and the read-only chips cannot
 * drift apart.
 */
export { OPPORTUNITY_STATUS_STYLE } from "@/lib/status-options";

export function fitColor(score: number) {
  if (score >= 85) return "bg-success text-white";
  if (score >= 70) return "bg-gold text-navy-deep";
  return "bg-navy/15 text-navy";
}

/** Canonical deep link for an opportunity. */
export function opportunityHref(id: string) {
  return `/portal/opportunities/${id}`;
}

/**
 * Print routes for engine-written content. `auto=1` opens the tab straight
 * into the browser's print dialog, which is where "Save as PDF" lives — that
 * is the whole PDF pipeline, and it needs no dependency.
 */
export function printDocHref(id: string) {
  return `/portal/print/doc/${id}?auto=1`;
}

export function printOutreachHref(id: string) {
  return `/portal/print/outreach/${id}?auto=1`;
}

/** Only PDFs render in a frame; anything else gets an honest fallback. */
function isPreviewable(file: string) {
  return file.toLowerCase().endsWith(".pdf");
}

export function OpportunityDetail({ opportunity }: { opportunity: Opportunity }) {
  const o = opportunity;

  // Client-only date. These pages are statically generated, so a build-time
  // "today" would freeze and every deadline chip would slowly become a lie.
  const [today, setToday] = useState<string | null>(null);
  useEffect(() => setToday(todayISO()), []);

  // Which document is open in the inline viewer. Non-null replaces the detail
  // body so a PDF can be read without leaving the modal.
  const [viewing, setViewing] = useState<PortalDocument | null>(null);
  // Generated documents render from data rather than a file, so they get their
  // own viewer slot instead of being forced through the PDF iframe.
  const [viewingGenerated, setViewingGenerated] =
    useState<GeneratedDocument | null>(null);

  // The status a human set, falling back to the engine's. Everything on this
  // page that depends on state reads THIS, not o.status — otherwise marking an
  // opportunity Won would leave its deadline chip still nagging.
  const { opportunityStatusOf } = useStatuses();
  const status = opportunityStatusOf(o);

  const sweep = sweepFor(o);
  const closed = status === "Won" || status === "Lost";
  const health = healthFor(o.dueDate, today, closed);
  const docs = documentsForOpportunity(o.id);
  const generated = generatedDocsForOpportunity(o.id);
  const drafts = outreachForOpportunity(o.id);

  if (viewing) {
    return <DocumentViewer doc={viewing} onBack={() => setViewing(null)} />;
  }

  if (viewingGenerated) {
    return (
      <GeneratedDocumentViewer
        doc={viewingGenerated}
        onBack={() => setViewingGenerated(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header>
        <div className="flex flex-wrap items-center gap-2">
          {/* Editable: this is the same fact as the card's column on the
              pipeline board, so changing it here moves the card there. */}
          <StatusControl
            kind="opportunity"
            id={o.id}
            engineStatus={o.status}
            options={OPPORTUNITY_STATUS_OPTIONS}
            styleFor={opportunityStatusStyle}
            size="sm"
            label="Opportunity status"
          />

          {sweep && (
            <span
              title={`First found on the ${formatDate(sweep.iso)} sweep`}
              className={cn(
                "inline-flex rounded-full px-2 py-0.5 text-xs font-bold uppercase tracking-wide",
                o.addedISO === LATEST_RUN_ISO
                  ? "bg-gold text-navy-deep"
                  : "bg-navy/10 text-navy/70"
              )}
            >
              {sweep.label} sweep
            </span>
          )}

          {o.hardDeadline && (
            <span
              title="Published deadline, not an internal target"
              className="inline-flex rounded-full bg-purple-100 px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-purple-700"
            >
              Hard date
            </span>
          )}

          {health && (
            <span
              className={cn(
                "inline-flex rounded-full px-2 py-0.5 text-xs font-semibold",
                health.chip
              )}
            >
              {health.label}
            </span>
          )}
        </div>

        <h2 className="mt-3 break-words text-lg font-semibold leading-snug text-navy-deep">
          {o.title}
        </h2>
        <p className="mt-1 break-words text-sm text-ink/60">{o.agency}</p>
      </header>

      {/* ── Meta grid ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3">
        <Meta icon={Building2} label="Agency" value={o.agency} />
        <Meta icon={MapPin} label="Location" value={o.location} />
        <Meta
          icon={Calendar}
          label={o.hardDeadline ? "Published deadline" : "Action by"}
          value={formatDate(o.dueDate)}
        />
        <Meta icon={ArrowUpDown} label="Est. value" value={formatCurrency(o.estValue)} />
        <Meta icon={Hash} label="NAICS" value={o.naics} />
        <Meta icon={Layers} label="Source" value={o.source} />
      </div>

      {o.hardDeadline && (
        <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" aria-hidden />
          <p className="text-xs text-red-700">
            This is a real published date from the issuing body — not an
            internal target. Missing it forfeits the opportunity.
          </p>
        </div>
      )}

      <div className="flex items-center gap-3 rounded-xl bg-surface p-4">
        <span
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-sm font-bold",
            fitColor(o.fitScore)
          )}
        >
          {o.fitScore}
        </span>
        <div>
          <p className="text-sm font-semibold text-navy-deep">Fit score</p>
          <p className="text-xs text-ink/60">Scored by the Lead Qualifier</p>
        </div>
      </div>

      <Detail title="Description">{o.description}</Detail>
      <Detail title="Why it fits">{o.whyItFits}</Detail>

      <div className="rounded-xl border border-gold/30 bg-gold/10 p-4">
        <p className="flex items-center gap-1.5 text-sm font-semibold text-[#8a6c1f]">
          <Lightbulb className="h-4 w-4" aria-hidden />
          Suggested next action
        </p>
        <p className="mt-1.5 break-words text-sm text-ink/75">
          {o.suggestedAction}
        </p>
      </div>

      {/* ── Sources ────────────────────────────────────────────────────── */}
      {/* Placed immediately after the suggested action on purpose: the action
          says "call them and say this", and this says "and here is why you are
          allowed to". Together they are what makes a cold call warm. */}
      <SourceLinks
        sources={o.sources}
        predatesRule={predatesSourceCitations(o)}
      />

      {/* ── Documents ──────────────────────────────────────────────────── */}
      <section>
        <SectionTitle icon={FileText} title="Documents" count={docs.length} />
        {docs.length === 0 ? (
          <EmptyNote>
            No documents are linked to this opportunity yet.
          </EmptyNote>
        ) : (
          <ul className="mt-3 space-y-3">
            {docs.map((d) => (
              <li
                key={d.id}
                className="rounded-xl border border-navy/10 bg-white p-4"
              >
                <p className="text-xs font-semibold uppercase tracking-wide text-ink/45">
                  {d.category}
                </p>
                <h4 className="mt-0.5 break-words text-sm font-semibold leading-snug text-navy-deep">
                  {d.title}
                </h4>

                <StatusControl
                  className="mt-2"
                  kind="document"
                  id={d.id}
                  engineStatus={d.status}
                  options={DOCUMENT_STATUS_OPTIONS}
                  styleFor={documentStatusStyle}
                  size="sm"
                  label={`Status for ${d.title}`}
                />

                <p className="mt-2 break-words text-xs leading-relaxed text-ink/70">
                  {d.summary}
                </p>

                <div className="mt-3 rounded-lg border border-navy/10 bg-surface p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-ink/50">
                    What to do next
                  </p>
                  <ol className="mt-1.5 space-y-1">
                    {d.nextSteps.map((s, i) => (
                      <li
                        key={s}
                        className="flex items-start gap-2 break-words text-xs text-ink/75"
                      >
                        <span className="mt-px font-bold text-gold">{i + 1}.</span>
                        {s}
                      </li>
                    ))}
                  </ol>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setViewing(d)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-navy/15 bg-white px-3 py-1.5 text-xs font-semibold text-navy transition-colors hover:bg-surface"
                  >
                    <Eye className="h-3.5 w-3.5" aria-hidden />
                    Open
                  </button>
                  <a
                    href={d.file}
                    download
                    className="inline-flex items-center gap-1.5 rounded-lg border border-navy/15 bg-white px-3 py-1.5 text-xs font-semibold text-navy transition-colors hover:bg-surface"
                  >
                    <Download className="h-3.5 w-3.5" aria-hidden />
                    Download
                  </a>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* ── Generated documents ────────────────────────────────────────── */}
      {/* Styled identically to the static documents above so the two read as
          one list — from Darren's side the only difference that matters is
          that these are never stale, because they render from engine data at
          the moment he asks rather than from a binary committed weeks ago. */}
      <section>
        <SectionTitle
          icon={FileSpreadsheet}
          title="Generated documents"
          count={generated.length}
        />
        {generated.length === 0 ? (
          <EmptyNote>
            No generated documents are linked to this opportunity yet.
          </EmptyNote>
        ) : (
          <ul className="mt-3 space-y-3">
            {generated.map((d) => (
              <li
                key={d.id}
                className="rounded-xl border border-navy/10 bg-white p-4"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-ink/45">
                    {d.category}
                  </p>
                  <span className="inline-flex rounded-full bg-navy/5 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-navy">
                    Generated
                  </span>
                </div>
                <h4 className="mt-0.5 break-words text-sm font-semibold leading-snug text-navy-deep">
                  {d.title}
                </h4>
                {d.subtitle && (
                  <p className="mt-0.5 break-words text-xs text-ink/55">
                    {d.subtitle}
                  </p>
                )}

                <StatusControl
                  className="mt-2"
                  kind="generated-doc"
                  id={d.id}
                  engineStatus={d.status}
                  options={DOCUMENT_STATUS_OPTIONS}
                  styleFor={documentStatusStyle}
                  size="sm"
                  label={`Status for ${d.title}`}
                />

                <p className="mt-2 break-words text-xs leading-relaxed text-ink/70">
                  {d.summary}
                </p>

                <div className="mt-3 rounded-lg border border-navy/10 bg-surface p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-ink/50">
                    What to do next
                  </p>
                  <ol className="mt-1.5 space-y-1">
                    {d.nextSteps.map((s, i) => (
                      <li
                        key={s}
                        className="flex items-start gap-2 break-words text-xs text-ink/75"
                      >
                        <span className="mt-px font-bold text-gold">{i + 1}.</span>
                        {s}
                      </li>
                    ))}
                  </ol>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setViewingGenerated(d)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-navy/15 bg-white px-3 py-1.5 text-xs font-semibold text-navy transition-colors hover:bg-surface"
                  >
                    <Eye className="h-3.5 w-3.5" aria-hidden />
                    Open
                  </button>
                  <a
                    href={printDocHref(d.id)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-navy/15 bg-white px-3 py-1.5 text-xs font-semibold text-navy transition-colors hover:bg-surface"
                  >
                    <Download className="h-3.5 w-3.5" aria-hidden />
                    Download PDF
                  </a>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* ── Outreach ───────────────────────────────────────────────────── */}
      <section>
        <SectionTitle icon={Send} title="Outreach" count={drafts.length} />
        {drafts.length === 0 ? (
          <EmptyNote>
            No outreach has been drafted for this opportunity yet.
          </EmptyNote>
        ) : (
          <ul className="mt-3 space-y-3">
            {drafts.map((r) => (
              <OutreachCard key={r.id} record={r} />
            ))}
          </ul>
        )}
      </section>

      {/* ── Notes ──────────────────────────────────────────────────────── */}
      {/* Everything above this line is written by the engine. This is the one
          section the humans own, and it is shared: what Darren learns on a call
          has to survive the week and reach whoever picks the lead up next. */}
      <NotesThread subjectKind="opportunity" subjectId={o.id} />

      {/* ── Footer ─────────────────────────────────────────────────────── */}
      <footer className="border-t border-navy/10 pt-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="break-words text-xs text-ink/40">
            {o.id}
            {sweep
              ? ` · first found on the ${sweep.label} sweep, ${formatDate(sweep.iso)}`
              : ""}
            . Found by the Opportunity Finder and scored by the Lead Qualifier.
          </p>
          <CopyButton
            label="Copy link"
            text={() =>
              `${typeof window === "undefined" ? "" : window.location.origin}${opportunityHref(o.id)}`
            }
            icon={Link2}
          />
        </div>
      </footer>
    </div>
  );
}

/* ─────────────────────────── Inline document viewer ─────────────────────── */

/**
 * Renders a linked document in place rather than punting the user to a new
 * tab — leaving the portal to read a PDF loses the opportunity context that is
 * the whole point of showing the document here.
 */
function DocumentViewer({
  doc,
  onBack,
}: {
  doc: PortalDocument;
  onBack: () => void;
}) {
  const previewable = isPreviewable(doc.file);

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-navy/10 pb-3">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 rounded-lg border border-navy/15 bg-white px-3 py-1.5 text-xs font-semibold text-navy transition-colors hover:bg-surface"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
          Back to opportunity
        </button>
        <a
          href={doc.file}
          download
          className="inline-flex items-center gap-1.5 rounded-lg border border-navy/15 bg-white px-3 py-1.5 text-xs font-semibold text-navy transition-colors hover:bg-surface"
        >
          <Download className="h-3.5 w-3.5" aria-hidden />
          Download
        </a>
      </div>

      <h3 className="mt-3 break-words text-sm font-semibold text-navy-deep">
        {doc.title}
      </h3>

      {previewable ? (
        <iframe
          src={doc.file}
          title={doc.title}
          className="mt-3 h-[70vh] min-h-[420px] w-full rounded-xl border border-navy/10 bg-surface"
        />
      ) : (
        <div className="mt-3 flex min-h-[280px] flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-navy/20 bg-surface p-8 text-center">
          <FileWarning className="h-8 w-8 text-gold" aria-hidden />
          <p className="text-sm font-semibold text-navy-deep">
            Preview not available for Word files
          </p>
          <p className="max-w-sm break-words text-xs text-ink/60">
            Browsers cannot render .docx inline. Download the file to open it in
            Word — the full text of every draft is also shown under Outreach on
            this page.
          </p>
          <a href={doc.file} download className="btn-navy mt-1 text-sm">
            <Download className="h-4 w-4" aria-hidden />
            Download {doc.file.split("/").pop()}
          </a>
        </div>
      )}
    </div>
  );
}

/* ───────────────────── Inline generated document viewer ─────────────────── */

/**
 * Renders a generated document in place using the same component the print
 * route uses, so what is read on screen and what comes out of the printer are
 * the same markup — there is no second rendering to drift out of sync.
 */
function GeneratedDocumentViewer({
  doc,
  onBack,
}: {
  doc: GeneratedDocument;
  onBack: () => void;
}) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-navy/10 pb-3">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 rounded-lg border border-navy/15 bg-white px-3 py-1.5 text-xs font-semibold text-navy transition-colors hover:bg-surface"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
          Back to opportunity
        </button>
        <a
          href={printDocHref(doc.id)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-lg border border-navy/15 bg-white px-3 py-1.5 text-xs font-semibold text-navy transition-colors hover:bg-surface"
        >
          <Download className="h-3.5 w-3.5" aria-hidden />
          Download PDF
        </a>
      </div>

      <div className="mt-3 max-h-[70vh] min-h-[420px] overflow-y-auto rounded-xl border border-navy/10 bg-surface">
        <PrintableDocument document={doc} />
      </div>
    </div>
  );
}

/* ──────────────────────────────── Outreach card ─────────────────────────── */

function OutreachCard({ record: r }: { record: OutreachRecord }) {
  // Resolved, not raw: once Darren approves or sends a draft, the warning
  // below has to stop saying it is waiting on him.
  const { statusOf } = useStatuses();
  const status = statusOf<OutreachStatus>("outreach", r.id, r.status);

  return (
    <li className="rounded-xl border border-navy/10 bg-white p-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex rounded-full bg-navy/5 px-2 py-0.5 text-xs font-semibold capitalize text-navy">
          {r.channel}
        </span>
        <StatusControl
          kind="outreach"
          id={r.id}
          engineStatus={r.status}
          options={OUTREACH_STATUS_OPTIONS}
          styleFor={outreachStatusStyle}
          size="sm"
          label={`Status for ${r.subject}`}
        />
        <span className="text-xs text-ink/40">{r.id}</span>
      </div>

      {status === "draft" && (
        <p className="mt-2.5 flex items-start gap-2 rounded-lg border border-gold/30 bg-gold/10 p-2.5 text-xs font-medium text-[#8a6c1f]">
          <AlertCircle className="mt-px h-3.5 w-3.5 shrink-0" aria-hidden />
          Awaiting approval — not sent. Change the status above once it goes out.
        </p>
      )}

      {status === "approved" && (
        <p className="mt-2.5 flex items-start gap-2 rounded-lg border border-gold/40 bg-gold/10 p-2.5 text-xs font-medium text-[#8a6c1f]">
          <AlertCircle className="mt-px h-3.5 w-3.5 shrink-0" aria-hidden />
          Approved and ready to send — not sent yet.
        </p>
      )}

      {/* Contact block. Fields are omitted rather than filled with a guess, so
          a missing name here means the engine genuinely has not found one. */}
      {(r.contactName || r.contactRole || r.contactEmail || r.contactPhone) && (
        <div className="mt-3 space-y-1 rounded-lg border border-navy/10 bg-surface p-3">
          {r.contactName && (
            <ContactLine icon={User} value={r.contactName} />
          )}
          {r.contactRole && (
            <ContactLine icon={Building2} value={r.contactRole} />
          )}
          {r.contactPhone && (
            <ContactLine icon={Phone} value={r.contactPhone} />
          )}
          {r.contactEmail && (
            <ContactLine icon={Mail} value={r.contactEmail} />
          )}
        </div>
      )}

      <dl className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs">
        <DateBit label="Drafted" iso={r.draftedISO} />
        {r.sentISO && <DateBit label="Sent" iso={r.sentISO} />}
        {r.responseISO && <DateBit label="Replied" iso={r.responseISO} />}
      </dl>

      <p className="mt-3 break-words text-sm font-semibold text-navy-deep">
        {r.subject}
      </p>

      <div className="mt-2 rounded-lg border border-navy/10 bg-surface p-3">
        {/* Preserve the draft's own line breaks — it is meant to be read (and
            copied) exactly as it will be sent. */}
        <p className="whitespace-pre-wrap break-words text-xs leading-relaxed text-ink/75">
          {r.body}
        </p>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <CopyButton
          label="Copy to clipboard"
          text={`Subject: ${r.subject}\n\n${r.body}`}
          icon={Copy}
        />
        {/* The printed version omits `notes` — see printable-document.tsx —
            so this is safe to hand to someone. */}
        <a
          href={printOutreachHref(r.id)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-lg border border-navy/15 bg-white px-3 py-1.5 text-xs font-semibold text-navy transition-colors hover:bg-surface"
        >
          <Download className="h-3.5 w-3.5" aria-hidden />
          Download PDF
        </a>
      </div>

      {r.notes && (
        <p className="mt-3 break-words text-xs italic leading-relaxed text-ink/55">
          {r.notes}
        </p>
      )}
    </li>
  );
}

/* ──────────────────────────────── Small pieces ──────────────────────────── */

function CopyButton({
  label,
  text,
  icon: Icon,
}: {
  label: string;
  /** A thunk when the value can only be known at click time, e.g. the URL. */
  text: string | (() => string);
  icon: typeof Copy;
}) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  async function copy() {
    try {
      await navigator.clipboard.writeText(
        typeof text === "function" ? text() : text
      );
      setCopied(true);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard is unavailable outside a secure context. Say nothing rather
      // than claim a copy that did not happen.
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="inline-flex items-center gap-1.5 rounded-lg border border-navy/15 bg-white px-3 py-1.5 text-xs font-semibold text-navy transition-colors hover:bg-surface"
    >
      {copied ? (
        <Check className="h-3.5 w-3.5 text-success" aria-hidden />
      ) : (
        <Icon className="h-3.5 w-3.5" aria-hidden />
      )}
      {copied ? "Copied" : label}
    </button>
  );
}

function ContactLine({
  icon: Icon,
  value,
}: {
  icon: typeof User;
  value: string;
}) {
  return (
    <p className="flex items-start gap-2 break-words text-xs text-ink/75">
      <Icon className="mt-px h-3.5 w-3.5 shrink-0 text-ink/40" aria-hidden />
      {value}
    </p>
  );
}

function DateBit({ label, iso }: { label: string; iso: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <dt className="text-ink/45">{label}</dt>
      <dd className="font-medium text-navy-deep">{formatDate(iso)}</dd>
    </div>
  );
}

function SectionTitle({
  icon: Icon,
  title,
  count,
}: {
  icon: typeof FileText;
  title: string;
  count: number;
}) {
  return (
    <h3 className="flex items-center gap-2 text-sm font-semibold text-navy-deep">
      <Icon className="h-4 w-4 text-gold" aria-hidden />
      {title}
      <span className="rounded-full bg-navy/10 px-1.5 text-xs font-bold text-navy">
        {count}
      </span>
    </h3>
  );
}

function EmptyNote({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-2 rounded-xl border border-dashed border-navy/15 p-4 text-xs text-ink/45">
      {children}
    </p>
  );
}

function Meta({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof MapPin;
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="flex items-center gap-1.5 text-xs text-ink/50">
        <Icon className="h-3.5 w-3.5" aria-hidden />
        {label}
      </p>
      {/* `break-words` so long agency or location names wrap instead of overflowing. */}
      <p className="mt-0.5 break-words text-sm font-medium text-navy-deep">
        {value}
      </p>
    </div>
  );
}

function Detail({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-navy-deep">{title}</h3>
      <p className="mt-1.5 break-words text-sm leading-relaxed text-ink/70">
        {children}
      </p>
    </div>
  );
}
