/**
 * lib/agents.ts
 * ---------------------------------------------------------------------------
 * Typed registry of the five AI agents that power the CSL lead-gen engine.
 * The agents are LIVE: research sweeps run on a weekly cadence (operated by
 * the DataIsData AI engine), and their findings are published into lib/data/
 * on every run. First live run: July 21, 2026.
 * ---------------------------------------------------------------------------
 */

export type AgentStatus = "live" | "coming-online";

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

export const AGENT_STATUS_LABEL = "Live — engine running";

export const agents: Agent[] = [
  {
    id: "opportunity-finder",
    name: "Opportunity Finder",
    purpose:
      "Continuously scans public and healthcare sources for medical-courier and NEMT opportunities that match CSL.",
    phase1Description:
      "LIVE. On every weekly run the Opportunity Finder sweeps SAM.gov and federal VA contracting (NCO 6 / VISN 6), Virginia eVA and state-local procurement, the Virginia Medicaid/DMAS NEMT broker network, and Richmond-area hospital systems, labs, and pharmacies. Each finding is matched against CSL's NAICS/NIGP codes, set-asides, and service area, then filed into the Opportunities table. The first live sweep (July 21, 2026) covered 30+ organizations and logged 15 real opportunities.",
    inputs: [
      "Company Brain: NAICS 492110 / 485991, NIGP 962-86 / 948-55",
      "Company Brain: set-asides (SWaM Small + MBE), service area (Richmond ~100mi)",
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
    status: "live",
  },
  {
    id: "lead-qualifier",
    name: "Lead Qualifier",
    purpose:
      "Scores every opportunity by real win-probability and surfaces the best-fit targets.",
    phase1Description:
      "LIVE. The Lead Qualifier scores every opportunity by genuine win-probability using CSL's advantages — Virginia SWaM Small + MBE preference, local Richmond presence, HIPAA/BBP training, and existing credentials — and filters out low-odds work such as in-house fleet operations, ambulance/ALS transport, and national-carrier contracts. Every fit score and why-it-fits rationale in the Opportunities table comes from this scoring pass.",
    inputs: [
      "Opportunities from the Opportunity Finder",
      "Company Brain: credentials, certifications, capacity, service area",
    ],
    outputs: [
      "A 0–100 fit score per opportunity",
      "Why-it-fits rationale and disqualifiers",
    ],
    status: "live",
  },
  {
    id: "outreach-writer",
    name: "Outreach Writer",
    purpose:
      "Drafts tailored intro emails and capability pitches to the right decision-makers.",
    phase1Description:
      "LIVE. The Outreach Writer drafts tailored introduction emails and capability-statement pitches aimed at the right decision-makers — procurement category managers, VA contracting officers, lab operations leads — using the Company Brain and the specifics of each opportunity. Every draft is held for human review and approval before anything is sent. Five drafts from the first run are awaiting approval now.",
    inputs: [
      "Qualified opportunities and contact roles",
      "Company Brain: capability statement, credentials, differentiators",
    ],
    outputs: [
      "Draft intro emails ready for human approval",
      "Tailored capability-statement pitches",
    ],
    status: "live",
  },
  {
    id: "application-assistant",
    name: "Application Assistant",
    purpose:
      "Pre-fills vendor registrations and applications and generates a reusable capability statement.",
    phase1Description:
      "LIVE. The Application Assistant reproduces each application field-by-field with CSL's answers already entered, pulling from the Company Brain so nothing is re-keyed — the SWaM certification and ModivCare NEMT applications are on the Documents page as completed worksheets, with only Darren's private fields (EIN, VIN, ownership %) flagged. It also maintains the capability statement and the registration playbooks for symplr, Quest, Lab Logistics, eVA, and SAM.",
    inputs: [
      "Company Brain: legal identity, codes, credentials, points of contact",
      "Target registration requirements",
    ],
    outputs: [
      "Field-by-field completed applications (SWaM, ModivCare) on the Documents page",
      "A reusable capability statement",
    ],
    status: "live",
  },
  {
    id: "weekly-briefing",
    name: "Weekly Briefing",
    purpose:
      "Compiles a weekly digest of activity, top leads, deadlines, and recommended next moves.",
    phase1Description:
      "LIVE. The Weekly Briefing compiles a digest after every run with the key data-tracking reports leadership needs: new opportunities found, top-scored leads, outreach sent and response rates, pipeline progress, upcoming deadlines, and recommended next moves. The current briefing on the Weekly Report page is real output from the July 21, 2026 run.",
    inputs: [
      "Activity from all other agents",
      "Pipeline stage changes and deadlines",
    ],
    outputs: [
      "A formatted weekly digest",
      "Prioritized recommended next actions",
    ],
    status: "live",
  },
];

export function getAgent(id: string): Agent | undefined {
  return agents.find((a) => a.id === id);
}
