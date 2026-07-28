/**
 * lib/data/pipeline.ts
 * ---------------------------------------------------------------------------
 * LIVE DATA — kanban pipeline cards derived from the live opportunities so the
 * two views stay consistent.
 *
 * Cards carry the fields the board needs to show *state*, not just position:
 * which sweep found the item, when it is due, and whether the due date is a
 * real published deadline or an internal target. A card sitting in "Found"
 * two sweeps later is the thing worth surfacing, and none of that is visible
 * from the stage column alone.
 * ---------------------------------------------------------------------------
 */

import { opportunities, sweepFor, LATEST_RUN_ISO } from "./opportunities";

export const PIPELINE_STAGES = [
  "Found",
  "Qualified",
  "Contacted",
  "Meeting",
  "Bid",
  "Won/Lost",
] as const;

export type PipelineStage = (typeof PIPELINE_STAGES)[number];

export interface PipelineCard {
  id: string;
  title: string;
  agency: string;
  estValue: number;
  fitScore: number;
  stage: PipelineStage;
  /** Published deadline or internal action-by target, ISO yyyy-mm-dd. */
  dueDate: string;
  /** True when dueDate is a real published date rather than a CSL target. */
  hardDeadline: boolean;
  /** ISO date of the sweep that first surfaced this item. */
  addedISO?: string;
  /** Short sweep label, e.g. "W1" / "W2". */
  sweepLabel?: string;
  /** True when this came from the most recent sweep. */
  isLatestSweep: boolean;
}

function toStage(status: string): PipelineStage {
  if (status === "Won" || status === "Lost") return "Won/Lost";
  return status as PipelineStage;
}

export const pipelineCards: PipelineCard[] = opportunities.map((o) => ({
  id: o.id,
  title: o.title,
  agency: o.agency,
  estValue: o.estValue,
  fitScore: o.fitScore,
  stage: toStage(o.status),
  dueDate: o.dueDate,
  hardDeadline: Boolean(o.hardDeadline),
  addedISO: o.addedISO,
  sweepLabel: sweepFor(o)?.label,
  isLatestSweep: o.addedISO === LATEST_RUN_ISO,
}));
