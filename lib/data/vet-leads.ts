/**
 * lib/data/vet-leads.ts
 * ---------------------------------------------------------------------------
 * LIVE DATA — the veterinary lead run.
 *
 * A SEPARATE BOARD ON PURPOSE. Darren named Richmond-area veterinary practices
 * as a target niche, and these leads do not behave like the opportunities on
 * the main board: there is no solicitation, no deadline, no fit-versus-set-aside
 * calculation. They are businesses to call. Mixing them into a table built
 * around due dates and NAICS codes would have made both harder to read, so they
 * get their own page and their own shape.
 *
 * THE HONEST FRAME, WHICH MATTERS MORE THAN THE LIST
 * ---------------------------------------------------
 * Routine specimen pickup to a reference lab is NOT the opening here. IDEXX and
 * Antech both operate their own courier fleets and fold collection into the
 * practice's lab contract — IDEXX even publishes online courier scheduling. A
 * pitch that assumes a practice is looking for someone to run daily send-outs
 * will be corrected on the first call, and correctly so.
 *
 * The lanes that are genuinely uncovered in this metro:
 *   1. Inter-hospital movement inside multi-site groups (VVC runs three sites,
 *      UrgentVet three, Partner two states).
 *   2. STAT blood products and cross-match between emergency hubs.
 *   3. After-hours transfer — a general practice closes at 6pm, its patient
 *      goes to an ER across town, and the records, imaging media and any
 *      samples have to follow.
 *   4. Controlled-substance movement between sites, where CSL's chain-of-
 *      custody discipline is a real differentiator rather than a talking point.
 *   5. Cremation and aftercare transport.
 *
 * WHAT IS AND IS NOT VERIFIED
 * ---------------------------
 * Every address and phone number below was read off the practice's own website
 * or a named directory, and each lead cites the URL. Where the two disagreed,
 * the practice's own site won and the conflict is recorded in `caution` — this
 * run found two stale addresses on a widely-shared referral list, and calling
 * them would have wasted Darren's morning.
 *
 * Run 1 of the vet sweep: 2026-08-17 (15 leads).
 * Run 2 of the vet sweep: 2026-08-25 (10 new leads; four V1 cautions resolved).
 * Run 3 of the vet sweep: 2026-09-30, labelled "9/30" in the UI (10 new leads —
 *   the first multi-site independent general practice, the first equine
 *   hospitals, the zoo and an in-home end-of-life vet; BluePearl's emergency
 *   hours corrected). Thirty-five leads total across three runs.
 * ---------------------------------------------------------------------------
 */

import type { SourceLink } from "./opportunities";

export type VetLeadPriority = "HOT" | "WARM" | "WATCH";

export type VetLeadCategory =
  | "ER & Specialty Hub"
  | "Urgent Care"
  | "General Practice"
  | "Nonprofit / High-Volume";

export interface VetLead {
  id: string;
  name: string;
  category: VetLeadCategory;
  priority: VetLeadPriority;
  /** 0–100, scored on the same basis as the main board's fit score. */
  fitScore: number;

  /** Street address as published by the practice. */
  address: string;
  city: string;
  state: string;
  zip: string;
  /** Display phone, e.g. "(804) 784-8722". Absent when not published. */
  phone?: string;
  /** Digits only, so a phone can dial it straight from the card. */
  tel?: string;
  website?: string;
  hours?: string;

  /** Sites this operator runs inside the Richmond metro, when more than one. */
  siteCount?: number;
  /** Every metro site, for operators with more than one. */
  sites?: { label: string; address: string; phone?: string; tel?: string }[];

  /** What has actually been verified about their diagnostics and setup. */
  capabilities: string[];
  /** The one-line reason to call, written to be said out loud. */
  pitch: string;
  /** Open with this, not with the pitch. Discovery beats a cold sell here. */
  openingQuestion: string;
  /** Anything that would embarrass CSL if it were not known before dialling. */
  caution?: string;

  addedISO: string;
  sources: SourceLink[];
}

/** Every vet sweep the engine has run, oldest first. */
export const VET_SWEEPS = [
  { run: 1, label: "V1", iso: "2026-08-17", weekOf: "2026-08-17" },
  { run: 2, label: "V2", iso: "2026-08-25", weekOf: "2026-08-24" },
  // Labelled by date rather than "V3" at Darren's request — weeks were missed
  // between runs, so a date says more than a run number.
  { run: 3, label: "9/30", iso: "2026-09-30", weekOf: "2026-09-28" },
] as const;

export type VetSweep = (typeof VET_SWEEPS)[number];

export const LATEST_VET_RUN_ISO = VET_SWEEPS[VET_SWEEPS.length - 1].iso;

/** Google Maps search link built from a verified address. */
function mapsUrl(name: string, address: string, city: string, state: string, zip: string) {
  const q = encodeURIComponent(`${name} ${address} ${city} ${state} ${zip}`);
  return `https://www.google.com/maps/search/?api=1&query=${q}`;
}

/** Canonical maps link for a lead — derived, never stored, so it cannot drift. */
export function vetLeadMapUrl(l: VetLead): string {
  return mapsUrl(l.name, l.address, l.city, l.state, l.zip);
}

const R = "2026-08-17";
const R2 = "2026-08-25";
const R3 = "2026-09-30";

/** Cited on several leads — the metro's shared referral list. */
const RAL_DIRECTORY: SourceLink = {
  label: "Richmond Animal League — emergency & urgent care clinic list",
  url: "https://www.ral.org/posts/emergency-and-urgent-care-clinics",
  kind: "directory",
  retrievedISO: R,
  note:
    "The referral list Richmond pet owners are handed when their vet is closed. Useful for mapping the network — but two of its addresses are out of date, so every one was re-checked against the practice's own site.",
};

export const vetLeads: VetLead[] = [
  /* ───────────────────────── ER & specialty hubs ───────────────────────── */
  {
    id: "VET-2026-001",
    name: "Virginia Veterinary Centers — Short Pump",
    category: "ER & Specialty Hub",
    priority: "HOT",
    fitScore: 93,
    address: "4300 Greybull Drive",
    city: "Henrico",
    state: "VA",
    zip: "23233",
    phone: "(804) 353-9000",
    tel: "8043539000",
    website: "https://www.virginiaveterinarycenters.com/locations/short-pump",
    hours: "24/7 emergency; specialty by appointment",
    siteCount: 3,
    sites: [
      {
        label: "Short Pump (flagship)",
        address: "4300 Greybull Drive, Henrico, VA 23233",
        phone: "(804) 353-9000",
        tel: "8043539000",
      },
      {
        label: "Midlothian",
        address: "12077 Hull Street Road, Midlothian, VA 23112",
        phone: "(804) 744-9800",
        tel: "8047449800",
      },
      {
        label: "Fredericksburg (outside the 25-mile radius)",
        address: "1301 Central Park Boulevard, Fredericksburg, VA 22401",
        phone: "(540) 372-3470",
        tel: "5403723470",
      },
    ],
    capabilities: [
      "24-hour emergency and critical care with a dedicated ICU",
      "Seven operating suites; 31 emergency exam rooms",
      "Medical AND radiation oncology, neurology and neurosurgery, ophthalmology, internal medicine, dentistry and oral surgery, anesthesiology",
      "CT, MRI, CT cone beam, fluoroscopy, digital radiology, ultrasound",
      "Full in-house laboratory",
      "Isolation suites for infectious disease",
    ],
    pitch:
      "The largest referral hub in the metro and the anchor account for this entire niche. Radiation oncology means scheduled, repeat-visit patients travelling in from other practices; three hospitals in one group means a standing inter-site lane before a single outside client is signed.",
    openingQuestion:
      "When a patient is referred in from a general practice — or moved between your Short Pump, Midlothian and Fredericksburg hospitals — how do the records, imaging media and any samples travel today? Is that a staff member driving?",
    caution:
      "Do NOT open with routine lab pickup. A hospital with a full in-house laboratory and a reference-lab contract already has that covered, and leading with it signals CSL has not done its homework.",
    addedISO: R,
    sources: [
      {
        label: "VVC Short Pump location page",
        url: "https://www.virginiaveterinarycenters.com/locations/short-pump",
        kind: "organization",
        retrievedISO: R,
        note:
          "Source for the Greybull Drive address, the 24/7 emergency status, and the full specialty, imaging and in-house laboratory list.",
      },
      {
        label: "VVC locations index",
        url: "https://www.virginiaveterinarycenters.com/locations",
        kind: "organization",
        retrievedISO: R,
        note:
          "Confirms the group runs exactly three hospitals — Fredericksburg, Midlothian and Short Pump — and gives the phone number for each.",
      },
      RAL_DIRECTORY,
    ],
  },
  {
    id: "VET-2026-002",
    name: "Virginia Veterinary Centers — Midlothian",
    category: "ER & Specialty Hub",
    priority: "HOT",
    fitScore: 90,
    address: "12077 Hull Street Road",
    city: "Midlothian",
    state: "VA",
    zip: "23112",
    phone: "(804) 744-9800",
    tel: "8047449800",
    website: "https://www.virginiaveterinarycenters.com/locations/midlothian",
    hours: "Emergency and urgent care; specialty by appointment",
    capabilities: [
      "Emergency and urgent care",
      "Internal medicine; surgical suite with ventilator",
      "Full in-house laboratory including digital cytology analysis",
      "Digital radiology, endoscopy, colonoscopy, bronchoscopy, ultrasound",
      "10,200 sq ft purpose-built facility, opened July 2024",
    ],
    pitch:
      "The south-side half of the VVC group and the other end of a standing inter-site lane to Short Pump. A facility that opened in 2024 is still forming its vendor habits, which is a materially easier moment to enter than a hospital that has done things the same way for a decade.",
    openingQuestion:
      "How does anything that has to reach Short Pump — a specialist consult sample, an imaging disc, a transferred patient's file — get there now?",
    caution:
      "Same ownership as VET-2026-001, so this is ONE conversation, not two. Calling both hospitals separately with the same pitch looks like a call centre. Ask at Short Pump who covers both.",
    addedISO: R,
    sources: [
      {
        label: "VVC Midlothian location page",
        url: "https://www.virginiaveterinarycenters.com/locations/midlothian",
        kind: "organization",
        retrievedISO: R,
        note:
          "Source for the Hull Street Road address, the July 2024 opening, the 10,200 sq ft figure, and the in-house laboratory with digital cytology.",
      },
      RAL_DIRECTORY,
    ],
  },
  {
    id: "VET-2026-003",
    name: "Veterinary Referral & Critical Care (VRCC)",
    category: "ER & Specialty Hub",
    priority: "HOT",
    fitScore: 91,
    address: "1596 Hockett Road",
    city: "Manakin-Sabot",
    state: "VA",
    zip: "23103",
    phone: "(804) 784-8722",
    tel: "8047848722",
    website: "https://vrccvet.com/",
    hours: "Monday 8:00am through Saturday 6:00pm; closed Sunday",
    capabilities: [
      "Emergency services and critical care",
      "Internal medicine, surgery (orthopaedic, neurological, soft tissue), neurology, canine rehabilitation",
      "On-site CT and MRI, ultrasound, echocardiography, digital radiography, endoscopy, ECG, telemetry",
      "In-house laboratory testing",
      "Referral required for internal medicine and surgery appointments",
    ],
    pitch:
      "Make this the first call of the week. Privately owned and operated since 1997 — the person who can approve a courier arrangement works in the building, which is not true of any corporate hospital on this list. Referral-required specialties mean a constant inbound flow from general practices across the metro.",
    openingQuestion:
      "Your internal medicine and surgery services are referral-only — when a general practice sends you a case, how do their records, films and any samples actually get here? And what happens on a Sunday when you're closed?",
    caution:
      "They close Sunday. That closure is itself the conversation: somebody is covering those cases elsewhere, and whatever has to move on Monday morning is backed up. VERIFIED NEGATIVE (this run): their own About page does not mention a blood bank or transfusion medicine — do not assume VRCC can supply blood products to other hospitals, and do not describe them as 24/7. Hours are Monday 8:00am through Saturday 6:00pm, closed Sunday.",
    addedISO: R,
    sources: [
      {
        label: "VRCC website",
        url: "https://vrccvet.com/",
        kind: "organization",
        retrievedISO: R,
        note:
          "Source for the Hockett Road address, the phone number, the hours, private ownership since 1997, the referral requirement, and the on-site CT / MRI / in-house lab list.",
      },
      RAL_DIRECTORY,
      {
        label: "VRCC — About page",
        url: "https://vrccvet.com/about.html",
        kind: "organization",
        retrievedISO: R2,
        note:
          "Re-verified the Mon-through-Sat hours, and cited for the absence of any blood bank or transfusion service.",
      },
    ],
  },
  {
    id: "VET-2026-004",
    name: "Partner Veterinary Emergency & Specialty Center",
    category: "ER & Specialty Hub",
    priority: "HOT",
    fitScore: 88,
    address: "1616 Three Chopt Road",
    city: "Henrico",
    state: "VA",
    zip: "23233",
    phone: "(804) 206-9122",
    tel: "8042069122",
    website: "https://partnervesc.com/",
    siteCount: 1,
    capabilities: [
      "Emergency and urgent care",
      "Internal medicine, oncology, neurology, surgery, cardiology",
      "Critical care (Richmond location only)",
      "Two-hospital group — Richmond, VA and Frederick, MD (7330 Guilford Drive)",
    ],
    pitch:
      "A growing two-state group whose Richmond hospital carries the only critical care unit of the pair. That asymmetry is the whole pitch: anything the Maryland site cannot handle has a reason to move, and a two-hospital company is small enough to make a decision quickly.",
    openingQuestion:
      "Your Richmond hospital is the one with critical care — does anything move between here and Frederick, and who handles it now?",
    caution:
      "The Richmond Animal League list gives this practice as 6506 W Broad St. Partner's OWN site says 1616 Three Chopt Road, Henrico. Use Three Chopt — the directory is stale.",
    addedISO: R,
    sources: [
      {
        label: "Partner Veterinary website",
        url: "https://partnervesc.com/",
        kind: "organization",
        retrievedISO: R,
        note:
          "Source for the Three Chopt Road address, the phone number, the specialty list, and the two-hospital Richmond / Frederick MD structure.",
      },
      RAL_DIRECTORY,
    ],
  },
  {
    id: "VET-2026-005",
    name: "BluePearl Pet Hospital — Richmond",
    category: "ER & Specialty Hub",
    priority: "WARM",
    fitScore: 72,
    address: "5918 W Broad Street",
    city: "Richmond",
    state: "VA",
    zip: "23230",
    phone: "(804) 716-4700",
    tel: "8047164700",
    website: "https://bluepearlvet.com/hospital/richmond-va/",
    hours:
      "Emergency (per their own site, 30 Sep 2026): Mon 12am–7am & 9am–midnight; Tue 24 hours; Wed 12am–7am & 9am–midnight; Thu & Fri 24 hours; Sat & Sun CLOSED. Specialty by appointment.",
    capabilities: [
      "Emergency and specialty referral",
      "On-site MRI and advanced imaging",
      "Specialists work directly with the referring primary-care veterinarian",
    ],
    pitch:
      "Worth a call, but expect a longer road than the independents — BluePearl is a national chain and vendor decisions rarely sit with the hospital. The genuinely interesting detail is still the hours, and they have changed: emergency is now closed every Saturday and Sunday, with a 7–9am gap on Mondays and Wednesdays. Every weekend case in the west end goes somewhere else, and something has to follow it back on Monday.",
    openingQuestion:
      "When your emergency service is closed at the weekend, where do those cases go — and how do the records and any samples get back here on Monday?",
    caution:
      "Two things. First, procurement is likely national, so ask early who actually approves a local vendor before investing calls. Second: 'Dogwood Veterinary Emergency & Specialty Center' and 'The Oncology Service — Dogwood' operated at THIS SAME address and are now listed as closed. Do not chase Dogwood as a separate business — it is this hospital.",
    addedISO: R,
    sources: [
      {
        label: "BluePearl Richmond hospital page",
        url: "https://bluepearlvet.com/hospital/richmond-va/",
        kind: "organization",
        retrievedISO: R,
        note:
          "Source for the West Broad Street address, phone, the unusual emergency hours, and the on-site MRI.",
      },
      {
        label: "BluePearl Richmond hospital page — re-checked on the 9/30 sweep",
        url: "https://bluepearlvet.com/hospital/richmond-va/",
        kind: "organization",
        retrievedISO: R3,
        note:
          "Re-opened 30 Sep 2026. Same address and phone, but the emergency schedule is DIFFERENT from what V1 recorded: now closed Saturday and Sunday, 24 hours Tue/Thu/Fri, with 7–9am gaps on Mon and Wed. The hours line on this card was corrected from this page.",
      },
      {
        label: "Yelp listing — The Oncology Service / Dogwood, 5918 W Broad St, marked CLOSED",
        url: "https://www.yelp.com/biz/the-oncology-service-dogwood-richmond",
        kind: "directory",
        retrievedISO: R,
        note:
          "The evidence behind the Dogwood caution: same address as BluePearl, listed as closed. Cited so the caution is checkable rather than asserted.",
      },
      RAL_DIRECTORY,
    ],
  },

  /* ────────────────────────────── Urgent care ──────────────────────────── */
  {
    id: "VET-2026-006",
    name: "UrgentVet — Richmond metro (3 clinics)",
    category: "Urgent Care",
    priority: "HOT",
    fitScore: 82,
    address: "14300 Winterview Parkway, Suite 106",
    city: "Midlothian",
    state: "VA",
    zip: "23113",
    phone: "(804) 924-0404",
    tel: "8049240404",
    website: "https://www.urgentvet.com/locations/",
    hours:
      "Mon–Fri 3:00pm–11:00pm; Sat–Sun 10:00am–8:00pm; holidays 12:00pm–8:00pm. NOT open overnight.",
    siteCount: 3,
    sites: [
      {
        label: "Carytown",
        address: "3531 Ellwood Avenue, Richmond, VA 23221",
        phone: "(804) 362-0202",
        tel: "8043620202",
      },
      {
        label: "Short Pump",
        address: "11521 West Broad Street, Richmond, VA 23233",
        phone: "(804) 533-7733",
        tel: "8045337733",
      },
      {
        label: "Midlothian",
        address: "14300 Winterview Parkway, Suite 106, Midlothian, VA 23113",
        phone: "(804) 924-0404",
        tel: "8049240404",
      },
    ],
    capabilities: [
      "After-hours urgent care bridging the gap between general practice and the emergency hospital",
      "Three clinics forming a triangle across the metro — Midlothian, Short Pump, Carytown",
      "Part of a national group of 101 clinics",
    ],
    pitch:
      "Three clinics in one metro is a courier route drawn on a map before anyone has said yes. Urgent care by definition operates when the referral labs and the general practices are shut, which is precisely the window a captive courier network does not cover.",
    openingQuestion:
      "You've got three clinics across the metro — is there anything that regularly needs to move between them, or on to an emergency hospital after you close?",
    caution:
      "Confirmed on their own site this run, so the V1 'directory-sourced' warning is retired. Two live cautions remain. Their own Midlothian page carries an 'American Veterinary Group' careers link — this is a chain, so vendor decisions may sit outside Richmond; the widely-reported Thrive Pet Healthcare ownership is NOT stated on their own site and must not be asserted on a call. And the other two Virginia UrgentVets are in Chesapeake and Newport News, far outside the radius — do not pitch a statewide network.",
    addedISO: R,
    sources: [
      RAL_DIRECTORY,
      {
        label: "UrgentVet locations page",
        url: "https://www.urgentvet.com/locations/",
        kind: "organization",
        retrievedISO: R,
        note:
          "Confirms the company operates 101 clinics nationally and lists Virginia as a served state. The Richmond-area clinics were NOT enumerated in the page the engine read, which is why the addresses here are attributed to the RAL directory instead.",
      },
      {
        label: "UrgentVet — Virginia locations page",
        url: "https://urgentvet.com/locations/virginia/",
        kind: "organization",
        retrievedISO: R2,
        note:
          "Confirms all three Richmond-metro addresses and phone numbers directly from UrgentVet, replacing the directory-sourced values V1 flagged as unverified.",
      },
      {
        label: "UrgentVet Midlothian — clinic page",
        url: "https://urgentvet.com/location/midlothian-va/",
        kind: "organization",
        retrievedISO: R2,
        note:
          "Establishes the hours and, in UrgentVet's own words, that they are 'not open overnight' and that serious cases are 'better treated by a full-service, 24/7 emergency veterinary animal hospital' — which is the after-hours handoff lane stated by the prospect rather than assumed by CSL. Also carries the American Veterinary Group careers link.",
      },
    ],
  },
  {
    id: "VET-2026-007",
    name: "Urgent Paws Veterinary Care",
    category: "Urgent Care",
    priority: "WARM",
    fitScore: 70,
    address: "6645 Lake Harbour Drive",
    city: "Midlothian",
    state: "VA",
    zip: "23112",
    phone: "(804) 280-6611",
    tel: "8042806611",
    capabilities: [
      "Urgent care, listed on the metro's shared referral list",
      "Midlothian — same corridor as VVC Midlothian and UrgentVet Midlothian",
    ],
    pitch:
      "A single-site urgent care in the busiest south-side veterinary corridor. Small enough that the owner answers, and close enough to VVC Midlothian that a transfer lane between them is a five-minute drive.",
    openingQuestion:
      "When a case is beyond urgent care and has to go to an emergency hospital, what travels with the patient and who takes it?",
    caution:
      "Address and phone come from the Richmond Animal League directory only — the engine did not reach an independent site for this practice. Confirm both before relying on them.",
    addedISO: R,
    sources: [RAL_DIRECTORY],
  },
  {
    id: "VET-2026-008",
    name: "BetterPet Veterinary Urgent Care — Mechanicsville",
    category: "Urgent Care",
    priority: "WARM",
    fitScore: 66,
    address: "7138 Mechanicsville Turnpike",
    city: "Mechanicsville",
    state: "VA",
    zip: "23111",
    phone: "(804) 442-2713",
    tel: "8044422713",
    website: "https://www.betterpetuc.com/contact",
    hours:
      "Open nights and weekends, walk-in, no appointment needed. Numeric opening times are NOT published on their own site.",
    capabilities: [
      "Urgent care serving the Hanover / Mechanicsville side of the metro",
      "The north-east corner of the radius, where the ER hubs are furthest away",
    ],
    pitch:
      "Geography is the argument. Mechanicsville is the furthest point in the metro from every 24-hour hub on this list, which makes the drive to an emergency hospital long enough that someone has already thought about how to handle it.",
    openingQuestion:
      "Mechanicsville is a fair drive from any of the 24-hour hospitals — when you refer a case in, does anything have to follow it, and who drives that?",
    caution:
      "Address and phone confirmed on their own site this run, so the V1 directory-sourced warning is retired. Live cautions: they are a nights-and-weekends operation, so a 10am cold call may reach nobody — try late afternoon. Their site does not state hours numerically or name a transfer partner, so do not claim to know where their overnight handoffs go. Single site, small operator. Email info@betterpetuc.com.",
    addedISO: R,
    sources: [
      RAL_DIRECTORY,
      {
        label: "BetterPet Veterinary Urgent Care — contact page",
        url: "https://www.betterpetuc.com/contact",
        kind: "organization",
        retrievedISO: R2,
        note:
          "Confirms 7138 Mechanicsville Turnpike and (804) 442-2713 from the practice itself, and the nights-and-weekends walk-in model.",
      },
    ],
  },

  /* ─────────────────────── Nonprofit / high volume ─────────────────────── */
  {
    id: "VET-2026-009",
    name: "Richmond SPCA — Susan M. Markel Veterinary Hospital",
    category: "Nonprofit / High-Volume",
    priority: "HOT",
    fitScore: 81,
    address: "2519 Hermitage Road",
    city: "Richmond",
    state: "VA",
    zip: "23220",
    phone: "(804) 521-1330",
    tel: "8045211330",
    website:
      "https://richmondspca.org/pet-help/veterinary-services/full-service-hospital/",
    hours: "Monday–Friday 8:00am–12:00pm and 1:00pm–6:00pm; closed weekends",
    siteCount: 2,
    sites: [
      {
        label: "Robins-Starr Humane Center / Susan M. Markel Veterinary Hospital",
        address: "2519 Hermitage Road, Richmond, VA 23220",
        phone: "(804) 521-1330",
        tel: "8045211330",
      },
      {
        label: "Smoky's Spay & Neuter Clinic (Mechanicsville Turnpike cluster)",
        address: "7088 Mechanicsville Turnpike, Mechanicsville, VA 23111",
        phone: "(804) 368-6232",
        tel: "8043686232",
      },
    ],
    capabilities: [
      "High-volume spay and neuter surgery",
      "In-house laboratory and radiology services",
      "Wound care, palliative care, acupuncture, laser therapy, geriatric care",
    ],
    pitch:
      "A high-volume nonprofit hospital runs on predictable daily throughput and a tight budget — the two conditions that make an outsourced route cheaper than paying clinical staff to drive. Nonprofits also care about who they buy from, which is where SWaM certification actually counts for something.",
    openingQuestion:
      "Between Hermitage Road and Smoky's out in Mechanicsville — what actually moves back and forth in a typical week, and who's driving it today?",
    caution:
      "Nonprofit: expect price sensitivity and possibly a request for in-kind or discounted work. Their own site does NOT say that animals or supplies move between the two sites — that is the discovery question, not a finding, and asserting it would be the same mistake as the routine-lab-pickup pitch. Markel's temporarily-reduced Mon–Thu schedule, stated on their site as of 6 April 2026, is still in force, so Friday calls may not land. Smoky's is closed Fri–Sun.",
    addedISO: R,
    sources: [
      {
        label: "Richmond SPCA full-service hospital page",
        url: "https://richmondspca.org/pet-help/veterinary-services/full-service-hospital/",
        kind: "organization",
        retrievedISO: R,
        note:
          "Source for the Hermitage Road address, phone, hours, the in-house laboratory and radiology, and the note about temporary reduced hours.",
      },
      {
        label: "Richmond SPCA — Smoky's Spay & Neuter Clinic page",
        url: "https://richmondspca.org/what-we-do/programs-services/snip/",
        kind: "organization",
        retrievedISO: R2,
        note:
          "Establishes the SECOND SITE that changes this lead's shape: 7088 Mechanicsville Turnpike, (804) 368-6232, Mon–Thu 7:30am–3:30pm, closed Fri–Sun.",
      },
      {
        label: "12 On Your Side — Richmond SPCA adjusts veterinary hospital hours (6 May 2026)",
        url: "https://www.12onyourside.com/2026/05/06/richmond-spca-adjusts-veterinary-hospital-hours-due-staffing-shortage/",
        kind: "news",
        retrievedISO: R3,
        note:
          "Explains the Monday–Thursday schedule: a veterinarian and technician shortage. Also reports the hospital sees about 9,000 patients a year. The SPCA's own page, re-opened 30 Sep 2026, still shows the temporary Mon–Thu schedule.",
      },
    ],
  },
  {
    id: "VET-2026-010",
    name: "Richmond Animal League",
    category: "Nonprofit / High-Volume",
    priority: "WATCH",
    fitScore: 62,
    address: "11401 International Drive",
    city: "Richmond",
    state: "VA",
    zip: "23236",
    website: "https://www.ral.org/posts/emergency-and-urgent-care-clinics",
    capabilities: [
      "High-volume nonprofit spay/neuter and community veterinary services",
      "Publishes the metro's most-shared emergency referral list",
    ],
    pitch:
      "Lower revenue potential than the hospitals, but strategically useful: RAL is the organisation the rest of the metro's practices point clients toward, so a relationship here is a credential in front of everyone else on this list.",
    openingQuestion:
      "Do you move animals or supplies between your clinic and partner shelters or foster homes on any kind of schedule?",
    caution:
      "NO PHONE NUMBER — the page the engine read does not publish one. Look it up on ral.org before calling; do not guess a number.",
    addedISO: R,
    sources: [RAL_DIRECTORY],
  },

  /* ───────────────────────── General practices ─────────────────────────── */
  {
    id: "VET-2026-011",
    name: "West Creek Animal Clinic",
    category: "General Practice",
    priority: "WARM",
    fitScore: 74,
    address: "12491 Patterson Avenue",
    city: "Richmond",
    state: "VA",
    zip: "23238",
    phone: "(804) 784-5758",
    tel: "8047845758",
    website: "https://wcacrva.com/contact/",
    capabilities: [
      "Mobile veterinary visits — they already run a vehicle-based service",
      "Laboratory testing, digital radiographs, ultrasound",
      "Surgery, dental cleaning, behaviour consults, OFA testing",
      "Serves Henrico, Richmond, Manakin-Sabot, North Chesterfield and Goochland",
    ],
    pitch:
      "The most logistics-literate practice on this list. They already run mobile visits, which means they have felt the cost of clinical staff spending their day driving — that is a conversation that starts halfway to yes.",
    openingQuestion:
      "You run mobile visits already — when something has to come back to the clinic mid-round, or go on to a referral hospital, is that the same vehicle doubling back?",
    addedISO: R,
    sources: [
      {
        label: "West Creek Animal Clinic contact page",
        url: "https://wcacrva.com/contact/",
        kind: "organization",
        retrievedISO: R,
        note:
          "Source for the Patterson Avenue address, phone, the mobile-visit service, the lab and imaging capability, and the service-area list.",
      },
    ],
  },
  {
    id: "VET-2026-012",
    name: "Wellesley Animal Hospital",
    category: "General Practice",
    priority: "WARM",
    fitScore: 68,
    address: "3430 Lauderdale Drive",
    city: "Richmond",
    state: "VA",
    zip: "23233",
    phone: "(804) 364-7030",
    tel: "8043647030",
    website: "https://www.wellesleyah.com/services/urgent-care/",
    hours: "Monday–Friday 8:00am–6:00pm; Saturday 9:00am–12:00pm; closed Sunday",
    capabilities: [
      "Blood analysis and x-ray on site",
      "General surgery, fracture repair, dental surgery",
      "Refers after-hours cases to three nearby 24-hour emergency facilities",
    ],
    pitch:
      "The clearest illustration of lane 3 on the whole board. They close at 6pm and hand after-hours cases to three different 24-hour hospitals — which means their patients' records and films have to reach three different destinations, on someone else's time.",
    openingQuestion:
      "You refer after-hours cases out to three different emergency hospitals — when that happens, how does the patient's history and imaging get to whichever one the owner chose?",
    addedISO: R,
    sources: [
      {
        label: "Wellesley Animal Hospital urgent care page",
        url: "https://www.wellesleyah.com/services/urgent-care/",
        kind: "organization",
        retrievedISO: R,
        note:
          "Source for the Lauderdale Drive address, phone, hours, the lab and imaging capability, and the fact that after-hours cases are referred to three nearby 24-hour facilities.",
      },
    ],
  },
  {
    id: "VET-2026-013",
    name: "Bon Air Animal Hospital",
    category: "General Practice",
    priority: "WARM",
    fitScore: 65,
    address: "2749 McRae Road",
    city: "Richmond",
    state: "VA",
    zip: "23235",
    phone: "(804) 320-5991",
    tel: "8043205991",
    website: "https://bonairanimalhospital.com/",
    hours:
      "Monday–Friday 8:00am–7:00pm; Saturday 9:00am–12:00pm; doctor hours Mon–Fri 9:00am–6:00pm",
    capabilities: [
      "Diagnostic testing and imaging",
      "Soft tissue and orthopaedic surgery",
      "Single-site independent practice on the south side",
    ],
    pitch:
      "A long-hours independent on the south side — open until 7pm on weekdays, which is later than most, so their after-hours handoff window is narrow and awkward. Independent means one decision-maker.",
    openingQuestion:
      "You're open until seven — when something needs to reach a referral hospital or a lab after that, what happens to it overnight?",
    caution:
      "Their own site does not detail the specific laboratory or imaging equipment, so do not assume an in-house lab. Ask.",
    addedISO: R,
    sources: [
      {
        label: "Bon Air Animal Hospital website",
        url: "https://bonairanimalhospital.com/",
        kind: "organization",
        retrievedISO: R,
        note:
          "Source for the McRae Road address, phone and hours. The site describes diagnostic testing and imaging in general terms only — the specifics were not published.",
      },
    ],
  },
  {
    id: "VET-2026-014",
    name: "Broad Street Veterinary Hospital",
    category: "General Practice",
    priority: "WATCH",
    fitScore: 60,
    address: "Address not published on the page read",
    city: "Richmond",
    state: "VA",
    zip: "",
    phone: "(804) 353-4491",
    tel: "8043534491",
    website:
      "https://www.broadstreetvet.com/site/veterinary-services-richmond/emergency-vet",
    hours: "Monday–Friday 7:30am–6:00pm; closed weekends",
    capabilities: [
      "Emergency and urgent care during regular hospital hours only",
      "Sees cats and dogs; birds and rodents in serious situations",
      "Opens at 7:30am — earlier than most practices in the metro",
    ],
    pitch:
      "A 7:30am opening is unusual and useful: they are receiving before anyone else, which makes them a natural first stop on an early route. Worth a call once the address is confirmed.",
    openingQuestion:
      "You open at 7:30 — is there anything that needs to arrive before you do, or leave first thing?",
    caution:
      "ADDRESS NOT VERIFIED. The page the engine read gives the phone number and hours but no street address, and nothing was assumed in its place. Confirm the address before scheduling any visit.",
    addedISO: R,
    sources: [
      {
        label: "Broad Street Veterinary Hospital — emergency vet page",
        url: "https://www.broadstreetvet.com/site/veterinary-services-richmond/emergency-vet",
        kind: "organization",
        retrievedISO: R,
        note:
          "Source for the phone number, the hours, and the scope of emergency care. The street address is genuinely absent from this page — hence the caution rather than a guess.",
      },
    ],
  },
  {
    id: "VET-2026-015",
    name: "River Run Animal Hospital",
    category: "General Practice",
    priority: "WATCH",
    fitScore: 58,
    address: "1403 Anderson Highway",
    city: "Powhatan",
    state: "VA",
    zip: "23139",
    phone: "(804) 794-4105",
    tel: "8047944105",
    capabilities: [
      "Urgent care listed on the metro referral list",
      "Powhatan — the western edge of CSL's service radius",
    ],
    pitch:
      "Edge of the radius, so it only pays as an add-on. But it sits on the same road out to VRCC in Manakin-Sabot, which means a Powhatan stop costs almost nothing once that lane exists.",
    openingQuestion:
      "How far do you have to send a case that needs specialty care, and does anything travel separately from the patient?",
    caution:
      "Directory-sourced only, and at the outer edge of the 25-mile radius. Do not price a standalone route here — only fold it into a VRCC run.",
    addedISO: R,
    sources: [RAL_DIRECTORY],
  },

  /* ───────────────────────── Run 2 — 2026-08-25 ───────────────────────── */
  /* ───────────────────────── ER & specialty hubs ───────────────────────── */
  {
    id: "VET-2026-016",
    name: "The Oncology Service — Richmond",
    category: "ER & Specialty Hub",
    priority: "HOT",
    fitScore: 86,
    address: "5711 Staples Mill Road, Suite 200",
    city: "Richmond",
    state: "VA",
    zip: "23228",
    phone: "(804) 999-0001",
    tel: "8049990001",
    website: "https://tosvets.com/locations/oncology-service-richmond.html",
    hours:
      "Medical oncology Mon–Fri 8:30am–5:00pm; radiation oncology Tue–Fri 8:30am–5:00pm; closed weekends",
    siteCount: 2,
    sites: [
      {
        label: "The Oncology Service (Suite 200)",
        address: "5711 Staples Mill Road, Suite 200, Richmond, VA 23228",
        phone: "(804) 999-0001",
        tel: "8049990001",
      },
      {
        label:
          "FETCH a Cure — Advanced Radiation Treatment Center (Suite 300, same building, separate entity)",
        address: "5711 Staples Mill Road, Suite 300, Richmond, VA 23228",
      },
    ],
    capabilities: [
      "Free-standing veterinary oncology practice — not a department inside another hospital",
      "Medical oncology and radiation oncology, referral-only",
      "Shares a building with FETCH a Cure's Advanced Radiation Treatment Center, open since October 2016, with CT and stereotactic radiation",
      "Appointment-based treatment, which means imaging and records must arrive ahead of the patient",
      "Sister sites in Leesburg and Springfield — both far outside the 25-mile radius",
    ],
    pitch:
      "Referral oncology is the one specialty where the paperwork genuinely has to beat the patient to the building. Every case arrives from somewhere else — an ER hub, a general practice — and treatment is scheduled, repeat-visit and time-boxed. That is a predictable, recurring inbound document lane rather than an on-demand one, which is the kind CSL can actually price.",
    openingQuestion:
      "When a referral comes in from an emergency hospital overnight, how do you get the imaging and the record in hand before the appointment — and does anything physical move between Suite 200 and the radiation centre upstairs?",
    caution:
      "Three things. It is a multi-state group, so purchasing may sit outside Richmond. There are TWO legal entities in one building — The Oncology Service and the nonprofit FETCH a Cure — so establish who signs before proposing anything. And do NOT offer chemotherapy or cytotoxic waste transport on a first call: those carry handling requirements beyond generic DOT-HazMat, and promising them before checking is exactly the kind of overreach that loses a clinical account.",
    addedISO: R2,
    sources: [
      {
        label: "The Oncology Service — Richmond location page",
        url: "https://tosvets.com/locations/oncology-service-richmond.html",
        kind: "organization",
        retrievedISO: R2,
        note:
          "Establishes the Suite 200 address, phone, split medical/radiation hours, and that the practice is free-standing rather than hosted inside another hospital.",
      },
      {
        label: "FETCH a Cure — Advanced Radiation Treatment Center announcement",
        url:
          "https://fetchacure.org/keeping-beloved-furry-friends-closer-longer-richmonds-new-veterinary-radiation-center/",
        kind: "organization",
        retrievedISO: R2,
        note:
          "Establishes the Suite 300 radiation facility as a separate nonprofit-owned entity operated in partnership with TOS — the reason 'who signs' is a real question here.",
      },
    ],
  },

  {
    id: "VET-2026-017",
    name: "Veterinary Specialists of Hanover",
    category: "ER & Specialty Hub",
    priority: "HOT",
    fitScore: 84,
    address: "6127 Mechanicsville Turnpike",
    city: "Mechanicsville",
    state: "VA",
    zip: "23111",
    phone: "(804) 277-8021",
    tel: "8042778021",
    website: "https://www.hanovervets.com/surgery",
    hours: "Mon–Fri 8:00am–5:00pm; single site",
    siteCount: 1,
    capabilities: [
      "Referral surgical practice led by Dr. Kristy Broaddus, DVM, MS, DACVS",
      "Portosystemic shunt correction, gallbladder mucocele, liver lobectomy, splenectomy",
      "Laryngeal paralysis and brachycephalic airway surgery; oncologic surgery",
      "Orthopaedics — cruciate, fracture repair, hip dysplasia; urethrostomy; reconstructive grafts and flaps",
      "Physical rehabilitation",
      "Eight-to-five only — no overnight capability of its own",
    ],
    pitch:
      "Splenectomy and liver lobectomy are the textbook transfusion cases, and this is an eight-to-five practice with no 24-hour floor to bank against. Blood products and overnight patient transfer are not hypothetical lanes here — they are structural consequences of doing major soft-tissue surgery on a daytime schedule. Also sits a mile from three other prospects on the same road.",
    openingQuestion:
      "You're eight to five and you're doing splenectomies and liver lobes. When one of those needs blood, or needs to move to a 24-hour hospital overnight, what physically has to travel with the patient — and who drives it today?",
    caution:
      "Small owner-led practice: the founding surgeon is almost certainly the decision maker and the budget is personal, so pitch a per-run price, not a retainer. Separately — their own referral page is STALE. It still lists Partner at the dead 6506 W Broad address and Virginia Veterinary Centers at the dead Colony Crossing address. Do not use hanovervets.com as a source on any other practice, and do not repeat those addresses back to anyone.",
    addedISO: R2,
    sources: [
      {
        label: "Veterinary Specialists of Hanover — surgery page",
        url: "https://www.hanovervets.com/surgery",
        kind: "organization",
        retrievedISO: R2,
        note:
          "Address, phone and the full surgical list including splenectomy and liver lobectomy. Their /contact page is blocked to automated retrieval, so the address was taken from this page instead — still their own site.",
      },
      {
        label: "Veterinary Specialists of Hanover — urgent care & emergencies referral page",
        url: "https://www.hanovervets.com/urgent-care-emergencies",
        kind: "organization",
        retrievedISO: R2,
        note:
          "Cited as the SOURCE OF THE STALE ADDRESSES, not as evidence for them. This page is where Partner's dead 6506 W Broad and VVC's dead Colony Crossing addresses are still published.",
      },
    ],
  },

  {
    id: "VET-2026-018",
    name: "CVCA Cardiac Care for Pets — Richmond",
    category: "ER & Specialty Hub",
    priority: "WARM",
    fitScore: 71,
    address: "1616 Three Chopt Road",
    city: "Henrico",
    state: "VA",
    zip: "23233",
    phone: "(804) 497-8940",
    tel: "8044978940",
    website: "https://www.cvcavets.com/locations/richmond/",
    hours: "Mon–Fri 9:00am–5:00pm; closed weekends",
    siteCount: 1,
    capabilities: [
      "Referral cardiology — four board-certified cardiologists listed at the Richmond office",
      "Portable echocardiography and Holter monitoring, so diagnostic kit travels with the clinician",
      "Hosted INSIDE Partner Veterinary Emergency & Specialty Center, which runs 24/7/365",
      "No other Virginia CVCA location listed on their own site",
    ],
    pitch:
      "Itinerant cardiologists carrying portable echo and Holter kit between host hospitals is a genuine equipment-movement lane, and Holter studies have to get back to referring vets. Modest on its own — but it is a second conversation inside a building CSL is already calling on.",
    openingQuestion:
      "Your cardiologists work out of Partner's building. When a Holter monitor or an echo study has to get back to a referring vet, how does that move today?",
    caution:
      "IMPORTANT DEDUPLICATION: CVCA shares 1616 Three Chopt Road with Partner Veterinary (VET-2026-004), which is already on this board. CVCA is a TENANT. Do not call these as two unrelated prospects at the same address — mention the connection first or it will look like CSL does not know who it is talking to. Also a large national cardiology group, so vendor decisions are likely centralised, and with no second Virginia site the 'inter-site' lane here is interstate rather than local.",
    addedISO: R2,
    sources: [
      {
        label: "CVCA — Richmond location page",
        url: "https://www.cvcavets.com/locations/richmond/",
        kind: "organization",
        retrievedISO: R2,
        note:
          "Establishes the shared address with Partner Veterinary, the weekday-only hours, the four cardiologists, and that Partner's 24/7 emergency line is the after-hours number for this office.",
      },
    ],
  },

  {
    id: "VET-2026-019",
    name: "Helping Hands Veterinary Surgery & Dentistry of Virginia",
    category: "Nonprofit / High-Volume",
    priority: "WARM",
    fitScore: 74,
    address: "1605 Rhoadmiller Street",
    city: "Richmond",
    state: "VA",
    zip: "23220",
    phone: "(804) 355-3500",
    tel: "8043553500",
    website: "https://helpinghandsvetva.com/contact/",
    hours: "Mon–Thu 7:30am–5:30pm; CLOSED Friday, Saturday and Sunday",
    siteCount: 1,
    capabilities: [
      "Dedicated high-volume surgery and dentistry centre — affordable-surgery model",
      "Four operating days a week through a single surgical suite",
      "Draws patients from Virginia, Maryland, North Carolina, DC and Pennsylvania",
    ],
    pitch:
      "Four surgery days a week through one suite is real throughput, and out-of-state referral patients mean records that have to travel further than anyone else's on this board. The aftercare volume that comes with a high-volume surgical centre is the honest lane here.",
    openingQuestion:
      "You run four surgery days a week and clients drive in from five states. What does your aftercare arrangement look like on a heavy week — and does anyone on staff ever have to make a run for you?",
    caution:
      "Closed Friday through Sunday — half the working week is dead air, so call Monday to Thursday morning. The entire brand is built on affordable surgery, so expect hard price sensitivity and lead with a per-run number. Their site makes NO mention of blood products, controlled substances or transport: those lanes are inferred from the service model, not stated, so ask rather than assert.",
    addedISO: R2,
    sources: [
      {
        label: "Helping Hands Veterinary Surgery & Dentistry — contact page",
        url: "https://helpinghandsvetva.com/contact/",
        kind: "organization",
        retrievedISO: R2,
        note:
          "Address, phone, the Mon–Thu-only schedule, and the five-state catchment.",
      },
    ],
  },

  {
    id: "VET-2026-020",
    name: "Animal Eye Care of Richmond",
    category: "ER & Specialty Hub",
    priority: "WARM",
    fitScore: 69,
    address: "2861 Huguenot Springs Road",
    city: "Midlothian",
    state: "VA",
    zip: "23113",
    phone: "(804) 355-5594",
    tel: "8043555594",
    website: "https://aecrichmond.com/",
    hours:
      "Midlothian Mon–Thu 8:30am–4:30pm, Fri 8:30am–3:30pm, closed weekends; Charlottesville hours vary on select Thursdays",
    siteCount: 3,
    sites: [
      {
        label: "Midlothian (primary — the only site inside the radius)",
        address: "2861 Huguenot Springs Road, Midlothian, VA 23113",
        phone: "(804) 355-5594",
        tel: "8043555594",
      },
      {
        label:
          "Charlottesville satellite — inside Autumn Trails Veterinary Center (~70 mi, OUTSIDE radius)",
        address: "2407 Hydraulic Road, Charlottesville, VA 22901",
      },
      {
        label:
          "Fredericksburg satellite — inside Littlepage Animal Hospital (~60 mi, OUTSIDE radius)",
        address: "712 Littlepage Street, Fredericksburg, VA 22401",
      },
    ],
    capabilities: [
      "Referral veterinary ophthalmology",
      "Itinerant model — ophthalmologists run satellite days inside two OTHER hospitals, so instruments, surgical packs and records travel with them",
      "Describe themselves as an extension of the referring practice",
      "Treat large animals and equine as well as small animals",
    ],
    pitch:
      "The itinerant satellite model is the purest version of the equipment-movement lane on this board: on a Charlottesville or Fredericksburg day, a surgical pack and a set of records physically have to be somewhere else by morning. Most practices have this lane by accident; this one has it by design.",
    openingQuestion:
      "Your doctors run satellite days inside two other hospitals. What has to travel with them on a Charlottesville or Fredericksburg day, and who packs and moves it?",
    caution:
      "Only the Midlothian site is inside CSL's 25-mile radius. The genuine inter-site lane here is a 60–90 mile run EACH WAY — price it deliberately or decline it, but do not promise it casually on a first call. They also treat equine, so 'transport' may not mean what Darren assumes; clarify early.",
    addedISO: R2,
    sources: [
      {
        label: "Animal Eye Care of Richmond — homepage",
        url: "https://aecrichmond.com/",
        kind: "organization",
        retrievedISO: R2,
        note:
          "All three addresses, phone, fax and per-site hours, plus the statement that the Charlottesville and Fredericksburg clinics operate inside host hospitals.",
      },
    ],
  },

  /* ─────────────────────── Cremation & aftercare ──────────────────────── */
  // V1 named aftercare as one of the five uncovered lanes and then listed
  // nobody in it. These three close that gap. Read the cautions: two of the
  // three already run their own pickups and will say so, which makes this an
  // overflow/subcontract conversation rather than a new-lane pitch.

  {
    id: "VET-2026-021",
    name: "Agape Pet Services — Sandston (Gateway Services Inc.)",
    category: "Nonprofit / High-Volume",
    priority: "WARM",
    fitScore: 67,
    address: "1001 Techpark Place",
    city: "Sandston",
    state: "VA",
    zip: "23150",
    phone: "(804) 737-8400",
    tel: "8047378400",
    website: "https://agapepetservices.com/",
    hours: "Not published on their own site — confirm before scheduling",
    siteCount: 1,
    capabilities: [
      "Pet cremation and aftercare; the Sandston facility is the Richmond-metro site, roughly 10 miles from downtown and inside the radius",
      "Operates under Gateway Services Inc. across nine facilities in VA, MD, WV, NC and SC",
      "Publishes a 'Become a Provider' path for veterinary practices, so they aggregate collection from clinics across the metro",
    ],
    pitch:
      "This is the aggregator every practice in the metro already hands its aftercare to. CSL does not displace them — CSL becomes the overflow van on the days their own fleet is stretched. That is a subcontract conversation with one signature covering many clinics, which is worth more than five individual practice accounts.",
    openingQuestion:
      "How many Richmond-area practices are you collecting from in a week, and does your own fleet cover all of them — or are there days you're stretched thin enough that a van on standby would save you a trip?",
    caution:
      "Gateway Services is a large corporate multi-state operator and almost certainly runs its own collection fleet with logistics bought above the local level. Their site does NOT state pickup terms, transport arrangements or opening hours — none of that is verified. Their /veterinary-professionals and /locations paths both 404, so do not cite them. Frame this as overflow capacity, never as 'let us be your courier'.",
    addedISO: R2,
    sources: [
      {
        label: "Agape Pet Services — homepage",
        url: "https://agapepetservices.com/",
        kind: "organization",
        retrievedISO: R2,
        note:
          "Establishes the Gateway Services parent, the nine-facility footprint, and the 'Become a Provider' path for veterinary practices.",
      },
      {
        label: "Agape Pet Services — Sandston contact page",
        url: "https://agapepetservices.com/contact-sandston/",
        kind: "organization",
        retrievedISO: R2,
        note: "Sandston address and phone. Hours are not published on this page.",
      },
    ],
  },

  {
    id: "VET-2026-022",
    name: "Caring Pet Cremation Services, Inc.",
    category: "Nonprofit / High-Volume",
    priority: "WATCH",
    fitScore: 61,
    address: "471 Jack Pen Lane",
    city: "King William",
    state: "VA",
    zip: "23086",
    phone: "(804) 885-0499",
    tel: "8048850499",
    website: "https://caringpetva.com/",
    hours: "Not published on their own site",
    siteCount: 1,
    capabilities: [
      "On-site crematory; collects from homes and veterinary offices and returns remains, in most cases within 48 hours",
      "Stated service area spans fourteen counties plus Colonial Heights, Richmond, Tappahannock and Warsaw",
      "Single facility in King William, roughly 35 miles from Richmond",
    ],
    pitch:
      "They cover fourteen counties out of one building with their own vehicles. The metro stops are the dense, low-margin end of that territory and the easiest part for them to hand off — which is exactly the shape of run CSL is built for.",
    openingQuestion:
      "You're collecting from vet offices across fourteen counties out of King William. Where does that stretch you thinnest — and on your heavy days, would a Richmond-based van covering your metro stops actually save you a trip?",
    caution:
      "They ALREADY do their own pickups and say so explicitly on their own site, so opening with 'you probably need a courier' will be corrected immediately. Their crematory is ~35 miles from Richmond — the collection stops are inside CSL's radius, the delivery leg is not. Price the return leg before calling, or this becomes a job CSL loses money on.",
    addedISO: R2,
    sources: [
      {
        label: "Caring Pet Cremation Services — homepage",
        url: "https://caringpetva.com/",
        kind: "organization",
        retrievedISO: R2,
        note:
          "Establishes the King William address, the fourteen-county service area, and their own statement that they collect from veterinary offices and return remains within 48 hours — the reason this is an overflow pitch, not a new-lane pitch.",
      },
    ],
  },

  {
    id: "VET-2026-023",
    name: "Pet Cremation Services & Richmond Pet Memorial Park",
    category: "Nonprofit / High-Volume",
    priority: "WATCH",
    fitScore: 58,
    address: "3815 Chamberlayne Avenue",
    city: "Richmond",
    state: "VA",
    zip: "23227",
    phone: "(804) 321-5055",
    tel: "8043215055",
    website: "https://www.animalcremationinrichmondva.com/",
    hours: "Not published on their own site",
    siteCount: 1,
    capabilities: [
      "Animal cremation, pet funeral services and urns",
      "On-site pet cemetery — burial as well as cremation, which is unusual in this market",
      "Inside the city, roughly five miles from downtown",
    ],
    pitch:
      "Burial is the one aftercare service with a fixed destination and a scheduled, dignified transport requirement — and it is inside the city. That is a short, repeatable, high-care run rather than a long-haul collection.",
    openingQuestion:
      "For a burial at the memorial park, how does the pet get from the veterinary hospital to you — is that on the family, on the vet, or on you?",
    caution:
      "Their own site does NOT state whether they collect from veterinary clinics, so do not assume they do — the opening question is genuinely a question. Two different phone numbers are published with no explanation of which is which ((804) 321-5055 and (804) 638-5818). Lowest-confidence record in this run.",
    addedISO: R2,
    sources: [
      {
        label: "Pet Cremation Services & Richmond Pet Memorial Park — homepage",
        url: "https://www.animalcremationinrichmondva.com/",
        kind: "organization",
        retrievedISO: R2,
        note:
          "Address, both published phone numbers, and the cremation / cemetery / funeral service list. Pickup from clinics is NOT stated anywhere on this site.",
      },
    ],
  },

  /* ───────────────────── Corporate groups — call last ───────────────────── */

  {
    id: "VET-2026-024",
    name: "Banfield Pet Hospital — Richmond metro (4 sites)",
    category: "General Practice",
    priority: "WATCH",
    fitScore: 46,
    address: "7225 Bell Creek Road",
    city: "Mechanicsville",
    state: "VA",
    zip: "23111",
    phone: "(804) 746-1926",
    tel: "8047461926",
    website: "https://www.banfield.com/locations/veterinarians/va/mechanicsville/mcv",
    hours: "Mon–Sat 8:00am–6:00pm at three sites; Short Pump Mon–Sat 9–6, Sun 10–5",
    siteCount: 4,
    sites: [
      {
        label: "Mechanicsville (#1328) — part of the Mechanicsville Turnpike cluster",
        address: "7225 Bell Creek Road, Mechanicsville, VA 23111",
        phone: "(804) 746-1926",
        tel: "8047461926",
      },
      {
        label: "Midlothian Commonwealth (#5401)",
        address: "13001 Hull Street Road, Midlothian, VA 23112",
        phone: "(804) 763-1833",
        tel: "8047631833",
      },
      {
        label: "Colonial Heights (#0673)",
        address: "42 Southgate Square, Colonial Heights, VA 23834",
        phone: "(804) 520-4433",
        tel: "8045204433",
      },
      {
        label:
          "Short Pump — street number NOT published on their own page; 'West Broad Street, at The Corner at Short Pump'. UNVERIFIED",
        address: "West Broad Street, Richmond, VA (exact number unverified)",
        phone: "(804) 364-0224",
        tel: "8043640224",
      },
    ],
    capabilities: [
      "Four Richmond-metro general-practice hospitals under one operator",
      "Inter-site movement is the only lane — controlled-drug transfers, equipment, records",
    ],
    pitch:
      "Four sites in the metro under one operator is the largest single-signature footprint on this board. It is also the least likely to sign locally, which is why it sits at the bottom.",
    openingQuestion:
      "Does anything move between your hospital and the other Richmond Banfields — controlled drug transfers, equipment, records — and who handles that today?",
    caution:
      "HEAVY CAUTION, CALL LAST AND ONLY TO LEARN. Banfield is Mars-owned, and Mars also owns ANTECH — lab logistics is literally in-house, so any send-out pitch is dead on arrival. National procurement means a local practice manager almost certainly cannot sign a courier agreement. The Short Pump street number is not on Banfield's own page and is recorded here as unverified; a third party lists 11825 W Broad St Ste A but that is NOT confirmed. Their /available-services path is blocked by robots.txt.",
    addedISO: R2,
    sources: [
      {
        label: "Banfield — Mechanicsville hospital page",
        url: "https://www.banfield.com/locations/veterinarians/va/mechanicsville/mcv",
        kind: "organization",
        retrievedISO: R2,
      },
      {
        label: "Banfield — Midlothian Commonwealth hospital page",
        url: "https://www.banfield.com/locations/veterinarians/va/midlothian/swr/",
        kind: "organization",
        retrievedISO: R2,
      },
      {
        label: "Banfield — Colonial Heights hospital page",
        url: "https://www.banfield.com/locations/veterinarians/va/colonial-heights/clh",
        kind: "organization",
        retrievedISO: R2,
      },
      {
        label: "Banfield — Short Pump hospital page",
        url: "https://www.banfield.com/locations/veterinarians/va/richmond/shp",
        kind: "organization",
        retrievedISO: R2,
        note:
          "Cited to establish what is NOT there: this page gives no street number or ZIP, only 'West Broad Street' and 'The Corner at Short Pump'.",
      },
    ],
  },

  {
    id: "VET-2026-025",
    name: "VCA Pets First Animal Hospital",
    category: "General Practice",
    priority: "WATCH",
    fitScore: 44,
    address: "9201 Staples Mill Road",
    city: "Richmond",
    state: "VA",
    zip: "23228",
    phone: "(804) 672-3576",
    tel: "8046723576",
    website: "https://vcahospitals.com/pets-first/hospital",
    hours: "Mon–Fri 7:30am–6:00pm; closed weekends",
    siteCount: 1,
    capabilities: [
      "AAHA-accredited general practice with surgical suite, laser surgery and dentistry",
      "In-house laboratory AND in-house pharmacy — both lanes closed",
      "Dermatology, internal medicine, pain management, boarding and grooming",
    ],
    pitch:
      "Weak. Included to close out the question of whether VCA has a Richmond footprint worth pursuing. It does not — this is the only VCA hospital in the metro.",
    openingQuestion:
      "You've got the lab and the pharmacy in-house. What still leaves the building — aftercare, controlled-drug transfers, anything going to a specialist?",
    caution:
      "Mars-owned, same parent as Banfield and Antech, with an in-house lab and national procurement. FINDING WORTH RECORDING: VCA's Richmond footprint is a SINGLE hospital — VCA Commonwealth Animal Hospital is in Fairfax, not Richmond — so there is no VCA inter-site lane in this metro and the 'large corporate group with a Richmond footprint' thesis does not hold for VCA. Their own site is also stale: it still refers patients to 'Dogwood Veterinary and Specialty Center' at 5918 West Broad Street, which now trades as BluePearl (VET-2026-005).",
    addedISO: R2,
    sources: [
      {
        label: "VCA Pets First Animal Hospital — hospital page",
        url: "https://vcahospitals.com/pets-first/hospital",
        kind: "organization",
        retrievedISO: R2,
        note:
          "Address, phone, hours, service list — and the stale Dogwood referral that is now BluePearl.",
      },
      {
        label: "VCA Commonwealth Animal Hospital — hospital page",
        url: "https://vcahospitals.com/commonwealth/hospital",
        kind: "organization",
        retrievedISO: R2,
        note:
          "Cited to establish a NEGATIVE: this hospital is in Fairfax, VA 22030, not Richmond. It is why VCA has no metro inter-site lane.",
      },
    ],
  },
  /* ───────────────────── 9/30 sweep — run 3, 2026-09-30 ───────────────────── */
  /* ── Multi-site independents ── */
  {
    id: "VET-2026-026",
    name: "Locke A. Taylor Veterinary Hospital (3 sites, incl. Glen Allen Animal Hospital)",
    category: "General Practice",
    priority: "HOT",
    fitScore: 80,
    address: "9023 Woodman Road",
    city: "Richmond",
    state: "VA",
    zip: "23228",
    phone: "(804) 262-8629",
    tel: "8042628629",
    website: "https://lockeataylordvm.com/",
    hours:
      "Monday & Wednesday 9am–8pm; Tuesday, Thursday, Friday 9am–6pm; by appointment (one schedule published for all three sites)",
    siteCount: 3,
    sites: [
      {
        label: "Woodman Road (main)",
        address: "9023 Woodman Road, Richmond, VA 23228",
        phone: "(804) 262-8629",
        tel: "8042628629",
      },
      {
        label: "N Parham Road",
        address: "2801 N Parham Road, Richmond, VA 23294",
        phone: "(804) 308-1384",
        tel: "8043081384",
      },
      {
        label: "Glen Allen Animal Hospital",
        address: "10222 Staples Mill Road, Glen Allen, VA 23060",
        phone: "(804) 308-9971",
        tel: "8043089971",
      },
    ],
    capabilities: [
      "Three hospitals in Henrico / North Richmond under one brand and one shared schedule",
      "Surgery, dental care, exotic and pocket-pet care, rehabilitation, end-of-life planning",
      "Handles emergencies during business hours at Woodman Road and N Parham Road",
      "Sends after-hours emergencies to outside ER hospitals — the after-hours transfer lane",
    ],
    pitch:
      "The best new multi-site independent in the metro: three hospitals roughly fifteen minutes apart, open until 8pm two nights a week. That is a standing inter-site lane for samples, records and medication, plus a same-evening hand-off to the ER for every patient who leaves at closing time.",
    openingQuestion:
      "When a patient seen at Parham needs something that's stocked or done at Woodman or Glen Allen, how does it get there today — and who drives it?",
    caution:
      "Two things before dialling. (1) Their own emergency page still sends clients to 'Dogwood Specialty Center (804) 716-4700' and 'Veterinary Referral and Care' — Dogwood now trades as BluePearl, which per its own site is closed for emergencies at weekends. Do not repeat the old names on the call. (2) The site refers to 'the late Dr. Locke A. Taylor' and does not say who owns the practice now — confirm the decision maker before pitching.",
    addedISO: R3,
    sources: [
      {
        label: "Locke A. Taylor — mobile homepage (locations)",
        url: "https://m.lockeataylordvm.com/",
        kind: "organization",
        retrievedISO: R3,
        note: "Source for all three addresses and phone numbers and the shared hours.",
      },
      {
        label: "Locke A. Taylor — homepage",
        url: "https://lockeataylordvm.com/",
        kind: "organization",
        retrievedISO: R3,
        note: "Source for the services list and the founder reference.",
      },
      {
        label: "Locke A. Taylor — Richmond pet emergencies page",
        url: "https://m.lockeataylordvm.com/richmond-pet-emergencies.php",
        kind: "organization",
        retrievedISO: R3,
        note: "Establishes business-hours emergency handling and the outdated after-hours ER referral names cited in the caution.",
      },
      {
        label: "Lab Rescue Richmond — veterinarian list",
        url: "https://www.labrescue-richmond.com/veternarians",
        kind: "directory",
        retrievedISO: R3,
        note: "Lists only two locations; the practice's own site shows three, and the own site wins.",
      },
    ],
  },
  {
    id: "VET-2026-027",
    name: "Mechanicsville Animal Hospital + Rutland Animal Hospital (sister practices)",
    category: "General Practice",
    priority: "WARM",
    fitScore: 72,
    address: "7044 Lee Park Rd.",
    city: "Mechanicsville",
    state: "VA",
    zip: "23111",
    phone: "(804) 559-9800",
    tel: "8045599800",
    website: "https://www.mechanicsvilleanimalhospital.com/",
    hours:
      "Mechanicsville: Mon–Thu 7:30am–7pm; Fri 7:30am–6pm; Sat 8am–3pm; Sun closed (medication and boarding pickup only)",
    siteCount: 2,
    sites: [
      {
        label: "Mechanicsville Animal Hospital",
        address: "7044 Lee Park Rd., Mechanicsville, VA 23111",
        phone: "(804) 559-9800",
        tel: "8045599800",
      },
      {
        label: "Rutland Animal Hospital (Mon–Thu 7:30am–7pm, Fri 7:30am–6pm, closed weekends)",
        address: "9375 Atlee Road, Suite 4109, Mechanicsville, VA 23116",
        phone: "(804) 559-6502",
        tel: "8045596502",
      },
    ],
    capabilities: [
      "Two Hanover County hospitals; Rutland sends its Saturday patients to Mechanicsville, so patients already move between the sites",
      "Mechanicsville: orthopaedic and soft-tissue surgery, internal medicine, dentistry, boarding; founded 1998",
      "Rutland: surgery, dental cleanings and wellness for cats and dogs; operating since 2016",
      "After hours, Rutland refers to the Richmond 24-hour hospitals (VVC, BluePearl, VRCC)",
    ],
    pitch:
      "Their own website already describes an inter-site hand-off — Rutland clients are sent to Lee Park on Saturdays. The Lee Park Road hospital is also in the same Mechanicsville (23111) corridor as the Mechanicsville Turnpike cluster — BetterPet, Smoky's, Veterinary Specialists of Hanover, Banfield — so it is a candidate stop on a route that already exists on paper (drive distance not yet measured).",
    openingQuestion:
      "When a Rutland patient has to be seen at Lee Park, or go to the ER after you close, what goes with them — and who carries it?",
    caution:
      "Neither site says who owns the practices or whether they belong to a corporate group — confirm independence before scoring higher. Mechanicsville's /emergencies page returned a 404, so its own after-hours policy is not published.",
    addedISO: R3,
    sources: [
      {
        label: "Mechanicsville Animal Hospital — homepage",
        url: "https://www.mechanicsvilleanimalhospital.com/",
        kind: "organization",
        retrievedISO: R3,
        note: "Source for the Lee Park Road address, phone, hours, services and the link to the sister location.",
      },
      {
        label: "Mechanicsville Animal Hospital — About",
        url: "https://www.mechanicsvilleanimalhospital.com/about-us",
        kind: "organization",
        retrievedISO: R3,
        note: "Establishes the 'Visit Our Second Location' link to Rutland. No ownership stated.",
      },
      {
        label: "Rutland Animal Hospital — About",
        url: "https://www.rutlandanimalhospital.com/about-us",
        kind: "organization",
        retrievedISO: R3,
        note: "Source for Rutland's address, phone, hours, 2016 opening and the Saturday redirect to Mechanicsville.",
      },
      {
        label: "Rutland Animal Hospital — Emergencies",
        url: "https://www.rutlandanimalhospital.com/emergencies",
        kind: "organization",
        retrievedISO: R3,
        note: "Establishes the after-hours ER referral list.",
      },
    ],
  },

  /* ── Equine & large animal ── */
  {
    id: "VET-2026-028",
    name: "Woodside Equine Clinic",
    category: "ER & Specialty Hub",
    priority: "HOT",
    fitScore: 82,
    address: "13011 Blanton Road",
    city: "Ashland",
    state: "VA",
    zip: "23005",
    phone: "(804) 798-3281",
    tel: "8047983281",
    website: "https://www.woodsideequineclinic.com/",
    hours: "Monday–Friday 8am–5pm; closed weekends; emergency service 24/7",
    capabilities: [
      "Privately owned — Dr. Scott Anderson has owned it since 1989; eleven veterinarians including two board-certified surgeons and a theriogenologist",
      "24/7 emergency service; 'surgeons are available 24/7 for referrals'; colic surgery with overnight hospitalisation",
      "In-house laboratory: CBC, chemistry, SAA, fibrinogen, Salmonella, Strangles and EHV-1 PCR, fecals",
      "Digital radiography, ultrasound, endoscopy and nuclear scintigraphy",
      "Ambulatory farm-call service, reproductive centre and sports medicine",
      "Site states it has expanded into a new Emergency & Surgery facility",
    ],
    pitch:
      "A completely new lane for the board: the 24/7 surgical referral hospital for horses north of Richmond, owner-led, with referring vets sending colic cases at all hours. When a referring vet sends a horse at 2am, the bloodwork, films and history have to follow — on a documented chain of custody.",
    openingQuestion:
      "When a referring vet sends you an emergency, how do their bloodwork, imaging and history reach you — and how often does that arrive late or not at all?",
    caution:
      "(1) The in-house lab covers most routine testing — do not pitch lab send-outs. (2) Nuclear scintigraphy involves radioactive material: do NOT imply CSL can carry Class 7 material. (3) The site announces a new Emergency & Surgery facility but publishes no separate address for it — ask for it before quoting any route.",
    addedISO: R3,
    sources: [
      {
        label: "Woodside Equine Clinic — homepage",
        url: "https://www.woodsideequineclinic.com/",
        kind: "organization",
        retrievedISO: R3,
        note: "Source for address, phone, hours, services, private ownership and the expansion notice.",
      },
      {
        label: "Woodside Equine Clinic — Emergency",
        url: "https://www.woodsideequineclinic.com/services/emergency.html",
        kind: "organization",
        retrievedISO: R3,
        note: "Establishes the 24/7 surgeon referrals, the fast-track emergency system and the in-house lab.",
      },
      {
        label: "Woodside Equine Clinic — Diagnostics",
        url: "https://www.woodsideequineclinic.com/services/diagnostics.html",
        kind: "organization",
        retrievedISO: R3,
        note: "Source for the in-house lab test menu and imaging, including scintigraphy.",
      },
      {
        label: "Woodside Equine Clinic — About",
        url: "https://www.woodsideequineclinic.com/about/",
        kind: "organization",
        retrievedISO: R3,
        note: "Establishes the eleven veterinarians, the board-certified surgeons and the ownership history.",
      },
      {
        label: "Woodside Equine Clinic — Surgery",
        url: "https://www.woodsideequineclinic.com/services/surgery.html",
        kind: "organization",
        retrievedISO: R3,
        note: "Establishes colic surgery, overnight hospitalisation and support for referring vets.",
      },
    ],
  },
  {
    id: "VET-2026-029",
    name: "Virginia Equine, PLLC",
    category: "General Practice",
    priority: "WARM",
    fitScore: 70,
    address: "1994 Shallow Well Rd",
    city: "Manakin-Sabot",
    state: "VA",
    zip: "23103",
    phone: "(804) 784-5419",
    tel: "8047845419",
    website: "https://virginiaequinepllc.com/",
    hours: "Clinic Monday–Friday 9am–4pm; after-hours emergency service for clients inside its service area",
    capabilities: [
      "Owner-led: Douglas K. Daniels DVM has owned and operated the practice since 1997",
      "Five mobile veterinarians covering Goochland, Powhatan, Midlothian, Chesterfield, Louisa, Hanover and Henrico",
      "Haul-in clinic with an on-site surgical stall",
      "Portable ultrasound, gastroscopy, upper-airway endoscopy, lameness exams; reproductive and neonatal care",
      "In-house lab capability: not published",
    ],
    pitch:
      "Five vets in five trucks across seven counties. Every field draw and every controlled-drug restock currently depends on a vet driving back to Manakin-Sabot — a scheduled collection run gives those hours back to billable farm calls.",
    openingQuestion:
      "When one of your field vets draws blood in Powhatan at 3pm, how does it get to the lab — and how do controlled-drug restocks reach the trucks?",
    caution:
      "Whether they run an in-house lab, and which reference lab they use, is NOT published — ask before assuming the sample lane exists. The clinic is roughly 20 miles west of downtown (estimate, not measured).",
    addedISO: R3,
    sources: [
      {
        label: "Virginia Equine — homepage",
        url: "https://virginiaequinepllc.com/",
        kind: "organization",
        retrievedISO: R3,
        note: "Source for the address, phone, hours, the five mobile vets, service area and after-hours emergencies.",
      },
      {
        label: "Virginia Equine — About",
        url: "https://virginiaequinepllc.com/about/",
        kind: "organization",
        retrievedISO: R3,
        note: "Establishes Dr. Daniels' ownership since 1997 and the haul-in clinic.",
      },
      {
        label: "Virginia Equine — Services",
        url: "https://virginiaequinepllc.com/services/",
        kind: "organization",
        retrievedISO: R3,
        note: "Source for the diagnostic, surgical and reproductive services.",
      },
    ],
  },

  /* ── Zoo, mobile & end-of-life ── */
  {
    id: "VET-2026-030",
    name: "Metro Richmond Zoo — on-site animal hospital",
    category: "Nonprofit / High-Volume",
    priority: "WARM",
    fitScore: 66,
    address: "8300 Beaver Bridge Road",
    city: "Moseley",
    state: "VA",
    zip: "23120",
    phone: "(804) 739-5666",
    tel: "8047395666",
    website: "https://metrorichmondzoo.com/",
    hours: "Zoo open Monday–Saturday 9:30am–5pm, closed Sundays (public hours — hospital hours not published)",
    capabilities: [
      "Privately owned and operated with no government funding — the owner decides, not a board or agency",
      "About 2,000 animals of 190 species on 150 acres in Chesterfield County",
      "On-site hospital with a small pharmacy, surgery room, blood chemistry analyser and x-ray",
      "Vet-tech job description includes preparing biological specimens for lab exams and shipment",
    ],
    pitch:
      "The zoo's own vet team already packs specimens for outside testing. CSL can take the local leg off them — Moseley to the lab, the airport or a Richmond specialist — documented end to end.",
    openingQuestion:
      "When the hospital needs a sample tested outside, where does it go and how does it leave the zoo today — FedEx, a staff drive, or a lab courier?",
    caution:
      "(1) The specimen-shipping evidence comes from a job posting, which may be old. (2) Many exotic-species tests go to national labs by overnight air, so CSL's realistic role is the local leg, not the whole journey. (3) Some species' specimens fall under USDA or CITES rules — ask before handling them. Roughly 20 miles southwest of downtown (estimate).",
    addedISO: R3,
    sources: [
      {
        label: "Metro Richmond Zoo — homepage",
        url: "https://metrorichmondzoo.com/",
        kind: "organization",
        retrievedISO: R3,
        note: "Source for the address, phone and public hours.",
      },
      {
        label: "Metro Richmond Zoo — press kit",
        url: "https://metrorichmondzoo.com/newsroom/press-kit/",
        kind: "organization",
        retrievedISO: R3,
        note: "Establishes the on-site hospital, private ownership, 2,000 animals, 190 species and 150 acres.",
      },
      {
        label: "Metro Richmond Zoo — Veterinary Technician posting",
        url: "https://metrorichmondzoo.com/employment/veterinary-technician/",
        kind: "organization",
        retrievedISO: R3,
        note: "Establishes the hospital pharmacy, surgery room and analyser, and the specimen-shipment duty.",
      },
    ],
  },
  {
    id: "VET-2026-031",
    name: "House Call Vet RVA (in-home end-of-life care)",
    category: "General Practice",
    priority: "WARM",
    fitScore: 60,
    address: "Mobile practice — no street address published",
    city: "Richmond",
    state: "VA",
    zip: "",
    phone: "(804) 382-3684",
    tel: "8043823684",
    website: "https://housecallvetrva.com/",
    hours: "Hours vary based on availability; evening and weekend options offered",
    capabilities: [
      "Owner: Dr. Kaitlyn Hemsley, DVM, CVA (certified veterinary acupuncturist)",
      "In-home euthanasia, hospice and end-of-life care; pain management, laser therapy, acupuncture",
      "Serves Richmond, Chesterfield, Hanover, Henrico, Midlothian, Mechanicsville, Ashland and Goochland",
      "Aftercare and cremation arrangements: not published",
    ],
    pitch:
      "The missing link in the aftercare lane: after an in-home euthanasia, often in the evening or at a weekend, someone has to take the pet to the crematory. CSL does that transfer with dignity and paperwork, so the vet can go straight to the next family.",
    openingQuestion:
      "After an in-home euthanasia, who transports the pet to the crematory — and how does that work at 8pm on a Saturday?",
    caution:
      "Her aftercare partner is not published and may already be one of the three cremation providers on this board (Agape, Caring Pet Cremation, Pet Cremation Services). Frame CSL as a carrier that works alongside them, not a replacement. The vehicle must be appropriate for carrying remains.",
    addedISO: R3,
    sources: [
      {
        label: "House Call Vet RVA — Contact",
        url: "https://housecallvetrva.com/contact/",
        kind: "organization",
        retrievedISO: R3,
        note: "Source for the phone, the hours language, service area and services.",
      },
      {
        label: "House Call Vet RVA — in-home veterinarian page",
        url: "https://housecallvetrva.com/richmond-va-in-home-veterinarian/",
        kind: "organization",
        retrievedISO: R3,
        note: "Establishes Dr. Hemsley as owner and the end-of-life focus.",
      },
    ],
  },

  /* ── General practices & specialists — after-hours hand-off lane ── */
  {
    id: "VET-2026-032",
    name: "Iron Bridge Animal Hospital",
    category: "General Practice",
    priority: "WATCH",
    fitScore: 45,
    address: "7540 Iron Bridge Road",
    city: "Richmond",
    state: "VA",
    zip: "23237",
    phone: "(804) 743-1704",
    tel: "8047431704",
    website: "https://ironbridgevet.com/",
    hours: "Mon–Wed 7am–7pm; Thu 7am–5pm; Fri 7am–6pm; Sat 9am–noon (by appointment)",
    capabilities: [
      "Full-service companion-animal hospital (medical, surgical, dental) serving Chesterfield and Chester for over thirty years",
      "Online pharmacy through Vetsource home delivery",
      "Sends after-hours emergencies to outside ER hospitals",
    ],
    pitch:
      "When a patient goes to the ER at 7pm, CSL makes sure the chart, films and labs are already there when the client walks in.",
    openingQuestion:
      "When a patient goes from you to the ER after hours, how do their records and any samples get there?",
    caution:
      "Their emergency list uses old names — 'Veterinary Emergency Center – South 744-9800' and '– Cary Street 353-9000' — which are now VVC Midlothian and VVC Short Pump. Dr. William Dunnavant is named on the site but his role is not stated; ownership is not published.",
    addedISO: R3,
    sources: [
      {
        label: "Iron Bridge Animal Hospital — homepage",
        url: "https://ironbridgevet.com/",
        kind: "organization",
        retrievedISO: R3,
        note: "Source for the address, phone, hours, services and the outdated ER list.",
      },
    ],
  },
  {
    id: "VET-2026-033",
    name: "Short Pump Animal Hospital",
    category: "General Practice",
    priority: "WATCH",
    fitScore: 42,
    address: "4730 Pouncey Tract Road",
    city: "Glen Allen",
    state: "VA",
    zip: "23059",
    phone: "(804) 360-0100",
    tel: "8043600100",
    website: "https://www.shortpumpvet.com/",
    hours: "Monday–Friday 7:30am–6:30pm; closed weekends",
    capabilities: [
      "AAHA-accredited; six doctors",
      "Same-day urgent care for stable sick patients",
      "X-ray, ultrasound, dermatology, dental and surgery",
      "Sends critical after-hours cases to partner hospitals",
    ],
    pitch:
      "Six doctors and same-day sick visits means some of those patients end up at the ER that night — CSL gets their workup there before the client arrives.",
    openingQuestion:
      "How many of your same-day urgent cases end up at the ER, and how does their workup get there?",
    caution:
      "No owner or parent company is published; it could be corporate-owned. Confirm before investing time.",
    addedISO: R3,
    sources: [
      {
        label: "Short Pump Animal Hospital — homepage",
        url: "https://www.shortpumpvet.com/",
        kind: "organization",
        retrievedISO: R3,
        note: "Source for the address, phone, hours, doctors, services and AAHA accreditation.",
      },
      {
        label: "Short Pump Animal Hospital — urgent care",
        url: "https://www.shortpumpvet.com/glen-allen-va/urgent-care/",
        kind: "organization",
        retrievedISO: R3,
        note: "Establishes same-day urgent care and after-hours referral to partner hospitals.",
      },
    ],
  },
  {
    id: "VET-2026-034",
    name: "Animal Dermatology Clinic — Richmond (formerly Veterinary Dermatology of Richmond)",
    category: "ER & Specialty Hub",
    priority: "WATCH",
    fitScore: 38,
    address: "13815 Fribble Way",
    city: "Midlothian",
    state: "VA",
    zip: "23112",
    phone: "(804) 740-9555",
    tel: "8047409555",
    website: "https://www.animaldermatology.com/locations/richmond",
    hours: "Mon–Thu 8am–5pm; Fri 8am–noon (closed every other Friday); closed weekends; closed 12:15–12:45pm daily",
    capabilities: [
      "Board-certified dermatologist Amy Shumaker, DVM, plus a resident",
      "Referral specialty for complex skin and ear disease, allergies and immune-mediated conditions",
      "Online referral portal for veterinarians",
    ],
    pitch:
      "Referrals arrive from all over the metro; a scheduled pickup of the referring vet's records and prior cultures means first visits start complete.",
    openingQuestion:
      "How often do referred patients arrive without their history or prior cultures, and what does that cost your schedule?",
    caution:
      "The site says the clinic is 'now part of the renowned Animal Dermatology Group (ADG)' — vendor decisions likely sit with the corporate group, which is why this scores low. Biopsy and culture send-outs probably go to national labs with their own couriers.",
    addedISO: R3,
    sources: [
      {
        label: "Animal Dermatology Clinic — Richmond location page",
        url: "https://www.animaldermatology.com/locations/richmond",
        kind: "organization",
        retrievedISO: R3,
        note: "Source for the address, phone, hours, doctors and ADG ownership. The old vavetderm.com domain redirects here.",
      },
    ],
  },
  {
    id: "VET-2026-035",
    name: "Hanover County Animal Protection and Shelter",
    category: "Nonprofit / High-Volume",
    priority: "WATCH",
    fitScore: 32,
    address: "12471 Taylor Complex Lane",
    city: "Ashland",
    state: "VA",
    zip: "23005",
    phone: "(804) 365-6485",
    tel: "8043656485",
    website: "https://www.hanovercounty.gov/172/Animal-Protection-and-Shelter",
    hours: "Tue–Fri 10am–4:30pm; Sat 10am–3:30pm (by appointment); closed Sun–Mon",
    capabilities: [
      "County shelter providing veterinarian care for homeless or unwanted animals",
      "Holds rabies clinics in fall and winter",
      "Whether it has an on-site clinic or contract vets: not published",
    ],
    pitch:
      "For a county agency, documented custody on every outside transfer is the selling point — and Hanover is the county the Mechanicsville cluster already sits in.",
    openingQuestion:
      "When a shelter animal needs care beyond what's done on site, who takes it there — staff, or a contractor?",
    caution:
      "A county agency: it almost certainly buys through public procurement (Hanover posts its solicitations on eVA). Treat as a long-cycle lead, not a cold call that closes.",
    addedISO: R3,
    sources: [
      {
        label: "Hanover County — Animal Protection and Shelter",
        url: "https://www.hanovercounty.gov/172/Animal-Protection-and-Shelter",
        kind: "organization",
        retrievedISO: R3,
        note: "Source for the address, phone, hours, veterinary care for shelter animals and the rabies clinics.",
      },
      {
        label: "CARE — local shelters and emergency vets",
        url: "https://care-cats.org/contact-information-for-local-shelters-and-rescues/",
        kind: "directory",
        retrievedISO: R3,
        note: "Cross-checks the same address and phone.",
      },
    ],
  },
];

/* ─────────────────────────────── Derived views ──────────────────────────── */

export const VET_PRIORITY_ORDER: VetLeadPriority[] = ["HOT", "WARM", "WATCH"];

export const VET_CATEGORIES: VetLeadCategory[] = [
  "ER & Specialty Hub",
  "Urgent Care",
  "General Practice",
  "Nonprofit / High-Volume",
];

/**
 * Headline numbers for the page.
 *
 * Derived rather than written down, so a lead added next run cannot leave a
 * stale count on screen — the same rule the main board follows.
 */
export function vetLeadStats() {
  const total = vetLeads.length;
  const byPriority = VET_PRIORITY_ORDER.reduce<Record<VetLeadPriority, number>>(
    (acc, p) => {
      acc[p] = vetLeads.filter((l) => l.priority === p).length;
      return acc;
    },
    { HOT: 0, WARM: 0, WATCH: 0 }
  );

  // Every physical site, not every record — VVC and UrgentVet each carry more
  // than one, and a route is planned against sites rather than accounts.
  const sites = vetLeads.reduce(
    (n, l) => n + (l.sites?.length ?? 1),
    0
  );

  return {
    total,
    byPriority,
    sites,
    withPhone: vetLeads.filter((l) => Boolean(l.phone)).length,
    needsVerification: vetLeads.filter((l) => Boolean(l.caution)).length,
    sourcesCited: vetLeads.reduce((n, l) => n + l.sources.length, 0),
  };
}

export function vetLeadById(id: string): VetLead | undefined {
  return vetLeads.find((l) => l.id === id);
}
