"use client";

/**
 * components/portal/jobs/job-fields.tsx
 * ---------------------------------------------------------------------------
 * The form controls the job detail page is built from.
 *
 * The job page is a form rather than a page of click-to-edit fields, because
 * the thing it is replacing is a form — the client's Route Dispatch Form. A
 * driver filling one in works top to bottom and saves once; making him click
 * each of thirty-odd fields to open it would be slower than the paper.
 * ---------------------------------------------------------------------------
 */

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { sanitizeDecimal } from "@/lib/quotes/format";

const CONTROL =
  "w-full rounded-xl border border-navy/15 bg-white px-3 py-2 text-sm text-ink/90 " +
  "focus:border-navy/40 focus:outline-none focus:ring-2 focus:ring-gold/40";

/** A titled group of fields, matching one block of the dispatch form. */
export function JobSection({
  step,
  title,
  caption,
  children,
}: {
  /** The number this block carries on the paper form. */
  step: number;
  title: string;
  caption?: string;
  children: ReactNode;
}) {
  return (
    <section className="card">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-navy-deep text-xs font-bold text-gold">
          {step}
        </span>
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-navy-deep">{title}</h2>
          {caption && (
            <p className="mt-0.5 break-words text-xs text-ink/55">{caption}</p>
          )}
        </div>
      </div>
      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{children}</div>
    </section>
  );
}

export function Field({
  label,
  hint,
  span,
  children,
}: {
  label: string;
  hint?: string;
  /** Let a wide field take the whole row. */
  span?: boolean;
  children: ReactNode;
}) {
  return (
    <label className={cn("block min-w-0 text-sm", span && "sm:col-span-2 lg:col-span-3")}>
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink/50">
        {label}
      </span>
      {children}
      {hint && <span className="mt-1 block break-words text-xs text-ink/45">{hint}</span>}
    </label>
  );
}

export function TextField({
  value,
  onChange,
  placeholder,
  multiline,
}: {
  value: string | null;
  onChange: (next: string | null) => void;
  placeholder?: string;
  multiline?: boolean;
}) {
  // Empty string is stored as null so a cleared field is genuinely unset
  // rather than an empty string that sorts and filters differently.
  const handle = (raw: string) => onChange(raw === "" ? null : raw);

  if (multiline) {
    return (
      <textarea
        value={value ?? ""}
        onChange={(e) => handle(e.target.value)}
        placeholder={placeholder}
        rows={3}
        className={cn(CONTROL, "resize-y")}
      />
    );
  }
  return (
    <input
      type="text"
      value={value ?? ""}
      onChange={(e) => handle(e.target.value)}
      placeholder={placeholder}
      className={CONTROL}
    />
  );
}

/**
 * Numeric input that keeps the raw string while typing.
 *
 * Binding a number straight to the input makes "3." unrepresentable, so the
 * decimal point vanishes as it is typed. sanitizeDecimal also caps the value at
 * one decimal point — parseFloat would quietly read "1.652.50" as 1.652 and
 * save that, which is how a wrong rate gets into the database unnoticed.
 */
export function NumberField({
  value,
  onChange,
  placeholder,
  prefix,
  suffix,
}: {
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
  prefix?: string;
  suffix?: string;
}) {
  return (
    <span className="relative block">
      {prefix && (
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-ink/50">
          {prefix}
        </span>
      )}
      <input
        type="text"
        inputMode="decimal"
        value={value}
        onChange={(e) => onChange(sanitizeDecimal(e.target.value))}
        placeholder={placeholder}
        className={cn(CONTROL, prefix && "pl-7", suffix && "pr-12", "tabular-nums")}
      />
      {suffix && (
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-ink/50">
          {suffix}
        </span>
      )}
    </span>
  );
}

export function DateField({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (next: string | null) => void;
}) {
  return (
    <input
      type="date"
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value === "" ? null : e.target.value)}
      className={CONTROL}
    />
  );
}

/** Postgres `time` comes back as "14:30:00"; the input wants "14:30". */
export function TimeField({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (next: string | null) => void;
}) {
  return (
    <input
      type="time"
      value={value ? value.slice(0, 5) : ""}
      onChange={(e) => onChange(e.target.value === "" ? null : e.target.value)}
      className={CONTROL}
    />
  );
}

export function SelectField({
  value,
  onChange,
  options,
  emptyLabel = "—",
}: {
  value: string | null;
  onChange: (next: string | null) => void;
  options: { value: string; label: string }[];
  emptyLabel?: string;
}) {
  return (
    <select
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value === "" ? null : e.target.value)}
      className={CONTROL}
    >
      <option value="">{emptyLabel}</option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

export function CheckField({
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
    <label className="flex min-w-0 items-start gap-2.5 text-sm sm:col-span-2 lg:col-span-3">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 h-4 w-4 shrink-0 rounded border-navy/25 text-navy focus:ring-gold"
      />
      <span className="min-w-0">
        <span className="block font-medium text-navy-deep">{label}</span>
        {hint && <span className="block break-words text-xs text-ink/55">{hint}</span>}
      </span>
    </label>
  );
}

/**
 * A value the database owns. Rendered as text, never as an input, so there is
 * no control to type into and wonder why the value snapped back.
 */
export function ReadOnlyValue({
  value,
  hint,
}: {
  value: string;
  hint?: string;
}) {
  return (
    <span className="block">
      <span className="block rounded-xl border border-dashed border-navy/15 bg-surface px-3 py-2 text-sm font-semibold tabular-nums text-navy-deep">
        {value}
      </span>
      {hint && <span className="mt-1 block break-words text-xs text-ink/45">{hint}</span>}
    </span>
  );
}
