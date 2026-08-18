"use client";

/**
 * components/portal/status-control.tsx
 * ---------------------------------------------------------------------------
 * The editable status chip, used on every record in the portal.
 *
 * Darren asked to be able to FIX these rather than just read them — a document
 * still saying "Action required" after he has done the thing, a draft still
 * saying "Awaiting approval" after he has approved it. So the chip is now the
 * control: tap it, pick the new state, done.
 *
 * It is a native <select> on purpose. The screenshots that prompted this were
 * taken on a phone, and a native select gets the operating system's own picker
 * — a full-height wheel with big targets — instead of a custom dropdown that
 * has to reinvent scrolling, focus and dismissal on touch. It also gets
 * keyboard support and screen-reader semantics for free.
 *
 * The chip keeps its colour coding, so the board still reads at a glance; the
 * only visible difference from the old static chip is a small chevron.
 * ---------------------------------------------------------------------------
 */

import { useId, useState } from "react";
import { ChevronDown, Loader2, RotateCcw, Check } from "lucide-react";
import { useStatuses } from "@/lib/status-context";
import type { StatusSubjectKind } from "@/lib/supabase/record-status";
import type { OpportunityStatus } from "@/lib/data/opportunities";
import { cn, formatRelative } from "@/lib/utils";

export interface StatusOption<T extends string = string> {
  value: T;
  label: string;
}

type Kind = StatusSubjectKind | "opportunity";

export function StatusControl<T extends string>({
  kind,
  id,
  engineStatus,
  options,
  styleFor,
  size = "md",
  /** Optional accessible name, e.g. "Document status". */
  label = "Status",
  /** Show the "changed by … · reset" line under the chip. */
  showProvenance = true,
  className,
}: {
  kind: Kind;
  id: string;
  engineStatus: T;
  options: StatusOption<T>[];
  styleFor: (value: T) => string;
  size?: "sm" | "md";
  label?: string;
  showProvenance?: boolean;
  className?: string;
}) {
  const s = useStatuses();
  const selectId = useId();
  const [busy, setBusy] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  const isOpportunity = kind === "opportunity";

  const current: T = isOpportunity
    ? (s.opportunityStatusOf({ id, status: engineStatus as OpportunityStatus }) as unknown as T)
    : s.statusOf<T>(kind as StatusSubjectKind, id, engineStatus);

  const ov = isOpportunity
    ? s.opportunityOverride(id)
    : s.override(kind as StatusSubjectKind, id);

  const changedByName = ov
    ? "movedByName" in ov
      ? ov.movedByName
      : ov.changedByName
    : null;
  const changedAt = ov
    ? "movedAtISO" in ov
      ? ov.movedAtISO
      : ov.changedAtISO
    : null;

  const overridden = Boolean(ov) && current !== engineStatus;

  async function change(next: string) {
    if (next === current || busy) return;
    setBusy(true);
    const ok = isOpportunity
      ? await s.setOpportunityStatus(id, next as OpportunityStatus)
      : await s.setStatus(kind as StatusSubjectKind, id, next);
    setBusy(false);
    if (ok) {
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 1800);
    }
  }

  async function reset() {
    if (busy) return;
    setBusy(true);
    if (isOpportunity) await s.resetOpportunityStatus(id);
    else await s.resetStatus(kind as StatusSubjectKind, id);
    setBusy(false);
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

        {/* Sits inside the chip; pointer-events-none so the whole chip stays
            one big tap target for the select underneath. */}
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

      {showProvenance && overridden && (
        <p className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px] text-ink/45">
          <span className="break-words">
            Changed{changedByName ? ` by ${changedByName}` : ""}
            {changedAt ? ` · ${formatRelative(changedAt)}` : ""}
          </span>
          <button
            type="button"
            onClick={() => void reset()}
            disabled={busy}
            className="inline-flex items-center gap-1 font-semibold text-[#8a6c1f] hover:underline disabled:opacity-50"
            title="Put this back to what the engine set"
          >
            <RotateCcw className="h-2.5 w-2.5" aria-hidden />
            Reset
          </button>
        </p>
      )}
    </div>
  );
}

/**
 * One shared banner for the whole portal: says when a change could not be
 * saved, and when nothing can be saved at all.
 *
 * Rendered once in the portal shell rather than per control — a failed write is
 * a session-level fact, and repeating it beside every chip would be noise.
 */
export function StatusBanner() {
  const s = useStatuses();

  if (s.problem) {
    return (
      <div className="flex items-start gap-2 rounded-xl border border-gold/40 bg-gold/10 p-3">
        <p className="break-words text-xs text-[#8a6c1f]">
          <strong className="font-semibold">Changes are not saving.</strong>{" "}
          {s.problem} Anything you change will still show on screen, but it will
          revert on refresh.
        </p>
      </div>
    );
  }

  if (s.lastError) {
    return (
      <div className="flex items-start justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-3">
        <p className="break-words text-xs text-red-700">
          <strong className="font-semibold">That change was put back.</strong>{" "}
          {s.lastError}
        </p>
        <button
          type="button"
          onClick={s.dismissError}
          className="shrink-0 text-xs font-semibold text-red-700 hover:underline"
        >
          Dismiss
        </button>
      </div>
    );
  }

  return null;
}
