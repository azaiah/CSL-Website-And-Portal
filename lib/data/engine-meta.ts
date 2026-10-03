/**
 * lib/data/engine-meta.ts
 * ---------------------------------------------------------------------------
 * LIVE DATA — metadata about the AI engine's most recent run. Updated on every
 * weekly refresh by the DataIsData AI engine.
 * ---------------------------------------------------------------------------
 */

export const ENGINE_META = {
  /** ISO date of the most recent full sweep. */
  lastRunISO: "2026-09-30",
  /** Monday of the reporting week. */
  weekOf: "2026-09-28",
  /** Cadence shown in the UI. */
  cadence: "Refreshed weekly",
  /** Which run number this is, for the UI. */
  runNumber: 6,
  /** Label shown on records this run added (date-based from run 6 onward). */
  runLabel: "9/30",
  /**
   * Sources actually swept on the last run.
   *
   * From run 4 onward these are backed by real URLs — see
   * `weeklyReport.sourcesSwept` for the run-level citations and each
   * Opportunity's own `sources` array for per-record ones. A null result is
   * reported here only when the search that produced it can be re-run.
   */
  sweptSources: [
    "SAM.gov / federal — searched live 2 Oct 2026: courier 39 active notices nationwide, specimen transport 5, courier AND Virginia returned zero (sixth consecutive run)",
    "SAM.gov — specimen-transport search surfaced 36C24627Q0029, a Richmond VAMC sources-sought for HLA transplant testing whose scope includes couriering samples from the VAMC to the VCU HLA lab — the first in-Richmond federal courier requirement in six runs",
    "Virginia eVA — searched live 2 Oct 2026: courier 295 records with no open bucket; Staunton library IFB now Bids Opened; VDSS courier OGS-27-005 still not issued; City of Richmond Justice Center pharmacy RFP #260019872 confirmed Open, closing 8 Oct",
    "Local portals — Henrico (11 open, none relevant in the rows that loaded), GRTC (none); City of Richmond, Chesterfield, Hanover, VCU and RPS listings could not be read",
    "Richmond-metro commercial healthcare — LTC pharmacies, community health centres, fertility, new clinics; every record cites the organisation's own page or named news",
    "Veterinary sweep 9/30 — 10 new leads, every address and phone read off the practice's own site; BluePearl hours corrected; Richmond SPCA schedule re-confirmed",
  ],
};
