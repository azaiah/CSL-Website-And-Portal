"use client";

/**
 * lib/supabase/record-status.ts
 * ---------------------------------------------------------------------------
 * Data access for editable statuses on documents, generated documents,
 * outreach drafts and veterinary leads.
 *
 * The engine writes an initial status into lib/data/. This table stores only
 * the HUMAN OVERRIDE on top of it — one row per record, and no row at all for
 * anything nobody has touched. That separation is what lets a weekly sweep
 * rewrite a document's summary or an outreach draft's body without resetting a
 * status Darren set last Tuesday.
 *
 * Opportunities are deliberately NOT handled here. An opportunity's status and
 * its column on the pipeline board are the same fact, so they share one row in
 * `pipeline_state` — see lib/supabase/pipeline-state.ts. Storing it in two
 * places would let the board and the detail page disagree.
 * ---------------------------------------------------------------------------
 */

import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

/** Every kind of record whose status a human can change (minus opportunities). */
export type StatusSubjectKind =
  | "document"
  | "generated-doc"
  | "outreach"
  | "vet-lead";

export interface StatusOverride {
  subjectKind: StatusSubjectKind;
  subjectId: string;
  status: string;
  note: string | null;
  changedByName: string | null;
  changedAtISO: string;
}

export type StatusResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

interface StatusRow {
  subject_kind: StatusSubjectKind;
  subject_id: string;
  status: string;
  note: string | null;
  changed_by_name: string | null;
  changed_at: string;
}

const COLUMNS =
  "subject_kind, subject_id, status, note, changed_by_name, changed_at";

/** Composite key used by the in-memory map: "outreach:OUT-2026-011". */
export function statusKey(kind: StatusSubjectKind, id: string): string {
  return `${kind}:${id}`;
}

function toOverride(r: StatusRow): StatusOverride {
  return {
    subjectKind: r.subject_kind,
    subjectId: r.subject_id,
    status: r.status,
    note: r.note,
    changedByName: r.changed_by_name,
    changedAtISO: r.changed_at,
  };
}

/**
 * Every status override in the portal, keyed by "kind:id".
 *
 * One query for the whole portal rather than one per card. There will never be
 * more of these than there are records a human has touched, so this stays
 * small; and loading them together is what guarantees the dashboard, the
 * pipeline and the detail view cannot disagree.
 */
export async function fetchAllStatuses(): Promise<
  StatusResult<Map<string, StatusOverride>>
> {
  if (!isSupabaseConfigured()) return { ok: false, error: "not-configured" };

  const supabase = createClient();
  const { data, error } = await supabase.from("record_status").select(COLUMNS);

  if (error) {
    if (isMissingTable(error)) return { ok: false, error: "no-table" };
    return { ok: false, error: error.message || "load-failed" };
  }

  const map = new Map<string, StatusOverride>();
  for (const row of (data ?? []) as StatusRow[]) {
    map.set(statusKey(row.subject_kind, row.subject_id), toOverride(row));
  }
  return { ok: true, data: map };
}

/** Set (or replace) one record's status. */
export async function saveStatus(input: {
  subjectKind: StatusSubjectKind;
  subjectId: string;
  status: string;
  note?: string | null;
  changedBy: string | null;
  changedByName: string | null;
}): Promise<StatusResult<StatusOverride>> {
  if (!isSupabaseConfigured()) {
    return {
      ok: false,
      error: "Status changes are not being saved — the portal database is not connected.",
    };
  }

  const supabase = createClient();
  const { data, error } = await supabase
    .from("record_status")
    .upsert(
      {
        subject_kind: input.subjectKind,
        subject_id: input.subjectId,
        status: input.status,
        note: input.note ?? null,
        changed_by: input.changedBy,
        changed_by_name: input.changedByName,
        changed_at: new Date().toISOString(),
      },
      { onConflict: "subject_kind,subject_id" }
    )
    .select(COLUMNS)
    .single();

  if (error || !data) {
    if (isMissingTable(error)) {
      return {
        ok: false,
        error:
          "Status table not found — run migration 003 in the Supabase SQL editor.",
      };
    }
    return { ok: false, error: error?.message || "That change could not be saved." };
  }

  return { ok: true, data: toOverride(data as StatusRow) };
}

/**
 * Remove the override so the record falls back to whatever the engine says.
 *
 * Worth having as a real action rather than making someone guess which value
 * was the original: "put it back the way the engine had it" is a different
 * intent from "set it to Ready", and only one of them survives the next sweep
 * changing its mind.
 */
export async function clearStatus(
  subjectKind: StatusSubjectKind,
  subjectId: string
): Promise<StatusResult<true>> {
  if (!isSupabaseConfigured()) {
    return { ok: false, error: "The portal database is not connected." };
  }

  const supabase = createClient();
  const { error } = await supabase
    .from("record_status")
    .delete()
    .eq("subject_kind", subjectKind)
    .eq("subject_id", subjectId);

  if (error) {
    return { ok: false, error: error.message || "That change could not be undone." };
  }
  return { ok: true, data: true };
}

/**
 * Live updates from other people's screens. Returns an unsubscribe function.
 * Safe to call unconditionally — if realtime is off the callback never fires
 * and the portal behaves as it does now, correct after a refresh.
 */
export function subscribeToStatuses(
  onChange: (kind: StatusSubjectKind, id: string, next: StatusOverride | null) => void
): () => void {
  if (!isSupabaseConfigured()) return () => {};

  const supabase = createClient();
  const channel = supabase
    .channel("record-status-changes")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "record_status" },
      (payload) => {
        if (payload.eventType === "DELETE") {
          const old = payload.old as Partial<StatusRow> | null;
          if (old?.subject_kind && old.subject_id) {
            onChange(old.subject_kind, old.subject_id, null);
          }
          return;
        }
        const row = payload.new as StatusRow | null;
        if (row?.subject_kind && row.subject_id) {
          onChange(row.subject_kind, row.subject_id, toOverride(row));
        }
      }
    )
    .subscribe();

  return () => {
    void supabase.removeChannel(channel);
  };
}

interface PostgrestLikeError {
  code?: string;
  message?: string;
}

function isMissingTable(error: PostgrestLikeError | null): boolean {
  if (!error) return false;
  return (
    error.code === "42P01" ||
    error.code === "PGRST205" ||
    Boolean(
      error.message?.includes("record_status") &&
        error.message?.includes("does not exist")
    )
  );
}
