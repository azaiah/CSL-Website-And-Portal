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
} from "lucide-react";
import {
  sweepFor,
  LATEST_RUN_ISO,
  type Opportunity,
  type OpportunityStatus,
} from "@/lib/data/opportunities";
import {
  documentsForOpportunity,
  DOCUMENT_STATUS_LABEL,
  type PortalDocument,
} from "@/lib/data/documents";
import {
  outreachForOpportunity,
  OUTREACH_STATUS_LABEL,
  type OutreachRecord,
  type OutreachStatus,
} from "@/lib/data/outreach";
import { healthFor, todayISO } from "@/lib/health";
import { formatCurrency, formatDate, cn } from "@/lib/utils";

/** Shared so the table rows and this view can never style a status differently. */
export const OPPORTUNITY_STATUS_STYLE: Record<OpportunityStatus, string> = {
  Found: "bg-navy/10 text-navy",
  Qualified: "bg-success/10 text-success",
  Contacted: "bg-gold/15 text-[#8a6c1f]",
  Meeting: "bg-blue-100 text-blue-700",
  Bid: "bg-purple-100 text-purple-700",
  Won: "bg-success/15 text-success",
  Lost: "bg-red-100 text-red-600",
};

export function fitColor(score: number) {
  if (score >= 85) return "bg-success text-white";
  if (score >= 70) return "bg-gold text-navy-deep";
  return "bg-navy/15 text-navy";
}

/** Canonical deep link for an opportunity. */
export function opportunityHref(id: string) {
  return `/portal/opportunities/${id}`;
}

const outreachStatusStyle: Record<OutreachStatus, string> = {
  draft: "bg-navy/10 text-navy",
  approved: "bg-gold/15 text-[#8a6c1f]",
  sent: "bg-blue-100 text-blue-700",
  replied: "bg-success/10 text-success",
  "no-response": "bg-ink/10 text-ink/60",
  closed: "bg-ink/10 text-ink/60",
};

const documentStatusStyle: Record<PortalDocument["status"], string> = {
  ready: "bg-success/10 text-success border-success/40",
  "action-required": "bg-gold/10 text-[#8a6c1f] border-gold/40",
  "awaiting-approval": "bg-navy/10 text-navy border-navy/30",
};

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

  const sweep = sweepFor(o);
  const closed = o.status === "Won" || o.status === "Lost";
  const health = healthFor(o.dueDate, today, closed);
  const docs = documentsForOpportunity(o.id);
  const drafts = outreachForOpportunity(o.id);

  if (viewing) {
    return <DocumentViewer doc={viewing} onBack={() => setViewing(null)} />;
  }

  return (
    <div className="space-y-6">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header>
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={cn(
              "inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold",
              OPPORTUNITY_STATUS_STYLE[o.status]
            )}
          >
            {o.status}
          </span>

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

                <span
                  className={cn(
                    "mt-2 inline-flex w-fit items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold",
                    documentStatusStyle[d.status]
                  )}
                >
                  {DOCUMENT_STATUS_LABEL[d.status]}
                </span>

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

/* ──────────────────────────────── Outreach card ─────────────────────────── */

function OutreachCard({ record: r }: { record: OutreachRecord }) {
  return (
    <li className="rounded-xl border border-navy/10 bg-white p-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex rounded-full bg-navy/5 px-2 py-0.5 text-xs font-semibold capitalize text-navy">
          {r.channel}
        </span>
        <span
          className={cn(
            "inline-flex rounded-full px-2 py-0.5 text-xs font-semibold",
            outreachStatusStyle[r.status]
          )}
        >
          {OUTREACH_STATUS_LABEL[r.status]}
        </span>
        <span className="text-xs text-ink/40">{r.id}</span>
      </div>

      {r.status === "draft" && (
        <p className="mt-2.5 flex items-start gap-2 rounded-lg border border-gold/30 bg-gold/10 p-2.5 text-xs font-medium text-[#8a6c1f]">
          <AlertCircle className="mt-px h-3.5 w-3.5 shrink-0" aria-hidden />
          Awaiting Darren&apos;s approval — not sent.
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
