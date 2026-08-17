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
  /**
   * FK to VetLead.id when the draft targets a veterinary practice. Vet leads
   * live on their own board, but every draft still hangs off an opportunity so
   * the funnel counts stay whole — the vet drafts all point at OPP-2026-044,
   * the programme record, and carry this to say which practice they are for.
   */
  vetLeadId?: string;
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
  {
    id: "OUT-2026-006",
    opportunityId: "OPP-2026-016",
    channel: "call",
    subject:
      "Pre-solicitation call — VDSS Statewide Courier Services (OGS-27-005)",
    body: `CALL SCRIPT — Pedro Andrade, Virginia Department of Social Services
(804) 726-7184 · pedro.andrade@dss.virginia.gov

WHY THIS CALL, AND WHY NOW
OGS-27-005 is posted as a Future Procurement with an estimated issue date of
August 1, 2026. That is the whole point of calling: once the solicitation drops,
the requirement is fixed and buyers stop taking shaping questions. Right now it
is still legitimate to introduce the company and ask how the work is structured.
This is not a bid, and nothing in this call commits CSL to anything.

OPENING
"Good morning — my name is Darren Lewis, I'm the managing member of Capital
Solutions & Logistics. We're a Virginia SWaM-certified courier company based in
the Richmond area. I saw the Future Procurement notice for statewide courier
services, OGS-27-005, and I wanted to introduce us before the solicitation
issues and ask a couple of questions about how it's being structured."

THE QUESTIONS — ask these in order, and write the answers down
1. Will the solicitation be awarded statewide to a single vendor, or split into
   regions or lots? (This is the single most important question. One van cannot
   serve the whole Commonwealth — a regional lot is CSL's path in.)
2. Is a SWaM set-aside or a SWaM evaluation preference being applied?
3. Is there an incumbent, and is this a renewal or a new requirement?
4. Roughly what volume and which locations — is it inter-office document
   courier between local DSS offices, or something broader?
5. What is the anticipated contract term, and is a pre-bid conference planned?
6. How should a vendor make sure it is notified the moment it posts — is the
   eVA commodity code enough, or is there a bidders list?
7. Is there anything about the current arrangement that isn't working well?

WHAT NOT TO SAY
- Do NOT claim SDVOSB status. The certification is still in progress.
- Do NOT claim active MC or DMV for-hire authority. Also in progress.
- Do NOT overstate fleet size. CSL runs one vehicle today. If asked directly,
  answer honestly and pivot to what that actually buys the Commonwealth:
  a dedicated local operator, an owner who answers the phone, and no volume
  routed through an out-of-state hub. Small is a reason to scope the award to a
  region — it is not a reason to be dishonest.

CLOSE
"That's very helpful — thank you. Could I send you our capability statement so
you have it on file? And if a bidders list exists, I'd appreciate being added."

IMMEDIATELY AFTER
Email the capability statement the same day, referencing OGS-27-005 and the
call. Log the answers to the seven questions in the portal so the bid decision
is made on facts rather than assumptions.`,
    status: "draft",
    draftedISO: "2026-07-28",
    contactName: "Pedro Andrade",
    contactRole: "Buyer of record, Virginia Department of Social Services",
    contactEmail: "pedro.andrade@dss.virginia.gov",
    contactPhone: "(804) 726-7184",
    documentId: "vdss-presolicitation-packet",
    notes:
      "TIME-CRITICAL: the estimated issue date is 2026-08-01. The value of this contact is entirely in the pre-solicitation window — after it issues, the shaping opportunity is gone. Contact details are published on the eVA Future Procurement notice.",
  },
  {
    id: "OUT-2026-007",
    opportunityId: "OPP-2026-017",
    channel: "email",
    subject:
      "Biopsy transport for West Creek Endoscopy — a local courier built for chain of custody",
    body: `Hello,

I'm Darren Lewis, Managing Member of Capital Solutions & Logistics, a medical courier company based in the Richmond area.

I'm writing specifically because of your endoscopy center. Scope procedures generate biopsy specimens on a predictable daily schedule, and that is the kind of work we are built around — scheduled routes rather than on-demand calls, with chain-of-custody documentation on every specimen and electronic proof of delivery timestamped end to end.

Our drivers are HIPAA and bloodborne-pathogen trained, and we hold DOT hazardous-materials certification. We are also a Virginia-certified SWaM small and minority-owned business, which matters to some of the health systems your pathology partners work with.

What I would suggest is not a contract but a trial: one week of biopsy transport from the West Creek Endoscopy Center at no charge, so you can see the documentation and the turnaround before anything changes. If it works, we talk about the other sites. If it doesn't, you've lost nothing.

Would a short call this week or next make sense? Our capability statement is attached.

Darren Lewis
Managing Member & Director of Operations
Capital Solutions & Logistics
(757) 453-3831 | Info@trustcsl.com | trustcsl.com`,
    status: "draft",
    draftedISO: "2026-07-28",
    contactRole:
      "Practice Administrator or COO — main office, 169 Wadsworth Dr, N. Chesterfield",
    contactPhone: "(804) 330-4021",
    notes:
      "Highest-scoring new commercial lead from the W2 sweep (fit 88). Physician-owned and independent, so the practice chooses its own vendors. Lead with the free trial — a scoped, reversible ask converts far better than a contract pitch.",
  },
  {
    id: "OUT-2026-008",
    opportunityId: "OPP-2026-018",
    channel: "email",
    subject:
      "One daily loop for Virginia Urology — pathology, pharmacy and the surgery center",
    body: `Hello,

I'm Darren Lewis, Managing Member of Capital Solutions & Logistics, a Richmond-area medical courier company.

Most practices we work with hand us one job. Virginia Urology looks like three: pathology specimens, deliveries out of your dispensing pharmacy, and supply movement between the Stony Point surgery center and the interventional radiology center in Goochland.

That combination is worth a conversation, because those stops consolidate. Run separately they are three vendors and three invoices. Run as one scheduled daily loop across Stony Point, Reynolds Crossing, Hanover, the Far West End and Prince George, they are one route — which is usually both cheaper and more reliable than what a practice is paying today across multiple providers.

We are HIPAA and bloodborne-pathogen trained, DOT hazmat certified, and provide chain-of-custody documentation with electronic proof of delivery on every stop. We are also a Virginia-certified SWaM small and minority-owned business.

If you can tell me roughly what moves between your sites on a normal day, I can put together a specific proposal for a consolidated route rather than a generic quote.

Our capability statement is attached.

Darren Lewis
Managing Member & Director of Operations
Capital Solutions & Logistics
(757) 453-3831 | Info@trustcsl.com | trustcsl.com`,
    status: "draft",
    draftedISO: "2026-07-28",
    contactRole:
      "Practice or Operations Administrator — Stony Point HQ, 9101 Stony Point Dr, Richmond",
    notes:
      "No public phone was confirmed for practice administration in the W2 sweep — look it up before sending rather than guessing. Also confirm the group is still independently physician-owned before leaning on the 'we work with independents' angle; national PE roll-ups have been active in urology.",
  },
  {
    id: "OUT-2026-009",
    opportunityId: "OPP-2026-019",
    channel: "email",
    subject: "Guaranteed-window specimen runs on Mohs surgery days",
    body: `Hello,

I'm Darren Lewis, Managing Member of Capital Solutions & Logistics, a medical courier company based in the Richmond area.

I'm reaching out about the Mohs Surgery Center on Midlothian Turnpike. Mohs is staged — tissue comes out, it gets read, and the surgeon cuts again while the patient waits — so specimen movement on surgery days is time-critical in a way most courier work simply isn't.

That is the work we would want. Not a general per-stop arrangement, but guaranteed pickup windows on your surgery days, priced per run, with electronic proof of delivery so there is a timestamped record for every specimen. Our drivers are HIPAA and bloodborne-pathogen trained and DOT hazmat certified.

We are local and we are small, which in this specific case is the point: you would be dealing with the owner, and a schedule change would be a phone call rather than a ticket.

Your Colonial Heights office also sits at the southern edge of where a lot of Richmond couriers stop going. We do go there.

Could we set up a short call on a non-surgery day? Our capability statement is attached.

Darren Lewis
Managing Member & Director of Operations
Capital Solutions & Logistics
(757) 453-3831 | Info@trustcsl.com | trustcsl.com`,
    status: "draft",
    draftedISO: "2026-07-28",
    contactRole: "Practice Manager — Mohs Surgery Center, 10800 Midlothian Tpke, Ste 310",
    contactPhone: "(804) 939-6191",
    notes:
      "Call the Mohs Center direct line on a NON-surgery day; the center runs Monday–Thursday and staff are unavailable mid-procedure. STAT work like this is priced per run, not per stop — do not let it be quoted as ordinary courier volume.",
  },
  {
    id: "OUT-2026-010",
    opportunityId: "OPP-2026-020",
    channel: "form",
    subject:
      "Owens & Minor supplier diversity registration — plus the certification question that decides everything",
    body: `PURPOSE
Register CSL in the Owens & Minor supplier diversity programme, and get a
definitive answer to one question that shapes CSL's whole certification
roadmap.

WHY OWENS & MINOR
It is a Fortune 500 medical-surgical distributor headquartered at 9120 Lockwood
Blvd, Mechanicsville — roughly twenty minutes from CSL's base — and it has been
expanding into last-mile healthcare logistics, which is adjacent to what CSL
already does. It is the largest healthcare logistics buyer physically inside
CSL's operating radius, and it has a formal supplier-diversity front door
rather than a cold sales cycle.

THE PROCESS, AS PUBLISHED
Three steps: registration, then qualification (a profile demonstrating
compliance), then approval through a competitive RFQ. Registration alone does
not win work — it makes CSL visible when an RFQ is scoped.

THE QUESTION THAT MATTERS MOST
Owens & Minor's published criteria reference third-party diversity
certification — specifically NMSDC and SBA programmes. Virginia SWaM is a
STATE certification and may not satisfy that on its own.

Ask, in writing, and get it in writing:
"Does Owens & Minor accept Virginia SWaM Small and Minority-Owned certification
for supplier diversity qualification, or is NMSDC, WBENC or SBA 8(a)
certification required?"

If the answer is that NMSDC is required, that is not a dead end — it is a
finding. It means CSL needs a second certification track alongside SWaM, and it
is far better to learn that now than after months of assuming SWaM was enough.
NMSDC certification runs through the Virginia Minority Supplier Development
Council and takes time, so the answer changes the sequencing of the whole
compliance roadmap.

WHAT CSL SUBMITS
- Legal name, address, EIN and UEI — see the Capability Statement for the
  fields still marked [FILL IN]
- NAICS 492110 (couriers) and 485991 (special needs transportation)
- Virginia SWaM designation certificate (attach the official PDF)
- Capability statement
- Insurance certificates: commercial auto, general liability, cargo
- Service description: HIPAA-compliant medical and pharmaceutical courier,
  lab specimen transport with chain of custody, scheduled routes and STAT runs,
  Greater Richmond, 25-mile radius

DO NOT CLAIM
SDVOSB status or active MC authority. Both are still in progress. A
diversity-programme application is exactly the wrong place to overstate a
credential — it is the one audience that verifies.

AFTER SUBMITTING
Record the date, the confirmation reference and the certification answer in the
portal. If no acknowledgement arrives within two weeks, call procurement
directly rather than resubmitting the form.`,
    status: "draft",
    draftedISO: "2026-07-28",
    contactRole:
      "Supplier Diversity department, Owens & Minor — 9120 Lockwood Blvd, Mechanicsville, VA 23116",
    documentId: "owens-minor-registration-sheet",
    notes:
      "No direct supplier-diversity contact or self-service portal was published as of the 2026-07-28 sweep — the site directs to a general contact form. Submit the form AND call, because the SWaM-vs-NMSDC answer is worth more than the registration itself.",
  },
  // ───────────────────── Run 3 — 2026-08-10 ─────────────────────
  // Only THREE drafts were written this run, deliberately. Ten drafts from
  // runs 1 and 2 are still sitting unsent, so writing fourteen more — one per
  // new opportunity — would have inflated the "drafted" number while making
  // the real constraint worse. These three are the highest-leverage calls on
  // the board: the best-fit commercial lead found in three runs, the lane CSL
  // can serve today with no new equipment, and the buyer who controls a
  // recurring statewide contract.
  {
    id: "OUT-2026-011",
    opportunityId: "OPP-2026-030",
    channel: "call",
    subject:
      "Call script — Virginia Physicians Core Lab, specimen movement from the ten satellite sites",
    body: `CALL SCRIPT — VPI Core Lab, (804) 836-1136
Ask for: the laboratory manager. Do NOT start at the practice main line.

OPENING
"Good morning — my name is Darren Lewis, I'm with Capital Solutions & Logistics here in Richmond. We're a medical courier company; specimen transport and pharmacy delivery is all we do. I'm calling the lab directly rather than the front office because my question is really an operations question. Do you have two minutes?"

THE ONE QUESTION THAT MATTERS
"I saw that the Core Lab in Glen Allen runs the testing for all of the Virginia Physicians divisions, and that there are ten sites drawing into it. How do the specimens actually get from those ten offices to Cox Road today?"

Then stop talking and listen. The three answers you may hear:

1. "Our medical assistants or the office staff drive them over."
   -> This is the opening. Respond: "That's really common, and it's usually the thing that quietly costs the most — you're paying clinical staff to drive, the specimens aren't under a documented chain of custody, and if somebody calls out the run doesn't happen. What we'd do is take that off your staff entirely: a fixed twice-a-day loop, midday and end of day, every specimen scanned at pickup and at drop with an electronic proof of delivery you can pull up if anyone ever audits a result."

2. "We use a courier already."
   -> "Understood. Are they covering all ten sites, or just some of them?" Split coverage is very common. Offer to price the sites the incumbent doesn't cover, and offer STAT backup for the ones they do.

3. "The reference lab's courier picks up."
   -> "That covers your send-outs. What I'm asking about is the other direction — the specimens coming INTO your own lab from your own offices. Does their courier handle that leg too?" Usually it does not.

WHAT TO OFFER
- A scoped trial, not a contract: the four Midlothian sites for one week, priced per stop, no commitment.
- Twice daily: midday and end of day.
- HIPAA-trained driver, documented chain of custody, electronic proof of delivery on every specimen.
- Local, Richmond-based, SWaM Small and Minority-Owned certified.

DO NOT SAY
- Do not claim MC operating authority or SDVOSB status. Both are still pending.
- Do not quote a monthly price on the first call. Price per stop after you know the volume and the window.

CLOSE
"Can I send you a one-page outline of what that loop would look like, and would it make sense to do the four Midlothian sites for a week so you can see the documentation before anyone signs anything?"

Get: name, title, direct number, email.`,
    status: "draft",
    draftedISO: "2026-08-10",
    contactRole: "Laboratory Manager, VPI Core Lab — 4900 Cox Road, Suite 180, Glen Allen, VA 23060",
    contactPhone: "(804) 836-1136",
    notes:
      "No named contact — VPI does not publish lab staff names, and inventing one would be worse than asking for the role. The Core Lab number is verified from vaphysicians.com/laboratory-services. This is the highest-fit lead the engine has produced in three runs: the practice owns its own lab, so the courier requirement is structural rather than discretionary.",
  },
  {
    id: "OUT-2026-012",
    opportunityId: "OPP-2026-033",
    channel: "email",
    subject: "STAT and cycle-fill coverage for your Richmond-area facility routes",
    body: `Hello,

I'm Darren Lewis, Managing Member of Capital Solutions & Logistics, a medical and pharmaceutical courier based in the Richmond area. We're about twenty minutes south of your Ashland pharmacy.

I'm writing about driver coverage — specifically the runs that don't fit the schedule. Cycle fill is predictable and most long-term care pharmacies have it handled. What tends to break is everything around it: a new admission at 4pm, a changed order, a facility that needs a dose tonight and doesn't have it. Those runs are where an in-house driver schedule either falls over or turns into overtime.

That is the work we'd like to cover for you.

What we bring:
- HIPAA and OSHA trained drivers, and documented chain of custody on every transfer — including signature capture and electronic proof of delivery to the receiving facility, not just a bag handed to whoever is at the desk.
- Ambient and cooler-controlled handling appropriate to LTC dispensing.
- Richmond-metro coverage as our core operating area, so we are not routing your STAT run behind somebody else's parcel route.
- A local, small, certified business — CSL holds Virginia SWaM Small and Minority-Owned certification.

We are deliberately not pitching you the whole cycle-fill route on a first email. The sensible way to start is that we cover STAT and after-hours runs for thirty days, you see the delivery documentation, and we talk about the recurring route only if that goes well.

Would it be worth fifteen minutes with your pharmacy manager or director of operations to find out whether that fits?

Thank you for your time.

Darren A. Lewis
Managing Member, Capital Solutions & Logistics
Info@trustcsl.com | (757) 453-3831`,
    status: "draft",
    draftedISO: "2026-08-10",
    contactRole:
      "Pharmacy Manager / Director of Operations, Remedi SeniorCare — 10448 Lakeridge Pkwy, Ashland, VA 23005",
    contactPhone: "(804) 550-4856",
    notes:
      "Send this, then call two days later — LTC pharmacy managers live on the phone, not in the inbox. No named contact was published; the role is used instead. This is the best CAPABILITY match on the board: ambient and small-cooler only, so CSL can serve it fully with the van it owns today, no validated cold chain required.",
  },
  {
    id: "OUT-2026-013",
    opportunityId: "OPP-2026-035",
    channel: "call",
    subject:
      "Call script — VDOT buyer Kimberly Palmer, IFB161013 Courier Services cycle and set-aside history",
    body: `CALL SCRIPT — Kimberly Palmer, VDOT Procurement
(804) 729-6317 | kimberly.palmer@vdot.virginia.gov

WHY THIS CALL: VDOT's statewide courier IFB (IFB161013 / eVA IFB-122257) closed 7/6/2026 and a Notice of Intent to Award was posted 7/15/2026. CSL missed the window — it opened before we were watching. The point of this call is NOT to protest or to bid. It is to make sure the next cycle is on the calendar a year early, and to find out who is about to hold the contract so we can approach them as a Richmond-area subcontractor.

OPENING
"Good morning Ms. Palmer, my name is Darren Lewis with Capital Solutions & Logistics — we're a Richmond-based medical courier and a certified Virginia SWaM small business. I'm calling about IFB161013, the statewide courier services solicitation that closed in July. I know it's already at intent to award, so I'm not calling about that bid — I'm calling so we're ready for the next one. Do you have a few minutes?"

THE FOUR QUESTIONS
1. "What's the term of the contract that's about to be awarded, and how many renewal options does it carry?" (This tells us exactly when to be ready.)
2. "The Notice of Intent to Award is posted — could you tell me who the intended awardee is?" (It is public information; only the download is behind a captcha.)
3. "Has this requirement ever been divided by district rather than bid statewide? We're a single-vehicle operator covering the Richmond District, so a district lot is the version we could actually perform."
4. "Was a small business set-aside considered this cycle? I ask because the 2014 cycle — IFB 151646-1 — was set aside for small business, and we're SWaM certified."

THEN
"Last thing — could you confirm which NIGP commodity code this solicitation is issued under, so I can make sure our eVA profile is registered against it and we're auto-notified next time?"

TONE
Respectful, brief, and explicitly not a complaint. Buyers remember the vendor who called to prepare for next year instead of to argue about last month.

DO NOT
- Do not claim MC operating authority — it is still pending.
- Do not suggest the award was improper. It was not; we simply were not watching yet.

AFTER THE CALL
Once the awardee is named, add them to the board as a subcontract target and approach them the same way as the Richmond VAMC prime: local capacity, already here, already credentialed.`,
    status: "draft",
    draftedISO: "2026-08-10",
    contactName: "Kimberly Palmer",
    contactRole: "Buyer, Virginia Department of Transportation",
    contactEmail: "kimberly.palmer@vdot.virginia.gov",
    contactPhone: "(804) 729-6317",
    notes:
      "Contact verified directly from the eVA solicitation record for IFB-122257 on 2026-08-10. The intended awardee could not be identified from any public source — the Notice of Intent to Award PDF on eVA is captcha-gated and was deliberately not bypassed — so asking the buyer is both the fastest and the only clean route.",
  },
  /* ───────────────────── Run 4 — 2026-08-17 · veterinary ────────────────
     Four drafts for the new niche. Note the channel: three of the four are
     CALL scripts, not emails. Veterinary practices answer their phones — a
     hospital that runs a 24-hour emergency service has to — and an email to
     info@ at a busy ER is read by whoever is least busy. The one email here
     goes to the group where a written record helps.                        */
  {
    id: "OUT-2026-014",
    opportunityId: "OPP-2026-044",
    vetLeadId: "VET-2026-003",
    channel: "call",
    subject:
      "Call script — Veterinary Referral & Critical Care, Manakin-Sabot (804) 784-8722",
    body: `ASK FOR: the hospital administrator or the practice owner. Not the front desk, and not "whoever handles vendors" — this hospital has been privately owned since 1997, so the decision-maker is on site. If they ask why, say you have a question about how referrals reach them, which is true.

OPEN WITH THE QUESTION, NOT THE PITCH:

"Morning — my name's Darren Lewis, I run Capital Solutions & Logistics here in Richmond. I've got one question and I'll be quick. Your internal medicine and surgery are referral-only, so when a general practice sends you a case, how do their records, films and any samples actually get here? Is somebody driving them over?"

THEN LISTEN. Do not pitch over the answer. What you are listening for:
  - "The owner brings them" → the referring practice is offloading the problem onto the client, and things arrive late or not at all.
  - "One of our techs runs out" → clinical staff are driving. That is the sale.
  - "We fax / email it" → fine for records, but ask what happens with imaging media, samples and anything physical.

SECOND QUESTION, ALWAYS ASK IT:

"And you're closed Sundays — what happens to anything that needs to move over the weekend? Does it just wait for Monday?"

WHAT CSL IS OFFERING (only once they have described a gap):

"We're a Richmond medical courier — we run specimen and pharmacy routes across the metro every weekday. What I think is worth pricing for you isn't your reference lab work, because I know IDEXX and Antech already collect that. It's the pieces nobody covers: transfers in from referring practices, anything that has to move on a Sunday, and controlled substances, where we document chain of custody on every leg and you get electronic proof of delivery with a signature and a timestamp."

CREDENTIALS, IF ASKED — AND ONLY WHAT IS TRUE:
  - Virginia SWaM certified: Small Business and Minority-Owned Business.
  - Commercial auto liability plus cargo coverage underwritten through Lloyd's of London.
  - Documented chain of custody and electronic proof of delivery on every run.
  - Standard routes Monday to Friday, 7:00am to 7:00pm, with STAT and on-demand available 24/7.
  - Do NOT claim MC operating authority or SDVOSB status. Neither is in place.

CLOSE:

"Can I put together a price on a two-week trial for the one lane that's giving you the most trouble? No commitment — if it doesn't help, we stop."

IF THEY SAY THEY HAVE NO NEED: ask who else in the building might, ask whether they would want a number for after-hours STAT work, and get a name. A "no" that produces a name is not a wasted call.`,
    status: "draft",
    draftedISO: "2026-08-17",
    contactRole:
      "Hospital administrator or practice owner, Veterinary Referral & Critical Care (privately owned since 1997)",
    contactPhone: "(804) 784-8722",
    notes:
      "No named contact yet — VRCC does not publish its administrator's name, and a fabricated one would be worse than none. Get the name on this call and it goes in the record for next time. This is the recommended FIRST call of the vet run: private ownership means the person who can approve a courier arrangement is reachable, which is not true at BluePearl or UrgentVet.",
  },
  {
    id: "OUT-2026-015",
    opportunityId: "OPP-2026-044",
    vetLeadId: "VET-2026-001",
    channel: "email",
    subject:
      "Richmond courier support between your Short Pump and Midlothian hospitals",
    body: `Hello,

I'm Darren Lewis, Managing Member of Capital Solutions & Logistics, a medical courier company based here in the Richmond area. We run specimen and pharmacy routes across the metro every weekday.

I'm writing because Virginia Veterinary Centers runs three hospitals — Short Pump, Midlothian and Fredericksburg — and in our experience the movement BETWEEN sites in a group like yours is the part that never quite has an owner. It ends up being a technician in their own car, or it waits until somebody happens to be driving that way.

To be direct about what I am not proposing: I know your reference lab work is already collected under your lab contract, and I'm not trying to displace that. What we would price for you is the work that falls outside it —

  • Movement between Short Pump, Midlothian and Fredericksburg on a scheduled run
  • STAT and after-hours transport, including blood products between hospitals
  • Records, imaging media and samples following a referred patient in from a general practice
  • Controlled substances between sites, with documented chain of custody on every leg

Every run gives you electronic proof of delivery — signature, timestamp, and a custody record you can hand to an inspector.

A few details that may matter:

  • Virginia SWaM certified — Small Business and Minority-Owned Business
  • Commercial auto liability plus cargo coverage underwritten through Lloyd's of London
  • Standard routes Monday–Friday, 7:00am–7:00pm; STAT and on-demand available 24/7
  • Based in the Richmond metro — Short Pump and Midlothian are both inside our daily service area

If it would be useful, I would rather start small than pitch big: give us the one lane that causes the most trouble and let us price a two-week trial on it.

Who is the right person to talk to about this — hospital administrator, or does the group handle it centrally?

Thank you for your time.

Darren Lewis
Managing Member & Director of Operations
Capital Solutions & Logistics
(757) 453-3831 | Info@trustcsl.com | trustcsl.com`,
    status: "draft",
    draftedISO: "2026-08-17",
    contactRole:
      "Hospital administrator, Virginia Veterinary Centers (covers Short Pump and Midlothian)",
    contactPhone: "(804) 353-9000",
    notes:
      "ONE approach for the whole group — do not send this separately to Short Pump and Midlothian. If no email address can be found on the site, call (804) 353-9000, ask for the hospital administrator, and read the second and third paragraphs aloud; they work as a script.",
  },
  {
    id: "OUT-2026-016",
    opportunityId: "OPP-2026-044",
    vetLeadId: "VET-2026-004",
    channel: "email",
    subject: "Courier support for Partner Veterinary — Richmond to Frederick",
    body: `Hello,

I'm Darren Lewis, Managing Member of Capital Solutions & Logistics, a Richmond-based medical courier company.

I noticed that of your two hospitals, the Richmond location is the one carrying critical care. That asymmetry is usually where a logistics problem lives: anything the Frederick site cannot handle has a reason to move, and anything a specialist here needs has a reason to come back.

I am not writing about routine lab pickup — I know that is bundled with your reference lab. What we would price is:

  • Scheduled or on-call movement between your Richmond and Frederick hospitals
  • STAT runs and blood products between Richmond emergency hospitals
  • Records, imaging media and samples following a referred or transferred patient
  • Controlled substances between sites, with documented chain of custody

Every run comes with electronic proof of delivery — signature, timestamp and a custody record.

About us: Virginia SWaM certified (Small Business and Minority-Owned Business), commercial auto liability plus cargo coverage underwritten through Lloyd's of London, standard routes Monday–Friday 7:00am–7:00pm with STAT and on-demand available 24/7. We are based in the Richmond metro, so your Three Chopt Road hospital is inside our daily service area.

If there is one lane that is currently a headache, I would rather price that than send a capability statement nobody reads. Happy to do a two-week trial on it.

Who should I be speaking with?

Darren Lewis
Managing Member & Director of Operations
Capital Solutions & Logistics
(757) 453-3831 | Info@trustcsl.com | trustcsl.com`,
    status: "draft",
    draftedISO: "2026-08-17",
    contactRole:
      "Hospital administrator or practice manager, Partner Veterinary Emergency & Specialty Center",
    contactPhone: "(804) 206-9122",
    notes:
      "Address check before sending: the Richmond Animal League referral list gives Partner as 6506 W Broad St, but Partner's own site says 1616 Three Chopt Road, Henrico. This draft uses Three Chopt. Confirm on the call.",
  },
  {
    id: "OUT-2026-017",
    opportunityId: "OPP-2026-044",
    vetLeadId: "VET-2026-012",
    channel: "call",
    subject:
      "Call script — Wellesley Animal Hospital, the after-hours handoff (804) 364-7030",
    body: `WHY THIS CALL: Wellesley closes at 6:00pm weekdays and noon on Saturday, and their own website says they refer after-hours cases to THREE different 24-hour emergency hospitals. That means their patients' history and imaging have to reach three different destinations, at the worst possible time, and nobody owns that. This is the clearest example of the after-hours transfer lane in the metro — which is why it is worth calling a single-site general practice at all.

ASK FOR: the practice manager.

OPEN:

"Hi — Darren Lewis, Capital Solutions & Logistics, we're a medical courier here in Richmond. Quick question about your after-hours process: your site says you refer emergencies out to three different 24-hour hospitals. When that happens, how does the patient's history and any imaging get to whichever one the owner picked?"

LISTEN FOR:
  - "We email it" → then ask about imaging media, and about anything physical.
  - "The owner takes it" → that is a client-experience problem as much as a logistics one, and worth naming gently.
  - "We call them" → ask what happens when nobody picks up at 9pm.

THE OFFER:

"What we do for practices in your position is cover the handoff — we can run records, imaging media or samples from you to whichever emergency hospital took the case, and back again the next morning, with a signature and timestamp on both ends. It's usually cheaper than it sounds, because we're already running that side of town."

BE HONEST ABOUT SCALE: Wellesley is a single-site general practice, so this is a small account on its own. Say so if it comes up — "this probably isn't a daily route for you, and I'd rather price it honestly than oversell it." The value here is partly the relationship: a general practice that trusts CSL refers CSL to the emergency hospital it works with, and those are the accounts that matter.

DO NOT: pitch daily lab pickup. Their reference lab already collects.

CLOSE: "Can I send you a number to keep by the phone for the nights it matters?"`,
    status: "draft",
    draftedISO: "2026-08-17",
    contactRole: "Practice manager, Wellesley Animal Hospital",
    contactPhone: "(804) 364-7030",
    notes:
      "Lowest revenue of the four W4 drafts and it is written to say so out loud. Kept in the run because it is the cleanest illustration of the after-hours lane, and because general practices are how a courier gets referred into the emergency hospitals that are worth real money.",
  },
];

/** Every draft written for one opportunity, oldest first. */
export function outreachForOpportunity(opportunityId: string): OutreachRecord[] {
  return outreach
    .filter((o) => o.opportunityId === opportunityId)
    .sort((a, b) => a.draftedISO.localeCompare(b.draftedISO));
}

/** Every draft written for one veterinary lead, oldest first. */
export function outreachForVetLead(vetLeadId: string): OutreachRecord[] {
  return outreach
    .filter((o) => o.vetLeadId === vetLeadId)
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
