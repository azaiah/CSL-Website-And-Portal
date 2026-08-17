/**
 * lib/data/engine-meta.ts
 * ---------------------------------------------------------------------------
 * LIVE DATA — metadata about the AI engine's most recent run. Updated on every
 * weekly refresh by the DataIsData AI engine.
 * ---------------------------------------------------------------------------
 */

export const ENGINE_META = {
  /** ISO date of the most recent full sweep. */
  lastRunISO: "2026-08-17",
  /** Monday of the reporting week. */
  weekOf: "2026-08-17",
  /** Cadence shown in the UI. */
  cadence: "Refreshed weekly",
  /** Which run number this is, for the UI. */
  runNumber: 4,
  /**
   * Sources actually swept on the last run.
   *
   * From run 4 onward these are backed by real URLs — see
   * `weeklyReport.sourcesSwept` for the run-level citations and each
   * Opportunity's own `sources` array for per-record ones. A null result is
   * reported here only when the search that produced it can be re-run.
   */
  sweptSources: [
    "SAM.gov / federal — searched live in-session for courier (31 active notices nationwide) and specimen transport (7). ZERO with a Virginia place of performance; fourth consecutive run with the same answer",
    "SAM.gov award notices — 36C25026Q0784 Lab Courier Services awarded 8/12/2026 to All American Express Solutions LLC, the same prime that holds the Richmond VAMC IDIQ",
    "Virginia eVA — searched live in-session for courier (294 records) and veterinary (398 records); the status facet showed NO OPEN BUCKET for either, meaning nothing live to bid",
    "Virginia eVA — VDOT IFB161013 / IFB-122257 re-opened: now AWARDED, award date 8/11/2026, with a Notice of Award and a public Bid Tab posted. Awardee name is captcha-gated and was not bypassed",
    "Richmond-metro veterinary network — first veterinary sweep: 15 practices across 19 physical sites, every address and phone re-verified against the practice's own website",
    "IDEXX and Antech reference-laboratory courier programmes — checked to establish what is already covered before any veterinary pitch is written",
  ],
};
