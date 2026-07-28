/**
 * lib/data/outreach.ts
 * ---------------------------------------------------------------------------
 * LIVE DATA — the drafts written by the Outreach Writer, one record per
 * opportunity.
 *
 * These five drafts already existed, but only as a single bundled .docx
 * (documents.ts, id "outreach-drafts") and as three hardcoded numbers in
 * weekly-report.ts. That made them impossible to show next to the opportunity
 * they belong to, and it meant the dashboard's "outreach drafted" count was a
 * literal that could drift away from what was actually written. Modelling each
 * draft as a record fixes both: the detail view can render the real text, and
 * every count is now derived.
 *
 * The bundled .docx is still the source artefact Darren sends from, so each
 * record points back at it via `documentId`.
 *
 * CONTACTS ARE REAL. Names, roles and phone numbers here come from the
 * corresponding opportunity's own description — nothing is invented. Where the
 * engine has not yet identified a named person, the field is simply absent and
 * `notes` says so, because a fabricated contact is worse than a missing one.
 * ---------------------------------------------------------------------------
 */

export type OutreachStatus =
  | "draft"
  | "approved"
  | "sent"
  | "replied"
  | "no-response"
  | "closed";

export interface OutreachRecord {
  id: string;
  /** FK to Opportunity.id. */
  opportunityId: string;
  channel: "email" | "call" | "form" | "in-person";
  subject: string;
  /** Full draft text, rendered verbatim in the opportunity detail view. */
  body: string;
  status: OutreachStatus;
  draftedISO: string;
  sentISO?: string;
  responseISO?: string;
  contactName?: string;
  contactRole?: string;
  contactEmail?: string;
  contactPhone?: string;
  /** Source document this draft was written into, e.g. the bundled drafts docx. */
  documentId?: string;
  notes?: string;
}

export const OUTREACH_STATUS_LABEL: Record<OutreachStatus, string> = {
  draft: "Draft — awaiting approval",
  approved: "Approved — ready to send",
  sent: "Sent",
  replied: "Replied",
  "no-response": "No response",
  closed: "Closed",
};

/**
 * Statuses that mean the message actually reached the recipient. Kept as one
 * list so `outreachStats()` and any future funnel view cannot disagree about
 * what "sent" means.
 */
const REACHED_RECIPIENT: OutreachStatus[] = [
  "sent",
  "replied",
  "no-response",
  "closed",
];

export const outreach: OutreachRecord[] = [
  {
    id: "OUT-2026-001",
    opportunityId: "OPP-2026-001",
    channel: "email",
    subject:
      "Richmond-based courier support — local capacity under VA IDIQ 36C24625D0070",
    body: `Hello,

I'm Darren Lewis, Managing Member of Capital Solutions & Logistics (CSL), a medical courier company based in the Richmond area.

I understand All American Express Solutions holds the courier IDIQ for the Richmond VA Medical Center (36C24625D0070, running through July 2030). I'm reaching out because we're roughly twenty minutes from the facility and we specialize in exactly this work — HIPAA-trained drivers, documented chain of custody, and electronic proof of delivery on every run.

If it would ever be useful to have a local partner for overflow volume, STAT runs, or coverage on short-notice delivery orders, we would welcome the chance to be that resource. Standing up local capacity from out of state is expensive; we're already here, already credentialed, and already running Richmond-area medical routes daily.

A few details that may be relevant:

- Virginia SWaM certified (Small Business and Minority-Owned Business)
- Commercial auto liability plus cargo coverage underwritten through Lloyd's of London
- HIPAA and bloodborne-pathogen trained drivers; chain-of-custody documentation on every specimen movement
- Standard routes Monday-Friday, 7:00am-7:00pm, with STAT and on-demand available 24/7

I've attached our capability statement. If there's a subcontracting or teaming coordinator I should be speaking with instead, I'd appreciate the pointer.

Thank you for your time.

Darren Lewis
Managing Member & Director of Operations
Capital Solutions & Logistics
(757) 453-3831 | Info@trustcsl.com | trustcsl.com`,
    status: "draft",
    draftedISO: "2026-07-21",
    contactRole:
      "Subcontracts / operations lead, All American Express Solutions LLC (SDVOSB prime, IDIQ 36C24625D0070)",
    documentId: "outreach-drafts",
    notes:
      "No named contact has been identified yet — pull the POC from the entity's SAM.gov registration before sending. This is a relationship play, not a bid: the IDIQ is a single-award SDVOSB set-aside locked through 2030 and CSL cannot compete for it.",
  },
  {
    id: "OUT-2026-002",
    opportunityId: "OPP-2026-003",
    channel: "email",
    subject: "Daily specimen pickup for GENETWORx — we're 15 minutes from Innslake Drive",
    body: `Hello,

I'm Darren Lewis, Managing Member of Capital Solutions & Logistics, a medical courier company based here in the Richmond area. We're about fifteen minutes from your Innslake Drive lab.

Reference labs live or die on specimen logistics, so I'll be direct about what we do: scheduled daily pickups from provider sites, chain-of-custody documentation on every specimen, bloodborne-pathogen and HIPAA-trained drivers, and electronic proof of delivery with timestamps you can pull for an audit.

What tends to matter most to a lab our clients' size is coverage on the edges — the late-afternoon pickups, the sites a national courier treats as unprofitable, and the STAT runs that don't fit a fixed schedule. We're built for that: we're local, we're small enough to answer the phone, and we don't route Richmond volume through a hub in another state.

If you have gaps in your current pickup coverage, or sites where turnaround is slower than you'd like, I'd welcome a short conversation about what a dedicated daily route would look like.

Our capability statement is attached.

Darren Lewis
Managing Member & Director of Operations
Capital Solutions & Logistics
(757) 453-3831 | Info@trustcsl.com | trustcsl.com`,
    status: "draft",
    draftedISO: "2026-07-21",
    contactRole: "Lab Operations / Logistics Manager",
    contactPhone: "(800) 858-5909",
    documentId: "outreach-drafts",
    notes:
      "Highest-scoring commercial lead on the board (fit 90) and the draft has been sitting unsent since the run-1 sweep. Ask for the lab operations or logistics manager by function — no named contact is published.",
  },
  {
    id: "OUT-2026-003",
    opportunityId: "OPP-2026-004",
    channel: "email",
    subject:
      "Consolidating inter-office specimen and medication runs across your six Richmond-area sites",
    body: `Hello,

I'm Darren Lewis, Managing Member of Capital Solutions & Logistics, a Richmond-based medical courier company.

Virginia Cancer Institute runs six-plus locations across the metro — West End, Parham, Johnston-Willis, Mechanicsville, Hull Street and Petersburg — which usually means specimens, records and medications are moving between sites every day, often by staff who were hired to do something else.

That's the work we take over. We run scheduled multi-site loops with documented chain of custody and electronic proof of delivery on every stop. Relevant to an oncology practice specifically: our drivers carry hazardous-drug and chemotherapy safe-handling training, which is not standard among local couriers and matters the moment you're moving anything compounded.

Because your sites sit on a natural loop, this is efficient to price as one scheduled daily route rather than per-stop courier calls — which is usually where practices find the savings.

Could we set up fifteen minutes to walk through your current inter-office movement? I've attached our capability statement.

Darren Lewis
Managing Member & Director of Operations
Capital Solutions & Logistics
(757) 453-3831 | Info@trustcsl.com | trustcsl.com`,
    status: "draft",
    draftedISO: "2026-07-21",
    contactRole: "Practice Administrator — business office, 7202 Glen Forest Drive, Henrico",
    contactPhone: "(804) 673-2024",
    documentId: "outreach-drafts",
    notes:
      "Chemo and hazardous-drug safe-handling training is the differentiator to lead with — few local couriers hold it.",
  },
  {
    id: "OUT-2026-004",
    opportunityId: "OPP-2026-005",
    channel: "email",
    subject: "Daily LTC delivery routes and STAT dose coverage for Bremo",
    body: `Hello,

I'm Darren Lewis, Managing Member of Capital Solutions & Logistics, a medical courier company based in the Richmond area.

Bremo's long-term-care division runs scheduled medication deliveries to facilities, and that kind of route is exactly what we're built for: fixed daily runs, signature and photo proof of delivery, HIPAA-trained drivers, and STAT coverage when a dose has to move outside the normal schedule.

Pharmacies generally come to us for one of two reasons — either delivery has grown past what one in-house driver can cover, or a driver leaving suddenly turns into an operational emergency. We can run a dedicated route, or sit behind your own driver as overflow and backup so a call-out never becomes a missed med pass.

If you're handling deliveries in-house today, I'd still welcome a short conversation. Knowing there's a local, insured, HIPAA-trained option is worth something even if you never need it.

Our capability statement is attached.

Darren Lewis
Managing Member & Director of Operations
Capital Solutions & Logistics
(757) 453-3831 | Info@trustcsl.com | trustcsl.com`,
    status: "draft",
    draftedISO: "2026-07-21",
    contactRole: "Owner / Long-Term Care Operations Manager",
    documentId: "outreach-drafts",
    notes:
      "Confirm the footprint before sending — the Skipwith Road location showed as closed on public listings during the 2026-07-28 sweep, while the Staples Mill site and the LTC division appear active. No published direct number for the LTC division was found; call the main pharmacy line to be routed.",
  },
  {
    id: "OUT-2026-005",
    opportunityId: "OPP-2026-006",
    channel: "email",
    subject: "Daily pathology and supply runs for West Creek and Stony Point",
    body: `Hello,

I'm Darren Lewis, Managing Member of Capital Solutions & Logistics, a Richmond-based medical courier company.

Ambulatory surgery centers generate a predictable daily flow of pathology specimens outbound and implant and supply deliveries inbound — and unlike a hospital, an independent ASC gets to choose its own courier rather than inheriting one from a corporate contract.

We run scheduled daily routes with documented chain of custody, bloodborne-pathogen and HIPAA-trained drivers, and electronic proof of delivery on every pickup. For MedRVA specifically there's an efficiency worth mentioning: your West Creek and Stony Point centers sit close enough to be served on one combined loop, which prices better than treating them as two separate courier accounts.

If you'd be open to it, I'd like to propose a combined two-site daily run and let the numbers speak for themselves. Our capability statement is attached.

Darren Lewis
Managing Member & Director of Operations
Capital Solutions & Logistics
(757) 453-3831 | Info@trustcsl.com | trustcsl.com`,
    status: "draft",
    draftedISO: "2026-07-21",
    contactRole: "Center Administrator — West Creek & Stony Point ASCs",
    documentId: "outreach-drafts",
    notes:
      "Send to the administrator at each center rather than a single corporate address. The West Creek / Stony Point cluster now also includes Richmond Gastroenterology, Virginia Urology and Sheltering Arms — price the loop against the whole cluster.",
  },
];

/** Every draft written for one opportunity, oldest first. */
export function outreachForOpportunity(opportunityId: string): OutreachRecord[] {
  return outreach
    .filter((o) => o.opportunityId === opportunityId)
    .sort((a, b) => a.draftedISO.localeCompare(b.draftedISO));
}

/**
 * Funnel counts derived from the records themselves. The dashboard, the weekly
 * report and the opportunity detail all read this, so flipping one record to
 * "sent" moves every view at once instead of leaving three literals to update
 * by hand.
 */
export function outreachStats(): {
  drafted: number;
  sent: number;
  responses: number;
} {
  return {
    // Every record was drafted at some point, including ones since sent —
    // this is a funnel total, not a count of things still sitting in draft.
    drafted: outreach.length,
    sent: outreach.filter((o) => REACHED_RECIPIENT.includes(o.status)).length,
    responses: outreach.filter((o) => o.status === "replied").length,
  };
}
