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
    subtitle:
      "eVA Future Procurement OGS-27-005 · WITHDRAWN — did not issue on 2026-08-01",
    category: "Bid packet",
    status: "action-required",
    summary:
      "SUPERSEDED IN PART. This packet was written for a solicitation that never issued — the August 1 estimated issue date passed and the Future Procurement notice was withdrawn from eVA. The bid-day instructions are on hold. The eVA readiness checklist is still worth completing, because it applies to every Commonwealth solicitation CSL will ever chase, and the buyer call is still worth making with a different question.",
    nextSteps: [
      "Read the status update at the top first — the August 1 bid-day plan is on hold, not live.",
      "Still work the eVA readiness checklist: it applies to any Commonwealth solicitation, and a profile gap found later is a missed bid.",
      "Call Pedro Andrade at (804) 726-7184 and ask whether the procurement was cancelled, deferred, or absorbed — and ask to be on his notification list.",
    ],
    relatedOpportunityIds: ["OPP-2026-016"],
    generatedISO: "2026-08-10",
    sections: [
      {
        heading: "Status update — 2026-08-10",
        blocks: [
          {
            kind: "callout",
            tone: "critical",
            title: "This procurement did not issue",
            text: "Verified live in eVA on August 10, 2026. An exact search for OGS-27-005 returns no results, the Future Procurement notice is absent from all 80 FPRs currently posted, and no courier search in eVA shows an open solicitation. The estimated issue date of August 1 passed and the notice was withdrawn. The opportunity has been rescored from 94 to 79 and its hard-deadline flag removed. Do not prepare a bid against this document.",
          },
          {
            kind: "paragraph",
            text: "What is still useful here: the eVA readiness checklist below is not specific to VDSS — it is the standing prerequisite for bidding anything on the Commonwealth's system, and completing it now means the next solicitation is a bid rather than a scramble. The bid/no-bid framework is also worth keeping, because the question it turns on — whether the requirement is divided into regional lots a single-vehicle operator can perform — is the same question that decides the VDOT courier cycle tracked as OPP-2026-035.",
          },
          {
            kind: "paragraph",
            text: "The call to Pedro Andrade is still worth making, with the question changed. He remains an active VDSS buyer on other current postings, so the contact is good. Ask whether the statewide courier requirement was cancelled, deferred, or folded into an existing contract, when it is expected to return, and to be added to his notification list either way.",
          },
        ],
      },
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
          {
            kind: "callout",
            tone: "warning",
            title: "One bullet above was overtaken — see the W3 brief",
            text: "The claim that the Richmond VAMC contract is 'barely used — one delivery order of $6,411.84' was corrected on August 10, 2026. USAspending now shows five child awards totalling $245,816.84, roughly 32% of the $769,850 ceiling, with activity as recent as July 10. The vehicle is active. The OA-151 and HB61 bullets both still stand.",
          },
        ],
      },
    ],
  },
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: "oa151-broker-unlock-sheet",
    title: "DMV Form OA-151 — The One Filing That Opens Four Broker Doors",
    subtitle: "NEMT carrier authority · ModivCare · Access2Care · MediDrive · Roundtrip",
    category: "Registration",
    status: "action-required",
    summary:
      "Every Medicaid transportation record on the board is blocked behind a single Virginia DMV filing. This sheet has the verified requirements, the exact costs, the four doors it opens, and the order to do them in. It is the highest-leverage hour on the entire board.",
    nextSteps: [
      "File Form OA-151 online at dmv.virginia.gov — the NEMT Carrier application, NOT OA-150.",
      "Line up the $350,000 liability coverage and the $25,000 surety bond before filing, not after.",
      "Once authority issues, enroll with all four brokers in the same week — the paperwork overlaps.",
    ],
    relatedOpportunityIds: [
      "OPP-2026-002",
      "OPP-2026-008",
      "OPP-2026-023",
      "OPP-2026-031",
    ],
    generatedISO: "2026-08-10",
    sections: [
      {
        heading: "Why this is the highest-leverage action on the board",
        blocks: [
          {
            kind: "paragraph",
            text: "Four separate opportunities on the board — worth a combined CSL-estimated $209,000 a year — are all blocked by the same thing, and it is not a sale. It is a form. Virginia Medicaid non-emergency medical transportation is contracted through brokers, and no broker can credential a carrier that does not hold DMV for-hire operating authority. File once, and all four enrollments become possible in the same week.",
          },
          {
            kind: "callout",
            tone: "warning",
            title: "It is OA-151, not OA-150",
            text: "OA-150 is the Broker application. Filing it would have CSL applying to become a transportation broker rather than a carrier — the wrong business, and a rejection after weeks of waiting. The NEMT Carrier application is Form OA 151. This was corrected in run 2 and re-verified against DMV's current published materials on August 10, 2026.",
          },
        ],
      },
      {
        heading: "Verified requirements — 1 to 6 passenger tier",
        blocks: [
          {
            kind: "fields",
            fields: [
              { label: "Application form", value: "Form OA 151 — NEMT Carrier" },
              { label: "Also required", value: "OA 435 surety bond, or OA 447 letter of credit; plus OA 210" },
              { label: "Liability insurance", value: "$350,000 (1–6 passengers)" },
              { label: "Liability — 7 to 15 passengers", value: "$1,500,000" },
              { label: "Liability — 16+ passengers", value: "$5,000,000" },
              { label: "Surety bond or letter of credit", value: "$25,000, maintained 3 years from certificate issuance" },
              { label: "Filing fee", value: "$50" },
              { label: "Operating authority registration fee", value: "$3" },
              { label: "Online filing", value: "Available since 1/1/2026; not mandatory until 2/1/2027" },
              { label: "Insurance carrier + policy number", value: "", needsInput: true },
              { label: "Surety company + bond number", value: "", needsInput: true },
            ],
          },
          {
            kind: "paragraph",
            text: "The two fields left blank are the only ones the engine cannot supply — they are Darren's insurance and surety details. Everything else above is verified against DMV's current NEMT carrier page as of August 10, 2026.",
          },
        ],
      },
      {
        heading: "The four doors this opens",
        blocks: [
          {
            kind: "bullets",
            items: [
              "ModivCare — statewide Medicaid fee-for-service broker, plus Humana, Sentara and UnitedHealthcare Mid-Atlantic. Provider Assistance (866) 810-8302. Note: three of five MCOs, not four — Aetna left on 4/1/2026.",
              "MediDrive — new broker for Aetna Better Health of Virginia since 4/1/2026, (800) 734-0430. Newest network and therefore the easiest to enter, because gaps are still open.",
              "Access2Care — Anthem HealthKeepers Plus, (877) 892-3988. That number is the Anthem member line; no separate Virginia provider-network line was published as of this run.",
              "Roundtrip — transport company network with a Richmond office, tracked as OPP-2026-023.",
            ],
          },
          {
            kind: "callout",
            tone: "critical",
            title: "Strike (804) 873-5200 from the file",
            text: "Run 2 recorded (804) 873-5200 as a broker contact. It appears in no ModivCare or DMAS published contact list and could not be verified from any primary source. Do not call it. Use ModivCare Provider Assistance (866) 810-8302, Facility Assistance (866) 679-6330, or the Mechanicsville administrative line (866) 810-8305.",
          },
        ],
      },
      {
        heading: "Order of operations",
        blocks: [
          {
            kind: "numbered",
            items: [
              "Get the insurance quote first. $350,000 liability is the gating cost and it determines whether the whole NEMT lane is worth entering — price it before filing anything.",
              "Secure the $25,000 surety bond or letter of credit. It must be maintained for three years from the date the certificate is issued, so treat it as a three-year commitment, not a one-time fee.",
              "File Form OA 151 online with the $50 filing fee and $3 registration fee.",
              "While the filing is pending, request enrollment packets from all four brokers so credentialing starts the day authority issues.",
              "Enroll with MediDrive first. It is the newest network in Virginia and the most likely to have unfilled Richmond-region capacity.",
            ],
          },
        ],
      },
    ],
  },
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: "w3-target-brief",
    title: "W3 Target Brief — Week of August 10, 2026",
    subtitle: "14 new opportunities · board at 43 · the constraint has not moved",
    category: "Briefing",
    status: "ready",
    summary:
      "What the third sweep found, what it corrected, and the one thing that has now blocked this pipeline for three consecutive weeks. Written to be read in five minutes before the week's calls.",
    nextSteps: [
      "Read the constraint section first — it is the same as last week and the week before.",
      "Make the three calls listed under 'This week's three calls' before adding anything new.",
      "Note the two capability gates: no validated cold chain, no hazmat certification. They decide which lanes to work now.",
    ],
    relatedOpportunityIds: [
      "OPP-2026-030",
      "OPP-2026-031",
      "OPP-2026-033",
      "OPP-2026-035",
      "OPP-2026-016",
      "OPP-2026-001",
    ],
    generatedISO: "2026-08-10",
    sections: [
      {
        heading: "The constraint, stated once more",
        blocks: [
          {
            kind: "callout",
            tone: "critical",
            title: "Three weeks, 43 opportunities, zero outreach sent",
            text: "The board has gone 15 to 29 to 43. Pipeline value has gone $1.59M to $2.07M to $2.51M. Outreach sent has gone 0 to 0 to 0. Ten drafts written on July 21 and July 28 are still awaiting approval. This is no longer a supply problem or a research problem — the engine is producing more qualified leads than the business is acting on, and every additional week widens that gap. Only three new drafts were written this run instead of fourteen, deliberately, so the number does not keep inflating while nothing ships.",
          },
        ],
      },
      {
        heading: "This week's three calls",
        blocks: [
          {
            kind: "numbered",
            items: [
              "VPI Core Lab, (804) 836-1136 — ask for the laboratory manager. Eleven sites feed a lab this practice owns. Qualifying question: how do specimens get from the ten satellites to Glen Allen today? If staff are driving them, that is the sale. Full call script is on OPP-2026-030.",
              "Remedi SeniorCare, (804) 550-4856 — ask for the pharmacy manager. Lead with STAT coverage, not the cycle-fill route. Ambient only, so CSL can serve this today with no new equipment. Email draft is on OPP-2026-033.",
              "VDOT buyer Kimberly Palmer, (804) 729-6317 — four questions about a statewide courier contract cycle CSL did not know existed. Call script is on OPP-2026-035.",
            ],
          },
        ],
      },
      {
        heading: "What the sweep corrected",
        blocks: [
          {
            kind: "bullets",
            items: [
              "The VDSS statewide courier procurement — last week's number one item at fit 94 — did not issue. The notice was withdrawn from eVA entirely. Rescored to 79 and reframed as a watch item.",
              "The Richmond VAMC contract is NOT dormant. Five delivery orders totalling $245,816.84, about 32% of ceiling, with activity through July 10. Rescored up, 84 to 88. Last week's data would have had Darren skip this call.",
              "Virginia statewide courier IS contracted — VDOT ran IFB161013 in June and posted intent to award on July 15. The recurring cycle, the buyer's name, and a 2014 small-business set-aside precedent are now on the board.",
              "Owens & Minor accepts Virginia SWaM. Last week's open question is closed; no second certification track is needed. The company was also sold to Platinum Equity on 12/31/2025.",
              "ModivCare covers three of five MCOs, not four — Aetna moved to MediDrive on 4/1/2026, which is a new door rather than a loss.",
              "The number (804) 873-5200 was struck from the file as unverifiable.",
            ],
          },
        ],
      },
      {
        heading: "Two capability gates that decide what to work now",
        blocks: [
          {
            kind: "paragraph",
            text: "Several attractive-looking lanes were deliberately scored down or scoped narrow this run because CSL cannot serve them today, and bidding work you cannot perform is worse than not bidding.",
          },
          {
            kind: "bullets",
            items: [
              "No validated cold chain. Home infusion and specialty pharmacy require 2–8°C with continuous monitoring and documented excursion handling; one van with an unvalidated cooler will not pass a pharmacy quality audit. Price validated shippers and data loggers — the spend is modest and it also unlocks parts of the dialysis and trial-kit lanes.",
              "No hazmat certification. Clinical trial kits routinely ship on dry ice, which is DOT hazmat UN1845 and requires certified shippers. Bid only the ambient and 2–8°C legs at Clinical Research Partners, and say so unprompted — volunteering the limit is what earns trust with research staff.",
            ],
          },
          {
            kind: "paragraph",
            text: "By contrast, the entire long-term-care pharmacy lane — Remedi, Family Care, Bremo LTC — is ambient or small-cooler. It needs nothing CSL does not already have. That is why it is the lane to work first.",
          },
        ],
      },
      {
        heading: "Lanes checked and ruled out — so nobody re-researches them",
        blocks: [
          {
            kind: "bullets",
            items: [
              "Veterinary specimen courier: effectively closed. Antech's regional lab serving Virginia is in Chantilly, not Richmond, so Richmond specimens ride a line-haul Antech already runs. Both Antech and IDEXX employ their own courier staff, and where IDEXX has no coverage it uses FedEx. Antech, VCA and Banfield are all Mars companies, so those hospitals send work intercompany. One courtesy call to Virginia Veterinary Centers, then drop it.",
              "Bulk plasma freight: not a cargo-van job. Source plasma ships frozen at −20°C or colder on pallets by reefer LTL. The regional independent no longer exists either — Virginia Blood Services was absorbed by the American Red Cross. The only realistic opening is Red Cross STAT hospital-to-hospital overflow.",
              "PharMerica and Guardian Pharmacy: neither has a Richmond-metro pharmacy. Do not spend calls there.",
              "Velocity Clinical Research has no Richmond site (Martinsville only), and Virginia Research Center states on its own site that it is no longer enrolling.",
              "Federal bidding: three consecutive live SAM.gov sweeps have returned zero open courier or specimen solicitations with a Virginia place of performance. Stay registered and notified; do not plan around it.",
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
