/**
 * lib/data/weekly-report.ts
 * ---------------------------------------------------------------------------
 * LIVE DATA — the first real weekly briefing, compiled by the Weekly Briefing
 * agent from the 2026-07-21 sweep. Updated on every weekly run.
 * ---------------------------------------------------------------------------
 */

export interface WeeklyMetric {
  label: string;
  value: string;
  delta?: string;
}

export interface WeeklyReport {
  weekOf: string;
  summary: string;
  metrics: WeeklyMetric[];
  newOpportunities: { title: string; source: string; fitScore: number }[];
  topLeads: { title: string; fitScore: number; note: string }[];
  outreach: { drafted: number; sent: number; responses: number };
  deadlines: { title: string; dueDate: string }[];
  recommendedMoves: string[];
}

export const weeklyReport: WeeklyReport = {
  weekOf: "2026-07-20",
  summary:
    "First live run of the engine, completed July 21, 2026. The Opportunity Finder swept SAM.gov and federal VA contracting (NCO 6 / VISN 6), Virginia eVA and state-local procurement, the Virginia Medicaid NEMT broker network, and 30+ Richmond-area health systems, labs, pharmacies, and clinics. 15 real opportunities were logged and scored. Headline finding: the Richmond VAMC's own courier contract is a $769,850 SDVOSB set-aside held by an out-of-state prime — a direct subcontract and recompete target. No outreach has been sent yet; five drafts are awaiting approval.",
  metrics: [
    { label: "New opportunities found", value: "15", delta: "First live run" },
    { label: "Top-scored leads (80+ fit)", value: "10" },
    { label: "Outreach drafted", value: "5", delta: "Awaiting approval" },
    { label: "Pipeline value", value: "$1.59M" },
  ],
  newOpportunities: [
    {
      title: "Richmond VAMC Courier — Subcontract & Recompete (SDVOSB IDIQ)",
      source: "SAM.gov",
      fitScore: 92,
    },
    {
      title: "GENETWORx Reference Lab — Daily Specimen Routes",
      source: "Independent Lab",
      fitScore: 90,
    },
    {
      title: "Virginia Cancer Institute — 6-Site Inter-Office Route",
      source: "Commercial",
      fitScore: 89,
    },
    {
      title: "Virginia Medicaid NEMT — ModivCare Network (FFS + 4 MCOs)",
      source: "DMAS / Broker",
      fitScore: 88,
    },
    {
      title: "Bremo Pharmacy & LTC — Daily Facility Delivery Routes",
      source: "Pharmacy",
      fitScore: 87,
    },
  ],
  topLeads: [
    {
      title: "Richmond VAMC Courier — Subcontract & Recompete",
      fitScore: 92,
      note: "SDVOSB set-aside at the VAMC in CSL's backyard, held by an Indianapolis prime. Subcontract inquiry drafted; SAM saved searches recommended (NCO 6 posts with 3–9 day windows).",
    },
    {
      title: "GENETWORx — Daily Specimen Routes",
      fitScore: 90,
      note: "CLIA lab 15 minutes away in Glen Allen with daily inbound specimen logistics. Call (800) 858-5909 — outreach draft ready.",
    },
    {
      title: "Virginia Cancer Institute — 6-Site Route",
      fitScore: 89,
      note: "Independent oncology group, 6+ metro sites; chemo safe-handling training is CSL's differentiator. Business office (804) 673-2024.",
    },
    {
      title: "ModivCare NEMT Enrollment",
      fitScore: 88,
      note: "One rolling enrollment covers Medicaid FFS + 4 of 5 MCOs. Prerequisite: VA DMV for-hire passenger authority.",
    },
  ],
  outreach: { drafted: 5, sent: 0, responses: 0 },
  deadlines: [
    { title: "Medzoomer courier signup (quick win)", dueDate: "2026-07-24" },
    { title: "GENETWORx intro call", dueDate: "2026-07-31" },
    { title: "Lab Logistics contractor profile", dueDate: "2026-07-31" },
    { title: "Virginia Cancer Institute + Bremo outreach", dueDate: "2026-08-07" },
    { title: "ModivCare credentialing started", dueDate: "2026-08-14" },
  ],
  recommendedMoves: [
    "Finish the SWaM certification — the single highest-leverage action: Virginia purchases from $10k–$100k can be set aside for certified small businesses, and CSL is invisible to those buyers until certified.",
    "Call ModivCare Network Development at (866) 810-8305 x2645 and confirm VA DMV intrastate for-hire passenger authority — one credential unlocks five Medicaid payer channels.",
    "Approve and send the five outreach drafts (VAMC prime subcontract inquiry, GENETWORx, Virginia Cancer Institute, Bremo, MedRVA).",
    "Create SAM.gov saved searches on office 36C246 + PSC R602 + NAICS 492110/485991, and set eVA alerts on NIGP 962-86 / 948-55.",
    "Knock out the two zero-cost registrations: Medzoomer courier signup and the Lab Logistics contractor profile.",
  ],
};
