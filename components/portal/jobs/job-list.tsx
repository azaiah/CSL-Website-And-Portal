"use client";

/**
 * components/portal/jobs/job-list.tsx
 * ---------------------------------------------------------------------------
 * The client's CLIENT REPOSITORY tab, rebuilt as something you can work from.
 *
 * His sheet is 54 columns wide, so finding one run means scrolling sideways
 * past every field that has ever been needed for any run. This shows the eight
 * that answer "what happened and did it pay" — the rest live on the job's own
 * page, grouped the way his Route Dispatch Form groups them.
 *
 * Job margin comes from the job_financials view rather than being recomputed
 * here. Fuel is a generated column and attributed cost is a subquery over
 * finance_entries; recomputing either in the browser would be a second
 * implementation to keep in step.
 * ---------------------------------------------------------------------------
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Truck } from "lucide-react";
import { formatDate } from "@/lib/utils";
import {
  listJobs,
  listCustomers,
  listServiceRates,
  getJobFinancials,
  setJobStatus,
} from "@/lib/quotes/queries";
import type {
  Customer,
  Job,
  JobFinancials,
  JobStatus,
  ServiceCode,
  ServiceRate,
} from "@/lib/quotes/types";
import { JOB_STATUSES, JOB_STATUS_OPTIONS, jobStatusStyle } from "@/lib/status-options";
import { formatMoney, formatMiles, marginStyle } from "@/lib/quotes/format";
import { StatusSelect } from "@/components/portal/quotes/status-select";
import {
  ErrorBanner,
  LoadingPanel,
  NotConnectedPanel,
  EmptyState,
  isNotConnected,
} from "@/components/portal/data-states";

export function JobList() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [financials, setFinancials] = useState<JobFinancials[]>([]);
  /* The service filter is built from the live rate card rather than a hardcoded
     list, so adding a service level in Settings shows up here for free. */
  const [rates, setRates] = useState<ServiceRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [statusFilter, setStatusFilter] = useState<"all" | JobStatus>("all");
  const [customerFilter, setCustomerFilter] = useState("all");
  const [serviceFilter, setServiceFilter] = useState<"all" | ServiceCode>("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);

    const [jobsRes, customersRes, finRes, ratesRes] = await Promise.all([
      listJobs(),
      listCustomers(true),
      getJobFinancials(),
      listServiceRates(),
    ]);

    const firstError =
      jobsRes.error || customersRes.error || finRes.error || ratesRes.error;
    if (firstError) {
      setError(firstError.message);
      setLoading(false);
      return;
    }

    setJobs(jobsRes.data ?? []);
    setCustomers(customersRes.data ?? []);
    setFinancials(finRes.data ?? []);
    setRates(ratesRes.data ?? []);
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

  const financialsByJobId = useMemo(() => {
    const m = new Map<string, JobFinancials>();
    for (const f of financials) m.set(f.job_id, f);
    return m;
  }, [financials]);

  /** The date filters read pickup_date, which is the date the run was worked. */
  const visible = useMemo(() => {
    return jobs.filter((j) => {
      if (statusFilter !== "all" && j.delivery_status !== statusFilter) return false;
      if (customerFilter !== "all" && j.customer_id !== customerFilter) return false;
      if (serviceFilter !== "all" && j.service_code !== serviceFilter) return false;
      // An undated job cannot satisfy a date bound, so it drops out when one is set.
      if (from !== "" && (j.pickup_date ?? "") < from) return false;
      if (to !== "" && (j.pickup_date === null || j.pickup_date > to)) return false;
      return true;
    });
  }, [jobs, statusFilter, customerFilter, serviceFilter, from, to]);

  /**
   * Status writes straight to jobs.delivery_status.
   *
   * This uses StatusSelect rather than StatusControl on purpose. StatusControl
   * writes a record_status OVERRIDE for engine-generated records, where the
   * underlying row is owned by the weekly sweep. A job's status is its own
   * column and nothing else writes it, so an override layer would add a second
   * place for the truth to live.
   */
  const changeStatus = useCallback(
    async (job: Job, next: JobStatus) => {
      const previous = job;
      setJobs((prev) =>
        prev.map((j) => (j.id === job.id ? { ...j, delivery_status: next } : j))
      );

      const { data, error: writeError } = await setJobStatus(job.id, next);
      if (writeError || !data) {
        setJobs((prev) => prev.map((j) => (j.id === job.id ? previous : j)));
        setError(writeError?.message ?? "Could not update the job status.");
        return false;
      }
      setJobs((prev) => prev.map((j) => (j.id === job.id ? data : j)));

      // Delivering a job is what makes its revenue real to finance_ledger, so
      // the margin column has to be re-read rather than patched locally.
      const { data: fin } = await getJobFinancials();
      if (fin) setFinancials(fin);
      return true;
    },
    []
  );

  if (isNotConnected(error)) {
    return <NotConnectedPanel message={error!} what="Job database" />;
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="card">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as "all" | JobStatus)}
            aria-label="Filter by status"
            className="rounded-xl border border-navy/15 bg-white px-3 py-2 text-sm"
          >
            <option value="all">All statuses</option>
            {JOB_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          <select
            value={serviceFilter}
            onChange={(e) => setServiceFilter(e.target.value as "all" | ServiceCode)}
            aria-label="Filter by service level"
            className="rounded-xl border border-navy/15 bg-white px-3 py-2 text-sm"
          >
            <option value="all">All services</option>
            {rates.map((r) => (
              <option key={r.service_code} value={r.service_code}>
                {r.service_code} — {r.service_name}
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
              aria-label="Picked up from"
              className="rounded-xl border border-navy/15 px-3 py-2 text-sm"
            />
            <span className="text-ink/50">to</span>
            <input
              type="date"
              value={to}
              min={from || undefined}
              onChange={(e) => setTo(e.target.value)}
              aria-label="Picked up to"
              className="rounded-xl border border-navy/15 px-3 py-2 text-sm"
            />
          </div>
        </div>
      </div>

      {error && !isNotConnected(error) && (
        <ErrorBanner
          title="Could not load jobs"
          message={error}
          onDismiss={() => setError(null)}
        />
      )}

      {loading ? (
        <LoadingPanel label="Loading jobs…" />
      ) : visible.length === 0 ? (
        <div className="card">
          <EmptyState
            title={jobs.length === 0 ? "No jobs yet" : "No jobs match those filters"}
            hint={
              jobs.length === 0
                ? "Jobs are created from a won quote — open the quote and use Convert to job. The quote's total becomes the starting billed amount."
                : "Try widening the date range or clearing the status filter."
            }
          />
        </div>
      ) : (
        <div className="card overflow-x-auto p-0">
          <table className="w-full min-w-[60rem] text-sm">
            <thead>
              <tr className="border-b border-navy/10 text-left text-xs uppercase tracking-wide text-ink/50">
                <th scope="col" className="px-4 py-3 font-semibold">UID</th>
                <th scope="col" className="px-4 py-3 font-semibold">Date</th>
                <th scope="col" className="px-4 py-3 font-semibold">Customer</th>
                <th scope="col" className="px-4 py-3 font-semibold">Service</th>
                <th scope="col" className="px-4 py-3 font-semibold">Status</th>
                <th scope="col" className="px-4 py-3 text-right font-semibold">Miles</th>
                <th scope="col" className="px-4 py-3 text-right font-semibold">Billed</th>
                <th scope="col" className="px-4 py-3 text-right font-semibold">Job margin</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((job) => {
                const customer = customerById.get(job.customer_id);
                const fin = financialsByJobId.get(job.id);
                return (
                  <tr
                    key={job.id}
                    className="border-b border-navy/5 transition-colors last:border-0 hover:bg-surface"
                  >
                    <td className="px-4 py-3 align-top">
                      <Link
                        href={`/portal/jobs/${job.id}`}
                        className="font-semibold text-navy hover:text-[#8a6c1f] hover:underline"
                      >
                        {job.uid}
                      </Link>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 align-top text-ink/60">
                      {job.pickup_date ? formatDate(job.pickup_date) : "—"}
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
                    <td className="px-4 py-3 align-top">{job.service_code}</td>
                    <td className="px-4 py-3 align-top">
                      <StatusSelect
                        value={job.delivery_status}
                        options={JOB_STATUS_OPTIONS}
                        styleFor={jobStatusStyle}
                        size="sm"
                        label="Delivery status"
                        onChange={(next) => changeStatus(job, next)}
                      />
                    </td>
                    <td className="px-4 py-3 text-right align-top tabular-nums text-ink/70">
                      {formatMiles(job.total_miles)}
                    </td>
                    <td className="px-4 py-3 text-right align-top tabular-nums font-semibold text-navy-deep">
                      {job.billed_amount === null ? (
                        <span className="font-normal text-ink/40">Not billed</span>
                      ) : (
                        formatMoney(job.billed_amount)
                      )}
                    </td>
                    {/* Margin is signed and coloured, never colour alone. */}
                    <td
                      className="px-4 py-3 text-right align-top tabular-nums font-semibold"
                      style={fin ? marginStyle(fin.job_margin) : undefined}
                    >
                      {fin ? (
                        `${fin.job_margin < 0 ? "−" : ""}${formatMoney(
                          Math.abs(fin.job_margin)
                        )}`
                      ) : (
                        <span className="font-normal text-ink/40">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <p className="flex items-start gap-2 text-xs text-ink/50">
        <Truck className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
        <span>
          Job margin is billed revenue less generated fuel cost and the costs logged against the
          run. Fixed overhead is deliberately not in it — that lands on net profit instead.
        </span>
      </p>
    </div>
  );
}
