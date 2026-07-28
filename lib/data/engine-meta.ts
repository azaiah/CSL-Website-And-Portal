/**
 * lib/data/engine-meta.ts
 * ---------------------------------------------------------------------------
 * LIVE DATA — metadata about the AI engine's most recent run. Updated on every
 * weekly refresh by the DataIsData AI engine.
 * ---------------------------------------------------------------------------
 */

export const ENGINE_META = {
  /** ISO date of the most recent full sweep. */
  lastRunISO: "2026-07-28",
  /** Monday of the reporting week. */
  weekOf: "2026-07-27",
  /** Cadence shown in the UI. */
  cadence: "Refreshed weekly",
  /** Which run number this is, for the UI. */
  runNumber: 2,
  /** Sources actually swept on the last run. */
  sweptSources: [
    "SAM.gov / federal — searched live in-session (VA NCO 6, USAspending, agency forecasts)",
    "Virginia eVA — searched live in-session (DSS, DGS, VCU, VDOT, counties, statewide)",
    "Virginia Medicaid DMAS / NEMT broker network (ModivCare, Access2Care, DMV authority)",
    "Richmond health systems, labs, pharmacies, practices & clinics (40+ organizations)",
  ],
};
