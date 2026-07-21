/**
 * lib/data/engine-meta.ts
 * ---------------------------------------------------------------------------
 * LIVE DATA — metadata about the AI engine's most recent run. Updated on every
 * weekly refresh by the DataIsData AI engine.
 * ---------------------------------------------------------------------------
 */

export const ENGINE_META = {
  /** ISO date of the most recent full sweep. */
  lastRunISO: "2026-07-21",
  /** Monday of the reporting week. */
  weekOf: "2026-07-20",
  /** Cadence shown in the UI. */
  cadence: "Refreshed weekly",
  /** Sources actually swept on the last run. */
  sweptSources: [
    "SAM.gov / federal (VA NCO 6, USAspending, procurement forecasts)",
    "Virginia eVA / state & local procurement (DGS, VCU, Chesterfield, Henrico, Richmond)",
    "Virginia Medicaid DMAS / NEMT broker network (ModivCare, Access2Care)",
    "Richmond health systems, labs, pharmacies & clinics (30+ organizations)",
  ],
};
