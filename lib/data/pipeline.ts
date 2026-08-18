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
 *
 * A stage IS an opportunity status
 * --------------------------------
 * The board used to merge Won and Lost into a single "Won/Lost" column, which
 * was fine while the only way to set a stage was dragging a card. Now that the
 * status can also be set directly on the opportunity detail page, that merge
 * became a lossy translation: picking "Won" in a dropdown had nowhere
 * unambiguous to land on the board.
 *
 * So the columns are now exactly the seven opportunity statuses. The dropdown
 * and the board offer the same list, the mapping between them is the identity
 * function, and there is no translation left to get wrong.
 * ---------------------------------------------------------------------------
 */

import {
  opportunities,
  sweepFor,
  LATEST_RUN_ISO,
  type Opportunity,
  type OpportunityStatus,
} from "./opportunities";

export const PIPELINE_STAGES = [
  "Found",
  "Qualified",
  "Contacted",
  "Meeting",
  "Bid",
  "Won",
  "Lost",
] as const;

/** A board column and an opportunity status are the same thing. */
export type PipelineStage = OpportunityStatus;

/** Stages that mean the deal is settled and should stop nagging about dates. */
export const CLOSED_STAGES: PipelineStage[] = ["Won", "Lost"];

export function isClosedStage(stage: string): boolean {
  return (CLOSED_STAGES as string[]).includes(stage);
}

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

/**
 * One opportunity as a board card.
 *
 * Exported because the board no longer renders the static `pipelineCards`
 * below — it renders the opportunities with any human status override already
 * applied, and maps them through this. Keeping the mapping in one function is
 * what stops the live board and the static export from describing cards
 * differently.
 */
export function toPipelineCard(o: Opportunity): PipelineCard {
  return {
    id: o.id,
    title: o.title,
    agency: o.agency,
    estValue: o.estValue,
    fitScore: o.fitScore,
    stage: o.status,
    dueDate: o.dueDate,
    hardDeadline: Boolean(o.hardDeadline),
    addedISO: o.addedISO,
    sweepLabel: sweepFor(o)?.label,
    isLatestSweep: o.addedISO === LATEST_RUN_ISO,
  };
}

/**
 * The engine's own view of the board, with no human overrides applied.
 * Still used anywhere a server-rendered or override-free list is wanted.
 */
export const pipelineCards: PipelineCard[] = opportunities.map(toPipelineCard);
