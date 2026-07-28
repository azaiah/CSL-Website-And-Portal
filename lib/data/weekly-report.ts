/**
 * lib/data/weekly-report.ts
 * ---------------------------------------------------------------------------
 * LIVE DATA — the weekly briefing compiled by the Weekly Briefing agent.
 * Run 2: 2026-07-28. Updated on every weekly run.
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
  corrections?: { item: string; detail: string }[];
}

export const weeklyReport: WeeklyReport = {
  weekOf: "2026-07-27",
  summary:
    "Second run of the engine, completed July 28, 2026. This week the Opportunity Finder searched SAM.gov and eVA live rather than through third-party mirrors, which changed the quality of the answer in both directions. The headline find is real and time-sensitive: the Virginia Department of Social Services has posted a Future Procurement for STATEWIDE COURIER SERVICES (OGS-27-005 / FPR 124752) with an estimated issue date of August 1 — three days out — with a named buyer who can be contacted before the solicitation drops. Fourteen new opportunities were added, bringing the board to 29. Equally important, the live sweep corrected three things last week's data got wrong, including a materially over-optimistic read of the Richmond VAMC contract. On the federal side the honest answer is that there is nothing to bid: two live SAM.gov searches returned zero open courier or specimen-transport solicitations anywhere in Virginia. Outreach remains the bottleneck — the five drafts from run 1 are still unsent after a full week, and the zero-cost Medzoomer signup is now overdue.",
  metrics: [
    { label: "New opportunities found", value: "14", delta: "Board now at 29" },
    { label: "Top-scored leads (80+ fit)", value: "14" },
    { label: "Outreach drafted", value: "5", delta: "Still unsent from run 1" },
    { label: "Pipeline value", value: "$2.07M", delta: "Up from $1.59M" },
  ],
  newOpportunities: [
    {
      title: "Virginia DSS — Statewide Courier Services (Future Procurement, issues 8/1)",
      source: "eVA",
      fitScore: 94,
    },
    {
      title: "Richmond Gastroenterology — 7-Site Biopsy & Endoscopy Route",
      source: "Commercial",
      fitScore: 88,
    },
    {
      title: "Virginia Urology — 7-Site Pathology, Pharmacy & Surgery Center Route",
      source: "Commercial",
      fitScore: 87,
    },
    {
      title: "Dermatology Associates of Virginia — Mohs STAT Specimen Runs",
      source: "Commercial",
      fitScore: 86,
    },
    {
      title: "Owens & Minor — Supplier Diversity Registration (Mechanicsville HQ)",
      source: "Commercial",
      fitScore: 79,
    },
  ],
  topLeads: [
    {
      title: "Virginia DSS — Statewide Courier Services (OGS-27-005)",
      fitScore: 94,
      note: "The only live public bid on the board and it issues August 1. Buyer Pedro Andrade, pedro.andrade@dss.virginia.gov, (804) 726-7184. Contact him BEFORE the solicitation drops — ask whether it splits into regional lots and whether SWaM preference applies. One van cannot cover the state, so the play is a regional lot or a teaming position.",
    },
    {
      title: "GENETWORx — Daily Specimen Routes",
      fitScore: 90,
      note: "Still the strongest commercial lead, still not contacted. CLIA lab 15 minutes away in Glen Allen. Call (800) 858-5909 — the draft has been ready for seven days.",
    },
    {
      title: "Virginia Cancer Institute — 6-Site Route",
      fitScore: 89,
      note: "Independent oncology group, 6+ metro sites; chemo safe-handling training is CSL's differentiator. Business office (804) 673-2024. Draft also still awaiting approval.",
    },
    {
      title: "ModivCare NEMT Enrollment",
      fitScore: 88,
      note: "One enrollment covers Medicaid FFS plus 4 of 5 MCOs. Correction this week: the DMV filing is Form OA-151, not OA-150 — OA-150 is the broker application and would have been rejected. DMV now accepts it online. $350k liability minimum, $25k bond, $50 fee.",
    },
    {
      title: "Richmond Gastroenterology Associates",
      fitScore: 88,
      note: "New this week and the best commercial add: seven sites plus their own endoscopy center, which means high, scheduled biopsy volume. Independent and physician-owned, so they choose their own vendor. (804) 330-4021.",
    },
  ],
  outreach: { drafted: 5, sent: 0, responses: 0 },
  deadlines: [
    { title: "Contact VDSS buyer before solicitation issues (OGS-27-005)", dueDate: "2026-08-01" },
    { title: "Medzoomer courier signup — OVERDUE from run 1", dueDate: "2026-07-31" },
    { title: "Send the five approved outreach drafts", dueDate: "2026-08-07" },
    { title: "Lab Logistics contractor profile + GENETWORx call", dueDate: "2026-08-07" },
    { title: "File DMV Form OA-151 (for-hire authority) online", dueDate: "2026-08-14" },
    { title: "ModivCare credentialing started", dueDate: "2026-08-14" },
  ],
  corrections: [
    {
      item: "Richmond VAMC IDIQ 36C24625D0070",
      detail:
        "Last week's record said delivery orders were 'actively being issued' and listed NAICS 492110. Both were wrong. USAspending shows a single delivery order of $6,411.84 against the $769,850 ceiling, and the award's NAICS is 492210. The contract is also a single-award SDVOSB set-aside locked through 2030, so CSL cannot bid it — it is a subcontract relationship target only. Fit score lowered 92 → 84 to reflect that honestly.",
    },
    {
      item: "Virginia DMV for-hire authority form",
      detail:
        "The NEMT carrier application is Form OA-151. Last week's checklist said OA-150, which is the Broker application — filing it would have cost Darren weeks. DMV has also accepted these online since January 1, 2026.",
    },
    {
      item: "HB61 SWaM Procurement Enhancement Program",
      detail:
        "The bill that would have set a 42% statewide SWaM utilization goal passed both chambers but was vetoed on May 19, 2026. Plan around today's $10,000–$100,000 set-aside thresholds; no expansion is coming.",
    },
    {
      item: "Bremo Pharmacy footprint",
      detail:
        "The Skipwith Road location now shows as closed on public listings. Estimated value reduced from $55,000 to $45,000 pending a confirmation call.",
    },
  ],
  recommendedMoves: [
    "Contact VDSS buyer Pedro Andrade before August 1 about the statewide courier procurement (OGS-27-005). This is the only live public bid on the board and the pre-solicitation window closes when it issues.",
    "Send the five outreach drafts. They have now been sitting for a full week and are blocking the four highest-scoring commercial leads — this is the single biggest constraint on the pipeline, not a lack of opportunities.",
    "File DMV Form OA-151 online — not OA-150. It gates the ModivCare, Access2Care, and Roundtrip records all at once, making it the highest-leverage single filing available.",
    "Close out Medzoomer and the Lab Logistics profile. Both are free, both are forms rather than sales, and both are now overdue.",
    "Ask Owens & Minor one question: do they accept Virginia SWaM, or is NMSDC/SBA certification required? The answer determines whether CSL's certification roadmap needs a second track.",
  ],
};
