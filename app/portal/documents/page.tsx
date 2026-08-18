"use client";

import { FolderDown, Download, FileText, ListChecks } from "lucide-react";
import { PortalPageHeader, SampleDataRibbon } from "@/components/portal/portal-ui";
import { OpportunityChips } from "@/components/portal/opportunity-trigger";
import { documents, actionPlan } from "@/lib/data/documents";
import { generatedDocuments } from "@/lib/data/generated-docs";
import { StatusControl } from "@/components/portal/status-control";
import {
  DOCUMENT_STATUS_OPTIONS,
  documentStatusStyle,
} from "@/lib/status-options";

export default function DocumentsPage() {
  return (
    <div className="space-y-6">
      <PortalPageHeader
        title="Documents"
        subtitle="Application packets, the capability statement, setup guides, and outreach drafts — prepared by the Application Assistant and Outreach Writer, pre-filled from the Company Brain, with step-by-step instructions on every one."
        icon={FolderDown}
      />
      <SampleDataRibbon />

      {/* This-week action plan */}
      <section className="card">
        <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-navy-deep">
          <ListChecks className="h-5 w-5 text-gold" aria-hidden />
          This week&apos;s action plan
        </h2>
        <ol className="space-y-2.5">
          {actionPlan.map((step, i) => (
            <li key={step} className="flex items-start gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gold text-xs font-bold text-navy-deep">
                {i + 1}
              </span>
              <span className="text-sm text-ink/75">{step}</span>
            </li>
          ))}
        </ol>
      </section>

      {/* Document cards.
          Generated documents come first: they render from engine data on
          demand, so they are always current, whereas the static files below are
          artefacts that cannot be regenerated (a certificate issued by
          Virginia, an IRS letter, and two field-by-field form reproductions). */}
      <div className="grid gap-6 lg:grid-cols-2">
        {generatedDocuments.map((doc) => (
          <article key={doc.id} className="card flex flex-col">
            <div className="flex items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl icon-tile">
                <FileText className="h-5 w-5" aria-hidden />
              </span>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-ink/45">
                    {doc.category}
                  </p>
                  <span className="inline-flex rounded-full bg-navy/5 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-navy">
                    Generated
                  </span>
                </div>
                <h3 className="mt-0.5 break-words text-base font-semibold leading-snug text-navy-deep">
                  {doc.title}
                </h3>
                {doc.subtitle && (
                  <p className="mt-0.5 break-words text-xs text-ink/55">
                    {doc.subtitle}
                  </p>
                )}
              </div>
            </div>

            <StatusControl
              className="mt-3"
              kind="generated-doc"
              id={doc.id}
              engineStatus={doc.status}
              options={DOCUMENT_STATUS_OPTIONS}
              styleFor={documentStatusStyle}
              label={`Status for ${doc.title}`}
            />

            <p className="mt-3 break-words text-sm leading-relaxed text-ink/70">
              {doc.summary}
            </p>

            <div className="mt-4 rounded-xl border border-navy/10 bg-surface p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-ink/50">
                What to do next
              </p>
              <ol className="mt-2 space-y-1.5">
                {doc.nextSteps.map((s, i) => (
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

            {doc.relatedOpportunityIds.length > 0 && (
              <div className="mt-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-ink/50">
                  {doc.relatedOpportunityIds.length} linked{" "}
                  {doc.relatedOpportunityIds.length === 1
                    ? "opportunity"
                    : "opportunities"}
                </p>
                <OpportunityChips
                  ids={doc.relatedOpportunityIds}
                  className="mt-2"
                />
              </div>
            )}

            <div className="mt-4 flex items-center gap-3 pt-1">
              <a
                href={`/portal/print/doc/${doc.id}?auto=1`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-navy text-sm"
              >
                <Download className="h-4 w-4" aria-hidden />
                Download PDF
              </a>
            </div>
          </article>
        ))}

        {documents.map((doc) => (
          <article key={doc.id} className="card flex flex-col">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl icon-tile">
                  <FileText className="h-5 w-5" aria-hidden />
                </span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-ink/45">
                    {doc.category}
                  </p>
                  <h3 className="mt-0.5 text-base font-semibold leading-snug text-navy-deep">
                    {doc.title}
                  </h3>
                </div>
              </div>
            </div>

            <StatusControl
              className="mt-3"
              kind="document"
              id={doc.id}
              engineStatus={doc.status}
              options={DOCUMENT_STATUS_OPTIONS}
              styleFor={documentStatusStyle}
              label={`Status for ${doc.title}`}
            />

            <p className="mt-3 text-sm leading-relaxed text-ink/70">{doc.summary}</p>

            <div className="mt-4 rounded-xl border border-navy/10 bg-surface p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-ink/50">
                What to do next
              </p>
              <ol className="mt-2 space-y-1.5">
                {doc.nextSteps.map((s, i) => (
                  <li key={s} className="flex items-start gap-2 text-xs text-ink/75">
                    <span className="mt-px font-bold text-gold">{i + 1}.</span>
                    {s}
                  </li>
                ))}
              </ol>
            </div>

            {/* Linked opportunities open the shared detail in place, so the
                document and the record it was prepared for stay one click
                apart rather than a page apart. */}
            {doc.relatedOpportunityIds &&
              doc.relatedOpportunityIds.length > 0 && (
                <div className="mt-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-ink/50">
                    {doc.relatedOpportunityIds.length} linked{" "}
                    {doc.relatedOpportunityIds.length === 1
                      ? "opportunity"
                      : "opportunities"}
                  </p>
                  <OpportunityChips
                    ids={doc.relatedOpportunityIds}
                    className="mt-2"
                  />
                </div>
              )}

            <div className="mt-4 flex items-center gap-3 pt-1">
              <a href={doc.file} download className="btn-navy text-sm">
                <Download className="h-4 w-4" aria-hidden />
                Download
              </a>
            </div>
          </article>
        ))}
      </div>

      <p className="text-xs text-ink/40">
        Prepared by the Application Assistant and Outreach Writer from the Company
        Brain. Online portals (ModivCare, symplr, eVA, SAM.gov) require CSL&apos;s
        own accounts to submit — these packets pre-fill every answer and list the
        exact steps, so each submission takes minutes, not hours.
      </p>
    </div>
  );
}
