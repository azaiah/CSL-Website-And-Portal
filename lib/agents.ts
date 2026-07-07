/**
 * lib/agents.ts
 * ---------------------------------------------------------------------------
 * Typed registry of the five Phase 1 AI agents that power the CSL lead-gen
 * engine. In Phase 1 these are DESCRIBED and previewed with mock data only —
 * there is NO live AI, scraping, or external API call. The typed shape below
 * lets real agent implementations drop in later without restructuring the UI.
 * ---------------------------------------------------------------------------
 */

export type AgentStatus = "coming-online";

export interface Agent {
  id: string;
  name: string;
  /** One-line purpose. */
  purpose: string;
  /** Plain-English "what it does in Phase 1" paragraph. */
  phase1Description: string;
  /** Inputs it reads (primarily the Company Brain). */
  inputs: string[];
  /** Output it produces. */
  outputs: string[];
  /** Data sources it will scan/use when live (Phase 2+). */
  sources?: string[];
  status: AgentStatus;
}

export const AGENT_STATUS_LABEL = "Coming online — Phase 1 build";

export const agents: Agent[] = [
  {
    id: "opportunity-finder",
    name: "Opportunity Finder",
    purpose:
      "Continuously scans public and healthcare sources for medical-courier and NEMT opportunities that match CSL.",
    phase1Description:
      "When live, the Opportunity Finder will continuously watch SAM.gov, Virginia eVA, Virginia Medicaid/DMAS (NEMT), VA medical centers & clinics, and regional hospital systems and independent labs. It matches each posting against CSL's NAICS/NIGP codes, set-asides, and service area, then files qualifying opportunities into the pipeline. In Phase 1 the interface and data model are complete and populated with clearly-labeled sample opportunities so the workflow can be reviewed before the live scanners are switched on.",
    inputs: [
      "Company Brain: NAICS 492110 / 485991, NIGP 962-86 / 948-55",
      "Company Brain: set-asides (SWaM, SDVOSB), service area (Richmond ~25mi)",
    ],
    outputs: [
      "New opportunities added to the Opportunities table",
      "Source, due date, and raw match reasons for each",
    ],
    sources: [
      "SAM.gov",
      "Virginia eVA",
      "Virginia Medicaid / DMAS (NEMT)",
      "VA medical centers & clinics",
      "Regional hospital systems & independent labs",
    ],
    status: "coming-online",
  },
  {
    id: "lead-qualifier",
    name: "Lead Qualifier",
    purpose:
      "Scores every opportunity by real win-probability and surfaces the best-fit targets.",
    phase1Description:
      "The Lead Qualifier will score each opportunity by genuine win-probability using CSL's advantages — SDVOSB/SWaM preference, local Richmond presence, HIPAA/BBP training, and existing credentials — while filtering out low-odds work such as in-house fleet operations, ambulance/ALS transport, and national-carrier contracts CSL can't realistically win. In Phase 1 it demonstrates the scoring model against the sample opportunities so you can see how fit scores and rationale will appear.",
    inputs: [
      "Opportunities from the Opportunity Finder",
      "Company Brain: credentials, certifications, capacity, service area",
    ],
    outputs: [
      "A 0–100 fit score per opportunity",
      "Why-it-fits rationale and disqualifiers",
    ],
    status: "coming-online",
  },
  {
    id: "outreach-writer",
    name: "Outreach Writer",
    purpose:
      "Drafts tailored intro emails and capability pitches to the right decision-makers.",
    phase1Description:
      "The Outreach Writer will draft tailored introduction emails and capability-statement pitches aimed at the right decision-makers — procurement category managers, VA transportation supervisors, lab operations leads — using CSL's capability statement and the specifics of each opportunity. Every draft is prepared for human review and approval before anything is sent. In Phase 1 it shows example drafts so the tone and structure can be approved in advance.",
    inputs: [
      "Qualified opportunities and contact roles",
      "Company Brain: capability statement, credentials, differentiators",
    ],
    outputs: [
      "Draft intro emails ready for human approval",
      "Tailored capability-statement pitches",
    ],
    status: "coming-online",
  },
  {
    id: "application-assistant",
    name: "Application Assistant",
    purpose:
      "Pre-fills vendor registrations and applications and generates a reusable capability statement.",
    phase1Description:
      "The Application Assistant will pre-fill vendor registrations and applications — eVA, Virginia Vendor ID requests, Medicaid/DMAS enrollment, and SAM renewals — pulling directly from the Company Brain so nothing is re-keyed, and it maintains a reusable, up-to-date capability statement. In Phase 1 it presents the target registrations and a generated capability statement so the source data can be verified before any submission is prepared.",
    inputs: [
      "Company Brain: legal identity, codes, credentials, points of contact",
      "Target registration requirements",
    ],
    outputs: [
      "Pre-filled registration & application drafts",
      "A reusable capability statement",
    ],
    status: "coming-online",
  },
  {
    id: "weekly-briefing",
    name: "Weekly Briefing",
    purpose:
      "Compiles a weekly digest of activity, top leads, deadlines, and recommended next moves.",
    phase1Description:
      "The Weekly Briefing will compile a weekly digest with the key data-tracking reports leadership needs: new opportunities found, top-scored leads, outreach sent and response rates, pipeline progress, upcoming deadlines, and recommended next moves. In Phase 1 a fully-formatted sample briefing is available on the Weekly Report page so the format and metrics are ready the moment live data flows.",
    inputs: [
      "Activity from all other agents",
      "Pipeline stage changes and deadlines",
    ],
    outputs: [
      "A formatted weekly digest",
      "Prioritized recommended next actions",
    ],
    status: "coming-online",
  },
];

export function getAgent(id: string): Agent | undefined {
  return agents.find((a) => a.id === id);
}
