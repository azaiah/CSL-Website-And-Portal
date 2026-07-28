"use client";

import { useState } from "react";
import { Pencil, Check, Lock } from "lucide-react";
import {
  company,
  credentials,
  certifications,
  codes,
  capabilityStatement,
  helpers,
} from "@/lib/company-brain";
import { cn } from "@/lib/utils";

/**
 * Editable-LOOKING profile. In Phase 1 the "Edit" toggle simply enables the
 * fields for demonstration — changes are not persisted (no backend yet).
 * TODO: wire edits to a datastore so the Company Brain becomes writable.
 */
export function CompanyBrainEditor() {
  const [editing, setEditing] = useState(false);

  return (
    <div className="space-y-6">
      {/* `flex-wrap` so the note and the button stack instead of overflowing on a phone. */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-navy/10 bg-white px-4 py-3">
        <p className="flex min-w-0 items-center gap-2 text-sm text-ink/60">
          <Lock className="h-4 w-4 text-gold" aria-hidden />
          Secure profile every agent reads from.
          {editing && (
            <span className="font-medium text-[#8a6c1f]">
              {" "}Editing preview — changes aren&apos;t saved in Phase 1.
            </span>
          )}
        </p>
        <button
          onClick={() => setEditing((v) => !v)}
          className={cn(editing ? "btn-navy" : "btn-ghost", "text-sm")}
        >
          {editing ? (
            <>
              <Check className="h-4 w-4" aria-hidden /> Done
            </>
          ) : (
            <>
              <Pencil className="h-4 w-4" aria-hidden /> Edit profile
            </>
          )}
        </button>
      </div>

      {/* Identity */}
      <Panel title="Business identity">
        <div className="grid gap-4 sm:grid-cols-2">
          <BField label="Legal name" value={company.legalName} editing={editing} />
          <BField label="Doing business as" value={company.dba} editing={editing} />
          <BField label="Founded" value={String(company.founded)} editing={editing} />
          <BField label="Website" value={company.domain} editing={editing} />
          <BField label="Primary contact" value={company.contact.name} editing={editing} />
          <BField label="Title" value={company.contact.title} editing={editing} />
          <BField label="Phone" value={company.contact.phone} editing={editing} />
          <BField label="Email" value={company.contact.email} editing={editing} />
          <BField
            label="Service area"
            value={`${company.serviceArea.label} (${company.serviceArea.radiusMiles} mi)`}
            editing={editing}
            className="sm:col-span-2"
          />
          <BField
            label="Insurance"
            value={company.insurance}
            editing={editing}
            className="sm:col-span-2"
            multiline
          />
        </div>
      </Panel>

      {/* Credentials */}
      <Panel title="Credentials & registrations">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {credentials.map((c) => (
            <div
              key={c.label}
              className="rounded-xl border border-navy/10 bg-surface px-3 py-2.5"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-navy-deep">{c.short}</span>
                <span
                  className={cn(
                    "shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold",
                    c.status === "active"
                      ? "bg-success/10 text-success"
                      : c.status === "registered"
                      ? "bg-navy/10 text-navy"
                      : "bg-gold/15 text-[#8a6c1f]"
                  )}
                >
                  {helpers.statusLabel(c.status)}
                </span>
              </div>
              {c.proofDocument && (
                <a
                  href={c.proofDocument.file}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 block text-xs font-medium text-gold hover:underline"
                >
                  {c.proofDocument.label}
                </a>
              )}
            </div>
          ))}
        </div>
      </Panel>

      {/* Codes */}
      <Panel title="Procurement codes">
        <div className="grid gap-3 sm:grid-cols-2">
          {codes.map((c) => (
            <div
              key={`${c.system}-${c.code}`}
              className="flex items-center gap-3 rounded-xl border border-navy/10 bg-surface px-3 py-2.5"
            >
              <span className="rounded bg-navy-deep px-2 py-0.5 text-xs font-bold text-gold">
                {c.system}
              </span>
              <span className="font-mono text-sm text-navy-deep">{c.code}</span>
              {/* Wrap the code description so the full wording is readable. */}
              <span className="min-w-0 break-words text-xs text-ink/60">
                {c.label}
              </span>
            </div>
          ))}
        </div>
      </Panel>

      {/* Certifications */}
      <Panel title="Certifications & training">
        <div className="flex flex-wrap gap-2">
          {certifications.map((c) => (
            <span key={c.label} className="badge-pill">
              {c.label}
              {c.reference && (
                <span className="text-ink/40"> · {c.reference}</span>
              )}
            </span>
          ))}
        </div>
      </Panel>

      {/* Capability statement */}
      <Panel title="Capability statement">
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <h4 className="text-sm font-semibold text-navy-deep">
              Core competencies
            </h4>
            <ul className="mt-2 space-y-1.5">
              {capabilityStatement.coreCompetencies.map((c) => (
                <li key={c} className="flex items-start gap-2 text-sm text-ink/75">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-navy" aria-hidden />
                  {c}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-navy-deep">
              Differentiators
            </h4>
            <ul className="mt-2 space-y-1.5">
              {capabilityStatement.differentiators.map((c) => (
                <li key={c} className="flex items-start gap-2 text-sm text-ink/75">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-gold" aria-hidden />
                  {c}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-5 rounded-xl border border-navy/10 bg-surface p-4">
          <h4 className="text-sm font-semibold text-navy-deep">Past performance</h4>
          <p className="mt-1 text-sm text-ink/70">
            {capabilityStatement.pastPerformanceNote}
          </p>
        </div>
      </Panel>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="card">
      <h3 className="mb-4 text-base font-semibold text-navy-deep">{title}</h3>
      {children}
    </section>
  );
}

function BField({
  label,
  value,
  editing,
  className,
  multiline,
}: {
  label: string;
  value: string;
  editing: boolean;
  className?: string;
  multiline?: boolean;
}) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-ink/50">
        {label}
      </span>
      {multiline ? (
        <textarea
          defaultValue={value}
          readOnly={!editing}
          rows={2}
          className={cn(
            "w-full rounded-xl border px-3 py-2 text-sm",
            editing
              ? "border-gold/50 bg-white text-ink"
              : "border-navy/10 bg-surface text-navy-deep"
          )}
        />
      ) : (
        <input
          defaultValue={value}
          readOnly={!editing}
          className={cn(
            "w-full rounded-xl border px-3 py-2 text-sm",
            editing
              ? "border-gold/50 bg-white text-ink"
              : "border-navy/10 bg-surface text-navy-deep"
          )}
        />
      )}
    </label>
  );
}
