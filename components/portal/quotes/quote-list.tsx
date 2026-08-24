"use client";

/**
 * components/portal/quotes/quote-list.tsx
 * ---------------------------------------------------------------------------
 * Every quote, with the three numbers the client actually asks about at the
 * top: what is still out there, what has been won, and how often he wins.
 *
 * The chips are computed from the loaded rows rather than from a view, because
 * they have to answer for the FILTERED set — "win rate for VCU Health in Q2"
 * is the question, and a view would only ever answer it for everything.
 * ---------------------------------------------------------------------------
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Plus, Calculator } from "lucide-react";
import { cn, formatDate } from "@/lib/utils";
import { todayISO } from "@/lib/health";
import {
  listQuotes,
  listCustomers,
  listJobs,
  listServiceRates,
  listRateSettings,
  createQuote,
  setQuoteStatus,
} from "@/lib/quotes/queries";
import type {
  Customer,
  Job,
  Quote,
  QuoteStatus,
  RateSetting,
  ServiceRate,
} from "@/lib/quotes/types";
import { QUOTE_STATUSES, QUOTE_STATUS_OPTIONS, quoteStatusStyle } from "@/lib/status-options";
import { formatMoney, formatPercent } from "@/lib/quotes/format";
import { StatusSelect } from "./status-select";
import { QuoteEstimator, type QuoteDraft } from "./quote-estimator";
import {
  ErrorBanner,
  LoadingPanel,
  NotConnectedPanel,
  EmptyState,
  isNotConnected,
} from "@/components/portal/data-states";

/** Outcomes that count as still in play for the pipeline figure. */
const OPEN_STATUSES: QuoteStatus[] = ["Draft", "Sent", "Pending"];

/** Outcomes that count as decided, so a win rate has a denominator. */
const DECIDED_STATUSES: QuoteStatus[] = ["Won", "Lost"];

export function QuoteList() {
  const [today, setToday] = useState<string | null>(null);
  useEffect(() => setToday(todayISO()), []);

  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [rates, setRates] = useState<ServiceRate[]>([]);
  const [settings, setSettings] = useState<RateSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [statusFilter, setStatusFilter] = useState<"all" | QuoteStatus>("all");
  const [customerFilter, setCustomerFilter] = useState("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [estimatorOpen, setEstimatorOpen] = useState(false);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);

    const [quotesRes, customersRes, jobsRes, ratesRes, settingsRes] = await Promise.all([
      listQuotes(),
      listCustomers(true),
      listJobs(),
      listServiceRates(),
      listRateSettings(),
    ]);

    const firstError =
      quotesRes.error ||
      customersRes.error ||
      jobsRes.error ||
      ratesRes.error ||
      settingsRes.error;
    if (firstError) {
      setError(firstError.message);
      setLoading(false);
      return;
    }

    setQuotes(quotesRes.data ?? []);
    setCustomers(customersRes.data ?? []);
    setJobs(jobsRes.data ?? []);
    setRates(ratesRes.data ?? []);
    setSettings(settingsRes.data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const customerById = useMemo(() => {
    const m = new Map<string, Customer>();
    for (const c of customers) m.set(c.id, c);
    return m;
  }, [customers]);

  /** quote_id -> job. There is a partial unique index, so at most one each. */
  const jobByQuoteId = useMemo(() => {
    const m = new Map<string, Job>();
    for (const j of jobs) if (j.quote_id) m.set(j.quote_id, j);
    return m;
  }, [jobs]);

  const visible = useMemo(() => {
    return quotes.filter((q) => {
      if (statusFilter !== "all" && q.status !== statusFilter) return false;
      if (customerFilter !== "all" && q.customer_id !== customerFilter) return false;
      if (from !== "" && q.quoted_on < from) return false;
      if (to !== "" && q.quoted_on > to) return false;
      return true;
    });
  }, [quotes, statusFilter, customerFilter, from, to]);

  /** The three summary chips, over the filtered rows. */
  const totals = useMemo(() => {
    let openValue = 0;
    let wonValue = 0;
    let won = 0;
    let decided = 0;

    for (const q of visible) {
      if (OPEN_STATUSES.includes(q.status)) openValue += q.total;
      if (q.status === "Won") {
        wonValue += q.total;
        won += 1;
      }
      if (DECIDED_STATUSES.includes(q.status)) decided += 1;
    }

    return {
      openValue,
      wonValue,
      // Null rather than 0 while nothing is decided — 0% would read as "we
      // never win" when the truth is "nothing has been answered yet".
      winRate: decided === 0 ? null : (won / decided) * 100,
      decided,
    };
  }, [visible]);

  const changeStatus = useCallback(
    async (quote: Quote, next: QuoteStatus) => {
      const previous = quote;
      const decidedOn = DECIDED_STATUSES.includes(next) ? today ?? todayISO() : null;

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

  /**
   * The save path from the estimator. Inputs, the frozen rate snapshot, the
   * line items and the totals all go into one row — reading a quote back never
   * recomputes anything.
   */
  const handleSaveQuote = useCallback(
    async (draft: QuoteDraft) => {
      const { data, error: writeError } = await createQuote({
        customer_id: draft.customerId,
        ...draft.inputs,
        rate_snapshot: draft.snapshot,
        line_items: draft.computation.lineItems,
        service_subtotal: draft.computation.serviceSubtotal,
        adjustment_amount: draft.computation.adjustmentAmount,
        total: draft.computation.total,
        status: "Draft",
        quoted_on: draft.quotedOn,
        notes: draft.notes,
      });

      if (writeError || !data) {
        setError(writeError?.message ?? "Could not save the quote.");
        return null;
      }
      setQuotes((prev) => [data, ...prev]);
      return data;
    },
    []
  );

  if (isNotConnected(error)) {
    return <NotConnectedPanel message={error!} what="Quote database" />;
  }

  return (
    <div className="space-y-6">
      {/* Summary chips */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Chip
          label="Open pipeline"
          value={formatMoney(totals.openValue)}
          hint="Draft, sent and pending"
        />
        <Chip label="Won value" value={formatMoney(totals.wonValue)} hint="Quoted, not billed" />
        <Chip
          label="Win rate"
          value={formatPercent(totals.winRate)}
          hint={
            totals.decided === 0
              ? "Nothing decided yet"
              : `Of ${totals.decided} decided quote${totals.decided === 1 ? "" : "s"}`
          }
        />
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as "all" | QuoteStatus)}
            aria-label="Filter by status"
            className="rounded-xl border border-navy/15 bg-white px-3 py-2 text-sm"
          >
            <option value="all">All statuses</option>
            {QUOTE_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          <select
            value={customerFilter}
            onChange={(e) => setCustomerFilter(e.target.value)}
            aria-label="Filter by customer"
            className="min-w-0 flex-1 rounded-xl border border-navy/15 bg-white px-3 py-2 text-sm lg:max-w-xs"
          >
            <option value="all">All customers</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <div className="flex flex-wrap items-center gap-2">
            <input
              type="date"
              value={from}
              max={to || undefined}
              onChange={(e) => setFrom(e.target.value)}
              aria-label="Quoted from"
              className="rounded-xl border border-navy/15 px-3 py-2 text-sm"
            />
            <span className="text-ink/50">to</span>
            <input
              type="date"
              value={to}
              min={from || undefined}
              onChange={(e) => setTo(e.target.value)}
              aria-label="Quoted to"
              className="rounded-xl border border-navy/15 px-3 py-2 text-sm"
            />
          </div>

          <button
            onClick={() => setEstimatorOpen(true)}
            className="btn-navy text-sm lg:ml-auto"
          >
            <Plus className="h-4 w-4" aria-hidden />
            New quote
          </button>
        </div>
      </div>

      {error && !isNotConnected(error) && (
        <ErrorBanner
          title="Could not load quotes"
          message={error}
          onDismiss={() => setError(null)}
        />
      )}

      {loading || !today ? (
        <LoadingPanel label="Loading quotes…" />
      ) : visible.length === 0 ? (
        <div className="card">
          <EmptyState
            title={quotes.length === 0 ? "No quotes yet" : "No quotes match those filters"}
            hint={
              quotes.length === 0
                ? "Build the first one — the estimator prices it from the live rate card and freezes those rates onto the quote."
                : "Try widening the date range or clearing the status filter."
            }
          />
        </div>
      ) : (
        <div className="card overflow-x-auto p-0">
          <table className="w-full min-w-[52rem] text-sm">
            <thead>
              <tr className="border-b border-navy/10 text-left text-xs uppercase tracking-wide text-ink/50">
                <th scope="col" className="px-4 py-3 font-semibold">UID</th>
                <th scope="col" className="px-4 py-3 font-semibold">Customer</th>
                <th scope="col" className="px-4 py-3 font-semibold">Service</th>
                <th scope="col" className="px-4 py-3 text-right font-semibold">Total</th>
                <th scope="col" className="px-4 py-3 font-semibold">Status</th>
                <th scope="col" className="px-4 py-3 font-semibold">Quoted on</th>
                <th scope="col" className="px-4 py-3 font-semibold">Job</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((q) => {
                const customer = customerById.get(q.customer_id);
                const job = jobByQuoteId.get(q.id);
                return (
                  <tr
                    key={q.id}
                    className="border-b border-navy/5 transition-colors last:border-0 hover:bg-surface"
                  >
                    <td className="px-4 py-3 align-top">
                      <Link
                        href={`/portal/quotes/${q.id}`}
                        className="font-semibold text-navy hover:text-[#8a6c1f] hover:underline"
                      >
                        {q.uid}
                      </Link>
                    </td>
                    <td className="px-4 py-3 align-top">
                      {customer ? (
                        <Link
                          href={`/portal/customers/${customer.id}`}
                          className="block break-words font-medium text-navy-deep hover:underline"
                        >
                          {customer.name}
                        </Link>
                      ) : (
                        <span className="text-ink/40">Unknown</span>
                      )}
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
                        onChange={(next) => changeStatus(q, next)}
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

      <p className="flex items-center gap-2 text-xs text-ink/50">
        <Calculator className="h-3.5 w-3.5" aria-hidden />
        Each quote stores the rate card it was priced with, so changing a rate never reprices a
        quote that has already gone out.
      </p>

      <QuoteEstimator
        open={estimatorOpen}
        onClose={() => setEstimatorOpen(false)}
        customers={customers.filter((c) => !c.is_archived)}
        rates={rates}
        settings={settings}
        onSave={handleSaveQuote}
      />
    </div>
  );
}

function Chip({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className={cn("card")}>
      <p className="text-xs font-semibold uppercase tracking-wide text-ink/50">{label}</p>
      <p className="mt-1 text-2xl font-bold tabular-nums text-navy-deep">{value}</p>
      <p className="mt-0.5 break-words text-xs text-ink/45">{hint}</p>
    </div>
  );
}
