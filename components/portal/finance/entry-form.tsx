"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { X, Plus, Save } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import type {
  FinanceEntry,
  FinanceCategory,
  FieldDef,
  FinanceKind,
} from "@/lib/finance/types";
import type { Opportunity } from "@/lib/data/opportunities";
import type { Customer, Job } from "@/lib/quotes/types";
import { parseAmount } from "@/lib/finance/calc";

const NEW_CATEGORY = "__new__";

interface EntryFormProps {
  open: boolean;
  onClose: () => void;
  entry: FinanceEntry | null;
  categories: FinanceCategory[];
  fieldDefs: FieldDef[];
  opportunities: Opportunity[];
  /** Optional so the form still works before jobs exist. */
  jobs?: Job[];
  customers?: Customer[];
  onSubmit: (
    entry: Omit<FinanceEntry, "id" | "created_at" | "updated_at" | "created_by">
  ) => Promise<boolean>;
  onCreateCategory: (
    category: Omit<FinanceCategory, "id" | "created_at" | "updated_at">
  ) => Promise<FinanceCategory | null>;
}

export function EntryForm({
  open,
  onClose,
  entry,
  categories,
  fieldDefs,
  opportunities,
  jobs = [],
  customers = [],
  onSubmit,
  onCreateCategory,
}: EntryFormProps) {
  const activeFields = useMemo(
    () => fieldDefs.filter((f) => !f.is_archived),
    [fieldDefs]
  );

  const initialForm = useMemo(
    () => ({
      entry_date: entry?.entry_date ?? new Date().toISOString().slice(0, 10),
      kind: entry?.kind ?? "expense",
      category_id: entry?.category_id ?? "",
      description: entry?.description ?? "",
      amount: entry?.amount ?? 0,
      opportunity_id: entry?.opportunity_id ?? null,
      job_id: entry?.job_id ?? null,
      customer_id: entry?.customer_id ?? null,
      quote_id: entry?.quote_id ?? null,
      is_overhead: entry?.is_overhead ?? false,
      custom_fields: entry?.custom_fields ?? {},
      notes: entry?.notes ?? null,
    }),
    [entry]
  );

  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [showNewCategory, setShowNewCategory] = useState(false);

  useEffect(() => {
    setForm(initialForm);
    setErrors({});
    setShowNewCategory(false);
    setNewCategoryName("");
  }, [initialForm]);

  // When kind changes, drop the category if it no longer matches.
  const categoriesForKind = useMemo(
    () => categories.filter((c) => c.kind === form.kind),
    [categories, form.kind]
  );

  useEffect(() => {
    const current = categories.find((c) => c.id === form.category_id);
    if (current && current.kind !== form.kind) {
      setForm((f) => ({ ...f, category_id: "" }));
    }
  }, [form.kind, categories, form.category_id]);

  // Escape closes the drawer.
  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  const updateField = useCallback(
    <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
      setForm((f) => ({ ...f, [key]: value }));
      setErrors((e) => ({ ...e, [key]: "" }));
    },
    []
  );

  const updateCustomField = useCallback((key: string, value: unknown) => {
    setForm((f) => ({ ...f, custom_fields: { ...f.custom_fields, [key]: value } }));
  }, []);

  function validate(): boolean {
    const next: Record<string, string> = {};
    if (!/^\d{4}-\d{2}-\d{2}$/.test(form.entry_date)) {
      next.entry_date = "Enter a valid date.";
    }
    if (!form.category_id) {
      next.category_id = "Select a category.";
    }
    if (!form.description.trim()) {
      next.description = "Description is required.";
    }
    if (!Number.isFinite(form.amount) || form.amount < 0) {
      next.amount = "Amount must be 0 or more.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    const ok = await onSubmit(form);
    setSubmitting(false);
    if (ok) onClose();
  }

  async function handleCreateCategory() {
    const name = newCategoryName.trim();
    if (!name) return;
    const created = await onCreateCategory({
      name,
      kind: form.kind,
      sort_order: categories.length,
      is_archived: false,
    });
    if (created) {
      setForm((f) => ({ ...f, category_id: created.id }));
      setShowNewCategory(false);
      setNewCategoryName("");
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true">
      <div
        className="absolute inset-0 bg-navy-deep/40"
        onClick={onClose}
        aria-hidden
      />
      <div className="relative z-10 flex h-full w-full max-w-md flex-col overflow-y-auto bg-white shadow-2xl sm:max-w-lg">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-navy/10 bg-white px-6 py-4">
          <h2 className="text-lg font-semibold text-navy-deep">
            {entry ? "Edit entry" : "Add entry"}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-ink/50 hover:bg-surface hover:text-navy-deep"
            aria-label="Close drawer"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex-1 space-y-5 px-6 py-6"
        >
          {/* Date */}
          <label className="block text-sm">
            <span className="mb-1.5 block font-medium text-navy-deep">Date</span>
            <input
              type="date"
              value={form.entry_date}
              onChange={(e) => updateField("entry_date", e.target.value)}
              className={cn(
                "w-full rounded-xl border bg-white px-3 py-2 text-sm",
                errors.entry_date ? "border-red-300" : "border-navy/15"
              )}
            />
            {errors.entry_date && <p className="mt-1 text-xs text-red-600">{errors.entry_date}</p>}
          </label>

          {/* Kind toggle */}
          <div>
            <span className="mb-1.5 block text-sm font-medium text-navy-deep">Kind</span>
            <div className="inline-flex rounded-full bg-surface p-1">
              {(["expense", "income"] as FinanceKind[]).map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => updateField("kind", k)}
                  className={cn(
                    "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                    form.kind === k
                      ? k === "income"
                        ? "bg-success text-white"
                        : "bg-red-500 text-white"
                      : "text-ink/60 hover:text-navy-deep"
                  )}
                >
                  {k === "income" ? "Income" : "Expense"}
                </button>
              ))}
            </div>
          </div>

          {/* Category */}
          <div>
            <span className="mb-1.5 block text-sm font-medium text-navy-deep">Category</span>
            {!showNewCategory ? (
              <div className="flex gap-2">
                <select
                  value={form.category_id}
                  onChange={(e) => {
                    if (e.target.value === NEW_CATEGORY) {
                      setShowNewCategory(true);
                    } else {
                      updateField("category_id", e.target.value);
                    }
                  }}
                  className={cn(
                    "flex-1 rounded-xl border bg-white px-3 py-2 text-sm",
                    errors.category_id ? "border-red-300" : "border-navy/15"
                  )}
                >
                  <option value="">Select category</option>
                  {categoriesForKind.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                  <option value={NEW_CATEGORY}>＋ New category</option>
                </select>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder={`New ${form.kind} category`}
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="flex-1 rounded-xl border border-navy/15 px-3 py-2 text-sm"
                />
                <button
                  type="button"
                  onClick={handleCreateCategory}
                  className="btn-navy px-3 py-2"
                >
                  <Plus className="h-4 w-4" aria-hidden />
                </button>
                <button
                  type="button"
                  onClick={() => setShowNewCategory(false)}
                  className="rounded-xl border border-navy/15 px-3 py-2 text-sm hover:bg-surface"
                >
                  Cancel
                </button>
              </div>
            )}
            {errors.category_id && <p className="mt-1 text-xs text-red-600">{errors.category_id}</p>}
          </div>

          {/* Description */}
          <label className="block text-sm">
            <span className="mb-1.5 block font-medium text-navy-deep">Description</span>
            <input
              type="text"
              value={form.description}
              onChange={(e) => updateField("description", e.target.value)}
              className={cn(
                "w-full rounded-xl border bg-white px-3 py-2 text-sm",
                errors.description ? "border-red-300" : "border-navy/15"
              )}
            />
            {errors.description && <p className="mt-1 text-xs text-red-600">{errors.description}</p>}
          </label>

          {/* Amount */}
          <label className="block text-sm">
            <span className="mb-1.5 block font-medium text-navy-deep">Amount</span>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/50">$</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.amount}
                onChange={(e) => {
                  const parsed = parseAmount(e.target.value);
                  updateField("amount", Number.isNaN(parsed) ? 0 : parsed);
                }}
                className={cn(
                  "w-full rounded-xl border bg-white py-2 pl-7 pr-3 text-sm",
                  errors.amount ? "border-red-300" : "border-navy/15"
                )}
              />
            </div>
            {errors.amount && <p className="mt-1 text-xs text-red-600">{errors.amount}</p>}
          </label>

          {/* Opportunity link */}
          <label className="block text-sm">
            <span className="mb-1.5 block font-medium text-navy-deep">Linked opportunity</span>
            <select
              value={form.opportunity_id ?? ""}
              onChange={(e) =>
                updateField("opportunity_id", e.target.value || null)
              }
              className="w-full rounded-xl border border-navy/15 bg-white px-3 py-2 text-sm"
            >
              <option value="">None</option>
              {opportunities.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.id} — {o.title}
                </option>
              ))}
            </select>
          </label>

          {/* Job / customer attribution, added by migration 004 */}
          <div className="space-y-4 rounded-xl border border-navy/10 bg-surface p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink/50">
              Attribution
            </p>

            <label className="block text-sm">
              <span className="mb-1.5 block font-medium text-navy-deep">Job</span>
              <select
                value={form.job_id ?? ""}
                onChange={(e) => {
                  const jobId = e.target.value || null;
                  const job = jobs.find((j) => j.id === jobId);
                  setForm((f) => ({
                    ...f,
                    job_id: jobId,
                    // Denormalise the customer so per-customer rollups skip a join.
                    customer_id: job ? job.customer_id : f.customer_id,
                    quote_id: job ? job.quote_id : f.quote_id,
                    // A cost booked against a specific run is attributable to
                    // it by definition, so it cannot also be overhead. Leaving
                    // both set would drop the cost from job margin silently.
                    is_overhead: jobId ? false : f.is_overhead,
                  }));
                }}
                className="w-full rounded-xl border border-navy/15 bg-white px-3 py-2 text-sm"
              >
                <option value="">None</option>
                {jobs.map((j) => (
                  <option key={j.id} value={j.id}>
                    {j.uid} — {j.service_code}
                    {j.pickup_date ? ` · ${j.pickup_date}` : ""}
                  </option>
                ))}
              </select>
              {jobs.length === 0 && (
                <span className="mt-1 block text-xs text-ink/50">
                  No jobs yet — costs can still be logged without one.
                </span>
              )}
            </label>

            <label className="block text-sm">
              <span className="mb-1.5 block font-medium text-navy-deep">Customer</span>
              <select
                value={form.customer_id ?? ""}
                onChange={(e) => updateField("customer_id", e.target.value || null)}
                className="w-full rounded-xl border border-navy/15 bg-white px-3 py-2 text-sm"
              >
                <option value="">None</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex items-start gap-2.5 text-sm">
              <input
                type="checkbox"
                checked={form.is_overhead}
                onChange={(e) => {
                  const on = e.target.checked;
                  setForm((f) => ({
                    ...f,
                    is_overhead: on,
                    // Mutually exclusive with a job, for the reason above.
                    job_id: on ? null : f.job_id,
                  }));
                }}
                className="mt-0.5 h-4 w-4 shrink-0 rounded border-navy/15 text-navy focus:ring-gold"
              />
              <span className="min-w-0">
                <span className="block font-medium text-navy-deep">
                  Overhead (not attributable to a job)
                </span>
                <span className="block break-words text-xs text-ink/55">
                  Insurance, subscriptions, phone — counts toward net profit, excluded from
                  per-job margin.
                </span>
              </span>
            </label>
          </div>

          {/* Notes */}
          <label className="block text-sm">
            <span className="mb-1.5 block font-medium text-navy-deep">Notes</span>
            <textarea
              value={form.notes ?? ""}
              onChange={(e) => updateField("notes", e.target.value || null)}
              rows={3}
              className="w-full rounded-xl border border-navy/15 bg-white px-3 py-2 text-sm"
            />
          </label>

          {/* Custom fields */}
          {activeFields.filter(
            (f) => f.applies_to === form.kind || f.applies_to === "both"
          ).length > 0 && (
            <div className="space-y-4 rounded-xl border border-navy/10 bg-surface p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-ink/50">
                Custom fields
              </p>
              {activeFields
                .filter((f) => f.applies_to === form.kind || f.applies_to === "both")
                .map((field) => (
                  <CustomFieldInput
                    key={field.id}
                    field={field}
                    value={form.custom_fields[field.key]}
                    onChange={(v) => updateCustomField(field.key, v)}
                  />
                ))}
            </div>
          )}

          <div className="sticky bottom-0 -mx-6 -mb-6 border-t border-navy/10 bg-white px-6 py-4">
            <button
              type="submit"
              disabled={submitting}
              className="btn-navy w-full"
            >
              <Save className="h-4 w-4" aria-hidden />
              {submitting ? "Saving…" : entry ? "Save changes" : "Add entry"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function CustomFieldInput({
  field,
  value,
  onChange,
}: {
  field: FieldDef;
  value: unknown;
  onChange: (value: unknown) => void;
}) {
  const baseClass = "w-full rounded-xl border border-navy/15 bg-white px-3 py-2 text-sm";

  switch (field.field_type) {
    case "text":
      return (
        <label className="block text-sm">
          <span className="mb-1.5 block font-medium text-navy-deep">
            {field.label} {field.required && <span className="text-red-500">*</span>}
          </span>
          <input
            type="text"
            required={field.required}
            value={typeof value === "string" ? value : ""}
            onChange={(e) => onChange(e.target.value || null)}
            className={baseClass}
          />
        </label>
      );
    case "number":
    case "currency":
      return (
        <label className="block text-sm">
          <span className="mb-1.5 block font-medium text-navy-deep">
            {field.label} {field.required && <span className="text-red-500">*</span>}
          </span>
          <input
            type="number"
            step={field.field_type === "currency" ? "0.01" : "1"}
            required={field.required}
            value={typeof value === "number" ? value : ""}
            onChange={(e) => onChange(e.target.value === "" ? null : Number(e.target.value))}
            className={baseClass}
          />
        </label>
      );
    case "date":
      return (
        <label className="block text-sm">
          <span className="mb-1.5 block font-medium text-navy-deep">
            {field.label} {field.required && <span className="text-red-500">*</span>}
          </span>
          <input
            type="date"
            required={field.required}
            value={typeof value === "string" ? value : ""}
            onChange={(e) => onChange(e.target.value || null)}
            className={baseClass}
          />
        </label>
      );
    case "select":
      return (
        <label className="block text-sm">
          <span className="mb-1.5 block font-medium text-navy-deep">
            {field.label} {field.required && <span className="text-red-500">*</span>}
          </span>
          <select
            required={field.required}
            value={typeof value === "string" ? value : ""}
            onChange={(e) => onChange(e.target.value || null)}
            className={baseClass}
          >
            <option value="">{field.required ? "Select…" : "—"}</option>
            {(field.options ?? []).map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
      );
    case "boolean":
      return (
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={Boolean(value)}
            onChange={(e) => onChange(e.target.checked)}
            className="h-4 w-4 rounded border-navy/15 text-navy focus:ring-gold"
          />
          <span className="font-medium text-navy-deep">
            {field.label} {field.required && <span className="text-red-500">*</span>}
          </span>
        </label>
      );
    default:
      return null;
  }
}
