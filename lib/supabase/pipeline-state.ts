"use client";

/**
 * lib/supabase/pipeline-state.ts
 * ---------------------------------------------------------------------------
 * Persistence for an opportunity's status.
 *
 * This one table backs BOTH the kanban board and the status control on the
 * opportunity detail page, because those are the same fact wearing two faces:
 * "this deal is at Contacted" and "this card sits in the Contacted column" can
 * never be allowed to disagree.
 *
 * Note the type: it stores an `OpportunityStatus` (seven values, Won and Lost
 * distinct), not a `PipelineStage` (six columns, Won/Lost merged). The board
 * merges the two for display; the record keeps them apart, so marking an
 * opportunity Won does not quietly erase which of Won or Lost it was.
 *
 * lib/data/pipeline.ts still derives every card from the engine's own data.
 * Postgres stores only the human override — one row per moved card, and no row
 * at all for anything nobody has touched.
 * ---------------------------------------------------------------------------
 */

import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import type { OpportunityStatus } from "@/lib/data/opportunities";

export interface PipelineOverride {
  opportunityId: string;
  status: OpportunityStatus;
  movedByName: string | null;
  movedAtISO: string;
}

export type PipelineResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

interface PipelineRow {
  opportunity_id: string;
  stage: string;
  moved_by_name: string | null;
  moved_at: string;
}

const COLUMNS = "opportunity_id, stage, moved_by_name, moved_at";

const VALID: OpportunityStatus[] = [
  "Found", "Qualified", "Contacted", "Meeting", "Bid", "Won", "Lost",
];

/**
 * Rows written before migration 003 may hold the merged "Won/Lost" value.
 * Read it as "Won" rather than dropping the row — the board renders both in
 * one column anyway, so nothing moves on screen, and the value becomes
 * unambiguous the next time someone sets it.
 */
function toStatus(raw: string): OpportunityStatus {
  if (raw === "Won/Lost") return "Won";
  return (VALID as string[]).includes(raw)
    ? (raw as OpportunityStatus)
    : "Found";
}

function toOverride(r: PipelineRow): PipelineOverride {
  return {
    opportunityId: r.opportunity_id,
    status: toStatus(r.stage),
    movedByName: r.moved_by_name,
    movedAtISO: r.moved_at,
  };
}

/** Every saved status, keyed by opportunity id. */
export async function fetchPipelineState(): Promise<
  PipelineResult<Map<string, PipelineOverride>>
> {
  if (!isSupabaseConfigured()) {
    return { ok: false, error: "not-configured" };
  }

  const supabase = createClient();
  const { data, error } = await supabase.from("pipeline_state").select(COLUMNS);

  if (error) {
    if (isMissingTable(error)) return { ok: false, error: "no-table" };
    return { ok: false, error: error.message || "load-failed" };
  }

  const map = new Map<string, PipelineOverride>();
  for (const row of (data ?? []) as PipelineRow[]) {
    map.set(row.opportunity_id, toOverride(row));
  }
  return { ok: true, data: map };
}

/**
 * Save one opportunity's status.
 *
 * Upsert on the primary key, so setting the same record five times leaves one
 * row holding the latest answer rather than five rows racing each other.
 */
export async function savePipelineStage(input: {
  opportunityId: string;
  status: OpportunityStatus;
  movedBy: string | null;
  movedByName: string | null;
}): Promise<PipelineResult<PipelineOverride>> {
  if (!isSupabaseConfigured()) {
    return {
      ok: false,
      error: "Changes are not being saved — the portal database is not connected.",
    };
  }

  const supabase = createClient();
  const { data, error } = await supabase
    .from("pipeline_state")
    .upsert(
      {
        opportunity_id: input.opportunityId,
        stage: input.status,
        moved_by: input.movedBy,
        moved_by_name: input.movedByName,
        moved_at: new Date().toISOString(),
      },
      { onConflict: "opportunity_id" }
    )
    .select(COLUMNS)
    .single();

  if (error || !data) {
    if (isMissingTable(error)) {
      return {
        ok: false,
        error:
          "Pipeline table not found — run migration 002 in the Supabase SQL editor.",
      };
    }
    // 23514 is the CHECK constraint. Won/Lost as separate values arrived in
    // migration 003, so this is the specific thing to point at.
    if (error?.code === "23514") {
      return {
        ok: false,
        error:
          "That status needs migration 003 — run it in the Supabase SQL editor.",
      };
    }
    return { ok: false, error: error?.message || "That change could not be saved." };
  }

  return { ok: true, data: toOverride(data as PipelineRow) };
}

/** Drop the override so the opportunity falls back to the engine's own status. */
export async function clearPipelineStage(
  opportunityId: string
): Promise<PipelineResult<true>> {
  if (!isSupabaseConfigured()) {
    return { ok: false, error: "The portal database is not connected." };
  }
  const supabase = createClient();
  const { error } = await supabase
    .from("pipeline_state")
    .delete()
    .eq("opportunity_id", opportunityId);
  if (error) {
    return { ok: false, error: error.message || "That change could not be undone." };
  }
  return { ok: true, data: true };
}

/**
 * Live updates from other users' boards. Returns an unsubscribe function.
 * If realtime is not enabled the callback simply never fires and the board
 * behaves as it does now — correct after a refresh.
 */
export function subscribeToPipelineState(
  onChange: (id: string, next: PipelineOverride | null) => void
): () => void {
  if (!isSupabaseConfigured()) return () => {};

  const supabase = createClient();
  const channel = supabase
    .channel("pipeline-state-changes")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "pipeline_state" },
      (payload) => {
        if (payload.eventType === "DELETE") {
          const old = payload.old as Partial<PipelineRow> | null;
          if (old?.opportunity_id) onChange(old.opportunity_id, null);
          return;
        }
        const row = payload.new as PipelineRow | null;
        if (row?.opportunity_id && row.stage) {
          onChange(row.opportunity_id, toOverride(row));
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
      error.message?.includes("pipeline_state") &&
        error.message?.includes("does not exist")
    )
  );
}
