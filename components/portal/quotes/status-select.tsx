"use client";

/**
 * components/portal/quotes/status-select.tsx
 * ---------------------------------------------------------------------------
 * The editable status chip for quotes and jobs.
 *
 * WHY THIS IS NOT components/portal/status-control.tsx
 * ---------------------------------------------------
 * StatusControl reads and writes through useStatuses(), which persists to the
 * record_status table. That is right for documents, outreach drafts and vet
 * leads, whose "real" status is computed by the sweep engine and where a human
 * change is an override layered on top.
 *
 * Quote and job status is not an override of anything. It is a column on the
 * quotes / jobs row — deliberately, per migration 003's header and 004's
 * Section 4: the quote and its outcome are one fact, so they live in one place.
 * Routing them through record_status would store the same fact twice and give
 * two screens licence to disagree.
 *
 * StatusControl's `kind` prop is typed StatusSubjectKind | "opportunity", so
 * "quote" would not even compile. This is the same control, visually and by
 * interaction, over a plain value/onChange contract instead.
 *
 * Native <select> for the same reason as StatusControl: the client uses this on
 * a phone, and a native select gets the OS picker, keyboard handling and
 * screen-reader semantics for free.
 * ---------------------------------------------------------------------------
 */

import { useId, useState } from "react";
import { ChevronDown, Loader2, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { StatusOption } from "@/lib/status-options";

export function StatusSelect<T extends string>({
  value,
  options,
  styleFor,
  onChange,
  size = "md",
  label = "Status",
  className,
}: {
  value: T;
  options: StatusOption<T>[];
  styleFor: (value: T) => string;
  /** Resolve false to roll the chip back to `value`. */
  onChange: (next: T) => Promise<boolean>;
  size?: "sm" | "md";
  label?: string;
  className?: string;
}) {
  const selectId = useId();
  const [busy, setBusy] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  /**
   * Shown while a write is in flight so the chip reflects the tap immediately.
   * Cleared on both paths, so a rejected write snaps back to the server value
   * rather than leaving the chip lying about what was saved.
   */
  const [pending, setPending] = useState<T | null>(null);
  const current = pending ?? value;

  async function change(next: string) {
    if (next === current || busy) return;
    setBusy(true);
    setPending(next as T);

    const ok = await onChange(next as T);

    setBusy(false);
    setPending(null);
    if (ok) {
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 1800);
    }
  }

  const pad = size === "sm" ? "py-1 pl-2.5 pr-7 text-xs" : "py-1.5 pl-3 pr-8 text-sm";

  return (
    <div className={cn("inline-flex flex-col items-start gap-1", className)}>
      <label htmlFor={selectId} className="sr-only">
        {label}
      </label>

      <div className="relative inline-flex items-center">
        <select
          id={selectId}
          value={current}
          disabled={busy}
          onChange={(e) => void change(e.target.value)}
          className={cn(
            "cursor-pointer appearance-none rounded-full font-semibold outline-none transition-shadow",
            "focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-1",
            "disabled:cursor-wait disabled:opacity-70",
            pad,
            styleFor(current)
          )}
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>

        {/* Inside the chip, pointer-events-none so the whole chip stays one
            tap target for the select underneath. */}
        <span className="pointer-events-none absolute right-2 flex items-center">
          {busy ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin opacity-70" aria-hidden />
          ) : justSaved ? (
            <Check className="h-3.5 w-3.5 opacity-80" aria-hidden />
          ) : (
            <ChevronDown className="h-3.5 w-3.5 opacity-70" aria-hidden />
          )}
        </span>
      </div>
    </div>
  );
}
