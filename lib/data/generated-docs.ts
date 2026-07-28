/**
 * lib/data/generated-docs.ts
 * ---------------------------------------------------------------------------
 * LIVE DATA — documents that are RENDERED ON DEMAND rather than shipped as
 * binary files.
 *
 * The portal has no AI inside it, so a "Download PDF" button cannot invent
 * content. But the content does not have to live inside a PDF either. Anything
 * the engine writes can live here as structured data and be rendered to a
 * printable page — and then to a PDF — at the moment someone asks for it.
 *
 * That split matters:
 *   - GENERATED (this file): outreach drafts, call scripts, checklists,
 *     registration sheets, briefs. No binary in the repo, never stale, and when
 *     the engine rewrites the text on the next sweep the download changes with
 *     it.
 *   - STATIC (documents.ts + /public/documents): artefacts that must be a real
 *     file. The SWaM Designation Certificate is issued by Virginia and cannot
 *     be regenerated. The pre-filled SWaM and ModivCare applications reproduce
 *     real government forms field-by-field, and their value is mirroring that
 *     layout exactly.
 *
 * Outreach drafts are NOT duplicated here — each OutreachRecord already carries
 * its full `body`, so its PDF renders straight from that record. This file
 * holds only documents that are not outreach.
 * ---------------------------------------------------------------------------
 */

import type { DocumentStatus } from "./documents";

export type DocBlock =
  | { kind: "paragraph"; text: string }
  | { kind: "bullets"; items: string[] }
  | { kind: "numbered"; items: string[] }
  | { kind: "checklist"; items: string[] }
  /** Label/value pairs. `needsInput` marks a field only Darren can supply. */
  | {
      kind: "fields";
      fields: { label: string; value: string; needsInput?: boolean }[];
    }
  | {
      kind: "callout";
      tone: "info" | "warning" | "critical";
      title: string;
      text: string;
    };

export interface DocSection {
  heading: string;
  blocks: DocBlock[];
}

export type GeneratedDocCategory =
  | "Bid packet"
  | "Registration"
  | "Briefing";

export interface GeneratedDocument {
  id: string;
  title: string;
  subtitle?: string;
  category: GeneratedDocCategory;
  status: DocumentStatus;
  summary: string;
  /** What Darren does with this, in order. */
  nextSteps: string[];
  relatedOpportunityIds: string[];
  /** ISO date the engine wrote this version. */
  generatedISO: string;
  sections: DocSection[];
}

export const generatedDocuments: GeneratedDocument[] = [
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: "vdss-presolicitation-packet",
    title: "VDSS Statewide Courier Services — Pre-Solicitation Packet",
    subtitle: "eVA Future Procurement OGS-27-005 · estimated issue 2026-08-01",
    category: "Bid packet",
    status: "action-required",
    summary:
      "Everything to do BEFORE the solicitation issues on August 1: the eVA readiness checklist, a bid/no-bid framework built around the one question that decides it, and what to do the day it drops. The call script for the buyer lives on the opportunity's outreach record.",
    nextSteps: [
      "Work the eVA readiness checklist today — a profile gap discovered after the solicitation posts is a missed bid.",
      "Call Pedro Andrade before August 1 using the call script on this opportunity.",
      "Apply the bid/no-bid framework once he answers question 1 about regional lots.",
    ],
    relatedOpportunityIds: ["OPP-2026-016"],
    generatedISO: "2026-07-28",
    sections: [
      {
        heading: "Why this packet exists",
        blocks: [
          {
            kind: "paragraph",
            text: "OGS-27-005 is the first genuinely biddable public solicitation the engine has surfaced for CSL. It is posted on eVA as a Future Procurement, which means the requirement is public but the solicitation itself has not issued. Estimated issue date is August 1, 2026.",
          },
          {
            kind: "callout",
            tone: "warning",
            title: "The window is the opportunity",
            text: "A Future Procurement notice is the only period in which a vendor can ask how the work is structured and be told. Once the solicitation issues, the requirement is fixed and buyers correctly refuse shaping conversations. Everything in this packet is time-boxed to before August 1.",
          },
        ],
      },
      {
        heading: "eVA readiness checklist — do this first",
        blocks: [
          {
            kind: "paragraph",
            text: "None of this is optional and all of it is unglamorous. A vendor profile gap discovered after a solicitation posts is a missed bid, because eVA notification and eligibility both key off the profile.",
          },
          {
            kind: "checklist",
            items: [
              "Confirm CSL's eVA vendor registration is ACTIVE and not lapsed — an expired registration silently stops notifications.",
              "Confirm NIGP commodity code 962-86 (Delivery / Messenger Services) is on the profile. This is the code this solicitation will almost certainly post under.",
              "Add NIGP 948-55 and 962-53 as secondary codes for related delivery and courier scopes.",
              "Confirm NAICS 492110 and 485991 are listed.",
              "Confirm the SWaM designation shows on the eVA profile AND in the DSBSD certification directory — buyers search both, and a certification that exists but is not visible does nothing.",
              "Upload the official SWaM Designation Certificate PDF to the eVA profile as supporting documentation.",
              "Verify the notification email on the eVA profile is one Darren actually reads daily.",
              "Set an eVA keyword alert on 'courier' and 'delivery' so the solicitation lands in the inbox on day one.",
              "Confirm W-9 and insurance certificates on file are current and not expiring inside the contract period.",
            ],
          },
        ],
      },
      {
        heading: "Bid / no-bid framework",
        blocks: [
          {
            kind: "paragraph",
            text: "CSL operates one vehicle. A genuinely statewide single-award requirement is not winnable and not deliverable, and bidding it anyway would be a waste of Darren's time at best and a performance failure at worst. The decision therefore turns on one question, which is why it is question 1 in the call script.",
          },
          {
            kind: "fields",
            fields: [
              {
                label: "Split into regions or lots",
                value:
                  "BID the Central Virginia / Richmond region. This is the target case and the reason to make the call early.",
              },
              {
                label: "Statewide single award, SWaM set-aside applied",
                value:
                  "Consider a teaming or subcontract position under a larger SWaM prime rather than a prime bid. Ask Pedro Andrade whether teaming is permitted.",
              },
              {
                label: "Statewide single award, no set-aside",
                value:
                  "NO-BID as prime. Register interest as a subcontractor and ask to be added to any bidders list so the eventual winner can find CSL.",
              },
              {
                label: "Volume far exceeds one vehicle in any lot",
                value:
                  "NO-BID, and say so honestly. Log the finding and revisit at the next recompete once the fleet has grown.",
              },
            ],
          },
          {
            kind: "callout",
            tone: "critical",
            title: "Do not overstate capacity to win this",
            text: "SDVOSB certification and MC authority are both still in progress and must not be claimed. Fleet size must not be inflated. A public solicitation is the single worst place to overstate a credential — the Commonwealth verifies, and a misrepresentation follows the company for years.",
          },
        ],
      },
      {
        heading: "The day it issues",
        blocks: [
          {
            kind: "numbered",
            items: [
              "Download the full solicitation package the day it posts, including every attachment and any Q&A schedule.",
              "Diary the question-submission deadline immediately — it is usually far earlier than the bid deadline and it is the last chance to clarify scope.",
              "Diary the pre-bid conference if one is scheduled, and attend it. Attendance is occasionally mandatory for eligibility.",
              "Read the scope of work against the bid/no-bid framework above and make the call within 48 hours rather than drifting toward the deadline.",
              "If bidding: confirm the SWaM certificate, W-9, insurance certificates and capability statement are attached in the format the solicitation specifies.",
              "Update the opportunity's status in the portal so the pipeline reflects reality.",
            ],
          },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  {
    id: "owens-minor-registration-sheet",
    title: "Owens & Minor — Supplier Diversity Submission Sheet",
    subtitle: "Field-by-field values to enter · 9120 Lockwood Blvd, Mechanicsville",
    category: "Registration",
    status: "action-required",
    summary:
      "The exact values to enter into the Owens & Minor supplier diversity registration, with the fields only Darren can supply flagged. The strategy and the certification question behind this submission are on the opportunity's outreach record.",
    nextSteps: [
      "Fill the flagged fields — they are the same values the Capability Statement needs, so doing it once unblocks both.",
      "Submit the registration form, then call to ask the SWaM-versus-NMSDC question.",
      "Record the confirmation reference and the certification answer in the portal.",
    ],
    relatedOpportunityIds: ["OPP-2026-020"],
    generatedISO: "2026-07-28",
    sections: [
      {
        heading: "Company identification",
        blocks: [
          {
            kind: "fields",
            fields: [
              { label: "Legal entity name", value: "Capital Investment Group LLC" },
              { label: "Doing business as", value: "Capital Solutions & Logistics (CSL)" },
              { label: "Headquarters", value: "Greater Richmond, Virginia" },
              { label: "Website", value: "trustcsl.com" },
              { label: "Primary contact", value: "Darren A. Lewis, Managing Member & Director of Operations" },
              { label: "Phone", value: "(757) 453-3831" },
              { label: "Email", value: "Info@trustcsl.com" },
              { label: "EIN", value: "[FILL IN — Darren]", needsInput: true },
              { label: "UEI (SAM.gov)", value: "[FILL IN — Darren]", needsInput: true },
              { label: "CAGE code", value: "[FILL IN — Darren]", needsInput: true },
              { label: "USDOT number", value: "[FILL IN — Darren]", needsInput: true },
              { label: "Date of formation", value: "[FILL IN — Darren]", needsInput: true },
            ],
          },
        ],
      },
      {
        heading: "Classification",
        blocks: [
          {
            kind: "fields",
            fields: [
              { label: "Primary NAICS", value: "492110 — Couriers and Express Delivery Services" },
              { label: "Secondary NAICS", value: "485991 — Special Needs Transportation" },
              { label: "Additional NAICS", value: "561210, 561320, 493110 (facilities, staffing, warehousing)" },
              { label: "Diversity certification held", value: "Virginia SWaM — Small Business and Minority-Owned Business (SBSD designated)" },
              { label: "SDVOSB", value: "NOT certified — application in progress. Do not claim." },
              { label: "NMSDC / WBENC / SBA 8(a)", value: "Not held. See the certification question below." },
              { label: "Employee count", value: "[FILL IN — Darren]", needsInput: true },
              { label: "Annual revenue", value: "[FILL IN — Darren]", needsInput: true },
            ],
          },
        ],
      },
      {
        heading: "Services offered",
        blocks: [
          {
            kind: "bullets",
            items: [
              "HIPAA-compliant medical and pharmaceutical courier — scheduled daily routes and STAT runs",
              "Laboratory specimen transport with documented chain of custody and electronic proof of delivery",
              "Pharmacy and long-term-care medication delivery",
              "Bloodborne-pathogen and DOT hazardous-materials trained drivers",
              "Facilities management, workforce and staffing support, warehouse and storage",
              "Service area: Greater Richmond, Virginia — approximately a 25-mile operating radius",
            ],
          },
        ],
      },
      {
        heading: "Attachments to upload",
        blocks: [
          {
            kind: "checklist",
            items: [
              "Virginia SWaM Designation Certificate (official PDF)",
              "CSL Capability Statement — complete the [FILL IN] fields first",
              "Certificate of insurance — commercial auto liability",
              "Certificate of insurance — general liability",
              "Certificate of insurance — cargo",
              "W-9",
            ],
          },
          {
            kind: "callout",
            tone: "warning",
            title: "Ask this before assuming CSL qualifies",
            text: "Owens & Minor's published criteria reference third-party certification such as NMSDC and SBA programmes. Virginia SWaM is a state certification and may not satisfy that on its own. Get a written answer to whether SWaM is accepted or NMSDC is required — if NMSDC is required, that reshapes CSL's certification roadmap and is worth more than this registration.",
          },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  {
    id: "w2-target-brief",
    title: "Week 2 Target Brief — What the 2026-07-28 Sweep Added",
    subtitle: "14 new opportunities, ranked by what to do first",
    category: "Briefing",
    status: "ready",
    summary:
      "A one-page orientation to the W2 board for Darren: the one bid with a real clock, the four commercial targets worth calling this week, and the honest note that outreach approval — not opportunity supply — is what is actually holding the pipeline back.",
    nextSteps: [
      "Read this before working the opportunities list — it says what to do first.",
      "Approve the outreach drafts; they are the constraint, not the leads.",
      "Revisit after the VDSS solicitation issues on August 1.",
    ],
    relatedOpportunityIds: [
      "OPP-2026-016",
      "OPP-2026-017",
      "OPP-2026-018",
      "OPP-2026-019",
      "OPP-2026-020",
    ],
    generatedISO: "2026-07-28",
    sections: [
      {
        heading: "The one with a clock on it",
        blocks: [
          {
            kind: "paragraph",
            text: "Virginia Department of Social Services posted a Future Procurement for statewide courier services, OGS-27-005, with an estimated issue date of August 1. It is the first real public bid on the board and the buyer is named and reachable. Everything else here can wait a week; this cannot.",
          },
        ],
      },
      {
        heading: "Four commercial targets worth calling this week",
        blocks: [
          {
            kind: "bullets",
            items: [
              "Richmond Gastroenterology Associates (fit 88) — seven sites plus their own endoscopy center. Scope procedures produce biopsy specimens on a schedule, which is the most predictable recurring courier work there is. Independent and physician-owned, so they pick their own vendor. (804) 330-4021.",
              "Virginia Urology (fit 87) — seven sites with an in-house surgery center, dispensing pharmacy and a separate IR center. Three recurring lanes that consolidate onto one loop.",
              "Dermatology Associates of Virginia (fit 86) — the Mohs Surgery Center runs staged procedures where specimen transport is genuinely time-critical, which is billed per run rather than per stop. (804) 939-6191.",
              "Owens & Minor (fit 79) — a Fortune 500 medical distributor headquartered twenty minutes away with a formal supplier-diversity front door. Slower, but the largest healthcare logistics buyer inside CSL's radius.",
            ],
          },
        ],
      },
      {
        heading: "The honest constraint",
        blocks: [
          {
            kind: "callout",
            tone: "critical",
            title: "Opportunity supply is not the problem",
            text: "The board went from 15 opportunities to 29 in one week, and the pipeline value from $1.59M to $2.07M. In the same week, zero outreach was sent. Five drafts from the July 21 sweep are still awaiting approval, and two free registrations — Medzoomer and Lab Logistics — remain undone. Adding more leads will not move revenue; approving and sending will.",
          },
        ],
      },
      {
        heading: "What the federal side actually showed",
        blocks: [
          {
            kind: "paragraph",
            text: "Worth stating plainly so it is not mistaken for an oversight: two live searches of SAM.gov on July 28 returned zero open courier or specimen-transport solicitations anywhere in Virginia. The Richmond VAMC contract is a single-award SDVOSB set-aside locked to an Indianapolis firm through 2030 and CSL cannot bid it. Federal work is a subcontract relationship play right now, not a bidding channel.",
          },
        ],
      },
      {
        heading: "Corrections carried into this board",
        blocks: [
          {
            kind: "bullets",
            items: [
              "The DMV for-hire filing is Form OA-151, not OA-150. OA-150 is the broker application and would have been rejected. This one filing gates ModivCare, Access2Care and Roundtrip all at once.",
              "The Richmond VAMC contract is barely used — one delivery order of $6,411.84 against a $769,850 ceiling — which strengthens the subcontract argument rather than the bidding one.",
              "HB61, which would have expanded SWaM utilisation targets, was vetoed on May 19, 2026. Plan around today's $10,000–$100,000 set-aside thresholds; no expansion is coming.",
            ],
          },
        ],
      },
    ],
  },
];

/** Every generated document linked to one opportunity. */
export function generatedDocsForOpportunity(
  opportunityId: string
): GeneratedDocument[] {
  return generatedDocuments.filter((d) =>
    d.relatedOpportunityIds.includes(opportunityId)
  );
}

export function generatedDocById(id: string): GeneratedDocument | undefined {
  return generatedDocuments.find((d) => d.id === id);
}
