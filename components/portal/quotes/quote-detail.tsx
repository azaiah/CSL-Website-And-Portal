"use client";

/**
 * components/portal/quotes/quote-detail.tsx
 * ---------------------------------------------------------------------------
 * One quote, exactly as it was priced.
 *
 * Nothing on this page is recalculated. The line items, subtotal, adjustment
 * and total are read straight off the row, and the rate card that produced
 * them is shown underneath. That is what rate_snapshot is FOR: a quote sent in
 * October must still read October's price after November's rate change, or the
 * number CSL honours and the number the portal shows drift apart.
 * ---------------------------------------------------------------------------
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRightLeft,
  Check,
  Loader2,
  Lock,
  Printer,
  Snowflake,
  Moon,
} from "lucide-react";
import { cn, formatDate } from "@/lib/utils";
import { todayISO } from "@/lib/health";
import {
  getQuote,
  getCustomer,
  listJobs,
  createJob,
  updateQuote,
  setQuoteStatus,
} from "@/lib/quotes/queries";
import type { Customer, Job, Quote, QuoteStatus } from "@/lib/quotes/types";
import { QUOTE_STATUS_OPTIONS, quoteStatusStyle } from "@/lib/status-options";
import { formatMoney } from "@/lib/quotes/format";
import { StatusSelect } from "./status-select";
import {
  ErrorBanner,
  LoadingPanel,
  NotConnectedPanel,
  EmptyState,
  isNotConnected,
} from "@/components/portal/data-states";

const DECIDED: QuoteStatus[] = ["Won", "Lost"];

export function QuoteDetail({ quoteId }: { quoteId: string }) {
  const [today, setToday] = useState<string | null>(null);
  useEffect(() => setToday(todayISO()), []);

  const [quote, setQuote] = useState<Quote | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [converting, setConverting] = useState(false);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);

    const quoteRes = await getQuote(quoteId);
    if (quoteRes.error || !quoteRes.data) {
      setError(quoteRes.error?.message ?? "Quote not found.");
      setLoading(false);
      return;
    }
    const q = quoteRes.data;
    setQuote(q);

    // The customer and any existing job both hang off the quote, so they are
    // only fetchable once the quote itself has come back.
    const [customerRes, jobsRes] = await Promise.all([
      getCustomer(q.customer_id),
      listJobs({ customerId: q.customer_id }),
    ]);

    if (customerRes.error || jobsRes.error) {
      setError((customerRes.error || jobsRes.error)!.message);
      setLoading(false);
      return;
    }

    setCustomer(customerRes.data);
    setJob((jobsRes.data ?? []).find((j) => j.quote_id === q.id) ?? null);
    setLoading(false);
  }, [quoteId]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const changeStatus = useCallback(
    async (next: QuoteStatus) => {
      if (!quote) return false;
      const previous = quote;
      const decidedOn = DECIDED.includes(next) ? today ?? todayISO() : null;

      setQuote({ ...quote, status: next, decided_on: decidedOn });

      const { data, error: writeError } = await setQuoteStatus(quote.id, next, decidedOn);
      if (writeError || !data) {
        setQuote(previous);
        setError(writeError?.message ?? "Could not update the status.");
        return false;
      }
      setQuote(data);
      return true;
    },
    [quote, today]
  );

  const saveNotes = useCallback(
    async (notes: string | null) => {
      if (!quote) return false;
      const previous = quote;
      setQuote({ ...quote, notes });

      const { data, error: writeError } = await updateQuote(quote.id, { notes });
      if (writeError || !data) {
        setQuote(previous);
        setError(writeError?.message ?? "Could not save the note.");
        return false;
      }
      setQuote(data);
      return true;
    },
    [quote]
  );

  /**
   * Turn an accepted quote into an operational record.
   *
   * Deliberately a button and not a side effect of setting the status to Won:
   * an accidental tap on a dropdown should not create a job that dispatch then
   * has to notice and delete.
   */
  const convertToJob = useCallback(async () => {
    if (!quote || job) return;

    setConverting(true);
    const { data, error: writeError } = await createJob({
      customer_id: quote.customer_id,
      quote_id: quote.id,
      service_code: quote.service_code,
      // The quote's route mileage is one way; the job's total_miles is what
      // was actually driven, so this is a starting value dispatch will correct
      // from the odometer.
      total_miles: quote.route_miles,
      billed_amount: quote.total,
      delivery_status: "Scheduled",
    });

    if (writeError || !data) {
      setConverting(false);
      setError(writeError?.message ?? "Could not create the job.");
      return;
    }

    setJob(data);

    // Winning the quote is implied by converting it, so stamp that too — but
    // only if it is not already decided, so a Lost quote is not silently won.
    if (quote.status !== "Won") await changeStatus("Won");

    setConverting(false);
  }, [quote, job, changeStatus]);

  const snapshotRate = quote?.rate_snapshot.rate ?? null;

  /** Won but never converted — the gap the client's paper process loses runs in. */
  const needsConversion = useMemo(
    () => Boolean(quote && quote.status === "Won" && !job),
    [quote, job]
  );

  if (isNotConnected(error)) {
    return <NotConnectedPanel message={error!} what="Quote database" />;
  }

  if (loading || !today) return <LoadingPanel label="Loading quote…" />;

  if (!quote) {
    return (
      <div className="card">
        <EmptyState title="Quote not found" hint={error ?? "The link may be wrong."} />
        <div className="text-center">
          <Link href="/portal/quotes" className="btn-ghost text-sm">
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Back to quotes
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/portal/quotes"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-navy hover:text-[#8a6c1f]"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          All quotes
        </Link>

        <div className="flex flex-wrap items-center gap-3">
          <a
            href={`/portal/print/quote/${quote.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-ghost text-sm"
          >
            <Printer className="h-4 w-4" aria-hidden />
            Print
          </a>

          {job ? (
            /* Links straight through to the run now that /portal/jobs/[id]
               exists — converting and then having to hunt for the job was the
               one rough edge left in this flow. */
            <Link
              href={`/portal/jobs/${job.id}`}
              className="inline-flex items-center gap-2 rounded-xl border border-success/40 bg-success/10 px-3 py-2 text-sm font-semibold text-success hover:bg-success/20"
            >
              <Check className="h-4 w-4" aria-hidden />
              Converted — {job.uid}
            </Link>
          ) : (
            <button
              onClick={() => void convertToJob()}
              disabled={converting}
              className="btn-navy text-sm"
            >
              {converting ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              ) : (
                <ArrowRightLeft className="h-4 w-4" aria-hidden />
              )}
              Convert to job
            </button>
          )}
        </div>
      </div>

      {error && !isNotConnected(error) && (
        <ErrorBanner
          title="Something did not save"
          message={error}
          onDismiss={() => setError(null)}
        />
      )}

      {/* Won but not converted — nudge, never automate. */}
      {needsConversion && (
        <div className="rounded-2xl border border-gold/40 bg-gold/10 p-4">
          <p className="break-words text-sm text-[#8a6c1f]">
            <strong className="font-semibold">This quote is won but has no job.</strong> Convert it
            so the run is scheduled and its revenue reaches the P&amp;L. Nothing is created
            automatically — a won quote with no job stays invisible to dispatch until someone makes
            it real.
          </p>
        </div>
      )}

      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div className="card">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8a6c1f]">
              {quote.uid}
            </p>
            <h1 className="mt-1 break-words text-2xl font-semibold text-navy-deep">
              {customer ? (
                <Link href={`/portal/customers/${customer.id}`} className="hover:underline">
                  {customer.name}
                </Link>
              ) : (
                "Unknown customer"
              )}
            </h1>
            <p className="mt-1 text-sm text-ink/60">
              {quote.service_code} · quoted {formatDate(quote.quoted_on)}
              {quote.decided_on && ` · decided ${formatDate(quote.decided_on)}`}
            </p>
          </div>

          <div className="flex flex-col items-end gap-2">
            <StatusSelect
              value={quote.status}
              options={QUOTE_STATUS_OPTIONS}
              styleFor={quoteStatusStyle}
              label="Quote status"
              onChange={changeStatus}
            />
            <p className="text-3xl font-bold tabular-nums text-navy-deep">
              {formatMoney(quote.total)}
            </p>
          </div>
        </div>

        {/* The inputs, as they were entered. */}
        <dl className="mt-6 grid gap-4 border-t border-navy/10 pt-5 sm:grid-cols-3 lg:grid-cols-5">
          <Fact label="Stops" value={String(quote.stops)} />
          <Fact label="Route mileage" value={`${quote.route_miles} mi`} />
          <Fact label="Extra miles" value={`${quote.extra_miles} mi`} />
          <Fact label="Wait time" value={`${quote.wait_minutes} min`} />
          <Fact label="Tolls & parking" value={formatMoney(quote.tolls_parking)} />
        </dl>

        {(quote.cold_chain || quote.off_hours) && (
          <div className="mt-4 flex flex-wrap gap-2">
            {quote.cold_chain && (
              <Tag icon={Snowflake} label="Cold-chain / temperature controlled" />
            )}
            {quote.off_hours && <Tag icon={Moon} label="Off-hours, weekend or holiday" />}
          </div>
        )}
      </div>

      {/* ── Stored breakdown ─────────────────────────────────────────────── */}
      <div className="card p-0">
        <div className="px-6 pt-6">
          <h2 className="text-base font-semibold text-navy-deep">Detailed cost breakdown</h2>
          <p className="mt-1 break-words text-xs text-ink/50">
            Read from the quote as it was saved. Not recalculated — that is the point of freezing
            the rates.
          </p>
        </div>

        <table className="mt-4 w-full text-sm">
          <thead>
            <tr className="border-y border-navy/10 text-left text-xs uppercase tracking-wide text-ink/50">
              <th scope="col" className="px-6 py-2 font-semibold">Component</th>
              <th scope="col" className="px-3 py-2 font-semibold">Basis</th>
              <th scope="col" className="px-6 py-2 text-right font-semibold">Amount</th>
            </tr>
          </thead>
          <tbody>
            {quote.line_items.map((li) => (
              <tr key={li.key} className="border-b border-navy/5 last:border-0">
                <td className="break-words px-6 py-2 align-top font-medium text-navy-deep">
                  {li.label}
                </td>
                <td className="break-words px-3 py-2 align-top text-xs text-ink/55">{li.basis}</td>
                <td
                  className={cn(
                    "px-6 py-2 text-right align-top tabular-nums",
                    li.amount === 0 && "text-ink/35"
                  )}
                >
                  {formatMoney(li.amount)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-navy/15">
              <td colSpan={2} className="px-6 py-3 font-semibold text-navy-deep">
                Total
              </td>
              <td className="px-6 py-3 text-right text-base font-bold tabular-nums text-navy-deep">
                {formatMoney(quote.total)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* ── The frozen rate card ─────────────────────────────────────────── */}
      {snapshotRate && (
        <div className="card">
          <h2 className="flex items-center gap-2 text-base font-semibold text-navy-deep">
            <Lock className="h-4 w-4 text-ink/40" aria-hidden />
            Rates used
          </h2>
          <p className="mt-1 max-w-2xl break-words text-xs text-ink/50">
            The rate card in force when this quote was priced, stored on the quote itself. Changing
            these rates in Settings affects new quotes only — this one will always read{" "}
            {formatMoney(quote.total)}.
          </p>

          <dl className="mt-4 grid gap-4 sm:grid-cols-3 lg:grid-cols-4">
            <Fact label="Service" value={`${snapshotRate.service_code} — ${snapshotRate.service_name}`} />
            <Fact label="Base pickup fee" value={formatMoney(snapshotRate.base_pickup_fee)} />
            <Fact label="Per mile" value={formatMoney(snapshotRate.per_mile_rate)} />
            <Fact label="Per extra stop" value={formatMoney(snapshotRate.per_stop_fee)} />
          </dl>

          <dl className="mt-4 grid gap-3 border-t border-navy/10 pt-4 sm:grid-cols-2 lg:grid-cols-3">
            {Object.entries(quote.rate_snapshot.settings)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([key, value]) => (
                <div key={key} className="min-w-0">
                  <dt className="break-words text-xs text-ink/50">{key}</dt>
                  <dd className="text-sm font-medium tabular-nums text-navy-deep">{value}</dd>
                </div>
              ))}
          </dl>
        </div>
      )}

      {/* ── Notes ────────────────────────────────────────────────────────── */}
      <QuoteNotes notes={quote.notes} onSave={saveNotes} />
    </div>
  );
}

/* ─────────────────────────────── Small parts ────────────────────────────── */

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs font-semibold uppercase tracking-wide text-ink/50">{label}</dt>
      <dd className="mt-0.5 break-words text-sm font-medium text-navy-deep">{value}</dd>
    </div>
  );
}

function Tag({ icon: Icon, label }: { icon: typeof Snowflake; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-navy/10 px-3 py-1 text-xs font-semibold text-navy">
      <Icon className="h-3.5 w-3.5" aria-hidden />
      {label}
    </span>
  );
}

/**
 * The quote's own notes column, not the shared notes thread.
 *
 * record_notes.subject_kind is constrained to ('opportunity','vet-lead'), so a
 * threaded note against a quote would be rejected by Postgres. This is the
 * quote's notes field, which is where the client's sheet kept them anyway.
 */
function QuoteNotes({
  notes,
  onSave,
}: {
  notes: string | null;
  onSave: (next: string | null) => Promise<boolean>;
}) {
  const [draft, setDraft] = useState(notes ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Follow the row when it is replaced by a server response.
  useEffect(() => setDraft(notes ?? ""), [notes]);

  const dirty = draft.trim() !== (notes ?? "");

  async function save() {
    setSaving(true);
    const ok = await onSave(draft.trim() === "" ? null : draft.trim());
    setSaving(false);
    if (ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 1800);
    }
  }

  return (
    <div className="card">
      <h2 className="text-base font-semibold text-navy-deep">Notes</h2>
      <p className="mt-1 text-xs text-ink/50">
        Why this price. Anything that would otherwise have to be remembered.
      </p>

      <textarea
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        rows={3}
        aria-label="Quote notes"
        placeholder="Matched a competitor at 10% under, agreed with Maria on the phone."
        className="mt-3 w-full resize-y rounded-xl border border-navy/15 px-3 py-2 text-sm"
      />

      <div className="mt-2 flex items-center justify-end gap-3">
        {saved && <span className="text-xs font-medium text-success">Saved</span>}
        <button
          type="button"
          onClick={() => void save()}
          disabled={!dirty || saving}
          className="btn-navy text-sm disabled:opacity-40"
        >
          {saving && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
          Save note
        </button>
      </div>
    </div>
  );
}
