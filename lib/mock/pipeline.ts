/**
 * lib/mock/pipeline.ts
 * ---------------------------------------------------------------------------
 * SAMPLE DATA — kanban pipeline cards for the portal Pipeline board.
 * Derived from the mock opportunities so the two views stay consistent.
 * ---------------------------------------------------------------------------
 */

import { opportunities } from "./opportunities";

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
}));
