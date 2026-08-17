"use client";

/**
 * lib/supabase/pipeline-state.ts
 * ---------------------------------------------------------------------------
 * Persistence for the pipeline board.
 *
 * The board used to hold stage in React state only, so every refresh silently
 * reverted the work someone had just done — cards "moved back to their original
 * place", which is the bug this file exists to kill.
 *
 * The model is deliberately narrow. lib/data/pipeline.ts still derives the
 * cards from the engine's opportunities; this table stores ONLY the override:
 * one row per opportunity saying which stage a human put it in. That means a
 * weekly sweep can rewrite titles, values and fit scores without touching where
 * anyone dragged a card, and an opportunity that has never been moved has no
 * row at all rather than a duplicated copy of engine data.
 *
 * The board is SHARED. Stage is a fact about the deal — if Darren moves a lead
 * to Contacted, it has been contacted for everybody — so there is no per-user
 * column here by design.
 * ---------------------------------------------------------------------------
 */

import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import type { PipelineStage } from "@/lib/data/pipeline";

export interface PipelineOverride {
  opportunityId: string;
  stage: PipelineStage;
  movedByName: string | null;
  movedAtISO: string;
}

export type PipelineResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

interface PipelineRow {
  opportunity_id: string;
  stage: PipelineStage;
  moved_by_name: string | null;
  moved_at: string;
}

const COLUMNS = "opportunity_id, stage, moved_by_name, moved_at";

function toOverride(r: PipelineRow): PipelineOverride {
  return {
    opportunityId: r.opportunity_id,
    stage: r.stage,
    movedByName: r.moved_by_name,
    movedAtISO: r.moved_at,
  };
}

/**
 * Every saved stage, keyed by opportunity id.
 *
 * Returns an empty map — not an error — when Supabase is unconfigured or the
 * migration has not been run. The board then shows the engine's own stages,
 * which is the correct fallback: stale positions are better than a broken page.
 */
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
 * Save one card's stage.
 *
 * Upsert on the primary key, so moving the same card five times leaves one row
 * holding the latest answer rather than five rows racing each other.
 */
export async function savePipelineStage(input: {
  opportunityId: string;
  stage: PipelineStage;
  movedBy: string | null;
  movedByName: string | null;
}): Promise<PipelineResult<PipelineOverride>> {
  if (!isSupabaseConfigured()) {
    return { ok: false, error: "Pipeline changes are not being saved — Supabase is not configured." };
  }

  const supabase = createClient();
  const { data, error } = await supabase
    .from("pipeline_state")
    .upsert(
      {
        opportunity_id: input.opportunityId,
        stage: input.stage,
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
    return {
      ok: false,
      error: error?.message || "That move could not be saved.",
    };
  }

  return { ok: true, data: toOverride(data as PipelineRow) };
}

/**
 * Live updates from other users' boards.
 *
 * Returns an unsubscribe function. If realtime is not enabled on the project
 * the callback simply never fires and the board behaves as it does now —
 * correct after a refresh — so this is safe to call unconditionally.
 */
export function subscribeToPipelineState(
  onChange: (override: PipelineOverride) => void
): () => void {
  if (!isSupabaseConfigured()) return () => {};

  const supabase = createClient();
  const channel = supabase
    .channel("pipeline-state-changes")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "pipeline_state" },
      (payload) => {
        const row = payload.new as PipelineRow | null;
        if (row?.opportunity_id && row.stage) onChange(toOverride(row));
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
