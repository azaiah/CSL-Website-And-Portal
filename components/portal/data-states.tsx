"use client";

/**
 * components/portal/data-states.tsx
 * ---------------------------------------------------------------------------
 * The three states every Supabase-backed portal page has to render: loading,
 * a failed read, and "there is no database configured at all".
 *
 * The finance dashboard grew its own copy of the last one. Five more pages
 * needed the same three, so they live here rather than being copied five times
 * and drifting.
 *
 * The distinction that matters: a missing env var is not an error the user can
 * do anything about by retrying, so it gets a whole panel explaining what is
 * wrong. A failed query is transient, so it gets a dismissible banner and the
 * page still renders whatever it managed to load.
 * ---------------------------------------------------------------------------
 */

import { AlertTriangle, Loader2 } from "lucide-react";

/** True when an error came from the missing-env-var guard in queries.ts. */
export function isNotConnected(message: string | null): boolean {
  return Boolean(message && message.includes("not connected"));
}

export function NotConnectedPanel({
  message,
  what = "Portal database",
}: {
  message: string;
  what?: string;
}) {
  return (
    <div className="card text-center">
      <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
        <AlertTriangle className="h-6 w-6" aria-hidden />
      </span>
      <h2 className="mt-4 text-lg font-semibold text-navy-deep">
        {what} not connected
      </h2>
      <p className="mx-auto mt-2 max-w-md break-words text-sm text-ink/60">{message}</p>
      <p className="mt-4 text-xs text-ink/40">
        Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your environment, then
        refresh.
      </p>
    </div>
  );
}

export function ErrorBanner({
  title,
  message,
  onDismiss,
}: {
  title: string;
  message: string;
  onDismiss?: () => void;
}) {
  return (
    <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
        <div className="min-w-0 flex-1">
          <p className="font-semibold">{title}</p>
          <p className="mt-0.5 break-words">{message}</p>
        </div>
        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className="shrink-0 font-semibold hover:underline"
          >
            Dismiss
          </button>
        )}
      </div>
    </div>
  );
}

export function LoadingPanel({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-center gap-2 py-12 text-ink/50">
      <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
      <span className="text-sm">{label}</span>
    </div>
  );
}

/** Empty-state row for a table that loaded fine but has nothing in it yet. */
export function EmptyState({
  title,
  hint,
}: {
  title: string;
  hint?: string;
}) {
  return (
    <div className="py-12 text-center">
      <p className="text-sm font-medium text-navy-deep">{title}</p>
      {hint && <p className="mx-auto mt-1 max-w-sm break-words text-xs text-ink/50">{hint}</p>}
    </div>
  );
}
