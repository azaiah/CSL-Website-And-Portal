/**
 * lib/mock/opportunities.ts
 * ---------------------------------------------------------------------------
 * SAMPLE DATA — clearly labeled. These mock opportunities illustrate what the
 * Opportunity Finder + Lead Qualifier will surface once live. No data here is
 * scraped or real; it exists only to demonstrate the portal UI/UX.
 * ---------------------------------------------------------------------------
 */

export type OpportunitySource =
  | "SAM.gov"
  | "eVA"
  | "DMAS"
  | "VA Medical Center"
  | "Hospital System"
  | "Independent Lab";

export type OpportunityStatus =
  | "Found"
  | "Qualified"
  | "Contacted"
  | "Meeting"
  | "Bid"
  | "Won"
  | "Lost";

export interface Opportunity {
  id: string;
  title: string;
  source: OpportunitySource;
  naics: string;
  location: string;
  dueDate: string; // ISO yyyy-mm-dd
  fitScore: number; // 0–100
  status: OpportunityStatus;
  estValue: number;
  agency: string;
  description: string;
  whyItFits: string;
  suggestedAction: string;
}

export const IS_SAMPLE_DATA = true;

export const opportunities: Opportunity[] = [
  {
    id: "OPP-1042",
    title: "Clinical Specimen Courier Services — Regional Lab Network",
    source: "eVA",
    naics: "492110",
    location: "Richmond, VA",
    dueDate: "2026-08-14",
    fitScore: 94,
    status: "Qualified",
    estValue: 320000,
    agency: "Virginia Department of General Services",
    description:
      "Scheduled and STAT courier services for clinical laboratory specimens across a regional lab network, including temperature-controlled handling and documented chain-of-custody.",
    whyItFits:
      "Directly matches CSL's flagship medical-courier line, NAICS 492110, and the Richmond service area. HIPAA/BBP training and Lloyd's cargo coverage meet stated requirements; SWaM preference applies.",
    suggestedAction:
      "Confirm eVA registration is current, then have the Outreach Writer draft an intro to the procurement category manager and prepare a capability statement.",
  },
  {
    id: "OPP-1039",
    title: "Non-Emergency Medical Transportation (NEMT) Broker Panel",
    source: "DMAS",
    naics: "485991",
    location: "Central Virginia",
    dueDate: "2026-09-02",
    fitScore: 81,
    status: "Found",
    estValue: 540000,
    agency: "Virginia Medicaid / DMAS",
    description:
      "Panel enrollment for non-emergency medical transportation providers serving Medicaid members in the Central Virginia region.",
    whyItFits:
      "NAICS 485991 (Special-Needs / NEMT) is on CSL's code list. Local coverage and compliance training are strengths; requires confirming DMAS enrollment steps.",
    suggestedAction:
      "Route to the Application Assistant to pre-fill DMAS enrollment and verify vehicle/driver credentialing requirements.",
  },
  {
    id: "OPP-1035",
    title: "Pharmacy Delivery — Retail & Long-Term Care Sites",
    source: "Hospital System",
    naics: "492110",
    location: "Henrico County, VA",
    dueDate: "2026-07-28",
    fitScore: 88,
    status: "Contacted",
    estValue: 180000,
    agency: "Regional Health System (Pharmacy Services)",
    description:
      "Recurring pharmacy delivery routes between a central fill pharmacy and retail plus long-term-care dispensing sites, with same-day and scheduled windows.",
    whyItFits:
      "Pharmacy delivery is core to CSL. Recurring routes fit the operating model; on-time SLA aligns with the 'on-time, every time' standard.",
    suggestedAction:
      "Follow up on the intro email; propose a pilot route and share proof-of-delivery workflow.",
  },
  {
    id: "OPP-1031",
    title: "Medical Supply Distribution — Community Clinics",
    source: "SAM.gov",
    naics: "492110",
    location: "Richmond, VA",
    dueDate: "2026-08-30",
    fitScore: 76,
    status: "Found",
    estValue: 210000,
    agency: "Federal Health Services Contractor",
    description:
      "Distribution of medical supplies from a regional warehouse to a network of community clinics on a scheduled basis.",
    whyItFits:
      "Combines CSL's courier and secure-warehouse-storage lines. Federal registration (SAM/CAGE, UEI) is in place; set-aside preferences may apply.",
    suggestedAction:
      "Confirm any set-aside eligibility, then qualify further and prepare a capability statement.",
  },
  {
    id: "OPP-1028",
    title: "STAT Lab Courier — Hospital to Reference Lab",
    source: "Independent Lab",
    naics: "492110",
    location: "Chesterfield County, VA",
    dueDate: "2026-07-19",
    fitScore: 90,
    status: "Meeting",
    estValue: 96000,
    agency: "Independent Reference Laboratory",
    description:
      "On-demand STAT courier runs from hospital collection points to a reference laboratory, with strict turnaround and specimen-integrity requirements.",
    whyItFits:
      "STAT specimen transport is a CSL strength; Chesterfield PInG registration and BBP/specimen-integrity training directly apply.",
    suggestedAction:
      "Prepare for the scheduled meeting; bring the compliance one-pager and proposed STAT SLA.",
  },
  {
    id: "OPP-1024",
    title: "VA Medical Center — Inter-Facility Medical Delivery",
    source: "VA Medical Center",
    naics: "492110",
    location: "Richmond, VA",
    dueDate: "2026-09-15",
    fitScore: 85,
    status: "Bid",
    estValue: 275000,
    agency: "Central Virginia VA Health Care System",
    description:
      "Inter-facility transport of medical items and documents between VA medical center campuses and affiliated clinics.",
    whyItFits:
      "Veteran-focused agency where SDVOSB designation (in progress) is advantageous; TWIC and TSA PreCheck support secure-site access.",
    suggestedAction:
      "Finalize the bid package; confirm insurance certificates and driver credentials are attached.",
  },
  {
    id: "OPP-1019",
    title: "Cold-Chain Vaccine Transport — County Health Dept.",
    source: "eVA",
    naics: "492110",
    location: "Hanover County, VA",
    dueDate: "2026-10-01",
    fitScore: 79,
    status: "Found",
    estValue: 145000,
    agency: "County Health Department",
    description:
      "Temperature-monitored transport of vaccines and biologics from a central depot to county clinic sites, with cold-chain documentation.",
    whyItFits:
      "Temperature-controlled handling and documentation are within CSL's capabilities; requires confirming cold-chain monitoring equipment.",
    suggestedAction:
      "Qualify further; verify cold-chain equipment and validation before drafting outreach.",
  },
  {
    id: "OPP-1012",
    title: "Ambulance / ALS Transport Contract",
    source: "SAM.gov",
    naics: "621910",
    location: "Richmond, VA",
    dueDate: "2026-08-05",
    fitScore: 22,
    status: "Lost",
    estValue: 800000,
    agency: "Regional EMS Authority",
    description:
      "Advanced Life Support (ALS) ambulance transport with licensed paramedic staffing and emergency response requirements.",
    whyItFits:
      "Filtered out by the Lead Qualifier: requires ALS/ambulance licensure and clinical staffing outside CSL's courier scope. Included to show disqualification handling.",
    suggestedAction:
      "No action — outside scope. Kept visible so the qualifier's filtering is transparent.",
  },
];

/** Dashboard aggregates derived from the sample opportunities. */
export const opportunityStats = {
  open: opportunities.filter((o) =>
    ["Found", "Qualified", "Contacted", "Meeting", "Bid"].includes(o.status)
  ).length,
  qualified: opportunities.filter((o) => o.fitScore >= 80).length,
  pipelineValue: opportunities
    .filter((o) => !["Lost"].includes(o.status))
    .reduce((sum, o) => sum + o.estValue, 0),
};
