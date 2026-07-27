/**
 * lib/data/documents.ts
 * ---------------------------------------------------------------------------
 * LIVE DATA — registry of application packets and documents prepared by the
 * Application Assistant. Files live in /public/documents/ and are downloadable
 * from the portal Documents page. Updated on each engine run.
 * ---------------------------------------------------------------------------
 */

export type DocumentStatus = "ready" | "action-required" | "awaiting-approval";

export interface PortalDocument {
  id: string;
  title: string;
  file: string; // path under /public
  category:
    | "Core asset"
    | "Completed application"
    | "Application packet"
    | "Setup guide"
    | "Outreach";
  status: DocumentStatus;
  summary: string;
  /** What Darren does with this document, in order. */
  nextSteps: string[];
  relatedOpportunityIds?: string[];
}

export const DOCUMENT_STATUS_LABEL: Record<DocumentStatus, string> = {
  ready: "Ready to use",
  "action-required": "Action required — Darren",
  "awaiting-approval": "Awaiting approval",
};

export const documents: PortalDocument[] = [
  {
    id: "swam-designation-certificate",
    title: "SWaM Designation Certificate — Small & Minority-Owned Business",
    file: "/documents/CSL_SWaM_Designation_Certificate.pdf",
    category: "Core asset",
    status: "ready",
    summary:
      "Official Virginia SBSD designation certificate for Capital Investment Group LLC (CSL). Confirms qualification as a Small Business and Minority-Owned Business. Service-Disabled Veteran designation was not awarded — attach this PDF to eVA, vendor diversity portals, and set-aside applications as proof.",
    nextSteps: [
      "Download and save to the compliance folder — this is the proof-of-designation file.",
      "Upload to eVA supplier profile, Bon Secours symplr, and any vendor-diversity portal that asks for SWaM/MBE documentation.",
      "Reference the certificate number on outreach and capability materials.",
    ],
    relatedOpportunityIds: ["OPP-2026-009", "OPP-2026-011"],
  },
  {
    id: "capability-statement",
    title: "CSL Capability Statement",
    file: "/documents/CSL_Capability_Statement.pdf",
    category: "Core asset",
    status: "action-required",
    summary:
      "The one-page credential sheet every application and outreach email attaches. Pre-filled from the Company Brain; UEI, CAGE, and EIN blanks are flagged for fill-in.",
    nextSteps: [
      "Fill in the [FILL IN] blanks (EIN, UEI, CAGE, USDOT #) — 5 minutes, one time.",
      "Save the final copy as PDF and attach it to every outreach email and registration.",
      "Send the finished numbers back to the engine so future documents come pre-filled completely.",
    ],
  },
  {
    id: "swam-completed",
    title: "SWaM Certification — Completed Application (pre-filled)",
    file: "/documents/CSL_SWaM_Completed_Application.pdf",
    category: "Completed application",
    status: "ready",
    summary:
      "Transcription sheet used to apply for Virginia SWaM certification. CSL is now certified — see the official designation certificate above. Keep this file as the application record.",
    nextSteps: [
      "No action needed — certification is complete.",
      "Use the official designation certificate (above) as proof going forward.",
    ],
    relatedOpportunityIds: ["OPP-2026-009", "OPP-2026-011"],
  },
  {
    id: "modivcare-completed",
    title: "ModivCare NEMT Provider — Completed Application (pre-filled)",
    file: "/documents/CSL_ModivCare_Completed_Application.pdf",
    category: "Completed application",
    status: "action-required",
    summary:
      "The ModivCare provider enrollment and credentialing fields — plus the Virginia DMAS requirements layered on top — reproduced with CSL's answers pre-entered. Gold fields need Darren's data or a step done first (DMV authority, insurance limits, VIN).",
    nextSteps: [
      "Do the Virginia DMV for-hire authority first (Section 8) — it's the long pole.",
      "Call ModivCare Network Development (866-810-8305 x2645) and read these answers down the packet.",
      "Fill the gold fields: EIN, USDOT #, NPI, VIN/plate, insurance policy #s and limits, banking.",
    ],
    relatedOpportunityIds: ["OPP-2026-002", "OPP-2026-008"],
  },
  {
    id: "modivcare-packet",
    title: "Medicaid NEMT Enrollment Guide (ModivCare + Access2Care)",
    file: "/documents/CSL_ModivCare_NEMT_Enrollment_Packet.pdf",
    category: "Setup guide",
    status: "action-required",
    summary:
      "The how-and-why companion to the completed ModivCare application: one credential covers FFS + 4 of 5 MCOs; Access2Care adds Anthem. Covers the DMV prerequisite, credentialing checklist, rates, and enrollment contacts.",
    nextSteps: [
      "Read alongside the completed ModivCare application above.",
      "Use the contact numbers and rate guidance when you call.",
      "Save every confirmation to the compliance folder.",
    ],
    relatedOpportunityIds: ["OPP-2026-002", "OPP-2026-008"],
  },
  {
    id: "swam-checklist",
    title: "SWaM Certification Checklist",
    file: "/documents/CSL_SWaM_Certification_Checklist.pdf",
    category: "Application packet",
    status: "ready",
    summary:
      "Checklist used during the SWaM application process. CSL is now certified as a Small and Minority-Owned Business. Keep for records; use the official designation certificate as live proof.",
    nextSteps: [
      "No action needed — certification is complete.",
      "Download the designation certificate and upload to vendor portals.",
    ],
    relatedOpportunityIds: ["OPP-2026-009", "OPP-2026-011"],
  },
  {
    id: "vendor-playbook",
    title: "Vendor Registrations Playbook (6 registrations)",
    file: "/documents/CSL_Vendor_Registrations_Playbook.pdf",
    category: "Application packet",
    status: "action-required",
    summary:
      "Six vendor registrations ordered by speed-to-revenue: Medzoomer, Lab Logistics, Bon Secours symplr + supplier diversity, Quest supplier portal, VCU, and HealthTrust/HCA — each with the exact URL, what to enter, and what proof to save.",
    nextSteps: [
      "Do #1 (Medzoomer) and #2 (Lab Logistics) this week — both are free and take minutes.",
      "Work #3–#5 next; flag minority-owned / veteran-owned status everywhere it's asked.",
      "Log each confirmation in the pipeline so the engine tracks registration status.",
    ],
    relatedOpportunityIds: [
      "OPP-2026-014",
      "OPP-2026-012",
      "OPP-2026-010",
      "OPP-2026-013",
      "OPP-2026-009",
    ],
  },
  {
    id: "alerts-guide",
    title: "Bid Alerts Setup Guide (SAM.gov, eVA, local portals)",
    file: "/documents/CSL_SAM_eVA_Alerts_Setup_Guide.pdf",
    category: "Setup guide",
    status: "action-required",
    summary:
      "One-hour, one-time setup so no solicitation slips by: SAM.gov saved searches (NCO 6 posts courier bids with 3–9 day windows), eVA commodity-code alerts, and the Richmond-metro local portals. The engine's weekly sweep is the backstop; these alerts win the short-window races.",
    nextSteps: [
      "Set up the three SAM.gov saved searches with daily email notifications.",
      "Confirm NIGP 962-86 / 948-55 on the eVA profile and save the VBO keyword searches.",
      "Screenshot each confirmation as proof of setup.",
    ],
    relatedOpportunityIds: ["OPP-2026-001"],
  },
  {
    id: "outreach-drafts",
    title: "Outreach Drafts — Week of July 20, 2026",
    file: "/documents/CSL_Outreach_Drafts_2026-07-21.docx",
    category: "Outreach",
    status: "awaiting-approval",
    summary:
      "Five ready-to-send emails from the Outreach Writer: the VAMC prime subcontract inquiry, GENETWORx, Virginia Cancer Institute, Bremo Pharmacy, and MedRVA. Nothing sends without Darren's approval.",
    nextSteps: [
      "Review each draft; edit tone or details as needed.",
      "Send from capitalsolutionslogistics@gmail.com with the finished Capability Statement attached.",
      "Report replies back so the engine updates pipeline stages and response rates.",
    ],
    relatedOpportunityIds: [
      "OPP-2026-001",
      "OPP-2026-003",
      "OPP-2026-004",
      "OPP-2026-005",
      "OPP-2026-006",
    ],
  },
];

/** Ordered this-week action plan shown at the top of the Documents page. */
export const actionPlan: string[] = [
  "Upload the SWaM designation certificate to eVA, symplr, and vendor-diversity portals — certification is complete.",
  "Fill the [FILL IN] blanks on the Capability Statement (EIN, UEI, CAGE, USDOT #) — everything else reuses them.",
  "Call ModivCare (866-810-8305 x2645) and start the DMV for-hire authority application.",
  "Knock out Medzoomer + Lab Logistics signups (both free, ~15 minutes total).",
  "Approve and send the five outreach drafts.",
  "Set up SAM.gov + eVA alerts per the guide.",
];
