"use client";

/**
 * components/portal/customers/customer-detail.tsx
 * ---------------------------------------------------------------------------
 * One customer: their details, their quotes, their jobs, and what they are
 * worth. This is step 3 of the client's flow chart — "look the customer up" —
 * which on paper means scrolling a spreadsheet and here means loading a row.
 *
 * The contact fields are edited in place. A phone number changing is a
 * five-second job and should not need a modal.
 * ---------------------------------------------------------------------------
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Archive,
  ArchiveRestore,
  Check,
  Loader2,
  Lock,
  Pencil,
} from "lucide-react";
import { cn, formatDate } from "@/lib/utils";
import {
  getCustomer,
  updateCustomer,
  archiveCustomer,
  getCustomerSummary,
  listQuotes,
  listJobs,
  listLookupValues,
  setQuoteStatus,
  setJobStatus,
} from "@/lib/quotes/queries";
import type {
  Customer,
  CustomerSummary,
  Quote,
  QuoteStatus,
  Job,
  JobStatus,
  LookupValue,
} from "@/lib/quotes/types";
import { formatMoney, marginStyle, formatPercent, formatMiles } from "@/lib/quotes/format";
import {
  QUOTE_STATUS_OPTIONS,
  quoteStatusStyle,
  JOB_STATUS_OPTIONS,
  jobStatusStyle,
} from "@/lib/status-options";
import { todayISO } from "@/lib/health";
import { StatusSelect } from "@/components/portal/quotes/status-select";
import {
  ErrorBanner,
  LoadingPanel,
  NotConnectedPanel,
  EmptyState,
  isNotConnected,
} from "@/components/portal/data-states";

/** Quote statuses that mean the outcome is settled, so decided_on is stamped. */
const DECIDED: QuoteStatus[] = ["Won", "Lost"];

export function CustomerDetail({ customerId }: { customerId: string }) {
  // Client-only "today" — a build-time date would freeze into the bundle.
  const [today, setToday] = useState<string | null>(null);
  useEffect(() => setToday(todayISO()), []);

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [summary, setSummary] = useState<CustomerSummary | null>(null);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [deliveryTypes, setDeliveryTypes] = useState<LookupValue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);

    const [customerRes, summaryRes, quotesRes, jobsRes, lookupRes] = await Promise.all([
      getCustomer(customerId),
      getCustomerSummary(customerId),
      listQuotes({ customerId }),
      listJobs({ customerId }),
      listLookupValues("delivery_type"),
    ]);

    const firstError =
      customerRes.error || summaryRes.error || quotesRes.error || jobsRes.error || lookupRes.error;
    if (firstError) {
      setError(firstError.message);
      setLoading(false);
      return;
    }

    setCustomer(customerRes.data);
    setSummary((summaryRes.data ?? [])[0] ?? null);
    setQuotes(quotesRes.data ?? []);
    setJobs(jobsRes.data ?? []);
    setDeliveryTypes(lookupRes.data ?? []);
    setLoading(false);
  }, [customerId]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  /** quote_id -> job, so a quote row can link to the job it became. */
  const jobByQuoteId = useMemo(() => {
    const m = new Map<string, Job>();
    for (const j of jobs) if (j.quote_id) m.set(j.quote_id, j);
    return m;
  }, [jobs]);

  /**
   * Save one field. Optimistic with a real rollback: the input shows the new
   * value at once, and goes back to the stored value if Postgres refuses it.
   */
  const saveField = useCallback(
    async (field: keyof Customer, value: string | null) => {
      if (!customer) return false;
      const previous = customer;

      setCustomer({ ...customer, [field]: value } as Customer);

      const { data, error: writeError } = await updateCustomer(customer.id, {
        [field]: value,
      });

      if (writeError || !data) {
        setCustomer(previous);
        setError(writeError?.message ?? "Could not save that change.");
        return false;
      }
      setCustomer(data);
      return true;
    },
    [customer]
  );

  const toggleArchived = useCallback(async () => {
    if (!customer) return;
    const previous = customer;
    const next = !customer.is_archived;

    setCustomer({ ...customer, is_archived: next });

    const { data, error: writeError } = await archiveCustomer(customer.id, next);
    if (writeError || !data) {
      setCustomer(previous);
      setError(writeError?.message ?? "Could not change the archived state.");
      return;
    }
    setCustomer(data);
  }, [customer]);

  const changeQuoteStatus = useCallback(
    async (quote: Quote, next: QuoteStatus) => {
      const previous = quote;
      // decided_on is stamped only when the outcome actually settles, and
      // cleared when a quote is moved back to an open state.
      const decidedOn = DECIDED.includes(next) ? today ?? todayISO() : null;

      setQuotes((prev) =>
        prev.map((q) => (q.id === quote.id ? { ...q, status: next, decided_on: decidedOn } : q))
      );

      const { data, error: writeError } = await setQuoteStatus(quote.id, next, decidedOn);
      if (writeError || !data) {
        setQuotes((prev) => prev.map((q) => (q.id === quote.id ? previous : q)));
        setError(writeError?.message ?? "Could not update the quote status.");
        return false;
      }
      setQuotes((prev) => prev.map((q) => (q.id === quote.id ? data : q)));
      return true;
    },
    [today]
  );

  const changeJobStatus = useCallback(async (job: Job, next: JobStatus) => {
    const previous = job;
    setJobs((prev) => prev.map((j) => (j.id === job.id ? { ...j, delivery_status: next } : j)));

    const { data, error: writeError } = await setJobStatus(job.id, next);
    if (writeError || !data) {
      setJobs((prev) => prev.map((j) => (j.id === job.id ? previous : j)));
      setError(writeError?.message ?? "Could not update the job status.");
      return false;
    }
    setJobs((prev) => prev.map((j) => (j.id === job.id ? data : j)));
    return true;
  }, []);

  if (isNotConnected(error)) {
    return <NotConnectedPanel message={error!} what="Customer database" />;
  }

  if (loading || !today) return <LoadingPanel label="Loading customer…" />;

  if (!customer) {
    return (
      <div className="card">
        <EmptyState
          title="Customer not found"
          hint="It may have been removed, or the link may be wrong."
        />
        <div className="text-center">
          <Link href="/portal/customers" className="btn-ghost text-sm">
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Back to customers
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/portal/customers"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-navy hover:text-[#8a6c1f]"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          All customers
        </Link>

        <button onClick={toggleArchived} className="btn-ghost text-sm">
          {customer.is_archived ? (
            <>
              <ArchiveRestore className="h-4 w-4" aria-hidden />
              Restore
            </>
          ) : (
            <>
              <Archive className="h-4 w-4" aria-hidden />
              Archive
            </>
          )}
        </button>
      </div>

      {error && !isNotConnected(error) && (
        <ErrorBanner
          title="Something did not save"
          message={error}
          onDismiss={() => setError(null)}
        />
      )}

      {/* ── Header: identity and contact, edited in place ─────────────────── */}
      <div className="card">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8a6c1f]">
              {customer.uid}
            </p>
            <InlineText
              value={customer.name}
              label="Customer name"
              required
              onSave={(v) => saveField("name", v)}
              className="mt-1 break-words text-2xl font-semibold text-navy-deep"
            />
          </div>
          {customer.is_archived && (
            <span className="rounded-full bg-navy/10 px-3 py-1 text-xs font-semibold text-navy">
              Archived
            </span>
          )}
        </div>

        <dl className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <DetailField label="Phone">
            <InlineText
              value={customer.phone}
              label="Phone"
              placeholder="Add a phone number"
              onSave={(v) => saveField("phone", v)}
            />
          </DetailField>

          <DetailField label="Email">
            <InlineText
              value={customer.email}
              label="Email"
              placeholder="Add an email"
              onSave={(v) => saveField("email", v)}
            />
          </DetailField>

          <DetailField label="Delivery type">
            <select
              value={customer.delivery_type ?? ""}
              onChange={(e) => void saveField("delivery_type", e.target.value || null)}
              aria-label="Delivery type"
              className="w-full rounded-xl border border-navy/15 bg-white px-2 py-1.5 text-sm"
            >
              <option value="">Not set</option>
              {deliveryTypes.map((d) => (
                <option key={d.id} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
          </DetailField>

          <DetailField label="Customer since">
            <span className="text-sm text-ink/70">{formatDate(customer.created_at.slice(0, 10))}</span>
          </DetailField>

          <div className="sm:col-span-2">
            <DetailField label="Address">
              <InlineText
                value={customer.address}
                label="Address"
                placeholder="Add an address"
                multiline
                onSave={(v) => saveField("address", v)}
              />
            </DetailField>
          </div>

          <div className="sm:col-span-2">
            <DetailField label="Notes">
              <InlineText
                value={customer.notes}
                label="Notes"
                placeholder="Add a note about this customer"
                multiline
                onSave={(v) => saveField("notes", v)}
              />
            </DetailField>
          </div>
        </dl>
      </div>

      {/* ── Financials, straight from customer_summary ────────────────────── */}
      <div className="card">
        <h2 className="text-base font-semibold text-navy-deep">Financials</h2>
        <p className="mt-1 text-xs text-ink/50">
          Counted from this customer&apos;s jobs by the customer_summary view. Job margin excludes
          fixed overhead, which belongs to the month rather than to any one run.
        </p>

        {summary ? (
          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <Metric label="Revenue" value={formatMoney(summary.revenue)} />
            <Metric label="Cost to CSL" value={formatMoney(summary.cost_to_csl)} />
            <Metric
              label="Job margin"
              value={formatMoney(summary.job_margin)}
              valueStyle={marginStyle(summary.job_margin)}
            />
            <Metric
              label="Win rate"
              value={formatPercent(summary.win_rate_pct)}
              hint={`${summary.quotes_won} won · ${summary.quotes_lost} lost · ${summary.quotes_open} open`}
            />
            <Metric label="Quotes" value={String(summary.quotes_total)} />
            <Metric
              label="Jobs"
              value={`${summary.jobs_delivered}/${summary.jobs_total}`}
              hint="Delivered / total"
            />
            <Metric label="Miles" value={formatMiles(summary.miles)} />
            <Metric
              label="Won quote value"
              value={formatMoney(summary.won_quote_value)}
              hint="What was quoted, not what was billed"
            />
          </div>
        ) : (
          <EmptyState
            title="Nothing to total yet"
            hint="Once this customer has a quote or a job, the rollup appears here."
          />
        )}
      </div>

      {/* ── Quotes ───────────────────────────────────────────────────────── */}
      <div className="card p-0">
        <div className="flex items-center justify-between px-6 pt-6">
          <h2 className="text-base font-semibold text-navy-deep">
            Quotes <span className="text-ink/40">({quotes.length})</span>
          </h2>
          <Link href="/portal/quotes" className="text-sm font-medium text-navy hover:underline">
            New quote
          </Link>
        </div>

        {quotes.length === 0 ? (
          <EmptyState title="No quotes yet" hint="Build one from the Quotes page." />
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[44rem] text-sm">
              <thead>
                <tr className="border-y border-navy/10 text-left text-xs uppercase tracking-wide text-ink/50">
                  <th scope="col" className="px-6 py-3 font-semibold">Quote</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Service</th>
                  <th scope="col" className="px-4 py-3 text-right font-semibold">Total</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Status</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Quoted</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Job</th>
                </tr>
              </thead>
              <tbody>
                {quotes.map((q) => {
                  const job = jobByQuoteId.get(q.id);
                  return (
                    <tr key={q.id} className="border-b border-navy/5 last:border-0">
                      <td className="px-6 py-3 align-top">
                        <Link
                          href={`/portal/quotes/${q.id}`}
                          className="font-semibold text-navy hover:underline"
                        >
                          {q.uid}
                        </Link>
                      </td>
                      <td className="px-4 py-3 align-top">{q.service_code}</td>
                      <td className="px-4 py-3 text-right align-top font-semibold tabular-nums">
                        {formatMoney(q.total)}
                      </td>
                      <td className="px-4 py-3 align-top">
                        <StatusSelect
                          value={q.status}
                          options={QUOTE_STATUS_OPTIONS}
                          styleFor={quoteStatusStyle}
                          size="sm"
                          label="Quote status"
                          onChange={(next) => changeQuoteStatus(q, next)}
                        />
                      </td>
                      <td className="px-4 py-3 align-top whitespace-nowrap text-ink/60">
                        {formatDate(q.quoted_on)}
                      </td>
                      <td className="px-4 py-3 align-top">
                        {job ? (
                          <span className="font-medium text-navy-deep">{job.uid}</span>
                        ) : (
                          <span className="text-ink/40">Not converted</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Jobs ─────────────────────────────────────────────────────────── */}
      <div className="card p-0">
        <h2 className="px-6 pt-6 text-base font-semibold text-navy-deep">
          Jobs <span className="text-ink/40">({jobs.length})</span>
        </h2>

        {jobs.length === 0 ? (
          <EmptyState
            title="No jobs yet"
            hint="A job is created by converting a won quote, or dispatched directly for an urgent run."
          />
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[48rem] text-sm">
              <thead>
                <tr className="border-y border-navy/10 text-left text-xs uppercase tracking-wide text-ink/50">
                  <th scope="col" className="px-6 py-3 font-semibold">Job</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Service</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Pickup</th>
                  <th scope="col" className="px-4 py-3 text-right font-semibold">Miles</th>
                  <th scope="col" className="px-4 py-3 text-right font-semibold">Billed</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((j) => (
                  <tr key={j.id} className="border-b border-navy/5 last:border-0">
                    <td className="px-6 py-3 align-top font-semibold text-navy-deep">{j.uid}</td>
                    <td className="px-4 py-3 align-top">{j.service_code}</td>
                    <td className="px-4 py-3 align-top whitespace-nowrap text-ink/60">
                      {j.pickup_date ? formatDate(j.pickup_date) : "Not scheduled"}
                    </td>
                    <td className="px-4 py-3 text-right align-top tabular-nums">
                      {formatMiles(j.total_miles)}
                    </td>
                    <td className="px-4 py-3 text-right align-top tabular-nums">
                      {j.billed_amount === null ? "—" : formatMoney(j.billed_amount)}
                    </td>
                    <td className="px-4 py-3 align-top">
                      <StatusSelect
                        value={j.delivery_status}
                        options={JOB_STATUS_OPTIONS}
                        styleFor={jobStatusStyle}
                        size="sm"
                        label="Delivery status"
                        onChange={(next) => changeJobStatus(j, next)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Notes: blocked on migration 005 ──────────────────────────────── */}
      <NotesPlaceholder />
    </div>
  );
}

/**
 * NotesThread is not rendered here on purpose.
 *
 * record_notes.subject_kind has a CHECK constraint of ('opportunity','vet-lead'),
 * and NoteSubjectKind is typed to match it, so 'customer' is both a compile
 * error and a runtime constraint violation. A one-line migration 005 adding
 * 'customer' to the constraint (and to NoteSubjectKind) turns this panel into
 * <NotesThread subjectKind="customer" subjectId={customer.uid} />.
 *
 * Rendering a live composer here would let someone type a note, hit send and
 * lose it to a 23514 — worse than not offering it.
 */
function NotesPlaceholder() {
  return (
    <div className="card border-dashed bg-surface/60">
      <h2 className="flex items-center gap-2 text-base font-semibold text-navy-deep">
        <Lock className="h-4 w-4 text-ink/40" aria-hidden />
        Notes
      </h2>
      <p className="mt-1 max-w-2xl break-words text-sm text-ink/60">
        Customer notes are not switched on yet. The shared notes table currently accepts notes on
        opportunities and vet leads only, so a note saved here would be rejected by the database.
        Adding customers to that list is a one-line migration.
      </p>
      <p className="mt-2 text-xs text-ink/45">
        In the meantime, the Notes field in the customer details above is saved on the customer
        record itself.
      </p>
    </div>
  );
}

/* ─────────────────────────────── Small parts ────────────────────────────── */

function DetailField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="mb-1 text-xs font-semibold uppercase tracking-wide text-ink/50">{label}</dt>
      <dd className="min-w-0">{children}</dd>
    </div>
  );
}

function Metric({
  label,
  value,
  hint,
  valueStyle,
}: {
  label: string;
  value: string;
  hint?: string;
  valueStyle?: React.CSSProperties;
}) {
  return (
    <div className="min-w-0">
      <p className="text-xs font-semibold uppercase tracking-wide text-ink/50">{label}</p>
      <p className="mt-1 text-xl font-bold tabular-nums text-navy-deep" style={valueStyle}>
        {value}
      </p>
      {hint && <p className="mt-0.5 break-words text-xs text-ink/45">{hint}</p>}
    </div>
  );
}

/**
 * Read-only text that becomes an input when clicked. Enter saves, Escape
 * cancels; blur saves too, because on a phone there is no Enter key in view.
 */
function InlineText({
  value,
  label,
  placeholder = "Not set",
  required,
  multiline,
  onSave,
  className,
}: {
  value: string | null;
  label: string;
  placeholder?: string;
  required?: boolean;
  multiline?: boolean;
  onSave: (next: string | null) => Promise<boolean>;
  className?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value ?? "");
  const [busy, setBusy] = useState(false);

  function begin() {
    setDraft(value ?? "");
    setEditing(true);
  }

  async function commit() {
    const trimmed = draft.trim();

    // Nothing changed, or a required field was emptied — just close.
    if (trimmed === (value ?? "") || (required && trimmed === "")) {
      setEditing(false);
      return;
    }

    setBusy(true);
    await onSave(trimmed === "" ? null : trimmed);
    setBusy(false);
    setEditing(false);
  }

  if (!editing) {
    return (
      <button
        type="button"
        onClick={begin}
        className={cn(
          "group flex w-full items-start gap-1.5 rounded-lg text-left hover:bg-surface",
          className ?? "text-sm text-ink/80"
        )}
        aria-label={`Edit ${label}`}
      >
        <span className={cn("min-w-0 break-words", !value && "text-ink/40")}>
          {value || placeholder}
        </span>
        <Pencil
          className="mt-1 h-3 w-3 shrink-0 opacity-0 transition-opacity group-hover:opacity-50"
          aria-hidden
        />
      </button>
    );
  }

  // Shared between the input and the textarea branch below.
  const fieldClass = "w-full resize-y rounded-xl border border-navy/25 px-2 py-1.5 text-sm";

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") {
      setEditing(false);
      return;
    }
    // Enter submits a single-line field; in a textarea it should make a line.
    if (e.key === "Enter" && !multiline) {
      e.preventDefault();
      void commit();
    }
  }

  return (
    <div className="flex items-start gap-1.5">
      {multiline ? (
        <textarea
          rows={3}
          value={draft}
          autoFocus
          disabled={busy}
          aria-label={label}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={() => void commit()}
          onKeyDown={onKeyDown}
          className={fieldClass}
        />
      ) : (
        <input
          type="text"
          value={draft}
          autoFocus
          disabled={busy}
          aria-label={label}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={() => void commit()}
          onKeyDown={onKeyDown}
          className={fieldClass}
        />
      )}
      <span className="mt-1.5 shrink-0">
        {busy ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin text-ink/40" aria-hidden />
        ) : (
          <Check className="h-3.5 w-3.5 text-ink/30" aria-hidden />
        )}
      </span>
    </div>
  );
}
