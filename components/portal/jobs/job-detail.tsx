"use client";

/**
 * components/portal/jobs/job-detail.tsx
 * ---------------------------------------------------------------------------
 * One run, sectioned the way the client's Route Dispatch Form is sectioned, so
 * anyone who has filled in the paper version recognises this immediately:
 *
 *   1. Customer & pickup / dropoff
 *   2. Route, vehicle & fuel
 *   3. Medical courier & chain-of-custody
 *   4. Service, expenses & status
 *
 * It is a form with one Save, not thirty click-to-edit fields, because that is
 * how the paper works — top to bottom, then hand it in.
 * ---------------------------------------------------------------------------
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Save, Undo2 } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { formatMoney } from "@/lib/quotes/format";
import {
  getJob,
  getCustomer,
  updateJob,
  listVehicles,
  listLookupValues,
  getJobFinancials,
} from "@/lib/quotes/queries";
import type {
  Customer,
  Job,
  JobFinancials,
  JobStatus,
  LookupValue,
  ServiceCode,
  Vehicle,
} from "@/lib/quotes/types";
import { JOB_STATUSES, jobStatusStyle } from "@/lib/status-options";
import { cn } from "@/lib/utils";
import {
  ErrorBanner,
  LoadingPanel,
  NotConnectedPanel,
  isNotConnected,
} from "@/components/portal/data-states";
import {
  JobSection,
  Field,
  TextField,
  NumberField,
  DateField,
  TimeField,
  SelectField,
  CheckField,
  ReadOnlyValue,
} from "./job-fields";
import { JobExpenses } from "./job-expenses";
import { JobFooterStrip } from "./job-footer-strip";
import {
  toForm,
  toPatch,
  isDirty,
  milesFromOdometer,
  previewFuelCost,
  type JobForm,
} from "./job-form-state";

export function JobDetail({ jobId }: { jobId: string }) {
  const [job, setJob] = useState<Job | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [financials, setFinancials] = useState<JobFinancials | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [lookups, setLookups] = useState<LookupValue[]>([]);
  const [form, setForm] = useState<JobForm | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    const [jobRes, vehiclesRes, lookupsRes, finRes] = await Promise.all([
      getJob(jobId),
      listVehicles(),
      listLookupValues(),
      getJobFinancials({ jobId }),
    ]);

    if (jobRes.error || !jobRes.data) {
      setError(jobRes.error?.message ?? "Job not found.");
      setLoading(false);
      return;
    }

    setJob(jobRes.data);
    setForm(toForm(jobRes.data));
    setVehicles(vehiclesRes.data ?? []);
    setLookups(lookupsRes.data ?? []);
    setFinancials(finRes.data?.[0] ?? null);

    const customerRes = await getCustomer(jobRes.data.customer_id);
    setCustomer(customerRes.data ?? null);
    setLoading(false);
  }, [jobId]);

  useEffect(() => {
    load();
  }, [load]);

  /** Re-read the view. Called after a save and after a cost is logged. */
  const refreshFinancials = useCallback(async () => {
    const { data } = await getJobFinancials({ jobId });
    if (data) setFinancials(data[0] ?? null);
  }, [jobId]);

  const lookupsFor = useCallback(
    (kind: string) =>
      lookups
        .filter((l) => l.kind === kind)
        .map((l) => ({ value: l.value, label: l.label })),
    [lookups]
  );

  const dirty = useMemo(
    () => (form && job ? isDirty(form, job) : false),
    [form, job]
  );

  /** Patch one field. */
  const set = useCallback(<K extends keyof JobForm>(key: K, value: JobForm[K]) => {
    setForm((f) => (f ? { ...f, [key]: value } : f));
  }, []);

  /**
   * Odometer readings auto-fill total miles.
   *
   * total_miles stays an ordinary editable field afterwards, because plenty of
   * runs get logged from a phone with no odometer reading at all. Typing an
   * odometer pair overwrites it — that is what "auto-fill" means here, and the
   * hint under the field says so.
   */
  const setOdometer = useCallback(
    (key: "odometer_start" | "odometer_end", raw: string) => {
      setForm((f) => {
        if (!f) return f;
        const next = { ...f, [key]: raw };
        const miles = milesFromOdometer(next.odometer_start, next.odometer_end);
        if (miles !== null) next.total_miles = String(miles);
        return next;
      });
    },
    []
  );

  async function handleSave() {
    if (!form || !job) return;
    setSaving(true);
    setError(null);

    const { data, error: writeError } = await updateJob(job.id, toPatch(form));
    setSaving(false);

    if (writeError || !data) {
      setError(writeError?.message ?? "Could not save the job.");
      return;
    }

    // Re-seed the form from the saved row: fuel_cost and any database defaults
    // come back here, so the page shows what was actually stored.
    setJob(data);
    setForm(toForm(data));
    refreshFinancials();
  }

  function handleDiscard() {
    if (job) setForm(toForm(job));
  }

  if (isNotConnected(error)) {
    return <NotConnectedPanel message={error!} what="Job database" />;
  }

  if (loading) return <LoadingPanel label="Loading job…" />;

  if (!job || !form) {
    return (
      <div className="card">
        <h2 className="text-lg font-semibold text-navy-deep">Job not found</h2>
        <p className="mt-1 text-sm text-ink/60">
          {error ?? "This job may have been deleted."}
        </p>
        <Link href="/portal/jobs" className="btn-navy mt-4 text-sm">
          Back to jobs
        </Link>
      </div>
    );
  }

  const fuelPreview = previewFuelCost(form);
  const savedFuel = job.fuel_cost;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <Link
            href="/portal/jobs"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink/55 hover:text-navy"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
            All jobs
          </Link>
          <h1 className="mt-2 break-words text-2xl font-semibold text-navy-deep">
            {job.uid}
          </h1>
          <p className="mt-1 break-words text-sm text-ink/60">
            {customer ? (
              <Link
                href={`/portal/customers/${customer.id}`}
                className="font-medium text-navy hover:underline"
              >
                {customer.name}
              </Link>
            ) : (
              "Unknown customer"
            )}
            {job.pickup_date ? ` · ${formatDate(job.pickup_date)}` : ""}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* The SAVED status, as a badge. The editable one is in section 4, so
              status and billed amount commit together in a single save. */}
          <span
            className={cn(
              "rounded-full px-3 py-1 text-xs font-semibold",
              jobStatusStyle(job.delivery_status)
            )}
          >
            {job.delivery_status}
          </span>
          {job.quote_id && (
            <Link
              href={`/portal/quotes/${job.quote_id}`}
              className="btn-ghost text-xs"
            >
              View quote
            </Link>
          )}
        </div>
      </div>

      {error && !isNotConnected(error) && (
        <ErrorBanner
          title="Could not save this job"
          message={error}
          onDismiss={() => setError(null)}
        />
      )}

      <JobSection
        step={1}
        title="Customer & pickup / dropoff"
        caption="Who it is for, where it came from, and where it went."
      >
        <Field label="Customer">
          <ReadOnlyValue
            value={customer?.name ?? "Unknown"}
            hint="Set when the job was created"
          />
        </Field>

        <Field label="Delivery type">
          <SelectField
            value={form.delivery_type}
            onChange={(v) => set("delivery_type", v)}
            options={lookupsFor("delivery_type")}
          />
        </Field>

        <Field label="Time slot">
          <SelectField
            value={form.time_slot}
            onChange={(v) => set("time_slot", v)}
            options={lookupsFor("time_slot")}
          />
        </Field>

        <Field label="Pickup date">
          <DateField value={form.pickup_date} onChange={(v) => set("pickup_date", v)} />
        </Field>

        <Field label="Pickup time">
          <TimeField value={form.pickup_time} onChange={(v) => set("pickup_time", v)} />
        </Field>

        <Field label="Pickup location">
          <TextField
            value={form.pickup_location}
            onChange={(v) => set("pickup_location", v)}
            placeholder="Street, city"
          />
        </Field>

        <Field label="Dropoff date">
          <DateField value={form.dropoff_date} onChange={(v) => set("dropoff_date", v)} />
        </Field>

        <Field label="Dropoff time">
          <TimeField value={form.dropoff_time} onChange={(v) => set("dropoff_time", v)} />
        </Field>

        <Field label="Dropoff location">
          <TextField
            value={form.dropoff_location}
            onChange={(v) => set("dropoff_location", v)}
            placeholder="Street, city"
          />
        </Field>

        <Field label="Recipient names" span>
          <TextField
            value={form.recipient_names}
            onChange={(v) => set("recipient_names", v)}
            placeholder="Who signed for it"
          />
        </Field>
      </JobSection>

      <JobSection
        step={2}
        title="Route, vehicle & fuel"
        caption="Fuel cost is calculated by the database from gallons and price — it is not a field you fill in."
      >
        <Field label="Vehicle">
          <SelectField
            value={form.vehicle_id}
            onChange={(v) => set("vehicle_id", v)}
            options={vehicles.map((v) => ({
              value: v.id,
              label: v.vehicle_type ? `${v.label} — ${v.vehicle_type}` : v.label,
            }))}
            emptyLabel="Not assigned"
          />
        </Field>

        <Field label="Odometer start">
          <NumberField
            value={form.odometer_start}
            onChange={(v) => setOdometer("odometer_start", v)}
            placeholder="0"
            suffix="mi"
          />
        </Field>

        <Field label="Odometer end">
          <NumberField
            value={form.odometer_end}
            onChange={(v) => setOdometer("odometer_end", v)}
            placeholder="0"
            suffix="mi"
          />
        </Field>

        <Field
          label="Total miles"
          hint="Filled in from the odometer pair when both are set, and editable for a run logged without them."
        >
          <NumberField
            value={form.total_miles}
            onChange={(v) => set("total_miles", v)}
            placeholder="0.0"
            suffix="mi"
          />
        </Field>

        <Field label="Fuel gallons">
          <NumberField
            value={form.fuel_gallons}
            onChange={(v) => set("fuel_gallons", v)}
            placeholder="0.00"
            suffix="gal"
          />
        </Field>

        <Field label="Price per gallon">
          <NumberField
            value={form.cost_per_gallon}
            onChange={(v) => set("cost_per_gallon", v)}
            placeholder="0.000"
            prefix="$"
          />
        </Field>

        {/*
          Display only. fuel_cost is GENERATED ALWAYS in Postgres, so it is
          never posted — the saved figure below comes back from the database.
          The preview is shown separately while there are unsaved edits, rather
          than overwriting the saved number, so the two are never confused.
        */}
        <Field label="Fuel cost">
          <ReadOnlyValue
            value={formatMoney(savedFuel)}
            hint={
              fuelPreview !== null && Math.abs(fuelPreview - savedFuel) >= 0.005
                ? `Will become ${formatMoney(fuelPreview)} when saved`
                : "Gallons × price per gallon, calculated by the database"
            }
          />
        </Field>
      </JobSection>

      <JobSection
        step={3}
        title="Medical courier & chain-of-custody"
        caption="Only relevant to medical and hazardous runs — leave it blank for anything else."
      >
        <CheckField
          checked={form.cold_chain_logged}
          onChange={(v) => set("cold_chain_logged", v)}
          label="Cold chain logged"
          hint="Temperatures were recorded at both ends of the run."
        />

        <Field label="Pickup temp (°F)">
          <NumberField
            value={form.pickup_temp_f}
            onChange={(v) => set("pickup_temp_f", v)}
            placeholder="0.0"
          />
        </Field>

        <Field label="Dropoff temp (°F)">
          <NumberField
            value={form.dropoff_temp_f}
            onChange={(v) => set("dropoff_temp_f", v)}
            placeholder="0.0"
          />
        </Field>

        <Field label="Hazard class">
          <SelectField
            value={form.hazard_class}
            onChange={(v) => set("hazard_class", v)}
            options={lookupsFor("hazard_class")}
            emptyLabel="None"
          />
        </Field>

        {/* Only asked for when the class is Other, so the field is not an
            unexplained blank on every other job. */}
        {form.hazard_class === "Other" && (
          <Field label="Hazard class — describe">
            <TextField
              value={form.hazard_class_other}
              onChange={(v) => set("hazard_class_other", v)}
              placeholder="What was carried"
            />
          </Field>
        )}

        <CheckField
          checked={form.coc_required}
          onChange={(v) => set("coc_required", v)}
          label="Chain of custody required"
          hint="Tick this and the handover details below become part of the record."
        />

        {form.coc_required && (
          <>
            <Field label="CoC number">
              <TextField
                value={form.coc_number}
                onChange={(v) => set("coc_number", v)}
                placeholder="Reference"
              />
            </Field>

            <Field label="Released by (pickup)">
              <TextField
                value={form.coc_pickup_person}
                onChange={(v) => set("coc_pickup_person", v)}
                placeholder="Name"
              />
            </Field>

            <Field label="Pickup timestamp">
              <input
                type="datetime-local"
                value={form.coc_pickup_at ? form.coc_pickup_at.slice(0, 16) : ""}
                onChange={(e) =>
                  set("coc_pickup_at", e.target.value === "" ? null : e.target.value)
                }
                className="w-full rounded-xl border border-navy/15 bg-white px-3 py-2 text-sm"
              />
            </Field>

            <Field label="Pickup location (CoC)">
              <TextField
                value={form.coc_pickup_location}
                onChange={(v) => set("coc_pickup_location", v)}
              />
            </Field>

            <Field label="Received by (handoff)">
              <TextField
                value={form.coc_handoff_person}
                onChange={(v) => set("coc_handoff_person", v)}
                placeholder="Name"
              />
            </Field>

            <Field label="Handoff timestamp">
              <input
                type="datetime-local"
                value={form.coc_handoff_at ? form.coc_handoff_at.slice(0, 16) : ""}
                onChange={(e) =>
                  set("coc_handoff_at", e.target.value === "" ? null : e.target.value)
                }
                className="w-full rounded-xl border border-navy/15 bg-white px-3 py-2 text-sm"
              />
            </Field>

            <Field label="Handoff location (CoC)">
              <TextField
                value={form.coc_handoff_location}
                onChange={(v) => set("coc_handoff_location", v)}
              />
            </Field>
          </>
        )}
      </JobSection>

      <JobSection
        step={4}
        title="Service, expenses & status"
        caption="A cost saved here is already in the finance tracker — it is the same table, so there is nothing to re-key."
      >
        <Field label="Service level">
          <SelectField
            value={form.service_code}
            onChange={(v) => v && set("service_code", v as ServiceCode)}
            options={[
              { value: "ODC", label: "ODC" },
              { value: "SDR", label: "SDR" },
              { value: "STAT", label: "STAT" },
              { value: "GEN", label: "GEN" },
            ]}
            emptyLabel="Select"
          />
        </Field>

        <Field label="Delivery status">
          <SelectField
            value={form.delivery_status}
            onChange={(v) => v && set("delivery_status", v as JobStatus)}
            options={JOB_STATUSES.map((s) => ({ value: s, label: s }))}
            emptyLabel="Select"
          />
        </Field>

        <Field
          label="Billed amount"
          hint="Defaults to the quote total, and stays editable — a difference is recorded, not corrected."
        >
          <NumberField
            value={form.billed_amount}
            onChange={(v) => set("billed_amount", v)}
            placeholder="0.00"
            prefix="$"
          />
        </Field>

        <Field label="Delay reason">
          <SelectField
            value={form.delay_reason}
            onChange={(v) => set("delay_reason", v)}
            options={lookupsFor("delay_reason")}
            emptyLabel="None"
          />
        </Field>

        <Field label="Delay notes" span>
          <TextField
            value={form.delay_notes}
            onChange={(v) => set("delay_notes", v)}
            placeholder="What happened"
          />
        </Field>

        <Field label="Delivery notes" span>
          <TextField
            value={form.delivery_notes}
            onChange={(v) => set("delivery_notes", v)}
            multiline
            placeholder="Anything worth knowing next time"
          />
        </Field>

        <div className="sm:col-span-2 lg:col-span-3">
          <JobExpenses
            jobId={job.id}
            customerId={job.customer_id}
            onChanged={refreshFinancials}
            onError={setError}
          />
        </div>
      </JobSection>

      <JobFooterStrip financials={financials} />

      {/* Save bar. Only appears when something has changed, so it is never a
          button whose effect you have to guess at. */}
      {dirty && (
        <div className="sticky bottom-4 z-20">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gold/40 bg-white px-4 py-3 shadow-lg">
            <p className="text-sm font-medium text-navy-deep">Unsaved changes</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleDiscard}
                className="inline-flex items-center gap-1.5 rounded-xl border border-navy/15 px-3 py-2 text-sm hover:bg-surface"
              >
                <Undo2 className="h-4 w-4" aria-hidden />
                Discard
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="btn-navy text-sm"
              >
                <Save className="h-4 w-4" aria-hidden />
                {saving ? "Saving…" : "Save job"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
