/**
 * lib/data/engine-meta.ts
 * ---------------------------------------------------------------------------
 * LIVE DATA — metadata about the AI engine's most recent run. Updated on every
 * weekly refresh by the DataIsData AI engine.
 * ---------------------------------------------------------------------------
 */

export const ENGINE_META = {
  /** ISO date of the most recent full sweep. */
  lastRunISO: "2026-08-10",
  /** Monday of the reporting week. */
  weekOf: "2026-08-10",
  /** Cadence shown in the UI. */
  cadence: "Refreshed weekly",
  /** Which run number this is, for the UI. */
  runNumber: 3,
  /** Sources actually swept on the last run. */
  sweptSources: [
    "SAM.gov / federal — searched live in-session (active courier + specimen transport notices nationwide; zero open in Virginia)",
    "Virginia eVA — searched live in-session (courier, statewide courier, specimen, medical transportation, delivery and laboratory services; all 80 posted Future Procurements reviewed)",
    "USAspending.gov — Richmond VAMC IDIQ 36C24625D0070 obligation history re-pulled",
    "Virginia DMV, DMAS and the NEMT broker network (ModivCare, Access2Care, MediDrive, Humana, Sentara, UnitedHealthcare)",
    "CMS NPPES provider registry — Richmond-metro LTC pharmacy, dialysis, home infusion and clinical research sites",
    "Richmond health systems, multi-site physician groups, pharmacies and labs (60+ organizations, verified against their own published sources)",
  ],
};
