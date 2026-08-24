"use client";

/**
 * components/portal/customers/customer-form.tsx
 * ---------------------------------------------------------------------------
 * Drawer for creating and editing a customer. Same shape as the finance
 * module's EntryForm: right-hand sheet, sticky header, Escape to close,
 * validation before the write.
 *
 * The whole point of this drawer is that it is the ONLY place customer details
 * are typed. The client's spreadsheet re-types name, address, phone and email
 * on every route row, which is why VCU Health will eventually appear forty
 * times with one typo in the email.
 * ---------------------------------------------------------------------------
 */

import { useCallback, useEffect, useState } from "react";
import { X, Loader2 } from "lucide-react";
import type { Customer, LookupValue } from "@/lib/quotes/types";

export interface CustomerDraft {
  name: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  delivery_type: string | null;
  notes: string | null;
}

function draftFrom(customer: Customer | null): CustomerDraft {
  return {
    name: customer?.name ?? "",
    address: customer?.address ?? "",
    phone: customer?.phone ?? "",
    email: customer?.email ?? "",
    delivery_type: customer?.delivery_type ?? "",
    notes: customer?.notes ?? "",
  };
}

/** Empty strings become null so the column stays honestly empty, not "". */
const orNull = (v: string | null) => {
  const t = (v ?? "").trim();
  return t === "" ? null : t;
};

export function CustomerForm({
  open,
  onClose,
  customer,
  deliveryTypes,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  /** null = creating. */
  customer: Customer | null;
  deliveryTypes: LookupValue[];
  onSubmit: (draft: CustomerDraft) => Promise<boolean>;
}) {
  const [form, setForm] = useState<CustomerDraft>(draftFrom(null));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  // Reload the draft whenever the drawer opens onto a different record.
  useEffect(() => {
    if (open) {
      setForm(draftFrom(customer));
      setErrors({});
    }
  }, [open, customer]);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  const update = useCallback(
    <K extends keyof CustomerDraft>(key: K, value: CustomerDraft[K]) => {
      setForm((f) => ({ ...f, [key]: value }));
      setErrors((e) => ({ ...e, [key]: "" }));
    },
    []
  );

  function validate(): boolean {
    const next: Record<string, string> = {};
    const name = (form.name ?? "").trim();

    // Mirrors the SQL check: char_length(name) between 1 and 200.
    if (name === "") next.name = "A customer needs a name.";
    else if (name.length > 200) next.name = "Keep the name under 200 characters.";

    const email = (form.email ?? "").trim();
    if (email !== "" && !email.includes("@")) {
      next.email = "That does not look like an email address.";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    const ok = await onSubmit({
      name: (form.name ?? "").trim(),
      address: orNull(form.address),
      phone: orNull(form.phone),
      email: orNull(form.email),
      delivery_type: orNull(form.delivery_type),
      notes: orNull(form.notes),
    });
    setSubmitting(false);
    if (ok) onClose();
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-navy-deep/40" onClick={onClose} aria-hidden />

      <div className="relative z-10 flex h-full w-full max-w-md flex-col overflow-y-auto bg-white shadow-2xl sm:max-w-lg">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-navy/10 bg-white px-6 py-4">
          <h2 className="text-lg font-semibold text-navy-deep">
            {customer ? "Edit customer" : "New customer"}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-ink/50 hover:bg-surface hover:text-navy-deep"
            aria-label="Close drawer"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-1 flex-col gap-4 px-6 py-5">
          <Field label="Name" required error={errors.name}>
            <input
              type="text"
              value={form.name ?? ""}
              onChange={(e) => update("name", e.target.value)}
              maxLength={200}
              autoFocus
              className="w-full rounded-xl border border-navy/15 px-3 py-2 text-sm"
              placeholder="VCU Health — Main Lab"
            />
          </Field>

          <Field label="Delivery type">
            <select
              value={form.delivery_type ?? ""}
              onChange={(e) => update("delivery_type", e.target.value)}
              className="w-full rounded-xl border border-navy/15 bg-white px-3 py-2 text-sm"
            >
              <option value="">Not set</option>
              {deliveryTypes.map((d) => (
                <option key={d.id} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Phone">
            <input
              type="tel"
              value={form.phone ?? ""}
              onChange={(e) => update("phone", e.target.value)}
              className="w-full rounded-xl border border-navy/15 px-3 py-2 text-sm"
              placeholder="(804) 555-0100"
            />
          </Field>

          <Field label="Email" error={errors.email}>
            <input
              type="email"
              value={form.email ?? ""}
              onChange={(e) => update("email", e.target.value)}
              className="w-full rounded-xl border border-navy/15 px-3 py-2 text-sm"
              placeholder="dispatch@example.org"
            />
          </Field>

          <Field label="Address">
            <textarea
              value={form.address ?? ""}
              onChange={(e) => update("address", e.target.value)}
              rows={2}
              className="w-full resize-y rounded-xl border border-navy/15 px-3 py-2 text-sm"
              placeholder="1250 E Marshall St, Richmond, VA 23298"
            />
          </Field>

          <Field label="Notes">
            <textarea
              value={form.notes ?? ""}
              onChange={(e) => update("notes", e.target.value)}
              rows={3}
              className="w-full resize-y rounded-xl border border-navy/15 px-3 py-2 text-sm"
              placeholder="Ask for Maria after 2pm. Dock is round the back."
            />
          </Field>

          <div className="mt-auto flex items-center justify-end gap-3 border-t border-navy/10 pt-4">
            <button type="button" onClick={onClose} className="btn-ghost text-sm">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn-navy text-sm">
              {submitting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
              {customer ? "Save changes" : "Create customer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink/60">
        {label}
        {required && <span className="ml-0.5 text-[#8a6c1f]">*</span>}
      </span>
      {children}
      {error && <span className="mt-1 block break-words text-xs text-red-600">{error}</span>}
    </label>
  );
}
