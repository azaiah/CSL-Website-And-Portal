"use client";

/**
 * components/portal/customers/customer-directory.tsx
 * ---------------------------------------------------------------------------
 * The client's "Customer Repository", minus the route ledger.
 *
 * His first column is "Customer UID" holding RT-2026-001 — a ROUTE id. So his
 * repository is really a route log with the customer re-typed on every row.
 * Here the customer is stored once and the numbers beside it are read from the
 * customer_summary view, which counts the quotes and jobs rather than asking
 * anyone to keep a running total by hand.
 * ---------------------------------------------------------------------------
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Users, Plus, Search, Archive } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils";
import {
  listCustomers,
  createCustomer,
  getCustomerSummary,
  listLookupValues,
} from "@/lib/quotes/queries";
import type { Customer, CustomerSummary, LookupValue } from "@/lib/quotes/types";
import { formatMoney, marginStyle, formatPercent } from "@/lib/quotes/format";
import {
  ErrorBanner,
  LoadingPanel,
  NotConnectedPanel,
  EmptyState,
  isNotConnected,
} from "@/components/portal/data-states";
import { CustomerForm, type CustomerDraft } from "./customer-form";

export function CustomerDirectory() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [summaries, setSummaries] = useState<CustomerSummary[]>([]);
  const [deliveryTypes, setDeliveryTypes] = useState<LookupValue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [showArchived, setShowArchived] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);

    const [customersRes, summaryRes, lookupRes] = await Promise.all([
      listCustomers(true), // load archived too; hiding is a client-side filter
      getCustomerSummary(),
      listLookupValues("delivery_type"),
    ]);

    const firstError = customersRes.error || summaryRes.error || lookupRes.error;
    if (firstError) {
      setError(firstError.message);
      setLoading(false);
      return;
    }

    setCustomers(customersRes.data ?? []);
    setSummaries(summaryRes.data ?? []);
    setDeliveryTypes(lookupRes.data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  /** customer_id -> rollup, so a row can show its numbers without a join. */
  const summaryById = useMemo(() => {
    const m = new Map<string, CustomerSummary>();
    for (const s of summaries) m.set(s.customer_id, s);
    return m;
  }, [summaries]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();

    return customers.filter((c) => {
      if (!showArchived && c.is_archived) return false;
      if (typeFilter !== "all" && c.delivery_type !== typeFilter) return false;
      if (q === "") return true;

      // Search covers the three things someone actually looks a customer up by.
      return (
        c.name.toLowerCase().includes(q) ||
        (c.email ?? "").toLowerCase().includes(q) ||
        (c.phone ?? "").toLowerCase().includes(q) ||
        c.uid.toLowerCase().includes(q)
      );
    });
  }, [customers, search, typeFilter, showArchived]);

  const handleCreate = useCallback(
    async (draft: CustomerDraft) => {
      const { data, error: writeError } = await createCustomer(draft);
      if (writeError || !data) {
        setError(writeError?.message ?? "Could not create the customer.");
        return false;
      }
      // uid is a sequence default, so the real row is the only source of it —
      // no optimistic insert here, because we cannot invent the UID.
      setCustomers((prev) => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
      return true;
    },
    []
  );

  if (isNotConnected(error)) {
    return <NotConnectedPanel message={error!} what="Customer database" />;
  }

  const archivedCount = customers.filter((c) => c.is_archived).length;

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="card">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/40"
              aria-hidden
            />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, email, phone or UID"
              aria-label="Search customers"
              className="w-full rounded-xl border border-navy/15 py-2 pl-9 pr-3 text-sm"
            />
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            aria-label="Filter by delivery type"
            className="rounded-xl border border-navy/15 bg-white px-3 py-2 text-sm"
          >
            <option value="all">All delivery types</option>
            {deliveryTypes.map((d) => (
              <option key={d.id} value={d.value}>
                {d.label}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => setShowArchived((v) => !v)}
            className={cn(
              "inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition-colors",
              showArchived
                ? "border-navy/30 bg-navy/10 text-navy-deep"
                : "border-navy/15 bg-white text-ink/60 hover:text-navy-deep"
            )}
            aria-pressed={showArchived}
          >
            <Archive className="h-4 w-4" aria-hidden />
            Archived
            {archivedCount > 0 && (
              <span className="rounded-full bg-navy/10 px-1.5 text-xs">{archivedCount}</span>
            )}
          </button>

          <button onClick={() => setDrawerOpen(true)} className="btn-navy text-sm">
            <Plus className="h-4 w-4" aria-hidden />
            New customer
          </button>
        </div>
      </div>

      {error && !isNotConnected(error) && (
        <ErrorBanner
          title="Could not load customers"
          message={error}
          onDismiss={() => setError(null)}
        />
      )}

      {loading ? (
        <LoadingPanel label="Loading customers…" />
      ) : visible.length === 0 ? (
        <div className="card">
          <EmptyState
            title={customers.length === 0 ? "No customers yet" : "No customers match those filters"}
            hint={
              customers.length === 0
                ? "Add the first one and every quote and job can reference it instead of re-typing the details."
                : "Try clearing the search or the delivery-type filter."
            }
          />
        </div>
      ) : (
        <div className="card overflow-x-auto p-0">
          <table className="w-full min-w-[64rem] text-sm">
            <thead>
              <tr className="border-b border-navy/10 text-left text-xs uppercase tracking-wide text-ink/50">
                <Th>UID</Th>
                <Th>Name</Th>
                <Th>Phone</Th>
                <Th align="right">Quotes</Th>
                <Th align="right">Win rate</Th>
                <Th align="right">Jobs done</Th>
                <Th align="right">Revenue</Th>
                <Th align="right">Cost to CSL</Th>
                <Th align="right">Job margin</Th>
                <Th>Last job</Th>
              </tr>
            </thead>
            <tbody>
              {visible.map((c) => {
                const s = summaryById.get(c.id);
                return (
                  <tr
                    key={c.id}
                    className="border-b border-navy/5 transition-colors last:border-0 hover:bg-surface"
                  >
                    <Td>
                      <Link
                        href={`/portal/customers/${c.id}`}
                        className="font-semibold text-navy hover:text-[#8a6c1f] hover:underline"
                      >
                        {c.uid}
                      </Link>
                    </Td>
                    <Td>
                      <Link
                        href={`/portal/customers/${c.id}`}
                        className="block break-words font-medium text-navy-deep hover:underline"
                      >
                        {c.name}
                      </Link>
                      <span className="mt-0.5 block break-words text-xs text-ink/50">
                        {c.delivery_type ?? "No delivery type"}
                        {c.is_archived && " · Archived"}
                      </span>
                    </Td>
                    <Td>
                      <span className="break-words text-ink/70">{c.phone ?? "—"}</span>
                    </Td>
                    <Td align="right">
                      {s ? (
                        <span className="tabular-nums">
                          {s.quotes_won}/{s.quotes_total}
                        </span>
                      ) : (
                        "—"
                      )}
                    </Td>
                    <Td align="right">
                      <span className="tabular-nums">{formatPercent(s?.win_rate_pct ?? null)}</span>
                    </Td>
                    <Td align="right">
                      <span className="tabular-nums">{s ? s.jobs_delivered : "—"}</span>
                    </Td>
                    <Td align="right">
                      <span className="tabular-nums">{s ? formatMoney(s.revenue) : "—"}</span>
                    </Td>
                    <Td align="right">
                      <span className="tabular-nums">{s ? formatMoney(s.cost_to_csl) : "—"}</span>
                    </Td>
                    <Td align="right">
                      {s ? (
                        <span className="font-semibold tabular-nums" style={marginStyle(s.job_margin)}>
                          {formatMoney(s.job_margin)}
                        </span>
                      ) : (
                        "—"
                      )}
                    </Td>
                    <Td>
                      <span className="whitespace-nowrap text-ink/60">
                        {s?.last_job_date ? formatDate(s.last_job_date) : "—"}
                      </span>
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <p className="flex items-center gap-2 text-xs text-ink/50">
        <Users className="h-3.5 w-3.5" aria-hidden />
        Revenue, cost and margin come from the customer_summary view — they are counted from the
        jobs, never typed.
      </p>

      <CustomerForm
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        customer={null}
        deliveryTypes={deliveryTypes}
        onSubmit={handleCreate}
      />
    </div>
  );
}

function Th({
  children,
  align = "left",
}: {
  children: React.ReactNode;
  align?: "left" | "right";
}) {
  return (
    <th
      scope="col"
      className={cn("px-4 py-3 font-semibold", align === "right" && "text-right")}
    >
      {children}
    </th>
  );
}

function Td({
  children,
  align = "left",
}: {
  children: React.ReactNode;
  align?: "left" | "right";
}) {
  return (
    <td className={cn("px-4 py-3 align-top", align === "right" && "text-right")}>{children}</td>
  );
}
