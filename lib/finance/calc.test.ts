/**
 * lib/finance/calc.test.ts
 * ---------------------------------------------------------------------------
 * Lightweight unit tests for the pure finance calculation functions. Runs with
 * any TypeScript runner (e.g. tsx, ts-node) or can be compiled to JS and run
 * with Node directly.
 * ---------------------------------------------------------------------------
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { plSummary, totalsByCategory, monthOverMonth, filterByDateRange } from "./calc";
import type { FinanceEntry, FinanceCategory, MonthlyPL } from "./types";

const categories: FinanceCategory[] = [
  { id: "cat-1", name: "Fuel", kind: "expense", sort_order: 0, is_archived: false, created_at: "", updated_at: "" },
  { id: "cat-2", name: "Revenue", kind: "income", sort_order: 1, is_archived: false, created_at: "", updated_at: "" },
];

const entries: FinanceEntry[] = [
  {
    id: "1",
    entry_date: "2026-07-01",
    kind: "income",
    category_id: "cat-2",
    description: "Client A",
    amount: 5000,
    opportunity_id: null,
    custom_fields: {},
    notes: null,
    created_at: "",
    updated_at: "",
    created_by: null,
  },
  {
    id: "2",
    entry_date: "2026-07-05",
    kind: "income",
    category_id: "cat-2",
    description: "Client B",
    amount: 3000,
    opportunity_id: null,
    custom_fields: {},
    notes: null,
    created_at: "",
    updated_at: "",
    created_by: null,
  },
  {
    id: "3",
    entry_date: "2026-07-10",
    kind: "expense",
    category_id: "cat-1",
    description: "Gas",
    amount: 1200,
    opportunity_id: null,
    custom_fields: {},
    notes: null,
    created_at: "",
    updated_at: "",
    created_by: null,
  },
];

describe("plSummary", () => {
  it("matches Income − Expenses", () => {
    const summary = plSummary(entries);
    assert.equal(summary.income, 8000);
    assert.equal(summary.expenses, 1200);
    assert.equal(summary.net, 6800); // 8000 - 1200
    assert.equal(summary.margin, 85); // 6800 / 8000 * 100
  });
});

describe("totalsByCategory", () => {
  it("sorts descending by amount and preserves kind", () => {
    const totals = totalsByCategory(entries, categories);
    assert.equal(totals.length, 2);
    assert.equal(totals[0].name, "Revenue");
    assert.equal(totals[0].amount, 8000);
    assert.equal(totals[0].kind, "income");
    assert.equal(totals[1].name, "Fuel");
    assert.equal(totals[1].amount, 1200);
    assert.equal(totals[1].kind, "expense");
  });
});

describe("filterByDateRange", () => {
  it("includes only entries inside the inclusive range", () => {
    const filtered = filterByDateRange(entries, { from: "2026-07-01", to: "2026-07-05" });
    assert.equal(filtered.length, 2);
    assert.equal(filtered[0].description, "Client A");
    assert.equal(filtered[1].description, "Client B");
  });
});

describe("monthOverMonth", () => {
  it("compares the current month to the previous month", () => {
    const monthly: MonthlyPL[] = [
      { month: "2026-06-01", income: 4000, expenses: 1000, net: 3000 },
      { month: "2026-07-01", income: 8000, expenses: 1200, net: 6800 },
    ];
    const mom = monthOverMonth(monthly, "2026-07-28")!;
    assert.equal(mom.currentNet, 6800);
    assert.equal(mom.previousNet, 3000);
    assert.equal(mom.delta, 3800);
    assert.equal(mom.percentChange, (3800 / 3000) * 100);
  });
});
