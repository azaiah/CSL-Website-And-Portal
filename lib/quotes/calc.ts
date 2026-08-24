/**
 * lib/quotes/calc.ts
 * ---------------------------------------------------------------------------
 * Pure, testable quote calculations — no Supabase, no React, no side effects.
 * Same discipline as lib/finance/calc.ts.
 *
 * Every function here reads its rates from a RateSnapshot rather than from the
 * database, so a quote calculated in October still recomputes to the October
 * number after November's rate change.
 * ---------------------------------------------------------------------------
 */

import type {
  QuoteInputs,
  QuoteComputation,
  QuoteLineItem,
  RateSnapshot,
  RateSetting,
  ServiceRate,
} from "./types";

/** Round to cents. Money is numeric(12,2) in Postgres; keep TS in step. */
export const round2 = (n: number) => Math.round(n * 100) / 100;

/**
 * The adjustment steps the client's estimator offers: -15% to +15% in 5% jumps.
 * Stored as fractions because quotes.adjustment_pct is a fraction, not a percent.
 */
export const ADJUSTMENT_STEPS = [-0.15, -0.1, -0.05, 0, 0.05, 0.1, 0.15];

/** "-15%" … "+15%", with a bare "0%" for no adjustment. */
export function formatAdjustment(pct: number): string {
  if (pct === 0) return "0%";
  const sign = pct > 0 ? "+" : "-";
  return `${sign}${Math.round(Math.abs(pct) * 100)}%`;
}

/**
 * Trim a number for display inside a `basis` string: 14.2 stays "14.2", 1.0
 * becomes "1". Keeps the breakdown readable without inventing precision.
 */
const trim = (n: number) => String(Number(n.toFixed(2)));

/** Read a snapshot setting. Missing keys read as 0 rather than NaN. */
function setting(snapshot: RateSnapshot, key: string): number {
  const v = snapshot.settings[key];
  return typeof v === "number" && Number.isFinite(v) ? v : 0;
}

/**
 * Collapse the rate_settings rows into the { key: value } map that
 * quotes.rate_snapshot stores alongside the chosen rate row.
 */
export function buildRateSnapshot(
  rate: ServiceRate,
  settings: RateSetting[]
): RateSnapshot {
  const map: Record<string, number> = {};
  for (const s of settings) map[s.key] = s.value;
  return { rate, settings: map };
}

/**
 * Round-trip miles beyond the excess threshold, as a starting value for the
 * extra_miles input. Route miles are one way, so the round trip is doubled.
 */
export function suggestedExtraMiles(
  routeMiles: number,
  settings: Record<string, number>
): number {
  const threshold = settings.excess_mileage_threshold ?? 0;
  return round2(Math.max(0, routeMiles * 2 - threshold));
}

/**
 * Price a quote from its inputs and the rate card frozen on it.
 *
 * The snapshot's rate is authoritative for the maths. `inputs.service_code`
 * mirrors the quotes column so the input object round-trips to the table, but
 * it is not read here — that way a snapshot can never disagree with itself.
 */
export function computeQuote(
  inputs: QuoteInputs,
  snapshot: RateSnapshot
): QuoteComputation {
  const { rate } = snapshot;

  const excessRate = setting(snapshot, "excess_mileage_rate");
  const coldChainRate = setting(snapshot, "cold_chain_surcharge");
  const offHoursRate = setting(snapshot, "off_hours_surcharge");
  const graceMinutes = setting(snapshot, "wait_time_grace_minutes");
  const waitRate = setting(snapshot, "wait_time_per_minute");

  // First stop is included in the base pickup fee; only the extras are billed.
  const billableStops = Math.max(0, inputs.stops - 1);
  const billableWaitMinutes = Math.max(0, inputs.wait_minutes - graceMinutes);

  const mileageFee = round2(inputs.route_miles * rate.per_mile_rate);
  const stopsFee = round2(billableStops * rate.per_stop_fee);
  const excessFee = round2(inputs.extra_miles * excessRate);
  const coldChain = inputs.cold_chain ? coldChainRate : 0;
  const offHours = inputs.off_hours ? offHoursRate : 0;
  const waitTime = round2(billableWaitMinutes * waitRate);

  const serviceSubtotal = round2(
    rate.base_pickup_fee +
      mileageFee +
      stopsFee +
      excessFee +
      coldChain +
      offHours +
      waitTime
  );

  const adjustmentAmount = round2(serviceSubtotal * inputs.adjustment_pct);

  // Tolls are added AFTER the adjustment and are deliberately NOT part of the
  // adjustment base. This looks wrong next to the client's spreadsheet, which
  // folds tolls into the subtotal before discounting — but that ordering means
  // a -15% quote refunds 15% of a toll CSL already paid out of pocket. His own
  // surcharge table says tolls are "Exact face value cost (No markup)", so the
  // pass-through has to sit outside anything that scales it.
  const total = round2(serviceSubtotal + adjustmentAmount + inputs.tolls_parking);

  // One row per component, including the zero-value ones. The client reads this
  // table top to bottom; a row that disappears when it costs nothing reads as
  // a bug rather than as a zero.
  const lineItems: QuoteLineItem[] = [
    {
      key: "base",
      label: "Base Pickup Fee",
      basis: `${rate.service_code} base fee`,
      amount: round2(rate.base_pickup_fee),
    },
    {
      key: "mileage",
      label: "Standard Mileage Fee",
      basis:
        inputs.route_miles > 0
          ? `${trim(inputs.route_miles)} miles @ $${rate.per_mile_rate.toFixed(2)}/mi`
          : "N/A",
      amount: mileageFee,
    },
    {
      key: "stops",
      label: "Additional Stop Fee",
      basis:
        billableStops > 0
          ? `${billableStops} extra ${billableStops === 1 ? "stop" : "stops"} @ $${rate.per_stop_fee.toFixed(2)}`
          : "N/A",
      amount: stopsFee,
    },
    {
      key: "excess",
      label: "Excess Mileage Fee",
      basis:
        inputs.extra_miles > 0
          ? `${trim(inputs.extra_miles)} miles @ $${excessRate.toFixed(2)}/mi`
          : "N/A",
      amount: excessFee,
    },
    {
      key: "cold_chain",
      label: "Cold-Chain / Temp Control",
      basis: inputs.cold_chain ? "Flat surcharge" : "N/A",
      amount: round2(coldChain),
    },
    {
      key: "off_hours",
      label: "Off-Hours / Weekend / Holiday",
      basis: inputs.off_hours ? "Flat surcharge" : "N/A",
      amount: round2(offHours),
    },
    {
      key: "wait_time",
      label: "Wait-Time Billing",
      basis:
        billableWaitMinutes > 0
          ? `${trim(billableWaitMinutes)} min past ${trim(graceMinutes)} min grace @ $${waitRate.toFixed(2)}/min`
          : "N/A",
      amount: waitTime,
    },
    {
      key: "adjustment",
      label: "Discount / Premium",
      basis:
        inputs.adjustment_pct !== 0
          ? `${formatAdjustment(inputs.adjustment_pct)} of $${serviceSubtotal.toFixed(2)}`
          : "N/A",
      amount: adjustmentAmount,
    },
    {
      key: "tolls",
      label: "Tolls & Parking",
      basis: inputs.tolls_parking > 0 ? "Exact cost, no markup" : "N/A",
      amount: round2(inputs.tolls_parking),
    },
  ];

  return { lineItems, serviceSubtotal, adjustmentAmount, total };
}

/**
 * Margin on a single run: revenue less the fuel it burned and the costs booked
 * against it. Mirrors the job_margin column in the job_financials view.
 *
 * Overhead is excluded on purpose — it is real money, but it belongs to the
 * month rather than to any one run. Net profit includes it; this does not.
 */
export function jobMargin(
  revenue: number,
  fuelCost: number,
  attributedCost: number
): number {
  return round2(revenue - fuelCost - attributedCost);
}
