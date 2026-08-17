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
      "They close Sunday. That closure is itself the conversation: somebody is covering those cases elsewhere, and whatever has to move on Monday morning is backed up.",
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
      "Emergency: Sunday 7am – Wednesday 7pm; Thursday closed; Friday 7am – 7pm. Specialty by appointment.",
    capabilities: [
      "Emergency and specialty referral",
      "On-site MRI and advanced imaging",
      "Specialists work directly with the referring primary-care veterinarian",
    ],
    pitch:
      "Worth a call, but expect a longer road than the independents — BluePearl is a national chain and vendor decisions rarely sit with the hospital. The genuinely interesting detail is the hours: emergency coverage stops Wednesday evening and does not resume until Friday morning. Those cases go somewhere else, and something has to follow them.",
    openingQuestion:
      "When your emergency service is closed Thursday, where do those cases go — and how do the records and any samples get back here afterwards?",
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
    siteCount: 3,
    sites: [
      {
        label: "Midlothian",
        address: "14300 Winterview Pkwy, Suite 106, Midlothian, VA 23113",
        phone: "(804) 924-0404",
        tel: "8049240404",
      },
      {
        label: "Short Pump",
        address: "11521 W Broad St, Henrico, VA 23233",
        phone: "(804) 533-7733",
        tel: "8045337733",
      },
      {
        label: "Carytown",
        address: "3531 Ellwood Ave, Richmond, VA 23221",
        phone: "(804) 362-0202",
        tel: "8043620202",
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
      "Two cautions. The addresses come from the Richmond Animal League directory, and UrgentVet's own location finder did not list the Virginia clinics in the page the engine read — confirm each address on the call. And with 101 clinics nationally, vendor approval may well sit above the clinic manager.",
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
    name: "Better Pet — Mechanicsville",
    category: "Urgent Care",
    priority: "WARM",
    fitScore: 66,
    address: "7138 Mechanicsville Turnpike",
    city: "Mechanicsville",
    state: "VA",
    zip: "23111",
    phone: "(804) 442-2713",
    tel: "8044422713",
    capabilities: [
      "Urgent care serving the Hanover / Mechanicsville side of the metro",
      "The north-east corner of the radius, where the ER hubs are furthest away",
    ],
    pitch:
      "Geography is the argument. Mechanicsville is the furthest point in the metro from every 24-hour hub on this list, which makes the drive to an emergency hospital long enough that someone has already thought about how to handle it.",
    openingQuestion:
      "Mechanicsville is a fair drive from any of the 24-hour hospitals — when you refer a case in, does anything have to follow it, and who drives that?",
    caution:
      "Directory-sourced only. Confirm the address and phone on the call.",
    addedISO: R,
    sources: [RAL_DIRECTORY],
  },

  /* ─────────────────────── Nonprofit / high volume ─────────────────────── */
  {
    id: "VET-2026-009",
    name: "Richmond SPCA — Susan M. Markel Veterinary Hospital",
    category: "Nonprofit / High-Volume",
    priority: "WARM",
    fitScore: 76,
    address: "2519 Hermitage Road",
    city: "Richmond",
    state: "VA",
    zip: "23220",
    phone: "(804) 521-1330",
    tel: "8045211330",
    website:
      "https://richmondspca.org/pet-help/veterinary-services/full-service-hospital/",
    hours: "Monday–Friday 8:00am–12:00pm and 1:00pm–6:00pm; closed weekends",
    capabilities: [
      "High-volume spay and neuter surgery",
      "In-house laboratory and radiology services",
      "Wound care, palliative care, acupuncture, laser therapy, geriatric care",
    ],
    pitch:
      "A high-volume nonprofit hospital runs on predictable daily throughput and a tight budget — the two conditions that make an outsourced route cheaper than paying clinical staff to drive. Nonprofits also care about who they buy from, which is where SWaM certification actually counts for something.",
    openingQuestion:
      "With the surgery volume you run, what leaves the building each day — samples, supplies, animals moving to or from foster and partner shelters — and who moves it now?",
    caution:
      "The page notes temporary operating hours from April 2026 that cut the hospital to Monday–Thursday. Confirm the current schedule before proposing a route built on five days.",
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
