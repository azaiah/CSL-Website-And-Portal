/**
 * lib/mock/weekly-report.ts
 * ---------------------------------------------------------------------------
 * SAMPLE DATA — a formatted weekly briefing, matching what the Weekly Briefing
 * agent will produce once live. Numbers are illustrative only.
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
  weekOf: "2026-07-06",
  summary:
    "This is a sample weekly briefing. Once the engine is live, this page updates automatically each week with real activity across the pipeline. The current view demonstrates the format and the metrics leadership will track.",
  metrics: [
    { label: "New opportunities found", value: "7", delta: "+3 vs. last week" },
    { label: "Top-scored leads (80+ fit)", value: "5", delta: "+1" },
    { label: "Outreach drafted", value: "4", delta: "+2" },
    { label: "Pipeline value", value: "$1.72M", delta: "+$0.32M" },
  ],
  newOpportunities: [
    { title: "Clinical Specimen Courier Services — Regional Lab Network", source: "eVA", fitScore: 94 },
    { title: "NEMT Broker Panel", source: "DMAS", fitScore: 81 },
    { title: "Cold-Chain Vaccine Transport — County Health Dept.", source: "eVA", fitScore: 79 },
  ],
  topLeads: [
    {
      title: "Clinical Specimen Courier Services — Regional Lab Network",
      fitScore: 94,
      note: "Strong code + set-aside match; SWaM preference applies.",
    },
    {
      title: "STAT Lab Courier — Hospital to Reference Lab",
      fitScore: 90,
      note: "Meeting scheduled; bring STAT SLA and compliance one-pager.",
    },
    {
      title: "Pharmacy Delivery — Retail & Long-Term Care Sites",
      fitScore: 88,
      note: "Awaiting follow-up; propose pilot route.",
    },
  ],
  outreach: { drafted: 4, sent: 2, responses: 1 },
  deadlines: [
    { title: "STAT Lab Courier — Hospital to Reference Lab", dueDate: "2026-07-19" },
    { title: "Pharmacy Delivery — Retail & Long-Term Care Sites", dueDate: "2026-07-28" },
    { title: "Clinical Specimen Courier Services — Regional Lab Network", dueDate: "2026-08-14" },
  ],
  recommendedMoves: [
    "Confirm eVA registration is current ahead of the Regional Lab Network due date.",
    "Send the STAT Lab Courier compliance one-pager before the meeting.",
    "Have the Application Assistant begin the DMAS NEMT enrollment pre-fill.",
    "Follow up on the Pharmacy Delivery intro with a proposed pilot route.",
  ],
};
