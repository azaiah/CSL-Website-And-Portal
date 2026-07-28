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
import {
  plSummary,
  totalsByCategory,
  monthOverMonth,
  filterByDateRange,
  UNCATEGORISED_ID,
} from "./calc";
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

/**
 * Regression test for a real bug: totalsByCategory() used to skip any entry
 * whose category had been deleted, while plSummary() still counted it. Since
 * finance_entries.category_id is `on delete set null`, deleting a category made
 * the chart total silently disagree with Net Profit. These assertions fail if
 * that behaviour ever comes back.
 */
describe("totalsByCategory with orphaned entries", () => {
  const orphan: FinanceEntry = {
    id: "orphan-1",
    entry_date: "2026-07-15",
    kind: "expense",
    category_id: null,
    description: "Category since deleted",
    amount: 450,
    opportunity_id: null,
    custom_fields: {},
    notes: null,
    created_at: "",
    updated_at: "",
    created_by: null,
  };

  const withOrphan = [...entries, orphan];

  it("keeps orphaned money instead of dropping it", () => {
    const totals = totalsByCategory(withOrphan, categories);
    const charted = totals.reduce((sum, t) => sum + t.amount, 0);
    const { income, expenses } = plSummary(withOrphan);
    assert.equal(
      charted,
      income + expenses,
      "chart total must equal the P&L total, orphans included"
    );
  });

  it("surfaces orphans as an Uncategorised row", () => {
    const totals = totalsByCategory(withOrphan, categories);
    const row = totals.find((t) => t.categoryId.startsWith(UNCATEGORISED_ID));
    assert.ok(row, "an Uncategorised row should exist");
    assert.equal(row!.name, "Uncategorised");
    assert.equal(row!.amount, 450);
    assert.equal(row!.kind, "expense");
  });

  it("scopes to one kind when asked, so measures never share a scale", () => {
    const onlyExpenses = totalsByCategory(withOrphan, categories, "expense");
    assert.ok(
      onlyExpenses.every((t) => t.kind === "expense"),
      "expense view must contain no income rows"
    );
    const onlyIncome = totalsByCategory(withOrphan, categories, "income");
    assert.ok(
      onlyIncome.every((t) => t.kind === "income"),
      "income view must contain no expense rows"
    );
  });
});
