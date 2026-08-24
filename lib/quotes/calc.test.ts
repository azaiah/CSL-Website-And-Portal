/**
 * lib/quotes/calc.test.ts
 * ---------------------------------------------------------------------------
 * Unit tests for the pure quote calculations. Uses only node:test and
 * node:assert, both Node built-ins, so no dependency is added.
 *
 * Run with:  npx tsx lib/quotes/calc.test.ts
 *
 * The fixtures below are the seed values from migration 004, not invented
 * numbers — if the seed changes, these tests should be the thing that notices.
 * ---------------------------------------------------------------------------
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  computeQuote,
  jobMargin,
  suggestedExtraMiles,
  formatAdjustment,
  buildRateSnapshot,
  ADJUSTMENT_STEPS,
} from "./calc";
import type {
  QuoteInputs,
  RateSnapshot,
  ServiceRate,
  ServiceCode,
} from "./types";

/* ─────────────────────────────── Fixtures ───────────────────────────────── */

const RATES: Record<ServiceCode, ServiceRate> = {
  STAT: {
    service_code: "STAT",
    service_name: "Super STAT Emergency",
    base_pickup_fee: 65.0,
    per_mile_rate: 1.9,
    per_stop_fee: 25.0,
    is_quotable: true,
    sort_order: 1,
    updated_at: "",
  },
  ODC: {
    service_code: "ODC",
    service_name: "On Demand Call",
    base_pickup_fee: 45.0,
    per_mile_rate: 1.65,
    per_stop_fee: 15.0,
    is_quotable: true,
    sort_order: 2,
    updated_at: "",
  },
  SDR: {
    service_code: "SDR",
    service_name: "Scheduled & Dedicated",
    base_pickup_fee: 30.0,
    per_mile_rate: 1.4,
    per_stop_fee: 10.0,
    is_quotable: true,
    sort_order: 3,
    updated_at: "",
  },
  GEN: {
    service_code: "GEN",
    service_name: "General Delivery",
    base_pickup_fee: 35.0,
    per_mile_rate: 1.5,
    per_stop_fee: 12.0,
    is_quotable: true,
    sort_order: 4,
    updated_at: "",
  },
};

/** The rate_settings seed, collapsed the way rate_snapshot stores it. */
const SETTINGS: Record<string, number> = {
  cold_chain_surcharge: 35.0,
  off_hours_surcharge: 25.0,
  excess_mileage_threshold: 100.0,
  excess_mileage_rate: 2.25,
  wait_time_per_minute: 1.75,
  wait_time_grace_minutes: 15.0,
  late_cancellation_fee: 35.0,
  no_show_fee: 50.0,
  return_trip_pct: 0.2,
};

function snapshotFor(code: ServiceCode): RateSnapshot {
  return { rate: RATES[code], settings: SETTINGS };
}

/** Inputs with everything switched off, so each test states only what it uses. */
function inputs(over: Partial<QuoteInputs> = {}): QuoteInputs {
  return {
    service_code: "ODC",
    stops: 1,
    route_miles: 0,
    extra_miles: 0,
    tolls_parking: 0,
    cold_chain: false,
    off_hours: false,
    wait_minutes: 0,
    adjustment_pct: 0,
    ...over,
  };
}

/* ──────────────────────────────── The maths ─────────────────────────────── */

describe("computeQuote — the baseline quote", () => {
  it("prices ODC, 2 stops, 1 mile at 61.65", () => {
    const result = computeQuote(
      inputs({ service_code: "ODC", stops: 2, route_miles: 1.0 }),
      snapshotFor("ODC")
    );

    // 45.00 base + 1.65 mileage + 15.00 one extra stop.
    //
    // The client's sheet shows 61.70 for this same quote because the calculator
    // hardcodes $1.70/mi instead of reading its own rate matrix, which says
    // $1.65 for ODC — see spec 2.2. 61.65 is the rate card; 61.70 is the bug.
    assert.equal(result.total, 61.65);
    assert.equal(result.serviceSubtotal, 61.65);
    assert.equal(result.adjustmentAmount, 0);
  });
});

describe("computeQuote — the four service levels", () => {
  // One identical route, priced four ways. This is the test that would have
  // caught GEN being missing from the estimator's dropdown entirely.
  const route = { stops: 4, route_miles: 18 };

  it("prices SDR at 85.20", () => {
    const r = computeQuote(inputs({ ...route, service_code: "SDR" }), snapshotFor("SDR"));
    assert.equal(r.total, 85.2);
  });

  it("prices GEN at 98.00", () => {
    const r = computeQuote(inputs({ ...route, service_code: "GEN" }), snapshotFor("GEN"));
    assert.equal(r.total, 98.0);
  });

  it("prices ODC at 119.70", () => {
    const r = computeQuote(inputs({ ...route, service_code: "ODC" }), snapshotFor("ODC"));
    assert.equal(r.total, 119.7);
  });

  it("prices STAT at 174.20", () => {
    const r = computeQuote(inputs({ ...route, service_code: "STAT" }), snapshotFor("STAT"));
    assert.equal(r.total, 174.2);
  });
});

describe("computeQuote — tolls sit outside the adjustment", () => {
  it("discounts the service subtotal but passes tolls through at face value", () => {
    const result = computeQuote(
      inputs({
        service_code: "ODC",
        stops: 3,
        route_miles: 22,
        cold_chain: true,
        wait_minutes: 25,
        tolls_parking: 8.5,
        adjustment_pct: -0.15,
      }),
      snapshotFor("ODC")
    );

    // 45.00 base + 36.30 mileage + 30.00 stops + 35.00 cold chain
    //   + 17.50 wait (10 billable min @ 1.75) = 163.80
    assert.equal(result.serviceSubtotal, 163.8);
    assert.equal(result.adjustmentAmount, -24.57);

    // 163.80 - 24.57 + 8.50
    assert.equal(result.total, 147.73);

    // Folding the toll into the base before discounting gives
    // (163.80 + 8.50) x 0.85 = 146.455. Both roundings of that are asserted
    // against, because either one means CSL refunded part of a toll it paid.
    assert.notEqual(result.total, 146.45);
    assert.notEqual(result.total, 146.46);
  });
});

describe("computeQuote — the thresholds", () => {
  it("bills nothing for wait time inside the grace window", () => {
    const result = computeQuote(
      inputs({ service_code: "ODC", route_miles: 10, wait_minutes: 14 }),
      snapshotFor("ODC")
    );

    const wait = result.lineItems.find((l) => l.key === "wait_time");
    assert.equal(wait?.amount, 0);
    // 45.00 base + 16.50 mileage, with nothing added for the 14 minutes.
    assert.equal(result.serviceSubtotal, 61.5);
  });

  it("bills no stop fee for a single-stop run", () => {
    const result = computeQuote(
      inputs({ service_code: "ODC", stops: 1, route_miles: 10 }),
      snapshotFor("ODC")
    );

    const stops = result.lineItems.find((l) => l.key === "stops");
    assert.equal(stops?.amount, 0);
    assert.equal(stops?.basis, "N/A");
  });
});

describe("computeQuote — the breakdown table", () => {
  it("emits every row even when nothing applies", () => {
    const result = computeQuote(inputs(), snapshotFor("ODC"));

    // Nine components, always. A row that vanishes at zero reads as a bug.
    assert.equal(result.lineItems.length, 9);
    assert.deepEqual(
      result.lineItems.map((l) => l.key),
      [
        "base",
        "mileage",
        "stops",
        "excess",
        "cold_chain",
        "off_hours",
        "wait_time",
        "adjustment",
        "tolls",
      ]
    );
  });

  it("explains the mileage row in the client's own terms", () => {
    const result = computeQuote(
      inputs({ service_code: "ODC", route_miles: 14.2 }),
      snapshotFor("ODC")
    );

    const mileage = result.lineItems.find((l) => l.key === "mileage");
    assert.equal(mileage?.basis, "14.2 miles @ $1.65/mi");
    assert.equal(mileage?.amount, 23.43);
  });
});

/* ──────────────────────────────── Helpers ──────────────────────────────── */

describe("jobMargin", () => {
  it("subtracts fuel and attributed cost from revenue", () => {
    assert.equal(jobMargin(61.65, 17.25, 3.5), 40.9);
  });
});

describe("suggestedExtraMiles", () => {
  it("returns 0 while the round trip is inside the threshold", () => {
    assert.equal(suggestedExtraMiles(22, SETTINGS), 0);
  });

  it("returns the round-trip overage past the threshold", () => {
    // 80 one way = 160 round trip, 60 of it beyond the 100-mile threshold.
    assert.equal(suggestedExtraMiles(80, SETTINGS), 60);
  });
});

describe("formatAdjustment", () => {
  it("signs every step the estimator offers", () => {
    assert.deepEqual(
      ADJUSTMENT_STEPS.map(formatAdjustment),
      ["-15%", "-10%", "-5%", "0%", "+5%", "+10%", "+15%"]
    );
  });
});

describe("buildRateSnapshot", () => {
  it("collapses rate_settings rows into a key/value map", () => {
    const snapshot = buildRateSnapshot(RATES.ODC, [
      {
        key: "cold_chain_surcharge",
        label: "Cold-Chain / Temp Control Surcharge",
        value: 35.0,
        unit: "usd",
        note: null,
        updated_at: "",
      },
      {
        key: "wait_time_per_minute",
        label: "Wait-Time Billing",
        value: 1.75,
        unit: "usd_per_minute",
        note: null,
        updated_at: "",
      },
    ]);

    assert.equal(snapshot.rate.service_code, "ODC");
    assert.equal(snapshot.settings.cold_chain_surcharge, 35.0);
    assert.equal(snapshot.settings.wait_time_per_minute, 1.75);
  });
});
