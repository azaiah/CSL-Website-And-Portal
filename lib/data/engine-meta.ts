/**
 * lib/data/engine-meta.ts
 * ---------------------------------------------------------------------------
 * LIVE DATA — metadata about the AI engine's most recent run. Updated on every
 * weekly refresh by the DataIsData AI engine.
 * ---------------------------------------------------------------------------
 */

export const ENGINE_META = {
  /** ISO date of the most recent full sweep. */
  lastRunISO: "2026-10-14",
  /** When the most recent sweep started and finished (Eastern, with offset). */
  lastRunStartedAt: "2026-10-14T10:25:00-04:00",
  lastRunFinishedAt: "2026-10-14T10:49:00-04:00",
  /** Monday of the reporting week. */
  weekOf: "2026-10-12",
  /** Cadence shown in the UI. */
  cadence: "Refreshed weekly",
  /** Which run number this is, for the UI. */
  runNumber: 7,
  /** Label shown on records this run added (date-based from run 6 onward). */
  runLabel: "10/14",
  /**
   * Sources actually swept on the last run.
   *
   * From run 4 onward these are backed by real URLs — see
   * `weeklyReport.sourcesSwept` for the run-level citations and each
   * Opportunity's own `sources` array for per-record ones. A null result is
   * reported here only when the search that produced it can be re-run.
   */
  sweptSources: [
    "SAM.gov / federal — searched live 14 Oct 2026 10:25–10:35 AM ET: courier 34 active notices nationwide (39 on 2 Oct); 'courier' + 'Virginia' and 'Richmond courier' both zero (seventh consecutive run); no courier, specimen, pharmacy-delivery, lab-courier, messenger or 492110 notice with a Virginia place of performance; the Richmond VAMC HLA sources-sought 36C24627Q0029 is now inactive with no follow-on yet",
    "Virginia eVA — searched live 14 Oct 2026: courier 295 records, no open bucket (unchanged); specimen 158, none open; pharmacy 2 open (Albemarle County benefits administration; Birmingham Green, Manassas), neither local nor courier; laboratory, medical and 'delivery services' open items all unrelated; VDSS courier OGS-27-005 still not issued; Richmond Justice Center RFP #260019872 closed 8 Oct",
    "Local portals — Henrico: all 8 open solicitations read, none relevant; City of Richmond now posts on OpenGov, which put up a bot check and could not be read",
    "Richmond-metro commercial healthcare — new building permits and business licences (BizSense), freestanding-ER openings, multi-site practices; every record cites the organisation's own page or named news",
    "Veterinary sweep 10/14 — 8 new leads, every address and phone read off the practice's own site (one area code taken from a named directory and flagged)",
  ],
};
