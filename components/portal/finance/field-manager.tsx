"use client";

import { useEffect, useMemo, useState } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FieldDef, FieldType, AppliesTo } from "@/lib/finance/types";
import { labelToKey } from "@/lib/finance/calc";

interface FieldManagerProps {
  open: boolean;
  onClose: () => void;
  fieldDefs: FieldDef[];
  onCreate: (field: Omit<FieldDef, "id" | "created_at" | "updated_at">) => Promise<FieldDef | null>;
  onArchive: (id: string) => Promise<boolean>;
}

const FIELD_TYPES: FieldType[] = ["text", "number", "currency", "date", "select", "boolean"];
const APPLIES_TO: AppliesTo[] = ["expense", "income", "both"];

export function FieldManager({
  open,
  onClose,
  fieldDefs,
  onCreate,
  onArchive,
}: FieldManagerProps) {
  const [label, setLabel] = useState("");
  const [fieldType, setFieldType] = useState<FieldType>("text");
  const [appliesTo, setAppliesTo] = useState<AppliesTo>("both");
  const [required, setRequired] = useState(false);
  const [optionsText, setOptionsText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generatedKey = useMemo(() => labelToKey(label), [label]);

  useEffect(() => {
    if (!open) {
      setLabel("");
      setFieldType("text");
      setAppliesTo("both");
      setRequired(false);
      setOptionsText("");
      setError(null);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const cleanLabel = label.trim();
    if (!cleanLabel) return;

    if (generatedKey === "") {
      setError("Enter a label that includes letters or numbers.");
      return;
    }

    const keyExists = fieldDefs.some((f) => f.key === generatedKey);
    if (keyExists) {
      setError(`A field with the key “${generatedKey}” already exists. Use a different label.`);
      return;
    }

    let options: string[] | null = null;
    if (fieldType === "select") {
      options = parseOptions(optionsText);
      if (options.length === 0) {
        setError("Select fields need at least one option.");
        return;
      }
    }

    setSubmitting(true);
    const created = await onCreate({
      key: generatedKey,
      label: cleanLabel,
      field_type: fieldType,
      options,
      required,
      applies_to: appliesTo,
      sort_order: fieldDefs.length,
      is_archived: false,
    });
    setSubmitting(false);

    if (created) {
      setLabel("");
      setFieldType("text");
      setAppliesTo("both");
      setRequired(false);
      setOptionsText("");
      setError(null);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-navy-deep/40" onClick={onClose} aria-hidden />
      <div className="relative z-10 flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-navy/10 px-6 py-4">
          <h2 className="text-lg font-semibold text-navy-deep">Customise fields</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-ink/50 hover:bg-surface hover:text-navy-deep"
            aria-label="Close"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {/* Existing fields */}
          <section className="mb-6">
            <h3 className="mb-3 text-sm font-semibold text-navy-deep">Active fields</h3>
            {fieldDefs.length === 0 ? (
              <p className="text-sm text-ink/50">No custom fields yet.</p>
            ) : (
              <ul className="space-y-2">
                {fieldDefs.map((field) => (
                  <li
                    key={field.id}
                    className="flex items-center justify-between rounded-xl border border-navy/10 bg-surface px-3 py-2 text-sm"
                  >
                    <div>
                      <p className="font-medium text-navy-deep">{field.label}</p>
                      <p className="text-xs text-ink/50">
                        {field.key} · {field.field_type} · {field.applies_to}
                        {field.required && " · required"}
                      </p>
                    </div>
                    <button
                      onClick={() => onArchive(field.id)}
                      className="rounded-lg p-1.5 text-ink/50 hover:bg-red-50 hover:text-red-600"
                      aria-label={`Archive ${field.label}`}
                      title="Archive — existing data is kept"
                    >
                      <Trash2 className="h-4 w-4" aria-hidden />
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <p className="mt-2 text-xs text-ink/40">
              Archiving hides a field from the table and form but keeps any data already stored.
            </p>
          </section>

          {/* Add new field */}
          <section className="rounded-xl border border-navy/10 bg-surface p-4">
            <h3 className="mb-3 text-sm font-semibold text-navy-deep">Add new field</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <label className="block text-sm">
                <span className="mb-1.5 block font-medium text-navy-deep">Label</span>
                <input
                  type="text"
                  value={label}
                  onChange={(e) => {
                    setLabel(e.target.value);
                    setError(null);
                  }}
                  placeholder="e.g. Vehicle"
                  className="w-full rounded-xl border border-navy/15 bg-white px-3 py-2 text-sm"
                />
                {generatedKey && (
                  <p className="mt-1 text-xs text-ink/50">
                    Key: <code className="rounded bg-white px-1 py-0.5 text-navy-deep">{generatedKey}</code>
                  </p>
                )}
              </label>

              <div className="grid grid-cols-2 gap-3">
                <label className="block text-sm">
                  <span className="mb-1.5 block font-medium text-navy-deep">Type</span>
                  <select
                    value={fieldType}
                    onChange={(e) => setFieldType(e.target.value as FieldType)}
                    className="w-full rounded-xl border border-navy/15 bg-white px-3 py-2 text-sm"
                  >
                    {FIELD_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block text-sm">
                  <span className="mb-1.5 block font-medium text-navy-deep">Applies to</span>
                  <select
                    value={appliesTo}
                    onChange={(e) => setAppliesTo(e.target.value as AppliesTo)}
                    className="w-full rounded-xl border border-navy/15 bg-white px-3 py-2 text-sm"
                  >
                    {APPLIES_TO.map((a) => (
                      <option key={a} value={a}>
                        {a}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              {fieldType === "select" && (
                <label className="block text-sm">
                  <span className="mb-1.5 block font-medium text-navy-deep">Options</span>
                  <input
                    type="text"
                    value={optionsText}
                    onChange={(e) => setOptionsText(e.target.value)}
                    placeholder="Van, Car, Bike (comma separated)"
                    className="w-full rounded-xl border border-navy/15 bg-white px-3 py-2 text-sm"
                  />
                </label>
              )}

              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={required}
                  onChange={(e) => setRequired(e.target.checked)}
                  className="h-4 w-4 rounded border-navy/15 text-navy focus:ring-gold"
                />
                <span className="font-medium text-navy-deep">Required</span>
              </label>

              {error && <p className="text-xs text-red-600">{error}</p>}

              <button type="submit" disabled={submitting} className="btn-navy w-full text-sm">
                <Plus className="h-4 w-4" aria-hidden />
                {submitting ? "Adding…" : "Add field"}
              </button>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}

function parseOptions(text: string): string[] {
  return text
    .split(/[,\n]+/)
    .map((o) => o.trim())
    .filter((o) => o.length > 0);
}
