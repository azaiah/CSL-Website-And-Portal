/**
 * lib/status-options.ts
 * ---------------------------------------------------------------------------
 * ONE vocabulary for every status in the portal: the values, the human labels,
 * and the chip colours.
 *
 * Before this file the same three things were spelled out separately in the
 * opportunity detail, the opportunities table and the documents page. That was
 * survivable while the chips were read-only. It stops being survivable the
 * moment they are editable, because a dropdown that offers a value one screen
 * cannot display is a bug waiting to happen.
 *
 * Colour note: the chips use tinted backgrounds with dark text rather than the
 * brand gold on white — gold on white measures 2.64:1, which is unreadable at
 * chip size. `#8A6C1F` on a gold tint measures 4.55:1 and is used throughout.
 * ---------------------------------------------------------------------------
 */

import type { OpportunityStatus } from "@/lib/data/opportunities";
import type { DocumentStatus } from "@/lib/data/documents";
import type { OutreachStatus } from "@/lib/data/outreach";
import { OUTREACH_STATUS_LABEL } from "@/lib/data/outreach";
import { DOCUMENT_STATUS_LABEL } from "@/lib/data/documents";
import {
  VET_LEAD_STATUSES,
  VET_LEAD_STATUS_LABEL,
  type VetLeadStatus,
} from "@/lib/status-context";
import type { QuoteStatus, JobStatus } from "@/lib/quotes/types";

export interface StatusOption<T extends string> {
  value: T;
  label: string;
}

/* ────────────────────────────── Opportunities ───────────────────────────── */

export const OPPORTUNITY_STATUSES: OpportunityStatus[] = [
  "Found", "Qualified", "Contacted", "Meeting", "Bid", "Won", "Lost",
];

/** Shared so a row, a card and the detail view can never style one differently. */
export const OPPORTUNITY_STATUS_STYLE: Record<OpportunityStatus, string> = {
  Found: "bg-navy/10 text-navy",
  Qualified: "bg-success/10 text-success",
  Contacted: "bg-gold/15 text-[#8a6c1f]",
  Meeting: "bg-blue-100 text-blue-700",
  Bid: "bg-purple-100 text-purple-700",
  Won: "bg-success/15 text-success",
  Lost: "bg-red-100 text-red-600",
};

export const OPPORTUNITY_STATUS_OPTIONS: StatusOption<OpportunityStatus>[] =
  OPPORTUNITY_STATUSES.map((s) => ({ value: s, label: s }));

export function opportunityStatusStyle(s: OpportunityStatus): string {
  return OPPORTUNITY_STATUS_STYLE[s] ?? OPPORTUNITY_STATUS_STYLE.Found;
}

/* ───────────────────────────────── Documents ────────────────────────────── */

export const DOCUMENT_STATUSES: DocumentStatus[] = [
  "action-required", "awaiting-approval", "ready",
];

export const DOCUMENT_STATUS_STYLE: Record<DocumentStatus, string> = {
  ready: "bg-success/10 text-success border border-success/40",
  "action-required": "bg-gold/15 text-[#8a6c1f] border border-gold/40",
  "awaiting-approval": "bg-navy/10 text-navy border border-navy/30",
};

export const DOCUMENT_STATUS_OPTIONS: StatusOption<DocumentStatus>[] =
  DOCUMENT_STATUSES.map((s) => ({ value: s, label: DOCUMENT_STATUS_LABEL[s] }));

export function documentStatusStyle(s: DocumentStatus): string {
  return DOCUMENT_STATUS_STYLE[s] ?? DOCUMENT_STATUS_STYLE["action-required"];
}

/* ───────────────────────────────── Outreach ─────────────────────────────── */

export const OUTREACH_STATUSES: OutreachStatus[] = [
  "draft", "approved", "sent", "replied", "no-response", "closed",
];

export const OUTREACH_STATUS_STYLE: Record<OutreachStatus, string> = {
  draft: "bg-navy/10 text-navy",
  approved: "bg-gold/15 text-[#8a6c1f]",
  sent: "bg-blue-100 text-blue-700",
  replied: "bg-success/15 text-success",
  "no-response": "bg-ink/10 text-ink/70",
  closed: "bg-ink/10 text-ink/70",
};

export const OUTREACH_STATUS_OPTIONS: StatusOption<OutreachStatus>[] =
  OUTREACH_STATUSES.map((s) => ({ value: s, label: OUTREACH_STATUS_LABEL[s] }));

export function outreachStatusStyle(s: OutreachStatus): string {
  return OUTREACH_STATUS_STYLE[s] ?? OUTREACH_STATUS_STYLE.draft;
}

/* ──────────────────────────────── Vet leads ─────────────────────────────── */

export const VET_LEAD_STATUS_STYLE: Record<VetLeadStatus, string> = {
  "not-started": "bg-navy/10 text-navy",
  attempted: "bg-gold/15 text-[#8a6c1f]",
  spoke: "bg-blue-100 text-blue-700",
  "follow-up": "bg-purple-100 text-purple-700",
  quoted: "bg-navy/15 text-navy",
  won: "bg-success/15 text-success",
  "not-a-fit": "bg-ink/10 text-ink/70",
};

export const VET_LEAD_STATUS_OPTIONS: StatusOption<VetLeadStatus>[] =
  VET_LEAD_STATUSES.map((s) => ({ value: s, label: VET_LEAD_STATUS_LABEL[s] }));

export function vetLeadStatusStyle(s: VetLeadStatus): string {
  return VET_LEAD_STATUS_STYLE[s] ?? VET_LEAD_STATUS_STYLE["not-started"];
}

/** Every vet lead starts here until somebody says otherwise. */
export const VET_LEAD_DEFAULT_STATUS: VetLeadStatus = "not-started";

/* ─────────────────────────────────── Quotes ─────────────────────────────── */

/**
 * Quote outcome. Unlike the vocabularies above, quote status is a column on
 * the quotes table rather than a record_status row — the quote and its outcome
 * are one fact, so they live in one place. See migration 003's header.
 *
 * The values are already human-readable, so label === value throughout.
 */
export const QUOTE_STATUSES: QuoteStatus[] = [
  "Draft", "Sent", "Pending", "Won", "Lost",
];

export const QUOTE_STATUS_STYLE: Record<QuoteStatus, string> = {
  Draft: "bg-navy/10 text-navy",
  Sent: "bg-blue-100 text-blue-700",
  Pending: "bg-gold/15 text-[#8a6c1f]",
  Won: "bg-success/15 text-success",
  Lost: "bg-red-100 text-red-600",
};

export const QUOTE_STATUS_OPTIONS: StatusOption<QuoteStatus>[] =
  QUOTE_STATUSES.map((s) => ({ value: s, label: s }));

export function quoteStatusStyle(s: QuoteStatus): string {
  return QUOTE_STATUS_STYLE[s] ?? QUOTE_STATUS_STYLE.Draft;
}

/* ──────────────────────────────────── Jobs ──────────────────────────────── */

/**
 * Delivery status on a job. Superset of the client's lookup tab, which offers
 * only Picked Up / In Transit / Delivered while his live rows already use
 * Delayed and On Hold.
 */
export const JOB_STATUSES: JobStatus[] = [
  "Scheduled", "Picked Up", "In Transit", "Delivered", "Delayed", "On Hold", "Cancelled",
];

export const JOB_STATUS_STYLE: Record<JobStatus, string> = {
  Scheduled: "bg-navy/10 text-navy",
  "Picked Up": "bg-blue-100 text-blue-700",
  "In Transit": "bg-purple-100 text-purple-700",
  Delivered: "bg-success/15 text-success",
  Delayed: "bg-gold/15 text-[#8a6c1f]",
  "On Hold": "bg-slate-100 text-slate-600",
  Cancelled: "bg-red-100 text-red-600",
};

export const JOB_STATUS_OPTIONS: StatusOption<JobStatus>[] =
  JOB_STATUSES.map((s) => ({ value: s, label: s }));

export function jobStatusStyle(s: JobStatus): string {
  return JOB_STATUS_STYLE[s] ?? JOB_STATUS_STYLE.Scheduled;
}
