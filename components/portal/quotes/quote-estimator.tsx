"use client";

/**
 * components/portal/quotes/quote-estimator.tsx
 * ---------------------------------------------------------------------------
 * The Quote Calculator, rebuilt.
 *
 * Two differences from the client's spreadsheet version, both deliberate:
 *
 * 1. It starts with a CUSTOMER. "Step 1 — look up or create the customer" only
 *    exists as a step on his flow chart because a spreadsheet cannot do it; a
 *    quote that is not attached to anyone cannot roll up into a win rate.
 *
 * 2. Every rate is read from service_rates / rate_settings, never hardcoded.
 *    His sheet hardcodes $1.70/mi in the formula while its own rate matrix says
 *    $1.65 for ODC, which is why the example quote reads $61.70 there and
 *    $61.65 here.
 *
 * Saving freezes the rate card onto the row. That is the whole point of
 * rate_snapshot: when a rate changes next month, this quote must still read
 * back at the price that was quoted.
 * ---------------------------------------------------------------------------
 */

import { useEffect, useMemo, useState } from "react";
import { X, Loader2, Search, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { todayISO } from "@/lib/health";
import {
  computeQuote,
  buildRateSnapshot,
  suggestedExtraMiles,
  formatAdjustment,
  ADJUSTMENT_STEPS,
} from "@/lib/quotes/calc";
import type {
  Customer,
  Quote,
  QuoteComputation,
  QuoteInputs,
  RateSetting,
  RateSnapshot,
  ServiceCode,
  ServiceRate,
} from "@/lib/quotes/types";
import { formatMoney, sanitizeDecimal } from "@/lib/quotes/format";

/**
 * Everything needed to write one quote row.
 *
 * customerId is separate because QuoteInputs mirrors only the pricing inputs —
 * the customer is who the quote is FOR, not part of what it costs.
 */
export interface QuoteDraft {
  customerId: string;
  inputs: QuoteInputs;
  /** The rate card as it stood when Save was pressed. */
  snapshot: RateSnapshot;
  computation: QuoteComputation;
  quotedOn: string;
  notes: string | null;
}

/** Stops 1–20, matching the sheet's dropdown. */
const STOP_OPTIONS = Array.from({ length: 20 }, (_, i) => i + 1);

/**
 * Numeric fields are held as strings so a half-typed "12." does not become NaN
 * and jump the cursor. They are parsed only on the way into computeQuote.
 */
interface EstimatorForm {
  customer_id: string;
  service_code: ServiceCode | "";
  stops: number;
  route_miles: string;
  extra_miles: string;
  tolls_parking: string;
  cold_chain: boolean;
  off_hours: boolean;
  wait_minutes: string;
  adjustment_pct: number;
  notes: string;
}

const EMPTY_FORM: EstimatorForm = {
  customer_id: "",
  service_code: "",
  stops: 1,
  route_miles: "",
  extra_miles: "",
  tolls_parking: "",
  cold_chain: false,
  off_hours: false,
  wait_minutes: "",
  adjustment_pct: 0,
  notes: "",
};

/** Blank and malformed both read as 0 rather than NaN. */
function num(value: string): number {
  const n = Number.parseFloat(value);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

export function QuoteEstimator({
  open,
  onClose,
  customers,
  rates,
  settings,
  /** Preselect a customer when the estimator is opened from their page. */
  initialCustomerId,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  customers: Customer[];
  rates: ServiceRate[];
  settings: RateSetting[];
  initialCustomerId?: string;
  onSave: (draft: QuoteDraft) => Promise<Quote | null>;
}) {
  const [today, setToday] = useState<string | null>(null);
  useEffect(() => setToday(todayISO()), []);

  const [form, setForm] = useState<EstimatorForm>(EMPTY_FORM);
  const [customerSearch, setCustomerSearch] = useState("");
  const [extraMilesTouched, setExtraMilesTouched] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Reset to a clean sheet each time the estimator opens.
  useEffect(() => {
    if (!open) return;
    setForm({ ...EMPTY_FORM, customer_id: initialCustomerId ?? "" });
    setCustomerSearch("");
    setExtraMilesTouched(false);
    setFormError(null);
  }, [open, initialCustomerId]);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  /** Only quotable levels are offered — the rest are not priced by this sheet. */
  const quotableRates = useMemo(() => rates.filter((r) => r.is_quotable), [rates]);

  // Default to the first quotable level so the breakdown is never empty.
  useEffect(() => {
    if (!open || form.service_code !== "" || quotableRates.length === 0) return;
    setForm((f) => ({ ...f, service_code: quotableRates[0].service_code }));
  }, [open, form.service_code, quotableRates]);

  const settingsMap = useMemo(() => {
    const m: Record<string, number> = {};
    for (const s of settings) m[s.key] = s.value;
    return m;
  }, [settings]);

  const selectedRate = useMemo(
    () => quotableRates.find((r) => r.service_code === form.service_code) ?? null,
    [quotableRates, form.service_code]
  );

  const inputs: QuoteInputs | null = useMemo(() => {
    if (!form.service_code) return null;
    return {
      service_code: form.service_code,
      stops: form.stops,
      route_miles: num(form.route_miles),
      extra_miles: num(form.extra_miles),
      tolls_parking: num(form.tolls_parking),
      cold_chain: form.cold_chain,
      off_hours: form.off_hours,
      wait_minutes: num(form.wait_minutes),
      adjustment_pct: form.adjustment_pct,
    };
  }, [form]);

  /**
   * Recomputed on every keystroke. computeQuote is pure arithmetic over a
   * handful of numbers, so there is nothing here worth debouncing.
   */
  const computation = useMemo(() => {
    if (!inputs || !selectedRate) return null;
    return computeQuote(inputs, buildRateSnapshot(selectedRate, settings));
  }, [inputs, selectedRate, settings]);

  const routeMiles = num(form.route_miles);
  const suggested = suggestedExtraMiles(routeMiles, settingsMap);
  const extraMilesOverridden = extraMilesTouched && num(form.extra_miles) !== suggested;

  const filteredCustomers = useMemo(() => {
    const q = customerSearch.trim().toLowerCase();
    if (q === "") return customers;
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.uid.toLowerCase().includes(q) ||
        (c.email ?? "").toLowerCase().includes(q)
    );
  }, [customers, customerSearch]);

  function update<K extends keyof EstimatorForm>(key: K, value: EstimatorForm[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setFormError(null);
  }

  async function handleSave() {
    if (!form.customer_id) {
      setFormError("Pick a customer. A quote nobody is attached to cannot be won or lost.");
      return;
    }
    if (!selectedRate || !inputs || !computation) {
      setFormError("Pick a service level.");
      return;
    }

    setSaving(true);
    const created = await onSave({
      customerId: form.customer_id,
      inputs,
      // The rate card as it stands right now, frozen onto the row.
      snapshot: buildRateSnapshot(selectedRate, settings),
      computation,
      quotedOn: today ?? todayISO(),
      notes: form.notes.trim() === "" ? null : form.notes.trim(),
    });
    setSaving(false);

    if (created) onClose();
  }

  if (!open || !today) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-navy-deep/40" onClick={onClose} aria-hidden />

      <div className="relative z-10 flex h-full w-full max-w-5xl flex-col overflow-y-auto bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-navy/10 bg-white px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-navy-deep">New quote</h2>
            <p className="text-xs text-ink/50">
              Rates are read live from Settings and frozen onto the quote when you save.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-ink/50 hover:bg-surface hover:text-navy-deep"
            aria-label="Close estimator"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>

        <div className="grid flex-1 gap-6 px-6 py-5 lg:grid-cols-2">
          {/* ── Inputs ───────────────────────────────────────────────────── */}
          <div className="space-y-5">
            {/* Customer — step 1 of the flow chart. */}
            <section>
              <h3 className="text-sm font-semibold text-navy-deep">Customer</h3>
              <div className="relative mt-2">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/40"
                  aria-hidden
                />
                <input
                  type="search"
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                  placeholder="Search customers"
                  aria-label="Search customers"
                  className="w-full rounded-xl border border-navy/15 py-2 pl-9 pr-3 text-sm"
                />
              </div>
              <select
                value={form.customer_id}
                onChange={(e) => update("customer_id", e.target.value)}
                aria-label="Customer"
                className="mt-2 w-full rounded-xl border border-navy/15 bg-white px-3 py-2 text-sm"
              >
                <option value="">Select a customer…</option>
                {filteredCustomers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} · {c.uid}
                  </option>
                ))}
              </select>
              {customers.length === 0 && (
                <p className="mt-1 break-words text-xs text-[#8a6c1f]">
                  No customers yet — add one on the Customers page first.
                </p>
              )}
            </section>

            {/* Service level. */}
            <section>
              <h3 className="text-sm font-semibold text-navy-deep">Service level</h3>
              <select
                value={form.service_code}
                onChange={(e) => update("service_code", e.target.value as ServiceCode)}
                aria-label="Service level"
                className="mt-2 w-full rounded-xl border border-navy/15 bg-white px-3 py-2 text-sm"
              >
                {quotableRates.map((r) => (
                  <option key={r.service_code} value={r.service_code}>
                    {r.service_code} — {r.service_name}
                  </option>
                ))}
              </select>
              {selectedRate && (
                <p className="mt-1.5 break-words text-xs text-ink/55">
                  Base {formatMoney(selectedRate.base_pickup_fee)} ·{" "}
                  {formatMoney(selectedRate.per_mile_rate)}/mi ·{" "}
                  {formatMoney(selectedRate.per_stop_fee)}/extra stop
                </p>
              )}
            </section>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Stops">
                <select
                  value={form.stops}
                  onChange={(e) => update("stops", Number(e.target.value))}
                  aria-label="Stops"
                  className="w-full rounded-xl border border-navy/15 bg-white px-3 py-2 text-sm"
                >
                  {STOP_OPTIONS.map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
                <Hint>The first stop is included in the base fee.</Hint>
              </Field>

              <Field label="Route mileage">
                <NumberInput
                  value={form.route_miles}
                  onChange={(v) => update("route_miles", v)}
                  label="Route mileage"
                  suffix="mi"
                />
                <Hint>One way, as driven.</Hint>
              </Field>
            </div>

            {/* Extra miles — suggested, never auto-filled. */}
            <Field label="Extra miles">
              <NumberInput
                value={form.extra_miles}
                onChange={(v) => {
                  setExtraMilesTouched(true);
                  update("extra_miles", v);
                }}
                label="Extra miles"
                suffix="mi"
              />
              <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
                {routeMiles > 0 ? (
                  <>
                    <Hint>
                      Suggested: {suggested.toFixed(1)} for a {(routeMiles * 2).toFixed(0)} mi round
                      trip
                    </Hint>
                    {suggested !== num(form.extra_miles) && (
                      <button
                        type="button"
                        onClick={() => {
                          setExtraMilesTouched(false);
                          update("extra_miles", suggested === 0 ? "" : String(suggested));
                        }}
                        className="text-xs font-semibold text-navy hover:underline"
                      >
                        Use it
                      </button>
                    )}
                  </>
                ) : (
                  <Hint>Enter route mileage to see the suggestion.</Hint>
                )}
                {extraMilesOverridden && (
                  <span className="rounded-full bg-gold/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#8a6c1f]">
                    Overridden
                  </span>
                )}
              </div>
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Tolls & parking">
                <NumberInput
                  value={form.tolls_parking}
                  onChange={(v) => update("tolls_parking", v)}
                  label="Tolls and parking"
                  prefix="$"
                />
                <Hint>Exact cost, no markup.</Hint>
              </Field>

              <Field label="Wait minutes">
                <NumberInput
                  value={form.wait_minutes}
                  onChange={(v) => update("wait_minutes", v)}
                  label="Wait minutes"
                  suffix="min"
                />
                <Hint>
                  First {settingsMap.wait_time_grace_minutes ?? 0} minutes are free.
                </Hint>
              </Field>
            </div>

            <section className="space-y-2">
              <Checkbox
                checked={form.cold_chain}
                onChange={(v) => update("cold_chain", v)}
                label="Cold-chain / temperature controlled"
                hint={`Flat ${formatMoney(settingsMap.cold_chain_surcharge ?? 0)} surcharge`}
              />
              <Checkbox
                checked={form.off_hours}
                onChange={(v) => update("off_hours", v)}
                label="Off-hours, weekend or holiday"
                hint={`Flat ${formatMoney(settingsMap.off_hours_surcharge ?? 0)} surcharge`}
              />
            </section>

            {/* Competitive adjustment — 0 sits in the middle on purpose. */}
            <section>
              <h3 className="text-sm font-semibold text-navy-deep">Competitive adjustment</h3>
              <div
                className="mt-2 flex flex-wrap gap-1 rounded-xl bg-surface p-1"
                role="group"
                aria-label="Competitive adjustment"
              >
                {ADJUSTMENT_STEPS.map((step) => (
                  <button
                    key={step}
                    type="button"
                    onClick={() => update("adjustment_pct", step)}
                    aria-pressed={form.adjustment_pct === step}
                    className={cn(
                      "flex-1 rounded-lg px-2 py-1.5 text-xs font-semibold tabular-nums transition-colors",
                      form.adjustment_pct === step
                        ? "bg-navy-deep text-white shadow-sm"
                        : "text-ink/60 hover:bg-white hover:text-navy-deep"
                    )}
                  >
                    {formatAdjustment(step)}
                  </button>
                ))}
              </div>
              <Hint>
                Applies to the service subtotal only. Tolls are passed through untouched.
              </Hint>
            </section>

            <Field label="Notes">
              <textarea
                value={form.notes}
                onChange={(e) => update("notes", e.target.value)}
                rows={2}
                aria-label="Quote notes"
                className="w-full resize-y rounded-xl border border-navy/15 px-3 py-2 text-sm"
                placeholder="Anything that explains this price later."
              />
            </Field>
          </div>

          {/* ── Breakdown ────────────────────────────────────────────────── */}
          <div className="space-y-4">
            <div className="rounded-2xl border border-navy/10 bg-navy-deep p-6 text-white">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">
                Quote total
              </p>
              <p className="mt-2 text-4xl font-bold tabular-nums">
                {computation ? formatMoney(computation.total) : "—"}
              </p>
              {computation && (
                <p className="mt-1 text-sm text-white/65">
                  Service {formatMoney(computation.serviceSubtotal)}
                  {computation.adjustmentAmount !== 0 &&
                    ` · adjustment ${formatMoney(computation.adjustmentAmount)}`}
                  {num(form.tolls_parking) > 0 &&
                    ` · tolls ${formatMoney(num(form.tolls_parking))}`}
                </p>
              )}
            </div>

            <div className="card p-0">
              <h3 className="px-5 pt-5 text-sm font-semibold text-navy-deep">
                Detailed cost breakdown
              </h3>
              <table className="mt-3 w-full text-sm">
                <thead>
                  <tr className="border-y border-navy/10 text-left text-xs uppercase tracking-wide text-ink/50">
                    <th scope="col" className="px-5 py-2 font-semibold">Component</th>
                    <th scope="col" className="px-3 py-2 font-semibold">Basis</th>
                    <th scope="col" className="px-5 py-2 text-right font-semibold">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {computation?.lineItems.map((li) => (
                    <tr key={li.key} className="border-b border-navy/5 last:border-0">
                      <td className="px-5 py-2 align-top break-words font-medium text-navy-deep">
                        {li.label}
                      </td>
                      <td className="px-3 py-2 align-top break-words text-xs text-ink/55">
                        {li.basis}
                      </td>
                      <td
                        className={cn(
                          "px-5 py-2 text-right align-top tabular-nums",
                          li.amount === 0 && "text-ink/35"
                        )}
                      >
                        {formatMoney(li.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                {computation && (
                  <tfoot>
                    <tr className="border-t-2 border-navy/15">
                      <td colSpan={2} className="px-5 py-3 font-semibold text-navy-deep">
                        Total
                      </td>
                      <td className="px-5 py-3 text-right text-base font-bold tabular-nums text-navy-deep">
                        {formatMoney(computation.total)}
                      </td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>

            <p className="flex items-start gap-2 rounded-xl border border-navy/10 bg-surface p-3 text-xs text-ink/60">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
              <span className="break-words">
                Every component is listed, including the ones costing nothing, so the table reads
                the same way every time.
              </span>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 border-t border-navy/10 bg-white px-6 py-4">
          {formError && (
            <p className="mb-3 break-words text-sm text-red-600">{formError}</p>
          )}
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs text-ink/50">Saved as a draft. Status can be changed after.</p>
            <div className="flex items-center gap-3">
              <button type="button" onClick={onClose} className="btn-ghost text-sm">
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void handleSave()}
                disabled={saving || !computation}
                className="btn-navy text-sm"
              >
                {saving && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
                Save quote
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────── Small parts ────────────────────────────── */

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink/60">
        {label}
      </span>
      {children}
    </div>
  );
}

function Hint({ children }: { children: React.ReactNode }) {
  return <span className="mt-1 block break-words text-xs text-ink/50">{children}</span>;
}

/**
 * A decimal entry box. `inputMode="decimal"` gets the numeric keypad on a
 * phone; type="text" avoids the spinner arrows and the scroll-wheel accidents
 * that type="number" brings with it.
 */
function NumberInput({
  value,
  onChange,
  label,
  prefix,
  suffix,
}: {
  value: string;
  onChange: (next: string) => void;
  label: string;
  prefix?: string;
  suffix?: string;
}) {
  return (
    <div className="flex items-center rounded-xl border border-navy/15 bg-white px-3">
      {prefix && <span className="pr-1 text-sm text-ink/45">{prefix}</span>}
      <input
        type="text"
        inputMode="decimal"
        value={value}
        aria-label={label}
        placeholder="0"
        // Digits and one decimal point only, so the field can never hold
        // something that parses to a different number than it displays.
        onChange={(e) => onChange(sanitizeDecimal(e.target.value))}
        className="w-full bg-transparent py-2 text-sm tabular-nums outline-none"
      />
      {suffix && <span className="pl-1 text-sm text-ink/45">{suffix}</span>}
    </div>
  );
}

function Checkbox({
  checked,
  onChange,
  label,
  hint,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
  hint?: string;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-navy/10 bg-white p-3 hover:bg-surface">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 h-4 w-4 shrink-0 rounded border-navy/30 text-navy focus-visible:ring-2 focus-visible:ring-gold"
      />
      <span className="min-w-0">
        <span className="block break-words text-sm font-medium text-navy-deep">{label}</span>
        {hint && <span className="block break-words text-xs text-ink/50">{hint}</span>}
      </span>
    </label>
  );
}
