/**
 * lib/data/opportunities.ts
 * ---------------------------------------------------------------------------
 * LIVE DATA — real opportunities surfaced by the Opportunity Finder and scored
 * by the Lead Qualifier.
 *
 * Run 1: 2026-07-21 (15 records)
 * Run 2: 2026-07-28 (14 new records; run-1 records re-verified and corrected)
 * Run 3: 2026-08-10 (14 new records; five earlier records corrected — see
 *         weekly-report.ts corrections[] for what prior runs got wrong)
 * Run 4: 2026-08-17 (first run that CITES ITS SOURCES — see SourceLink below.
 *         Zero open public solicitations found; the new supply this week is
 *         the veterinary lead run in lib/data/vet-leads.ts)
 * Run 5: 2026-08-25 (two new records — one eVA courier IFB, one veterinary
 *         aftercare lane; supply deliberately held back while the backlog grows)
 * Run 6: 2026-09-30, labelled "9/30" (nine new records — the first federal
 *         courier requirement inside Richmond, one open City RFP, two LTC
 *         pharmacies, two community health centres; swept 30 Sep – 2 Oct)
 *
 * The 2026-07-28 sweep was run against SAM.gov and eVA directly in a live
 * browser session — not from cached third-party mirrors — so the federal and
 * Commonwealth findings below reflect what those systems actually showed on
 * that date. Every record cites a real organization, solicitation, or program.
 * Estimated values are either published contract ceilings or CSL-estimated
 * annual revenue potential (noted per record).
 * ---------------------------------------------------------------------------
 */

export type OpportunitySource =
  | "SAM.gov"
  | "eVA"
  | "DMAS / Broker"
  | "VA Medical Center"
  | "Hospital System"
  | "Independent Lab"
  | "Pharmacy"
  | "Courier Network"
  | "Veterinary"
  | "Commercial";

export type OpportunityStatus =
  | "Found"
  | "Qualified"
  | "Contacted"
  | "Meeting"
  | "Bid"
  | "Won"
  | "Lost";

/**
 * Where a finding actually came from.
 *
 * Added in run 4 and MANDATORY for every record from that run onwards. The
 * reason is a real conversation: when Darren calls a lab manager and is asked
 * "how did you find us?", "our AI found you" is not an answer that builds
 * trust — "your own laboratory services page lists ten draw sites feeding the
 * Glen Allen core lab" is. It is also the only way anyone can audit whether
 * this engine is reporting or inventing.
 *
 * Rules for populating it:
 *   - Only URLs the engine actually opened. Never a plausible-looking guess.
 *   - `retrievedISO` is the date it was opened, so a stale citation is
 *     obvious rather than silently trusted.
 *   - A registry search URL is honest when there is no permalink (eVA award
 *     documents, for example, are behind a CAPTCHA); label it `kind: "search"`
 *     rather than dressing it up as a direct record.
 *   - If the engine cannot cite it, it does not go in the record.
 */
export type SourceKind =
  /** A posted solicitation, IFB/RFP, or Future Procurement notice. */
  | "solicitation"
  /** An award notice, contract, or spending record. */
  | "award"
  /** A government or professional registry entry. */
  | "registry"
  /** The organization's own website. */
  | "organization"
  /** A rule, form, regulation, or agency guidance document. */
  | "regulation"
  /** A directory or referral list maintained by a third party. */
  | "directory"
  /** News or trade coverage. */
  | "news"
  /** A search URL, used where the underlying record has no stable permalink. */
  | "search";

export interface SourceLink {
  /** What the reader is clicking, e.g. "VPI Laboratory Services page". */
  label: string;
  url: string;
  kind: SourceKind;
  /** ISO date the engine actually opened this URL. */
  retrievedISO: string;
  /** What this source establishes — the reason it is cited. */
  note?: string;
}

export interface Opportunity {
  id: string;
  title: string;
  source: OpportunitySource;
  naics: string;
  location: string;
  dueDate: string; // ISO yyyy-mm-dd — action-by / target date where no hard deadline exists
  fitScore: number; // 0–100, scored by the Lead Qualifier
  status: OpportunityStatus;
  estValue: number;
  agency: string;
  description: string;
  whyItFits: string;
  suggestedAction: string;
  /** ISO date of the sweep that first surfaced this record. */
  addedISO?: string;
  /** Set when a hard, published deadline exists (vs. a CSL action-by target). */
  hardDeadline?: boolean;
  /**
   * Where this finding came from. Required for every record added in run 4
   * (2026-08-17) or later; absent on earlier records that predate the citation
   * rule, which the UI states plainly rather than hiding.
   */
  sources?: SourceLink[];
}

export const IS_SAMPLE_DATA = false;

/**
 * Every sweep the engine has run, oldest first. This is what gives each
 * opportunity a permanent W1 / W2 label — "New this week" alone would silently
 * become wrong on the next run, whereas "W2" stays true forever.
 * Add one entry per run.
 */
export const SWEEPS = [
  { run: 1, label: "W1", iso: "2026-07-21", weekOf: "2026-07-20" },
  { run: 2, label: "W2", iso: "2026-07-28", weekOf: "2026-07-27" },
  { run: 3, label: "W3", iso: "2026-08-10", weekOf: "2026-08-10" },
  { run: 4, label: "W4", iso: "2026-08-17", weekOf: "2026-08-17" },
  { run: 5, label: "W5", iso: "2026-08-25", weekOf: "2026-08-24" },
  // Labelled by date rather than "W6" at Darren's request — weeks were missed
  // between runs, so a date says more than a run number.
  { run: 6, label: "9/30", iso: "2026-09-30", weekOf: "2026-09-28" },
] as const;

export type Sweep = (typeof SWEEPS)[number];

/** ISO date of the most recent sweep. */
export const LATEST_RUN_ISO = SWEEPS[SWEEPS.length - 1].iso;

/** Which sweep first surfaced this opportunity. */
export function sweepFor(o: Pick<Opportunity, "addedISO">): Sweep | undefined {
  return SWEEPS.find((s) => s.iso === o.addedISO);
}

/**
 * The first sweep that cited its sources. Records added before this ran under
 * the old rule, so the UI can say "found before the engine began citing
 * sources" instead of implying the citation was lost.
 */
export const SOURCES_REQUIRED_FROM_ISO = "2026-08-17";

/** True when a record is old enough that a missing citation is expected. */
export function predatesSourceCitations(
  o: Pick<Opportunity, "addedISO">
): boolean {
  return !o.addedISO || o.addedISO < SOURCES_REQUIRED_FROM_ISO;
}

export const opportunities: Opportunity[] = [
  // ───────────────────── 9/30 sweep (run 6) — 2026-09-30 ─────────────────────
  // Labelled "9/30" rather than "W6" because weeks were missed between runs.
  {
    id: "OPP-2026-047",
    title:
      "Richmond VAMC — HLA Transplant Testing + Courier (Sources Sought 36C24627Q0029): courier leg to the VCU HLA lab",
    source: "VA Medical Center",
    naics: "492110",
    location: "Richmond VA Medical Center to the VCU HLA laboratory, Richmond, VA",
    dueDate: "2026-10-09",
    fitScore: 78,
    status: "Found",
    estValue: 8600,
    agency:
      "Department of Veterans Affairs — Network Contracting Office 6 (36C246), Hampton VA, for the Richmond VAMC laboratory",
    description:
      "The first federal notice in six sweeps that names a courier requirement INSIDE Richmond. On 14 September 2026 the VA's Network Contracting Office 6 published a sources-sought notice titled 'VCU Heart and Renal Lab and Transplant Testing' for Human Leukocyte Antigen (HLA) testing for the Richmond VAMC — and the notice is explicit that the contractor must also 'provide transportation/courier services to transport samples from Richmond VAMC to VCU HLA laboratory'. It is registered under NAICS 621511 (Medical Laboratories), so the prime will be a laboratory, not a courier: CSL cannot bid it alone. The response window closed 21 September and the notice goes inactive on 6 October; a solicitation should follow. Value is a CSL estimate for the courier leg only (roughly three runs a week at about $55), not a published figure — transplant crossmatch volume is low but time-critical.",
    whyItFits:
      "This is exactly the work CSL is built for, on its home turf: a short, scheduled, chain-of-custody specimen run between two Richmond buildings, for a federal client, where the lab that wins needs a local courier it can name in its quote. It is also the cleanest possible subcontract — the prime is a lab with no van, and the courier leg is written into the scope rather than implied.",
    suggestedAction:
      "This week, before the notice goes inactive on 6 October: email the contracting officer, Gordon Burns (gordon.burns@va.gov, 757-251-4333), to ask to be added to the interested-vendors list for the follow-on solicitation and whether the courier leg may be performed by a subcontractor. Do NOT pitch him — contracting officers do not buy from emails. Then find who at VCU Health's HLA laboratory would respond to the solicitation and offer CSL as the named courier on their quote, with the e-POD and chain-of-custody sample records in hand. Watch SAM.gov for the solicitation under the same notice number.",
    addedISO: "2026-09-30",
    sources: [
      {
        label: "SAM.gov — 36C24627Q0029 VCU Heart and Renal Lab and Transplant Testing (sources sought)",
        url: "https://sam.gov/opp/450cbb12ead845878b25ac0b116d504c/view",
        kind: "solicitation",
        retrievedISO: "2026-10-02",
        note:
          "Opened 2 Oct 2026. Establishes: sources sought published 14 Sep 2026, response date 21 Sep, inactive 6 Oct; NAICS 621511; no set-aside; contracting office NCO 6, 100 Emancipation Dr, Hampton VA; primary contact Gordon Burns; and clause (i) — 'The Contractor shall provide transportation/courier services to transport samples from Richmond VAMC to VCU HLA laboratory.' Results are to be faxed back to the VA lab on 804-675-5518.",
      },
      {
        label: "SAM.gov — active opportunities, keyword 'specimen transport'",
        url:
          "https://sam.gov/search/?index=opp&page=1&pageSize=25&sort=-modifiedDate&sfm%5Bstatus%5D%5Bis_active%5D=true&sfm%5BsimpleSearch%5D%5BkeywordRadio%5D=ALL&sfm%5BsimpleSearch%5D%5BkeywordTags%5D%5B0%5D%5Bkey%5D=specimen%20transport&sfm%5BsimpleSearch%5D%5BkeywordTags%5D%5B0%5D%5Bvalue%5D=specimen%20transport",
        kind: "search",
        retrievedISO: "2026-10-02",
        note: "The search that surfaced it: 5 active results nationwide, and this is the only one with a Virginia place of performance.",
      },
    ],
  },
  {
    id: "OPP-2026-048",
    title:
      "Richmond City Justice Center — Inmate Pharmaceutical Services RFP #260019872: delivery subcontract to a bidding pharmacy",
    source: "eVA",
    naics: "492210",
    location: "Richmond City Justice Center, 900 E Broad St, Richmond, VA 23219",
    dueDate: "2026-10-08",
    hardDeadline: true,
    fitScore: 55,
    status: "Found",
    estValue: 15600,
    agency: "City of Richmond (for the Richmond City Sheriff's Office)",
    description:
      "An OPEN City of Richmond RFP — confirmed live on eVA on 2 October 2026 as RFP 127938, status Open, closing 8 October 2026 at 2:00pm. It asks for comprehensive pharmacy services at the Richmond City Justice Center in coordination with the existing medical provider. The listed procurement contact is Sue Demery (sue.demery@rva.gov, 804-646-1874). CSL is not a pharmacy and cannot be the prime; the opening is as the local, SWaM-certified delivery subcontractor named in a pharmacy's proposal. Value is a CSL estimate (about 260 weekday deliveries at $60) and assumes daily delivery, which the RFP may not require.",
    whyItFits:
      "Scheduled medication delivery into a secure building with documented custody is precisely CSL's service, inside downtown Richmond. A SWaM subcontractor also helps a prime meet the City's small-business participation expectations, which is a reason for a pharmacy to take the call.",
    suggestedAction:
      "Six days is tight but possible. Today: download the RFP from eVA and read the delivery frequency, security clearance and small-business subcontracting sections — if delivery is by mail-order or the prime's own fleet, stop there. If not, identify likely pharmacy bidders (pre-proposal sign-in sheet or planholder list if the City publishes one) and send each a one-page subcontract offer by 5 October. Procedural questions only to Sue Demery, and no contact with Sheriff's Office staff during the procurement — that can disqualify the prime.",
    addedISO: "2026-09-30",
    sources: [
      {
        label: "eVA public opportunity search — '260019872'",
        url: "https://mvendor.cgieva.com/Vendor/public/AllOpportunities.jsp",
        kind: "search",
        retrievedISO: "2026-10-02",
        note:
          "eVA has no stable permalink, so the search is cited. Opened 2 Oct 2026: one result, 'RFP #260019872 Richmond City Justice Center Inmate...', Status Open, RFP 127938, City of Richmond Government, 900 E Broad St Richmond VA 23219, closing 10/8/26 2:00 PM.",
      },
      {
        label: "LightRFP — listing of RFP #260019872",
        url: "https://www.lightrfp.com/marketplace/bid/VA_EVA-IV127938/rfp-260019872-richmond-city-justice-center-inmate-pharmaceutical-services",
        kind: "solicitation",
        retrievedISO: "2026-09-30",
        note:
          "Aggregator copy of the eVA notice: posted 4 Sep 2026, the scope language, the work address and the procurement contact. Superseded as the primary citation by the eVA search above.",
      },
    ],
  },
  {
    id: "OPP-2026-049",
    title:
      "Omnicare of Richmond — long-term-care pharmacy changing hands (CVS sale to GenieRx, closing expected October 2026)",
    source: "Pharmacy",
    naics: "492210",
    location: "8575 Magellan Pkwy, Ste 100, Richmond, VA 23227",
    dueDate: "2026-10-31",
    fitScore: 65,
    status: "Found",
    estValue: 46800,
    agency:
      "Omnicare of Richmond (legal name Neighborcare Pharmacy of Virginia, LLC), being acquired by GenieRx Holdings",
    description:
      "The NPI registry lists this site as a long-term-care pharmacy serving skilled-nursing and congregate-living facilities; a pharmacy directory lists it as open 24 hours with delivery, on (833) 342-5704. Omnicare filed for Chapter 11 in September 2025 and the court approved a $250M sale to GenieRx (Milrose Capital and Integro); trade press reported on 18 September 2026 that closing is expected in October 2026 and that what it means for facilities remains unresolved. Value is a CSL estimate for one dedicated facility route (about 260 days at $180), not a published figure.",
    whyItFits:
      "A new owner inheriting a 24-hour delivery pharmacy is the one moment when delivery vendors are genuinely up for review — and the nursing homes it serves have a reason to want a dependable local backup while the ownership settles.",
    suggestedAction:
      "Call (833) 342-5704 and ask for the Richmond pharmacy manager or the delivery / operations lead. Offer STAT, overflow and backup routes priced per stop, with HIPAA handling and e-POD. Stay strictly factual — do not comment on the bankruptcy or any litigation. Separately, the same offer can go to Richmond nursing-home administrators as backup coverage, without criticising Omnicare.",
    addedISO: "2026-09-30",
    sources: [
      {
        label: "NPI profile 1689753907 — Omnicare of Richmond",
        url: "https://npiprofile.com/npi/1689753907",
        kind: "registry",
        retrievedISO: "2026-09-30",
        note: "Legal name, Magellan Parkway address, long-term-care pharmacy classification and facility-delivery focus.",
      },
      {
        label: "WellRx — Omnicare of Richmond pharmacy detail",
        url: "https://www.wellrx.com/find-a-pharmacy-near-me/pharmacydetail/omnicare%20of%20richmond/4817423/",
        kind: "directory",
        retrievedISO: "2026-09-30",
        note: "Phone (833) 342-5704, open 24 hours, offers delivery. Directory-sourced — confirm on the call.",
      },
      {
        label: "Hoodline — Omnicare bankruptcy sets up $250M sale to GenieRx (18 Sep 2026)",
        url: "https://hoodline.com/2026/09/omnicare-bankruptcy-sets-up-250-million-sale-to-genierx-as-long-term-care-pharmacy-sector-faces-pressure/",
        kind: "news",
        retrievedISO: "2026-09-30",
        note: "The sale, the expected October 2026 closing, and delivery continuity flagged as an open question.",
      },
      {
        label: "Skilled Nursing News — Omnicare wins approval for sale to GenieRx (May 2026)",
        url: "https://skillednursingnews.com/2026/05/long-term-care-pharmacy-giant-omnicare-wins-approval-for-sale-to-genierx/",
        kind: "news",
        retrievedISO: "2026-09-30",
        note: "Court approval of the sale; the September 2025 Chapter 11 filing; facilities served in 47 states.",
      },
    ],
  },
  {
    id: "OPP-2026-050",
    title:
      "Family Care Pharmacy — independent LTC pharmacy (Richmond + Mechanicsville): after-hours STAT & overflow delivery",
    source: "Pharmacy",
    naics: "492210",
    location: "2576 Gayton Centre Dr, Richmond, VA 23238 and 7016 Lee Park Rd, Mechanicsville, VA 23111",
    dueDate: "2026-10-24",
    fitScore: 70,
    status: "Found",
    estValue: 23400,
    agency: "Family Care Pharmacy (family-owned)",
    description:
      "A family-owned long-term-care pharmacy serving assisted living, Alzheimer's care units, nursing facilities and adult care facilities across the Richmond area, advertising timely delivery and 24/7/365 emergency service from Richmond and Mechanicsville sites (plus one in Remington). Its own site names Vice President Timothy A. Dowdy (804-968-5530, tdowdy@familycareltc.com) and Richmond Pharmacy Director Tim Oley, RPh (804-740-3300). No driver postings were found, so whether it runs its own drivers is not known. Value is a CSL estimate: about ten STAT or after-hours runs a week at $45.",
    whyItFits:
      "A local pharmacy that promises 24/7 emergency delivery has to staff 2am runs somehow; a vetted, HIPAA-trained, on-call backup courier inside the radius is the obvious answer. The Mechanicsville site on Lee Park Road is also next door to the Mechanicsville vet cluster on the Vet Leads board — one route, two industries.",
    suggestedAction:
      "Email, then call, Tim Dowdy. Offer a 30-day trial of on-call after-hours and weekend STAT coverage, with sample e-POD and chain-of-custody records. Open by asking what they do today for a 2am emergency run — do not assume they are unhappy with their current drivers.",
    addedISO: "2026-09-30",
    sources: [
      {
        label: "Family Care Pharmacy — homepage",
        url: "https://www.familycareltc.com/",
        kind: "organization",
        retrievedISO: "2026-09-30",
        note: "Long-term-care focus and Richmond-area service area.",
      },
      {
        label: "Family Care Pharmacy — About",
        url: "https://www.familycareltc.com/copy-of-about",
        kind: "organization",
        retrievedISO: "2026-09-30",
        note: "Timely delivery and the 24/7/365 emergency-service promise.",
      },
      {
        label: "Family Care Pharmacy — Locations",
        url: "https://www.familycareltc.com/copy-of-locations",
        kind: "organization",
        retrievedISO: "2026-09-30",
        note: "Both addresses, phone numbers and the named contacts.",
      },
      {
        label: "ZipRecruiter — Family Care Pharmacy jobs",
        url: "https://www.ziprecruiter.com/co/Family-Care-Pharmacy/Jobs/-in-Mechanicsville,VA",
        kind: "directory",
        retrievedISO: "2026-09-30",
        note: "Only a pharmacy technician posting; no driver postings.",
      },
    ],
  },
  {
    id: "OPP-2026-051",
    title:
      "Capital Area Health Network — 4-Site Community Health Center Loop (specimens, pharmacy, supplies)",
    source: "Commercial",
    naics: "492110",
    location:
      "719 N. 25th St (Church Hill); 2809 North Ave (Northside & corporate); 2740 Bensley Commons Blvd (Chesterfield); 5855 Bremo Rd Ste 302",
    dueDate: "2026-10-31",
    fitScore: 60,
    status: "Found",
    estValue: 16900,
    agency: "Capital Area Health Network (federally funded community health center)",
    description:
      "A community health center network with four Richmond-area medical sites and a mobile unit, offering primary care, pediatrics, dental, behavioural health and pharmacy (pharmacy line 804-215-2938). The flagship Vernon J. Harris centre has offered pharmacy services since it opened in 1999. Main line 804-780-0840. Its website does not describe its lab arrangements, so the specimen lane is a question, not a finding. Value is a CSL estimate: one daily weekday loop of the four sites at about $65.",
    whyItFits:
      "Four sites spread across the City, Henrico and Chesterfield with one pharmacy is the classic shape of a standing inter-site loop, all inside the radius — and grant-funded buyers weigh SWaM certification more heavily than commercial ones.",
    suggestedAction:
      "Call 804-780-0840 and ask for the COO or director of operations. Open by asking how specimens, medications and supplies move between the four sites today; offer a fixed-price daily loop with e-POD logs only once that answer is in. Do not claim a lab or 340B arrangement the site does not state.",
    addedISO: "2026-09-30",
    sources: [
      {
        label: "Capital Area Health Network — homepage",
        url: "https://cahealthnet.org/",
        kind: "organization",
        retrievedISO: "2026-09-30",
        note: "The four site addresses and the pharmacy and main phone numbers.",
      },
      {
        label: "Capital Area Health Network — About",
        url: "https://cahealthnet.org/about/",
        kind: "organization",
        retrievedISO: "2026-09-30",
        note: "Services list including pharmacy; corporate address.",
      },
      {
        label: "Capital Area Health Network — Vernon J. Harris Medical Center",
        url: "https://cahealthnet.org/vernon-j-harris-medical-center/",
        kind: "organization",
        retrievedISO: "2026-09-30",
        note: "The flagship site with pharmacy services since 1999, and its hours.",
      },
    ],
  },
  {
    id: "OPP-2026-052",
    title: "Daily Planet Health Services — 4-Clinic Prescription & Specimen Loop (downtown + Southside)",
    source: "Commercial",
    naics: "492110",
    location: "517 & 511 W. Grace St, 180 E. Belt Blvd, 24 E. Cary St, Richmond, VA",
    dueDate: "2026-11-06",
    fitScore: 55,
    status: "Found",
    estValue: 13000,
    agency: "Daily Planet Health Services (federally funded community health center)",
    description:
      "Daily Planet runs four clinical sites in Richmond — two on W. Grace Street, one on E. Belt Boulevard in Southside and one on E. Cary Street — all reached on (804) 783-2505. The 517 W. Grace site lists primary care, behavioural health, addiction treatment, dental, PHARMACY and case management; Southside and East Cary list primary and dental care. Value is a CSL estimate: a daily weekday loop at about $50.",
    whyItFits:
      "One pharmacy and three other clinics, all in the centre of CSL's radius: filled prescriptions have to reach patients seen at Southside and East Cary somehow.",
    suggestedAction:
      "Call (804) 783-2505 and ask for operations or the pharmacy director. Propose moving filled prescriptions from the Grace Street pharmacy to the other three sites, plus specimen pickup. Patient dignity first — this population includes people in addiction treatment, so discretion is part of the pitch, not an afterthought.",
    addedISO: "2026-09-30",
    sources: [
      {
        label: "Daily Planet Health Services — Locations",
        url: "https://dailyplanetva.org/locations/",
        kind: "organization",
        retrievedISO: "2026-09-30",
        note: "All four addresses, services by site, the pharmacy at 517 W. Grace, and the shared phone line.",
      },
    ],
  },
  {
    id: "OPP-2026-053",
    title: "Shady Grove Fertility — Richmond: temperature-logged specimen & frozen-tissue moves between offices",
    source: "Commercial",
    naics: "492110",
    location: "7607 Forest Ave, Suite 400, Richmond, VA 23229 (page also references a Stony Point office)",
    dueDate: "2026-11-13",
    fitScore: 50,
    status: "Found",
    estValue: 9600,
    agency: "Shady Grove Fertility (SGF Richmond)",
    description:
      "The Forest Avenue office offers IVF, egg freezing and donor-egg programmes, with an on-site laboratory and 7–10am monitoring hours, and its page references a separate Stony Point office. Value is a CSL estimate: about four frozen-tissue or inter-office transports a month at $200. The SGF announcement of how the Richmond practices combined could not be opened, so the date of that change is not claimed.",
    whyItFits:
      "Two offices and an on-site lab create the most time- and temperature-sensitive specimen moves in human medicine, where a documented chain of custody and a temperature log are the whole product.",
    suggestedAction:
      "Ask the main office for the lab director or practice administrator. Before quoting, ask what dry-shipper and cryogenic handling standards they require — CSL must not offer frozen-tissue transport it is not equipped to do. Never use the published emergency lines for a sales call.",
    addedISO: "2026-09-30",
    sources: [
      {
        label: "Shady Grove Fertility — Richmond, Henrico Doctors' Forest fertility center",
        url: "https://www.shadygrovefertility.com/locations/virginia/richmond-henrico-doctors-forest-fertility-center/",
        kind: "organization",
        retrievedISO: "2026-09-30",
        note: "Address, on-site lab, services, monitoring hours and the reference to a Stony Point office.",
      },
    ],
  },
  {
    id: "OPP-2026-054",
    title: "New Kent Direct Care — new membership primary-care clinic with in-house lab (opened September 2026)",
    source: "Commercial",
    naics: "492110",
    location: "3215 Rock Creek Villa Drive, Quinton, VA (New Kent County) — at the edge of the 25-mile radius",
    dueDate: "2026-10-16",
    fitScore: 35,
    status: "Found",
    estValue: 6200,
    agency: "New Kent Direct Care",
    description:
      "Richmond BizSense reported on 29 September 2026 that this 1,500 sq ft clinic — three exam rooms and a laboratory — was slated to open that month, self-funded with $100,000 plus a $10,000 New Kent EDA grant. Services include primary care, same-day or next-day urgent visits, lab testing and chronic care management, with additional testing ordered through Labcorp. Founders include Christopher Lindsay (former VDH COO) and Medical Director Matt Nottingham; operations are run by Jaynie Lindsay. Value is a CSL estimate: about three runs a week at $40.",
    whyItFits:
      "A brand-new independent clinic has no vendor habits yet. It is small, and it is the one record this run that is genuinely new since the last sweep.",
    suggestedAction:
      "A relationship play, not a revenue one. Contact Jaynie Lindsay and offer pay-per-run specimen and member medication delivery. Ask first what Labcorp's own pickup covers and do not pitch against it. Check the drive time before quoting — Quinton is close to the edge of the radius.",
    addedISO: "2026-09-30",
    sources: [
      {
        label: "Richmond BizSense — New Kent locals launch direct primary care clinic (29 Sep 2026)",
        url: "https://richmondbizsense.com/2026/09/29/new-kent-locals-launch-direct-primary-care-clinic-in-their-home-county/",
        kind: "news",
        retrievedISO: "2026-09-30",
        note: "The opening, address, in-house lab, Labcorp ordering, founders and staff, and funding.",
      },
    ],
  },
  {
    id: "OPP-2026-055",
    title: "Dispatch — 'Courier Partners' programme, Greater Richmond (fill idle van hours)",
    source: "Courier Network",
    naics: "492210",
    location: "Greater Richmond (Henrico, Chesterfield, Mechanicsville, Glen Allen, Midlothian)",
    dueDate: "2026-10-15",
    fitScore: 40,
    status: "Found",
    estValue: 26000,
    agency: "Dispatch (dispatchit.com)",
    description:
      "Dispatch runs last-mile and local courier work across Greater Richmond with real-time tracking and proof of delivery. Cargo van is one of its vehicle classes, and alongside individual-driver onboarding it runs a separate 'Courier Partners' programme for delivery businesses. Its Richmond page does not mention medical deliveries. Value is a CSL estimate, GROSS before vehicle costs: about two idle-van days a week at $250.",
    whyItFits:
      "Utilisation, not strategy. With one van, every unbooked hour is lost revenue; network jobs fill those hours without any sales effort. It is scored low because it is non-medical and does nothing for CSL's positioning.",
    suggestedAction:
      "Apply as a Courier Partner, not as an individual driver, through the link on Dispatch's Richmond page — and only if the terms let CSL decline jobs that clash with medical routes. Keep cargo segregated: nothing that compromises the van's clean, HIPAA-controlled condition.",
    addedISO: "2026-09-30",
    sources: [
      {
        label: "Dispatch — Richmond location page",
        url: "https://www.dispatchit.com/company/locations/richmond",
        kind: "organization",
        retrievedISO: "2026-09-30",
        note: "Richmond coverage, the cargo-van class, and the driver and Courier Partners programmes.",
      },
    ],
  },

  // ───────────────────────── Run 5 — 2026-08-25 ─────────────────────────
  {
    id: "OPP-2026-045",
    title:
      "Library Courier Services — Staunton, Waynesboro & Augusta County (IFB 127152 / Bid H00226)",
    source: "eVA",
    naics: "492110",
    location: "Staunton, Waynesboro and Augusta County, VA",
    dueDate: "2026-09-10",
    hardDeadline: true,
    fitScore: 38,
    status: "Found",
    estValue: 24000,
    agency: "City of Staunton, with the City of Waynesboro and Augusta County",
    description:
      "A three-locality joint procurement for courier services running between the Staunton, Waynesboro and Augusta County public libraries, published on eVA and closing 10 September 2026 at 2:00pm. It is recorded here for one reason: it is the FIRST open courier notice eVA has produced in five consecutive sweeps. For four runs the status facet showed no open bucket at all for courier, and the reasonable conclusion was that the channel was dead. It is not dead — it is just rarely local. That is a different and more useful fact.",
    whyItFits:
      "On paper it fits perfectly: a small, scheduled, multi-stop inter-site run between fixed public buildings, exactly the shape of work CSL is built for, published through a channel CSL is already registered on. On the ground it does not fit at all — see the action note.",
    suggestedAction:
      "DO NOT BID. Staunton is roughly a hundred miles from Richmond, four times CSL's stated 25-mile radius, and a one-van operation cannot run a daily Shenandoah Valley library circuit without either abandoning the Richmond market or losing money on the fuel. The correct use of this record is as evidence, not as a target: it tells Darren that eVA does still produce courier work, that it appears with about three weeks of notice, and that the next one might be closer. Keep the eVA courier search as a weekly check on that basis. If a similar joint-locality courier IFB ever appears for Richmond, Henrico, Chesterfield or Hanover, it should go straight to the top of the board.",
    addedISO: "2026-08-25",
    sources: [
      {
        label: "eVA public opportunity search — courier, STATUS facet",
        url: "https://mvendor.cgieva.com/Vendor/public/AllOpportunities.jsp",
        kind: "search",
        retrievedISO: "2026-08-25",
        note:
          "eVA award and solicitation documents sit behind a session-bound search rather than a stable permalink, so the search page is cited honestly rather than a fabricated direct URL. The courier query returned 295 records with the STATUS facet reading Open 1 — this notice — plus Awarded 157, Closed 36, Bids Opened 5, Intent Posted 5, No Award 63, Cancelled 9, Contact Buyer 19. Record shown as 'Bid # H00226 - Library Courier Services, IFB 127152, City of Staunton - Augusta County, City of Staunton, City of Waynesboro, VA', closing 9/10/26 2:00 PM.",
      },
    ],
  },
  {
    id: "OPP-2026-046",
    title:
      "Veterinary Cremation & Aftercare — Overflow / Subcontract Collection Lane, Richmond Metro",
    source: "Veterinary",
    naics: "492110",
    location:
      "Sandston, King William, Richmond (Chamberlayne Ave) and the practices they collect from across the metro",
    dueDate: "2026-09-12",
    fitScore: 72,
    status: "Found",
    estValue: 31000,
    agency:
      "Agape Pet Services (Gateway Services Inc.), Caring Pet Cremation Services, Pet Cremation Services & Richmond Pet Memorial Park",
    description:
      "Run 1 of the veterinary sweep named cremation and aftercare transport as one of five genuinely uncovered lanes and then listed nobody in it. This run populated it. Three operators serve the Richmond metro: Agape in Sandston, part of the multi-state Gateway Services and the aggregator that collects from practices across the metro; Caring Pet Cremation in King William, covering fourteen counties out of a single crematory; and Richmond Pet Memorial Park on Chamberlayne Avenue, the only one offering burial as well as cremation, which means a fixed destination inside the city. All three are on the Vet Leads board as VET-2026-021 through 023.",
    whyItFits:
      "Aftercare collection is the one veterinary lane with no incumbent courier network defending it — IDEXX and Antech do not touch it, because it is not diagnostics. It is scheduled rather than on-demand, it is dignified and low-volume rather than time-critical, and it is exactly the kind of work a single compliant van can do well. One aggregator signature covers many clinics, which is worth more than five individual practice accounts.",
    suggestedAction:
      "Approach as OVERFLOW CAPACITY, never as 'let us be your courier'. Two of the three already run their own pickups and say so on their own websites, so the displacement pitch gets corrected in the first thirty seconds. Start with Agape in Sandston: it is inside the radius, it aggregates from many practices, and it publishes a 'Become a Provider' path. Ask how many metro practices they collect from in a week and where their own fleet gets stretched. Before quoting Caring Pet Cremation, price the King William leg deliberately — their collection stops are inside CSL's radius but their crematory is about 35 miles out, and that return leg is where this turns unprofitable if it is quoted casually.",
    addedISO: "2026-08-25",
    sources: [
      {
        label: "Agape Pet Services — homepage and Sandston contact page",
        url: "https://agapepetservices.com/contact-sandston/",
        kind: "organization",
        retrievedISO: "2026-08-25",
        note:
          "Establishes the Sandston facility at 1001 Techpark Place, (804) 737-8400, the Gateway Services Inc. parent, the nine-facility multi-state footprint, and the 'Become a Provider' path for veterinary practices. Hours and pickup terms are NOT published and are not claimed here.",
      },
      {
        label: "Caring Pet Cremation Services — homepage",
        url: "https://caringpetva.com/",
        kind: "organization",
        retrievedISO: "2026-08-25",
        note:
          "Their own statement that they collect from homes and veterinary offices and return remains within 48 hours, plus the fourteen-county service area — which is why this is an overflow pitch rather than a new-lane pitch.",
      },
      {
        label: "Pet Cremation Services & Richmond Pet Memorial Park — homepage",
        url: "https://www.animalcremationinrichmondva.com/",
        kind: "organization",
        retrievedISO: "2026-08-25",
        note:
          "Establishes the Chamberlayne Avenue address and the on-site pet cemetery. Whether they collect from veterinary clinics is NOT stated on their site and is deliberately not asserted.",
      },
    ],
  },

  // ───────────────────────── Run 4 — 2026-08-17 ─────────────────────────
  // First run under the citation rule: every record from here down carries a
  // `sources` array of URLs the engine actually opened.
  {
    id: "OPP-2026-044",
    title:
      "Richmond Veterinary Referral Network — Inter-Hospital, STAT & After-Hours Transfer Lane",
    source: "Veterinary",
    naics: "492110",
    location:
      "Henrico (Short Pump), Richmond, Midlothian, Manakin-Sabot, Mechanicsville, VA",
    dueDate: "2026-08-28",
    fitScore: 87,
    status: "Found",
    estValue: 52000,
    agency:
      "Richmond-metro veterinary emergency, specialty and multi-site practices",
    addedISO: "2026-08-17",
    sources: [
      {
        label: "Virginia Veterinary Centers — locations",
        url: "https://www.virginiaveterinarycenters.com/locations",
        kind: "organization",
        retrievedISO: "2026-08-17",
        note:
          "Confirms a three-hospital group: Short Pump, Midlothian and Fredericksburg. Two of the three sit inside CSL's radius and the third defines a standing 50-mile lane.",
      },
      {
        label: "Veterinary Referral & Critical Care (VRCC)",
        url: "https://vrccvet.com/",
        kind: "organization",
        retrievedISO: "2026-08-17",
        note:
          "Privately owned since 1997, referral-only for internal medicine and surgery, with on-site CT, MRI and in-house laboratory testing.",
      },
      {
        label: "Richmond Animal League — emergency and urgent care clinic list",
        url: "https://www.ral.org/posts/emergency-and-urgent-care-clinics",
        kind: "directory",
        retrievedISO: "2026-08-17",
        note:
          "The referral list Richmond pet owners are handed. It is how the metro's emergency network maps out — and it is partly STALE, which is itself useful: two of its addresses no longer match the practices' own sites.",
      },
      {
        label: "IDEXX Reference Laboratories — lab courier management",
        url: "https://www.idexx.com/en/veterinary/reference-laboratories/lab-courier-management/",
        kind: "organization",
        retrievedISO: "2026-08-17",
        note:
          "The disqualifier, cited deliberately. IDEXX runs its own courier network with online pickup scheduling, and Antech does the same. Routine reference-lab send-outs are already bundled into the practice's lab contract — CSL will not win that, and any pitch that assumes otherwise will be corrected on the call.",
      },
    ],
    description:
      "A NEW NICHE, opened at Darren's direction, and the reason it is a single opportunity record rather than fifteen is that the whole metro referral network behaves as one system. Fifteen individually verified practices are on the new Vet Leads page; this record is the programme they belong to. The structure: four 24/7 emergency-and-specialty hubs (Virginia Veterinary Centers Short Pump, VVC Midlothian, Veterinary Referral & Critical Care in Manakin-Sabot, Partner Veterinary in Henrico, plus BluePearl on West Broad) receive referrals, transfers and after-hours cases from dozens of general practices that close at 6pm. HONEST CAVEAT, AND IT IS THE IMPORTANT ONE: routine specimen pickup to a reference lab is NOT the opening. IDEXX and Antech both run their own courier fleets and bundle collection into the lab contract, so a pitch built on daily send-outs will be shot down on the first call. The lanes that are genuinely uncovered are inter-hospital movement inside multi-site groups, STAT blood-product and cross-match runs between hubs, after-hours patient-record and imaging-media transfer from GP practices to the ER that received their patient, controlled-substance movement between sites, and cremation and aftercare transport. Value is a CSL-estimated annual figure across the top five accounts, not a published contract.",
    whyItFits:
      "Veterinary medicine is the one healthcare vertical where a one-van operator is the right size rather than an obvious shortfall — these are single buildings making their own vendor decisions, not health systems running a GPO. CSL's actual differentiators map cleanly: DEA-grade chain-of-custody discipline is exactly what moving controlled substances between practice sites requires, e-POD answers the specimen-integrity question an accreditation inspector asks, and there is no HIPAA burden on animal patients at all, which removes the compliance drag that slows every human-healthcare conversation. It is also uncontested — the metro's referral network has no dedicated courier, because until now nobody has offered one.",
    suggestedAction:
      "Start with Veterinary Referral & Critical Care at (804) 784-8722 and ask for the hospital administrator or practice owner. Privately owned since 1997 means the person who can say yes is in the building, which is not true at BluePearl or at any corporate group. Open with the discovery question, not the pitch: 'when you take a transfer from a general practice after hours, how do the records, imaging and any samples get to you?' Then work Virginia Veterinary Centers at (804) 353-9000 — one conversation covers Short Pump and Midlothian and puts the Fredericksburg lane on the table. Do NOT lead with routine lab pickup at any of them.",
  },
  // ───────────────────────── Run 3 — 2026-08-10 ─────────────────────────
  {
    id: "OPP-2026-030",
    title: "Virginia Physicians Inc — 11-Site Spoke-to-Hub Core Lab Route",
    source: "Commercial",
    naics: "492110",
    location: "Glen Allen, Richmond, Midlothian, Mechanicsville, Ashland, Powhatan, VA",
    dueDate: "2026-08-21",
    fitScore: 92,
    status: "Found",
    estValue: 42000,
    agency: "Virginia Physicians, Inc.",
    addedISO: "2026-08-10",
    sources: [
      {
        label: "VPI Laboratory Services — the Glen Allen core lab page",
        url:
          "https://vaphysicians.com/laboratory-services/",
        kind: "organization",
        retrievedISO: "2026-08-17",
        note:
          "Virginia Physicians' own page describing the Core Lab at 4900 Cox Road and the draw sites that feed it. This is the page the whole lead rests on.",
      },
    ],
    description:
      "Independent physician group serving Central Virginia since 1923, operating eleven clinical locations — all inside CSL's 25-mile radius — that feed ONE owned laboratory: the VPI Core Lab at 4900 Cox Road, Suite 180, Glen Allen 23060, (804) 836-1136. VPI's own site states the Core Lab \"provides automated comprehensive testing for all of the Virginia Physician divisions\" and lists ten draw sites feeding it. Sites: Ashland Medical Center, Cold Harbor Family Medicine, Hanover Family Physicians, Innsbrook Primary Care, Midlothian Family Practice (Powhatan / Village / Waterford / Westchester), Midlothian Medical Care, Reynolds Primary Care, Rheumatology Specialists. Value is a CSL-estimated annual route figure, not a published contract.",
    whyItFits:
      "This is the cleanest structural match the engine has surfaced in three runs. A practice that owns its own core lab has guaranteed, scheduled, non-negotiable daily specimen volume — the courier is not a convenience, it is the thing that makes the lab work. The geography is a single loop no wider than the metro, so one van genuinely covers it; there is no 24/7 or statewide requirement to disqualify a small operator; and because the group is independent it makes its own vendor decision without a corporate GPO in the way. Chain-of-custody documentation and e-POD are exactly what an in-house lab needs to defend a specimen-integrity audit.",
    suggestedAction:
      "Call the Core Lab directly at (804) 836-1136 and ask for the laboratory manager — not the practice's main line. Ask two questions: how specimens currently move from the ten satellites to Glen Allen, and whether that is done by staff driving their own cars. Practices at this size very often have medical assistants running specimens, which is a compliance exposure and a recruiting problem, not a logistics program. Offer a priced two-run-per-day loop (midday + end of day) with e-POD, starting with the four Midlothian sites as a scoped trial.",
  },
  {
    id: "OPP-2026-031",
    title: "MediDrive — Aetna Better Health of Virginia NEMT Vendor Onboarding (new broker since 4/1/2026)",
    source: "DMAS / Broker",
    naics: "485991",
    location: "Statewide Virginia — Richmond region routes",
    dueDate: "2026-09-04",
    fitScore: 86,
    status: "Found",
    estValue: 45000,
    agency: "MediDrive (NEMT broker for Aetna Better Health of Virginia)",
    addedISO: "2026-08-10",
    description:
      "NEW DOOR, found this run. Aetna Better Health of Virginia moved its non-emergency medical transportation benefit from ModivCare to MediDrive effective 4/1/2026, per Aetna's own transportation-vendor transition FAQ. MediDrive member line (800) 734-0430. A broker that has just taken over a Cardinal Care MCO is actively building out its Virginia transportation provider network — which is the single best moment to enroll, because network gaps are still open and the broker needs coverage. This changes the prior read of the market: ModivCare no longer covers four of five MCOs, it now covers fee-for-service plus Humana, Sentara and UnitedHealthcare.",
    whyItFits:
      "Broker enrollment converts CSL's van into billable trips without a sales cycle — there is no bid, only credentialing. A newly-transitioned broker is materially easier to enter than an incumbent with a settled network. Aetna Better Health is a Cardinal Care managed care plan with statewide membership, so Richmond-region ambulatory trips are steady volume.",
    suggestedAction:
      "This is gated by the SAME DMV filing as ModivCare and Access2Care — Form OA-151 — so file that first; it unlocks four broker records at once. Then contact MediDrive's Virginia provider-network team about transportation-provider enrollment. Ask specifically whether they are still open for Richmond-region ambulatory (non-wheelchair) capacity and what the credentialing lead time is.",
  },
  {
    id: "OPP-2026-032",
    title: "Patient First — 9-Center Send-Out Specimen & Inter-Center Route",
    source: "Commercial",
    naics: "492110",
    location: "Glen Allen HQ; 9 centers across Richmond, Midlothian, Mechanicsville, Chester, Colonial Heights, VA",
    dueDate: "2026-08-28",
    fitScore: 84,
    status: "Found",
    estValue: 38000,
    agency: "Patient First",
    addedISO: "2026-08-10",
    description:
      "Privately owned urgent-care operator, administrative offices at 5000 Cox Road, Glen Allen 23060, (804) 968-5700. Nine centers in the Richmond region (Short Pump, Midlothian, Parham, Carytown, Mechanicsville, Colonial Heights, Genito, Chester, Woodman) out of 79 across VA/MD/PA/NJ. Every center runs on-site lab testing, X-ray and prescription dispensing. HONEST CAVEAT: nothing on Patient First's website describes courier operations, a reference-lab relationship, or in-house drivers — whether they already run captive couriers is an OPEN QUESTION, not a known gap, and should be the first thing asked on the call. Second caveat: centers operate 8am–8pm, 365 days, so a full-coverage requirement could exceed one van. Value is a CSL-estimated annual route figure.",
    whyItFits:
      "Nine sites in a tight metro cluster, each generating send-out specimens daily from on-site labs, plus inter-center supply and records movement out of a Glen Allen headquarters that is five minutes from CSL's own operating area. Urgent care volume is high and consistent rather than seasonal.",
    suggestedAction:
      "Call (804) 968-5700 and ask for the regional operations or laboratory director. Open with the discovery question — 'how do send-out specimens currently leave your Richmond centers?' — rather than a pitch. If they already have a captive courier, pivot immediately to weekday-only overflow and STAT coverage rather than trying to displace the incumbent.",
  },
  {
    id: "OPP-2026-033",
    title: "Remedi SeniorCare (Ashland) — LTC Cycle-Fill & STAT Facility Routes",
    source: "Pharmacy",
    naics: "492110",
    location: "10448 Lakeridge Pkwy, Ashland, VA 23005 — routes across Richmond metro SNF/ALF",
    dueDate: "2026-08-21",
    fitScore: 85,
    status: "Found",
    estValue: 36000,
    agency: "Remedi SeniorCare of Virginia LLC",
    addedISO: "2026-08-10",
    description:
      "Closed-door long-term-care pharmacy hub at 10448 Lakeridge Parkway, Ashland 23005, (804) 550-4856 / (877) 927-8716, serving skilled nursing and assisted living facilities across Virginia from an Ashland base — roughly 20 minutes north of CSL. LTC pharmacy runs a daily cycle-fill route to every facility it serves plus unscheduled STAT runs for new admissions and changed orders, and outsourcing that driving is industry-normal rather than exceptional. Value is a CSL-estimated annual route figure.",
    whyItFits:
      "This is the best CAPABILITY match on the board, not just the best revenue match. LTC pharmacy delivery is ambient or small-cooler — no validated cold chain, no freezer, no dry ice — so CSL can serve it fully with the van it owns today. It is also exactly the work CSL already describes as its core line, and DEA chain-of-custody discipline for controlled substances is a differentiator against a general parcel courier. Two other national LTC pharmacies were checked and ruled out this run: PharMerica and Guardian Pharmacy have NO Richmond-metro location.",
    suggestedAction:
      "Call (804) 550-4856 and ask for the pharmacy manager or director of operations. Lead with STAT coverage rather than the cycle-fill route — STAT is where an in-house driver schedule breaks down, it is the easiest wedge, and it proves reliability before asking for the recurring route. Also work the same lane at Family Care Pharmacy, 2576 Gayton Centre Dr, (804) 740-3300, which serves assisted living and nursing facilities across the Richmond area from three sites.",
  },
  {
    id: "OPP-2026-034",
    title: "Virginia Women's Center — 4-Site Cytology & Prenatal Specimen Route",
    source: "Commercial",
    naics: "492110",
    location: "Richmond (West End, Short Pump), Midlothian, Mechanicsville, VA",
    dueDate: "2026-08-28",
    fitScore: 83,
    status: "Found",
    estValue: 26000,
    agency: "Virginia Women's Center",
    addedISO: "2026-08-10",
    description:
      "OB/GYN group with four clinical sites inside CSL's radius — West End (6600 W Broad St Ste 100), Short Pump (12129 Graham Meadows Dr), Midlothian (13801 St. Francis Blvd Ste 100), Mechanicsville (8364 Bell Creek Rd) — plus a Central Business Office at 7130 Glen Forest Dr. A fifth site in Kilmarnock is outside the radius and is excluded from this estimate. Single practice line for all locations: (804) 288-4084. West End and Mechanicsville also run mammography and bone density. Value is a CSL-estimated annual route figure.",
    whyItFits:
      "OB/GYN has the highest specimen-per-visit density of any outpatient specialty — cytology and pap, prenatal panels, cultures, NIPT kits — and almost all of it is scheduled rather than walk-in, which is what makes a fixed daily loop priceable. Four sites in a compact metro footprint plus a separate business office adds a chart and imaging-media leg to the same run at no extra driving.",
    suggestedAction:
      "Call (804) 288-4084 and ask for the practice administrator. Ask which reference or cytology lab they send to and whether that lab's courier covers all four sites or only the West End. Split coverage between a lab's own courier and staff driving is the common failure point and the opening to price a single unified loop.",
  },
  {
    id: "OPP-2026-035",
    title: "VDOT Statewide Courier Services (IFB161013) — Next-Cycle Positioning & Subcontract",
    source: "eVA",
    naics: "492110",
    location: "Statewide Virginia — CSL target is the Richmond District lane",
    dueDate: "2026-09-11",
    fitScore: 80,
    status: "Found",
    estValue: 55000,
    agency: "Virginia Department of Transportation",
    addedISO: "2026-08-10",
    sources: [
      {
        label: "eVA public opportunity search — IFB161013 / IFB-122257",
        url:
          "https://mvendor.cgieva.com/Vendor/public/AllOpportunities.jsp",
        kind: "search",
        retrievedISO: "2026-08-17",
        note:
          "Opened live on 8/17/2026. Status is now AWARDED with an Award Date of 8/11/2026; a Notice of Award and a public Bid Tab were both posted 8/11/2026. The awardee's NAME is still not readable — the NOA and Bid Tab downloads are CAPTCHA-gated, and the on-page Award tab shows only the date. Darren can clear that CAPTCHA himself in under a minute. Buyer Kimberly Palmer, kimberly.palmer@vdot.virginia.gov, (804) 729-6317. Search the term IFB161013 from this page.",
      },
    ],
    description:
      "MAJOR CORRECTION TO STANDING INTEL, found this run. The previous read was that Virginia's statewide delivery contracts are parcel/express only and that same-day local courier remains uncontracted. That is wrong. VDOT ran IFB161013 (eVA IFB-122257) \"Courier Services\" — statewide, issued 6/11/2026, closed 7/6/2026 at 9:00 AM, with a Notice of Intent to Award posted 7/15/2026. Buyer: Kimberly Palmer, kimberly.palmer@vdot.virginia.gov, (804) 729-6317. The solicitation window opened and closed BEFORE this engine's first sweep on 7/21, so it was never missable — but the recurring cycle it reveals is the real asset. eVA history shows VDOT re-procures this repeatedly (IFB 151646-1 in 2014, IFB 2703-3 in 2019, IFB 4960-2 in 2021, IFB161013 in 2026) and the 2014 cycle was expressly SET ASIDE FOR SMALL BUSINESS. The intended awardee could not be identified: the award document on eVA is CAPTCHA-gated and no other public source names it. Value is a CSL estimate of a realistic Richmond District share.",
    whyItFits:
      "A recurring, predictable statewide requirement with a documented history of small-business set-aside is the single most valuable thing a SWaM-certified firm can know about in advance. CSL cannot serve the whole Commonwealth with one van, so the two real plays are a Richmond District lane if the next cycle is divided, or a subcontract under whichever prime is about to be awarded. Knowing the buyer's name and the cycle timing now, rather than discovering the IFB three weeks before it closes, is what converts this from a miss into a plan.",
    suggestedAction:
      "Call Kimberly Palmer at (804) 729-6317 THIS WEEK. Ask four things: the term of the contract about to be awarded and its renewal options, who the intended awardee is (it is public — the NOIA is posted, it is only the download that is gated), whether the requirement has ever been divided by district, and whether small-business set-aside was considered this cycle. Then confirm CSL's eVA vendor profile carries the courier NIGP code so the next cycle auto-notifies. Separately, once the awardee is named, approach them as a Richmond-area subcontractor.",
  },
  {
    id: "OPP-2026-036",
    title: "Commonwealth Primary Care — 7-Office Specimen Route + Glenside Campus Loop",
    source: "Commercial",
    naics: "492110",
    location: "Richmond, Glen Allen, Midlothian, VA",
    dueDate: "2026-09-04",
    fitScore: 82,
    status: "Found",
    estValue: 24000,
    agency: "Commonwealth Primary Care",
    addedISO: "2026-08-10",
    description:
      "Primary care group with seven Richmond-metro offices, three of which sit in the same building at 1800 Glenside Drive (Suites 110, 101, and Commonwealth Extended Care in Suite 103), plus Ridgefield (2200 Pump Rd), West Creek (1630 Wilkes Ridge Pkwy), Wyndham (5360 Twin Hickory Rd, Glen Allen) and Midlothian (2367 Colony Crossing Pl). Main line (804) 288-1800. Ownership — independent versus health-system affiliated — could NOT be verified from a primary source this run and should be confirmed before leading with an 'independent works with independent' angle. Value is a CSL-estimated annual route figure.",
    whyItFits:
      "The smallest geographic footprint of any multi-site group found this run — three of the seven offices are in one building, which means three stops at one door. Primary care generates steady daily draws that go out to a reference lab, and the compact loop makes the per-stop economics work even at modest volume.",
    suggestedAction:
      "Call (804) 288-1800 and ask for the practice manager. First confirm ownership. Then propose a single afternoon loop priced per stop, using the fact that the Glenside campus is effectively one stop as the reason the price is lower than a per-site quote from a national courier.",
  },
  {
    id: "OPP-2026-037",
    title: "Independent & JV Dialysis Clinics — Monthly Lab Draw Circuit (ARA / Nansen / Livingston / Ferron)",
    source: "Commercial",
    naics: "492110",
    location: "Richmond, Henrico, Chesterfield, Midlothian, Mechanicsville, Chester, VA",
    dueDate: "2026-09-11",
    fitScore: 78,
    status: "Found",
    estValue: 30000,
    agency: "Innovative Renal Care / American Renal Associates and independent Richmond dialysis operators",
    addedISO: "2026-08-10",
    description:
      "Roughly 24 outpatient dialysis clinics operate in the core Richmond metro, in three tight clusters: the West End / Broad Street corridor (about six stops within six miles), the East End / Laburnum corridor (about six stops), and Southside (about five stops). The targets here are deliberately NOT DaVita and Fresenius, which route logistics through national contracts. They are the ARA / Innovative Renal Care clinics — Forest Park (1603 Santa Rosa Rd Ste 100, (804) 288-2751), Westhampton (5320 Patterson Ave, (804) 285-3394), South Laburnum (4817 S Laburnum Ave, (804) 222-7718), Mechanicsville (8400 N Run Medical Dr Ste 100, (804) 569-6083) — plus independently-named operators including Glenside Dialysis / Nansen (7001 W Broad St, (804) 755-2368), Forest Hill Avenue / Livingston (4900 Forest Hill Ave, (804) 230-3594), Hopkins Road / Ferron (5750 Hopkins Rd, (804) 275-8631) and East End Dialysis Center (2201 E Main St Ste 100, (804) 643-3055). Value is a CSL-estimated annual figure across a multi-clinic circuit.",
    whyItFits:
      "Dialysis runs a monthly lab draw on every patient on a fixed schedule — the most predictable specimen calendar in outpatient medicine — and the three geographic clusters mean a single van can chain five or six clinics in one short run. Independent and joint-venture operators actually make local vendor decisions, which the national chains do not. Refrigeration requirement is moderate and satisfiable: mostly ambient or 2–8°C whole-blood tubes needing a validated cooler and a temperature log, not a freezer.",
    suggestedAction:
      "Do not call all twenty-four. Start with the four ARA clinics as one conversation — a chain of four under one regional manager is a single sale — then work the independently-named clinics individually. Price the West End cluster first as a proof route; it has the densest stop count per mile.",
  },
  {
    id: "OPP-2026-038",
    title: "Virginia Cardiovascular Specialists — 7-Site INR Draw & Monitor Device Circuit",
    source: "Commercial",
    naics: "492110",
    location: "Richmond, Henrico, Midlothian, Mechanicsville, Prince George, VA",
    dueDate: "2026-09-11",
    fitScore: 75,
    status: "Found",
    estValue: 22000,
    agency: "Virginia Cardiovascular Specialists",
    addedISO: "2026-08-10",
    description:
      "Cardiology group with nine locations, seven inside CSL's radius: West End (7611 Forest Ave Ste 100/100A, (804) 288-4827), the VCS Heart & Vascular ambulatory surgery center (8007 Discovery Dr Unit B, (804) 288-4827), Stony Point (8700 Stony Point Pkwy Ste 120, (804) 323-5011), West Creek (1630 Wilkes Ridge Pkwy Ste 303, (804) 708-0445), Mechanicsville (7515 Right Flank Rd, (804) 559-0405), Midlothian (6120 Harbourside Centre Loop, (804) 915-1400) and Prince George (4700 Puddledock Rd Ste 400, (804) 458-1740, at the edge of the radius). Quinton and Tappahannock are outside the radius and excluded. Their locations page does not list dedicated draw stations, so specimen volume should be confirmed on the call rather than assumed. Value is a CSL-estimated annual route figure.",
    whyItFits:
      "Three separate lanes on one loop: anticoagulation and lipid draws to a lab, Holter and event-monitor devices recovered from patients and redeployed between offices, and supply plus surgical-pathology movement for the Discovery Drive surgery center. The device-shuttle lane is unusual and sticky — once a courier is holding the monitor inventory rotation, switching costs are real.",
    suggestedAction:
      "Call the West End main line (804) 288-4827 and ask for the practice administrator. Lead with the cardiac monitor rotation rather than specimens — it is the pain point a general courier never offers to solve, and it differentiates immediately.",
  },
  {
    id: "OPP-2026-039",
    title: "OrthoVirginia Richmond — 12-Site Instrument Tray, Imaging Media & DME Circuit",
    source: "Commercial",
    naics: "492110",
    location: "Richmond, Henrico, Midlothian, Mechanicsville, Prince George, VA",
    dueDate: "2026-09-18",
    fitScore: 74,
    status: "Found",
    estValue: 28000,
    agency: "OrthoVirginia",
    addedISO: "2026-08-10",
    description:
      "Physician-owned and independent — OrthoVirginia describes itself as \"an independent practice\" with 150+ orthopedic specialists and is one of the largest orthopedic practices in the country, with 37 locations statewide and TWELVE in the Richmond metro, including two surgery centers (7858 Shrader Rd with CT, and 15300 East West Rd, Midlothian, with MRI), an MRI site at 7650 E Parham Rd, four Ortho On Call urgent locations, and a physical therapy site. HONEST FRAMING: this is NOT a specimen play — orthopedics has low daily lab volume, and pitching it as a lab route would waste the meeting. Corporate HQ address and main line are not published on their site and are marked unverified rather than guessed. Value is a CSL-estimated annual route figure.",
    whyItFits:
      "The lanes here are surgical instrument tray and loaner-set shuttles between the two ambulatory surgery centers, imaging media and records between the three MRI/CT sites and the clinics, DME and brace stock replenishment across twelve sites, and surgical pathology out of the two surgery centers. Loaner-set logistics in particular is time-critical and poorly served — a tray that misses a case cancels the case — and it is priced accordingly.",
    suggestedAction:
      "Route in through a surgery center, not the practice: call 7858 Shrader Rd at (804) 270-1305 and ask for the ASC materials manager or surgical services coordinator. Pitch scheduled inter-office logistics and loaner-tray shuttling. Do not open with specimen transport.",
  },
  {
    id: "OPP-2026-040",
    title: "Clinical Research Partners — 3-Site Trial Kit & Inter-Office Route (ambient legs only)",
    source: "Commercial",
    naics: "492110",
    location: "Richmond, North Chesterfield, Petersburg, VA",
    dueDate: "2026-09-18",
    fitScore: 76,
    status: "Found",
    estValue: 15000,
    agency: "Clinical Research Partners, LLC",
    addedISO: "2026-08-10",
    description:
      "Clinical trial site network with three offices: 7110 Forest Ave Ste 201, Richmond 23226, (804) 477-3045; 1212 Koger Center Blvd, North Chesterfield 23235, (804) 715-2169; and 269 Medical Park Blvd, Petersburg 23805, (804) 921-9592. CAPABILITY GATE, stated plainly: trial kits routinely require −20°C and −80°C dry-ice shipping, dry ice is a DOT hazmat (UN1845) requiring hazmat training and shipper certification, and ultra-cold is not achievable with one van. CSL should bid ONLY the ambient and 2–8°C legs plus the site-to-airport courier leg, and should decline dry-ice work until certified. Two other candidates were ruled out this run: Velocity Clinical Research has no Richmond site (Martinsville only), and Virginia Research Center states on its own site that it is no longer enrolling. Value reflects the ambient scope only, not the full trial-logistics spend.",
    whyItFits:
      "The inter-site leg between three offices spread from Richmond to Petersburg is work a national specialty courier will not bid and a research coordinator is currently driving themselves. Trial logistics is also the most documentation-hungry corner of medical transport, which is where CSL's chain-of-custody and e-POD story is worth an actual premium rather than a discount.",
    suggestedAction:
      "Call (804) 477-3045 and ask for the site director or lead coordinator. Be explicit and unprompted about the dry-ice limitation — volunteering a capability boundary is what earns trust with research staff, and it keeps CSL out of a shipment it would fail. Bid the Richmond–Chesterfield–Petersburg inter-office shuttle and ambient kit runs only.",
  },
  {
    id: "OPP-2026-041",
    title: "Virginia Family Dentistry — 17-Office Dental Lab Case Loop",
    source: "Commercial",
    naics: "492110",
    location: "Richmond, Midlothian, Mechanicsville, Chester, Ashland, Powhatan, Prince George, VA",
    dueDate: "2026-09-25",
    fitScore: 72,
    status: "Found",
    estValue: 20000,
    agency: "Virginia Family Dentistry",
    addedISO: "2026-08-10",
    description:
      "Locally owned and doctor-led multi-specialty dental group with seventeen offices across greater Richmond and 400+ staff. Verified sites include 1801 Huguenot Rd Midlothian ((804) 419-1041), 6000 Brashier Blvd Mechanicsville ((804) 730-3457), 12390 Three Chopt Rd Richmond ((804) 351-5432), 14001 Charter Park Dr Midlothian ((804) 417-0245), 9484 Charter Gate Dr Ashland ((804) 412-0599), 2601 Swiftrun Rd Chester ((804) 414-2550), 6441 Ironbridge Rd ((804) 743-8189), 6510 Harbour View Ct Midlothian ((804) 739-6494), 2625 Anderson Hwy Powhatan ((804) 403-6036) and 4710 Puddledock Rd Prince George ((804) 526-4886). Corporate administrative line unverified. Value is a CSL-estimated annual route figure.",
    whyItFits:
      "Seventeen offices all sending impressions and scans out to dental labs and receiving crowns and appliances back is the same route economics as a specimen loop with none of the HIPAA-lab overhead, and it complements the existing dental-lab record on the board (Colonial and Great Impressions) by approaching the same loop from the practice end instead of the lab end. Almost nobody calls on dental groups with a logistics offer, so the competitive field is close to empty.",
    suggestedAction:
      "Contact the group's central administration and ask who coordinates lab cases across the seventeen offices. Propose a single daily circuit that consolidates case pickup and return, priced per office per day, and pitch turnaround-time reduction — a case that moves same-day instead of next-day shortens the patient's temporary crown period, which is a clinical argument, not a cost argument.",
  },
  {
    id: "OPP-2026-042",
    title: "Local Independent Home Infusion — Temperature-Controlled Patient Deliveries (capability gate)",
    source: "Pharmacy",
    naics: "492110",
    location: "Richmond, Henrico, Glen Allen, VA",
    dueDate: "2026-10-02",
    fitScore: 70,
    status: "Found",
    estValue: 18000,
    agency: "Home Infusion Solutions LLC / Home Infusion Richmond LLC / Infusion PRN LLC",
    addedISO: "2026-08-10",
    description:
      "Three locally-owned home infusion providers, which are far likelier to outsource driving than the national chains: Home Infusion Solutions, 8701 Park Central Dr Ste 600, Richmond 23227, (804) 767-3600; Home Infusion Richmond, 9323 Midlothian Tpke Ste S, Richmond 23235, (804) 554-1500; and Infusion PRN, 4953 Cox Rd, Glen Allen 23060, (804) 888-8630. The national comparators are Option Care Health / HomeChoice Partners (pharmacy at 8841 Landmark Rd Ste 100, Henrico; infusion suite at 7301 Forest Ave Ste 100; both (804) 752-5979) and Palmetto Infusion at 1610 E Parham Rd. Soleo Health was checked and has NO Richmond branch. CAPABILITY GATE: this lane requires validated 2–8°C cold chain with continuous temperature monitoring and documented excursion handling; some products ship frozen. One van with an unvalidated cooler will NOT pass a pharmacy quality audit. Value is a CSL-estimated annual figure.",
    whyItFits:
      "Home infusion delivery is scheduled, recurring, patient-address work inside a tight metro radius — structurally ideal for one van — and the local independents have no captive fleet. It is listed at a deliberately moderate score because the equipment gate is real: this is a lane to open AFTER buying validated payload shippers and data loggers, not before.",
    suggestedAction:
      "Treat this as a capability decision before a sales call. Price validated 2–8°C shippers and temperature data loggers first; the spend is modest and it unlocks this lane plus parts of the dialysis and trial-kit lanes. Then call Home Infusion Solutions at (804) 767-3600 and ask what their current delivery arrangement is and what temperature documentation they require from a carrier.",
  },
  {
    id: "OPP-2026-043",
    title: "HealthTrust / HCA Virginia — Supplier Registration for 4 Richmond Hospitals (long horizon)",
    source: "Hospital System",
    naics: "492110",
    location: "Richmond, VA — Chippenham, Johnston-Willis, Henrico Doctors', Parham Doctors'",
    dueDate: "2026-10-02",
    fitScore: 65,
    status: "Found",
    estValue: 40000,
    agency: "HCA Virginia / HealthTrust Performance Group",
    addedISO: "2026-08-10",
    description:
      "HCA operates four hospitals inside CSL's radius: Chippenham (7101 Jahnke Rd, 804-483-0000), Johnston-Willis (1401 Johnston Willis Dr, (804) 483-5000), Henrico Doctors' (1602 Skipwith Rd, (804) 289-4500) and Parham Doctors' (7700 E Parham Rd, (804) 747-5600). HCA sources through its GPO, HealthTrust Performance Group, via the Prospective Supplier Profile at supplier.healthtrustpg.com/supplier-form; HealthTrust is at 1100 Dr. Martin L. King Jr. Blvd Ste 1100, Nashville TN 37203, 615.344.3000, hpgsvc@healthtrustpg.com. HealthTrust runs a Community Supplier Development Program and states it \"acknowledges a variety of certifications\" — but does NOT name Virginia SWaM specifically, so SWaM recognition here is UNVERIFIED and must not be assumed. Value is a CSL-estimated annual figure.",
    whyItFits:
      "Scored deliberately low and placed last on purpose. Hospital courier contracts typically demand 24/7/365 coverage, backup vehicles, and vendor credentialing with badging, immunizations and insurance floors that a single-van operator cannot satisfy today — and CSL's MC authority is still pending. This is a register-now, win-later item that costs an hour of form-filling, not a pipeline item to plan around.",
    suggestedAction:
      "Complete the HealthTrust Prospective Supplier Profile this month. Then send one email to hpgsvc@healthtrustpg.com asking precisely whether a Virginia SWaM certification issued by VA SBSD is recognized under the Community Supplier Development Program, and separately ask the CJW supply chain office whether courier services are sourced at the division level rather than through the GPO — division-level sourcing is the only realistic near-term door.",
  },
  // ───────────────────────── Run 2 — 2026-07-28 ─────────────────────────
  {
    id: "OPP-2026-016",
    title: "Virginia DSS — Statewide Courier Services (Future Procurement OGS-27-005)",
    source: "eVA",
    naics: "492110",
    location: "Statewide Virginia (agency HQ: Richmond)",
    dueDate: "2026-09-15",
    fitScore: 79,
    status: "Found",
    estValue: 120000,
    agency: "Virginia Department of Social Services",
    addedISO: "2026-07-28",
    sources: [
      {
        label: "eVA public opportunity search — courier, all statuses",
        url:
          "https://mvendor.cgieva.com/Vendor/public/AllOpportunities.jsp",
        kind: "search",
        retrievedISO: "2026-08-17",
        note:
          "Re-checked live on 8/17/2026. A courier search returns 294 records and the STATUS facet shows NO 'Open' bucket at all — awarded, closed, cancelled and no-award only. OGS-27-005 remains absent from the board three weeks after its estimated 8/1 issue date. This is now the third consecutive run with no live Commonwealth courier solicitation.",
      },
    ],
    description:
      "Posted on eVA as Future Procurement OGS-27-005 (eVA reference FPR 124752) with an estimated issue date of 8/1/2026. IT DID NOT ISSUE. Re-verified live in eVA on 2026-08-10: an exact search for \"OGS-27-005\" now returns NO RESULTS, the Future Procurement notice is no longer among the 80 FPRs currently posted, and neither a \"courier\" nor a \"Statewide Courier Services\" search shows any Open status bucket anywhere in eVA. The estimated issue date passed with no solicitation and the notice was withdrawn from the board. Buyer Pedro Andrade remains an active VDSS buyer — he is listed on a separate current VDSS future procurement (FPR 110192) — so the contact is still good: pedro.andrade@dss.virginia.gov, (804) 726-7184. Context that makes this still worth holding: eVA history shows VDSS re-procures statewide courier on a long cycle (IFB OGS-16-050-1 awarded 2016, RFP 1965-4 no-award 2022, RFP 2672-1 awarded 2022) and the 2011 cycle, IFB OGS-11-060-2, was expressly SET ASIDE FOR SMALL BUSINESSES. Value remains a CSL estimate of a Richmond/Central-region share, not a published figure.",
    whyItFits:
      "The reason to keep this on the board is the buyer relationship and the set-aside history, not an imminent bid. VDSS runs roughly 120 local departments of social services with a Richmond headquarters, so the recurring document and records courier requirement is real even when no solicitation is posted. A prior cycle was set aside for small business, which is exactly where CSL's SWaM Small + Minority-Owned certification scores. What changed this week is only the timing: there is no live procurement to prepare a bid against, so treating this as the top of the board would have been wrong.",
    suggestedAction:
      "Call Pedro Andrade at (804) 726-7184 and ask the one question that matters now: was the statewide courier procurement cancelled, deferred, or absorbed into an existing contract, and when is it expected to return. Ask to be added to his notification list either way. Confirm CSL's eVA vendor profile carries the courier NIGP code so any re-post auto-notifies. Do not build the week around this record — score lowered 94 to 79 to reflect that it is now a watch item, not a bid.",
  },
  {
    id: "OPP-2026-017",
    title: "Richmond Gastroenterology Associates — 7-Site Biopsy & Endoscopy Route",
    source: "Commercial",
    naics: "492110",
    location: "N. Chesterfield / Midlothian / Henrico / Hanover, VA",
    dueDate: "2026-08-14",
    fitScore: 88,
    status: "Found",
    estValue: 30000,
    agency: "Richmond Gastroenterology Associates / West Creek Endoscopy Center",
    addedISO: "2026-07-28",
    description:
      "Physician-owned GI group with seven metro clinical sites plus its own West Creek Endoscopy Center (1600 Wilkes Ridge Dr, Ste 100, Henrico 23233). Main office 169 Wadsworth Dr, N. Chesterfield 23236, (804) 330-4021. Endoscopy generates a high, predictable daily volume of biopsy specimens that must move to pathology under chain of custody. Value is a CSL-estimated annual route figure.",
    whyItFits:
      "GI is arguably the single best specialty match for CSL: every scope produces specimens, the volume is scheduled rather than random, and an independent group makes its own vendor decisions. Chain-of-custody documentation and e-POD are exactly what a practice needs to defend a specimen-handling audit.",
    suggestedAction:
      "Call (804) 330-4021 and ask for the practice administrator or COO. Lead with a one-week no-charge trial on the West Creek Endoscopy Center biopsy run — a scoped trial is the lowest-friction way in.",
  },
  {
    id: "OPP-2026-018",
    title: "Virginia Urology — 7-Site Pathology, Pharmacy & Surgery Center Route",
    source: "Commercial",
    naics: "492110",
    location: "Richmond, Henrico, Hanover, Goochland, Prince George, VA",
    dueDate: "2026-08-14",
    fitScore: 87,
    status: "Found",
    estValue: 35000,
    agency: "Virginia Urology",
    addedISO: "2026-07-28",
    description:
      "The largest urology group in Central Virginia, operating seven locations anchored at Stony Point (9101 Stony Point Dr, Richmond 23235) with its own surgery center, in-house pathology, a dispensing pharmacy, and a separate Interventional Radiology center in Goochland. Additional sites: Hanover/Mechanicsville, Reynolds Crossing, Far West End, Prince George, Tappahannock. Value is a CSL-estimated annual route figure.",
    whyItFits:
      "Three separate recurring lanes under one contract — pathology specimens, pharmacy dispensing deliveries, and surgery-center/IR supply movement. That combination is unusually efficient for a single-van operator because the stops consolidate onto one loop.",
    suggestedAction:
      "Contact practice administration at the Stony Point HQ. Propose consolidating their inter-office runs onto one priced daily loop. Confirm ownership structure early — verify the group is still independently physician-owned before leading with the 'local, independent, works with independents' angle.",
  },
  {
    id: "OPP-2026-019",
    title: "Dermatology Associates of Virginia — Mohs Surgery STAT Specimen Runs",
    source: "Commercial",
    naics: "492110",
    location: "Richmond, Mechanicsville, Midlothian, Colonial Heights, VA",
    dueDate: "2026-08-14",
    fitScore: 86,
    status: "Found",
    estValue: 18000,
    agency: "Dermatology Associates of Virginia",
    addedISO: "2026-07-28",
    description:
      "Five offices including a dedicated Mohs Surgery Center at 10800 Midlothian Tpke, Ste 310 (Mohs Center direct line (804) 939-6191; main (804) 549-4040), operating Monday–Thursday. Mohs surgery is staged: tissue is excised, processed, and read while the patient waits, then the surgeon cuts again — so specimen movement is frequent and genuinely time-critical. The Colonial Heights office extends the footprint south. Value is a CSL-estimated annual figure.",
    whyItFits:
      "STAT, time-defined runs are where a courier earns a premium rate rather than competing on per-stop price. A dermatology group with a dedicated Mohs center on fixed surgery days is predictable recurring work that a one-van operation can absolutely serve.",
    suggestedAction:
      "Call the Mohs Center directly at (804) 939-6191 on a non-surgery day and ask who coordinates specimen transport. Pitch guaranteed turnaround windows on surgery days, priced per run rather than per stop.",
  },
  {
    id: "OPP-2026-020",
    title: "Owens & Minor — Supplier Diversity Registration (Richmond-area HQ)",
    source: "Commercial",
    naics: "492110",
    location: "Mechanicsville, VA (9120 Lockwood Blvd)",
    dueDate: "2026-08-28",
    fitScore: 84,
    status: "Found",
    estValue: 80000,
    agency: "Owens & Minor",
    addedISO: "2026-07-28",
    description:
      "ANSWERED THIS RUN — last week's open question is closed, and the answer is yes. Owens & Minor's supplier diversity page requires third-party certification and names as acceptable the National Minority Supplier Development Council, the Office of Small Business Certification, US DOT, \"or state agency responsible for this function.\" A Virginia SWaM certification issued by VA SBSD therefore QUALIFIES — NMSDC is not exclusively required. O&M explicitly does not accept self-certification when tracking diversity spend, so CSL's actual certificate does the work. Registration runs through the form on that page: Registration, then Qualification, then Approval. SEPARATE CORRECTION: O&M is no longer a Richmond-headquartered public company. The distribution business was sold to Platinum Equity on 12/31/2025 and remains Mechanicsville-based, while the former public parent renamed itself Accendra Health, Inc. Approach the Mechanicsville distribution business, not the renamed parent. Value is CSL-estimated annual potential.",
    whyItFits:
      "The largest healthcare logistics buyer physically inside CSL's radius, with a formal diversity-supplier front door rather than a cold sales cycle. IMPORTANT CAVEAT: their published criteria reference third-party certification (NMSDC / SBA). Virginia SWaM is a state certification and may not satisfy that on its own — confirm before assuming eligibility.",
    suggestedAction:
      "Register through the Owens & Minor supplier diversity page now and attach the SWaM Designation Certificate — it is an accepted certification, which was the open question blocking this record. Note the ownership change when making contact so the approach lands with the Mechanicsville distribution business rather than Accendra Health. Score raised 79 to 84 now that the certification path is confirmed rather than assumed.",
  },
  {
    id: "OPP-2026-021",
    title: "Richmond Nephrology Associates — Multi-Office Lab Draw Runs",
    source: "Commercial",
    naics: "492110",
    location: "Midlothian / Mechanicsville, VA",
    dueDate: "2026-08-21",
    fitScore: 78,
    status: "Found",
    estValue: 12000,
    agency: "Richmond Nephrology Associates",
    addedISO: "2026-07-28",
    description:
      "Independent nephrology practice with multiple metro offices. CKD and dialysis patients require frequent scheduled bloodwork (chemistry panels, CBC), which makes lab-draw transport high-frequency rather than occasional. The practice's full location list could not be confirmed from the public site and should be verified by phone. Value is a CSL-estimated annual figure.",
    whyItFits:
      "Nephrology produces the highest routine lab-draw cadence of any outpatient specialty. It also pairs naturally with dialysis-center outreach, so one relationship can open a second channel.",
    suggestedAction:
      "Call to confirm the current site count and who handles their lab courier today. Ask specifically whether their reference lab's own courier covers all sites or leaves gaps — the gaps are the opening.",
  },
  {
    id: "OPP-2026-022",
    title: "Tuckahoe Orthopaedics — 4-Site Inter-Office & Supply Runs",
    source: "Commercial",
    naics: "492110",
    location: "Richmond, Mechanicsville, Short Pump, Henrico, VA",
    dueDate: "2026-08-21",
    fitScore: 76,
    status: "Found",
    estValue: 12000,
    agency: "Tuckahoe Orthopaedics",
    addedISO: "2026-07-28",
    description:
      "Independent orthopaedic group with four clinical sites plus an on-site MRI center at St. Mary's (1501 Maple Ave, Richmond 23226) and an administrative office in Henrico. Main line (804) 285-2300. Value is a CSL-estimated annual figure.",
    whyItFits:
      "Lower specimen volume than pathology-driven specialties, so this is a facilities-and-logistics pitch rather than a clinical-courier pitch: inter-office records, imaging media, DME and supply movement. Useful as route filler between higher-value medical runs, which is how a single van gets to full utilization.",
    suggestedAction:
      "Contact the Three Chopt Rd administrative office about consolidating inter-office runs onto a scheduled loop. Price it as route filler, not premium STAT work.",
  },
  {
    id: "OPP-2026-023",
    title: "Roundtrip — Transport Company Network (Richmond office)",
    source: "Courier Network",
    naics: "485991",
    location: "Richmond, VA (1717 E Cary St)",
    dueDate: "2026-09-04",
    fitScore: 75,
    status: "Found",
    estValue: 20000,
    agency: "Roundtrip (patient transport platform)",
    addedISO: "2026-07-28",
    description:
      "Healthcare patient-transport marketplace that contracts local transport companies to fulfill hospital and health-plan ride requests, with an office at 1717 E Cary St in Richmond. Free to join as a Transport Company; requires $1M/$1M commercial general liability and auto liability; pays on roughly net-45 terms. Contact transport@roundtrip.com. Value is a CSL-estimated annual figure and depends heavily on trip acceptance rate.",
    whyItFits:
      "Ambulatory patient trips fit the Transit van without a wheelchair lift, and there is no sales cycle — CSL joins a network and receives dispatched work. PREREQUISITE: this is passenger transport, so it requires the same Virginia DMV intrastate for-hire authority as the Medicaid NEMT work. Do not pursue before that authority is filed.",
    suggestedAction:
      "Sequence this behind the DMV for-hire authority filing (see the ModivCare record). Once filed, submit the transport-company application and confirm CSL's insurance meets the $1M/$1M threshold — that is above the DMV statutory minimum.",
  },
  {
    id: "OPP-2026-024",
    title: "Sheltering Arms Institute — Rehab Hospital Lab & Pharmacy Runs",
    source: "Hospital System",
    naics: "492110",
    location: "Richmond, VA (2000 Wilkes Ridge Dr)",
    dueDate: "2026-08-28",
    fitScore: 74,
    status: "Found",
    estValue: 10000,
    agency: "Sheltering Arms Institute",
    addedISO: "2026-07-28",
    description:
      "Independent nonprofit inpatient rehabilitation hospital — a joint venture between Sheltering Arms and VCU Health — at 2000 Wilkes Ridge Dr, Richmond 23233, (804) 877-4000. Inpatient rehab sends routine labs to an outside reference lab and receives pharmacy deliveries. The specific current arrangement is unconfirmed and should be verified by phone. Value is a CSL-estimated annual figure.",
    whyItFits:
      "A locally governed institution with a reachable decision layer, unlike a full acute-care system where courier vendors are set at the corporate level. It also sits next door to the West Creek Endoscopy Center — the two could share one Wilkes Ridge stop.",
    suggestedAction:
      "Call (804) 877-4000 and ask for support services or materials management. Note the geographic pairing with Richmond Gastroenterology's West Creek site when pricing.",
  },
  {
    id: "OPP-2026-025",
    title: "National Clinical Research — Trial Specimen Transport",
    source: "Commercial",
    naics: "492110",
    location: "Richmond, VA (2809 Emerywood Pkwy, Ste 140)",
    dueDate: "2026-08-28",
    fitScore: 73,
    status: "Found",
    estValue: 9000,
    agency: "National Clinical Research, Inc.",
    addedISO: "2026-07-28",
    description:
      "Independent clinical research site at 2809 Emerywood Pkwy, Ste 140, Richmond 23294, (804) 755-2300, running trials including pediatric vaccine and cognitive/Alzheimer's studies. Trial protocols typically mandate documented, often temperature-controlled specimen handling to a central lab. Value is a CSL-estimated annual figure.",
    whyItFits:
      "Clinical trials are the one setting where documented chain of custody is not a nice-to-have but a protocol requirement — a deviation can invalidate a sample. CSL's e-POD and chain-of-custody discipline is the actual product here, not the driving.",
    suggestedAction:
      "Call (804) 755-2300 and ask for the site or lab coordinator. Ask what their current protocol requires for sample handling and whether any active trial needs local same-day transport to a courier hub.",
  },
  {
    id: "OPP-2026-026",
    title: "Fastest Labs of West Richmond — Chain-of-Custody Specimen Runs",
    source: "Independent Lab",
    naics: "492110",
    location: "Richmond, VA (5700 Old Richmond Ave, Ste G-26)",
    dueDate: "2026-08-21",
    fitScore: 72,
    status: "Found",
    estValue: 7000,
    agency: "Fastest Labs of West Richmond",
    addedISO: "2026-07-28",
    description:
      "Independently owned drug, alcohol, and DNA testing franchise at 5700 Old Richmond Ave, Ste G-26, Richmond 23226, (804) 336-3513. Specimens move to partner reference labs under strict chain-of-custody rules — DOT-regulated collections especially. Value is a CSL-estimated annual figure.",
    whyItFits:
      "Small ticket, but a precise credential match: DOT and chain-of-custody handling are exactly CSL's training, and the franchise owner makes the decision locally with no procurement process. Good low-friction add-on stop on an existing route.",
    suggestedAction:
      "Call (804) 336-3513 and ask the owner who currently transports specimens to their partner lab and whether coverage gaps exist on DOT collections.",
  },
  {
    id: "OPP-2026-027",
    title: "American Red Cross Richmond — Blood Product Transport (Longer Shot)",
    source: "Commercial",
    naics: "492110",
    location: "Richmond, VA (2825 Emerywood Pkwy)",
    dueDate: "2026-09-11",
    fitScore: 68,
    status: "Found",
    estValue: 25000,
    agency: "American Red Cross — Virginia Region",
    addedISO: "2026-07-28",
    description:
      "The Emerywood Blood & Platelet Donation Center at 2825 Emerywood Pkwy is the Richmond-area collection site following the Red Cross's absorption of the former Virginia Blood Services. Blood product movement is time-critical and temperature-controlled. Honest caveat: the Red Cross largely runs its own national fleet and logistics contracts, so whether they subcontract locally at all is unconfirmed — treat this as a longer shot with a high ceiling.",
    whyItFits:
      "Time-critical, temperature-controlled, chain-of-custody transport is the highest expression of CSL's core competency, and landing any Red Cross lane would be an anchor reference that opens hospital doors.",
    suggestedAction:
      "Identify the Virginia Region logistics/operations manager through the Red Cross local office and ask one question: do they use local subcontract couriers for overflow or STAT lanes? If the answer is no, close the record rather than spending more cycles.",
  },
  {
    id: "OPP-2026-028",
    title: "Petersburg–Richmond Pharma Corridor — Logistics & Facilities Watch",
    source: "Commercial",
    naics: "492110",
    location: "Petersburg / Richmond, VA",
    dueDate: "2026-09-18",
    fitScore: 66,
    status: "Found",
    estValue: 60000,
    agency: "Alliance for Building Better Medicine (Phlow, Civica Rx, Occam Systems)",
    addedISO: "2026-07-28",
    description:
      "On 2026-07-21 the Alliance for Building Better Medicine received a $15.9M federal EDA award through Virginia's Advanced Pharmaceutical Manufacturing Tech Hub, funding an end-to-end domestic production chain across Occam Systems, Phlow Corp (APIs), and Civica Rx (finished drugs including ketamine, midazolam, norepinephrine, succinylcholine). No logistics solicitation has been issued. Value is a speculative CSL estimate of eventual potential.",
    whyItFits:
      "Federal money landing on a pharma manufacturing cluster 25 miles south of CSL creates warehousing, facilities-support, and GMP-adjacent transport needs — and CSL sells warehouse storage and facilities management alongside courier. Being known before the requirements are written is the entire play.",
    suggestedAction:
      "Send the capability statement to the Alliance and to Phlow and Civica site operations. Set a news alert on the Tech Hub. Do not invest heavily until a real requirement appears — this is a watch item, not a pipeline item.",
  },
  {
    id: "OPP-2026-029",
    title: "Three New Chesterfield Hospitals — Long-Horizon Vendor Positioning",
    source: "Hospital System",
    naics: "492110",
    location: "Chesterfield County, VA",
    dueDate: "2026-09-25",
    fitScore: 62,
    status: "Found",
    estValue: 50000,
    agency: "HCA Virginia / VCU Health / Bon Secours",
    addedISO: "2026-07-28",
    description:
      "In March 2026 Virginia approved three competing Chesterfield hospital projects totaling roughly $672M: HCA's $260M Magnolia Hospital (Hull St & Otterdale Rd), VCU Health's first Chesterfield hospital (~60 beds, Iron Bridge Rd), and a 40-bed expansion at Bon Secours St. Francis. VCU Health is also building a 100,000 sq ft Chesterfield Pavilion ambulatory surgery center and medical office building at 7000 Commons Plaza, which includes infusion and pharmacy services and opens well before the hospitals. Openings run roughly 2028–2030. Value is a speculative CSL estimate.",
    whyItFits:
      "New facilities write new vendor lists. The Chesterfield Pavilion is the near-term piece — an ASC with infusion and pharmacy on site is a courier customer from day one, and it opens years before the hospitals do.",
    suggestedAction:
      "Track the Chesterfield Pavilion opening timeline specifically and aim to be credentialed with VCU Health before it opens. Treat the three hospitals as a 2028+ horizon item — register in supplier-diversity programs now, spend no active selling time yet.",
  },

  // ───────────────────── Run 1 — 2026-07-21 (re-verified 2026-07-28) ─────────────────────
  {
    id: "OPP-2026-001",
    title: "Richmond VAMC Courier — Subcontract Target (IDIQ 36C24625D0070)",
    source: "SAM.gov",
    naics: "492210",
    location: "Richmond, VA 23249",
    dueDate: "2026-08-21",
    fitScore: 88,
    status: "Qualified",
    estValue: 769850,
    agency: "VA Network Contracting Office 6 (VISN 6)",
    addedISO: "2026-07-21",
    sources: [
      {
        label: "SAM.gov — active courier notices, searched live",
        url:
          "https://sam.gov/search/?index=opp&page=1&pageSize=25&sort=-modifiedDate&sfm%5Bstatus%5D%5Bis_active%5D=true&sfm%5BsimpleSearch%5D%5BkeywordRadio%5D=ALL&sfm%5BsimpleSearch%5D%5BkeywordTags%5D%5B0%5D%5Bkey%5D=courier&sfm%5BsimpleSearch%5D%5BkeywordTags%5D%5B0%5D%5Bvalue%5D=courier",
        kind: "search",
        retrievedISO: "2026-08-17",
        note:
          "Re-run on 8/17/2026: 31 active courier notices nationwide, none with a Virginia place of performance. The same search surfaced award notice 36C25026Q0784 (Lab Courier Services, NCO 10, published 8/12/2026) to ALL AMERICAN EXPRESS SOLUTIONS LLC, UEI TYNPRZ48FMJ7 — the same prime that holds the Richmond VAMC IDIQ. The prime is actively winning more VA lab courier work, which strengthens the subcontract approach rather than weakening it.",
      },
    ],
    description:
      "Single-award SDVOSB set-aside IDIQ for courier services at the Richmond VA Medical Center, held by All American Express Solutions LLC (Indianapolis, UEI TYNPRZ48FMJ7), $769,850 ceiling, 7/21/2025 through 7/20/2030, NAICS 492210, awarded off solicitation 36C24625Q0784 against 18 offers. CORRECTED THIS RUN: last week's record said only ONE delivery order had ever been issued, totalling $6,411.84, and called the vehicle nearly dormant. USAspending now shows FIVE child awards totalling $245,816.84 obligated — roughly 32% of ceiling — with IDV transaction activity as recent as 7/10/2026. The vehicle is being used steadily, not sitting idle. CSL still cannot bid it directly: it is a single-award SDVOSB set-aside locked through 2030 and CSL's SDVOSB certification is still pending. This is a subcontract and teaming target.",
    whyItFits:
      "A prime that is actually drawing on its ceiling needs local capacity, and one drawing $245K across five orders in twelve months is running real volume from an Indianapolis base twenty minutes further from the hospital than CSL is. That is the entire argument: standing up local coverage from out of state is expensive, and CSL is already here, already HIPAA-trained, already running Richmond medical routes. The correction matters in CSL's favour — an active vehicle is worth approaching, a dormant one is not, and last week's read would have had Darren skip this call.",
    suggestedAction:
      "Approach All American Express Solutions as a local subcontractor, leading with the low-utilization observation as a reason they may want overflow and STAT coverage. Separately, keep SAM.gov saved searches on office 36C246 + PSC R602 — NCO 6 is demonstrably active (it posted a courier award on 2026-07-20) and its response windows run 3–9 days.",
  },
  {
    id: "OPP-2026-002",
    title:
      "Virginia Medicaid NEMT — ModivCare Network Enrollment (FFS + 3 of 5 MCOs)",
    source: "DMAS / Broker",
    naics: "485991",
    location: "Central Virginia",
    dueDate: "2026-08-14",
    fitScore: 86,
    status: "Qualified",
    estValue: 96000,
    agency: "Virginia DMAS / ModivCare",
    addedISO: "2026-07-21",
    description:
      "ModivCare remains the statewide fee-for-service NEMT broker operating on behalf of DMAS. CORRECTED THIS RUN on two points. First, the MCO coverage: ModivCare no longer covers four of five managed care plans. Aetna Better Health of Virginia moved its transportation benefit from ModivCare to MediDrive effective 4/1/2026, so ModivCare now covers fee-for-service plus Humana Healthy Horizons (877) 718-4215, Sentara (877) 892-3986 and UnitedHealthcare Mid-Atlantic (833) 215-3884 — three of five. Anthem HealthKeepers Plus continues to use Access2Care (877) 892-3988. Aetna is now MediDrive (800) 734-0430, tracked separately as OPP-2026-031. Second, the phone number: (804) 873-5200 could not be found in any ModivCare or DMAS published contact list and should be STRUCK from the file. Use ModivCare Provider Assistance (866) 810-8302; Facility Assistance is (866) 679-6330 and the Mechanicsville administrative line is (866) 810-8305. Molina's 6/30/2025 exit to Humana is confirmed. Value is CSL-estimated annual trip revenue.",
    whyItFits:
      "One credentialing pass unlocks five payer channels, NAICS 485991 is already on CSL's code list, and the Transit handles ambulatory trips without a lift. The DMV for-hire authority is the single gating item — it also unlocks the Anthem/Access2Care and Roundtrip records, so it is the highest-leverage filing on the board.",
    suggestedAction:
      "File DMV Form OA-151 first — it gates this record, Access2Care, Roundtrip and the new MediDrive record simultaneously, which makes it the highest-leverage single action available to CSL. Then call ModivCare Provider Assistance at (866) 810-8302 to start transportation-provider credentialing. Do not use (804) 873-5200; it is unverified and was removed this run.",
  },
  {
    id: "OPP-2026-003",
    title: "GENETWORx Reference Lab — Daily Specimen Routes",
    source: "Independent Lab",
    naics: "492110",
    location: "Glen Allen, VA",
    dueDate: "2026-08-07",
    fitScore: 90,
    status: "Qualified",
    estValue: 60000,
    agency: "GENETWORx (Logistic and Distribution LLC)",
    addedISO: "2026-07-21",
    sources: [
      {
        label: "GENETWORx contact page",
        url:
          "https://genetworx.com/contact/",
        kind: "organization",
        retrievedISO: "2026-08-17",
        note:
          "The lab's own contact page — used to confirm the Glen Allen location and main line before the draft was written.",
      },
    ],
    description:
      "CLIA reference lab at 4060 Innslake Drive, Glen Allen — pharmacogenomics and pathogen panels — with daily inbound specimen logistics from regional providers. Phone (800) 858-5909. No change found on the 2026-07-28 re-check; no 2026 expansion news surfaced. Value is CSL-estimated annual route revenue. NOTE: the 2026-07-31 target from last week's run has effectively lapsed because outreach was not sent — date moved forward.",
    whyItFits:
      "A specimen-dependent lab 15 minutes from CSL's base. Daily scheduled pickups with chain-of-custody and BBP handling are exactly CSL's flagship service. Local decision-makers, no GPO gatekeeping.",
    suggestedAction:
      "This is the highest-scoring commercial lead on the board and the draft has been sitting for a week. Approve it and call (800) 858-5909 for the lab operations / logistics manager.",
  },
  {
    id: "OPP-2026-004",
    title: "Virginia Cancer Institute — 6-Site Inter-Office Route",
    source: "Commercial",
    naics: "492110",
    location: "Henrico / Richmond metro, VA",
    dueDate: "2026-08-07",
    fitScore: 89,
    status: "Qualified",
    estValue: 72000,
    agency: "Virginia Cancer Institute",
    addedISO: "2026-07-21",
    description:
      "Independent oncology practice with 6+ Richmond-area sites (West End, Parham, Johnston-Willis, Mechanicsville, Hull Street, Petersburg). Business office: 7202 Glen Forest Drive, Henrico — (804) 673-2024. Daily inter-site specimen and medication movement is a natural multi-stop route. Re-verified 2026-07-28, no change. Value is CSL-estimated annual route revenue.",
    whyItFits:
      "Independent practice = local decision-making. Multi-site daily route matches CSL's scheduled-route model; chemo/hazardous-drug safe-handling training is a direct differentiator few local couriers hold.",
    suggestedAction:
      "Call the business office and ask for the practice administrator; outreach draft has been ready for a week and is still awaiting approval.",
  },
  {
    id: "OPP-2026-005",
    title: "Bremo Pharmacy & Bremo LTC — Daily Facility Delivery Routes",
    source: "Pharmacy",
    naics: "492110",
    location: "Richmond, VA",
    dueDate: "2026-08-07",
    fitScore: 84,
    status: "Qualified",
    estValue: 45000,
    agency: "Bremo Pharmacy / Bremo Long Term Care",
    addedISO: "2026-07-21",
    description:
      "CONFIRMED THIS RUN. Bremo Pharmacy's own website lists only three sites, all on Staples Mill Road: retail at 2024 Staples Mill Rd, (804) 288-8361; the Training Center and Business Office at 2002 Staples Mill Rd, (804) 285-8055; and the LTC division at 2002 Staples Mill Rd, (804) 285-7823. No Skipwith Road location appears anywhere on bremorx.com, and the 1602 Skipwith Rd listing shows as CLOSED on third-party directories — so last week's estimate reduction from $55,000 to $45,000 was correct and stands. The LTC division is the real target: Bremo's own LTC page describes monthly synchronized cycle fill to group homes, intermediate care facilities and assisted living, which is a fixed recurring route. Value is CSL-estimated annual revenue across the LTC delivery lane.",
    whyItFits:
      "LTC pharmacies run daily med-pass routes plus STAT doses — recurring revenue that fits one-van operations. HIPAA training and pharmacy-delivery experience apply directly. A consolidating pharmacy may actually be more open to outsourcing delivery than one that is expanding.",
    suggestedAction:
      "Call the LTC division directly at (804) 285-7823 rather than the retail line — the recurring route lives there. Ask how monthly cycle-fill deliveries and STAT doses currently reach facilities and who drives them. Pair this call with Remedi SeniorCare (OPP-2026-033) and Family Care Pharmacy; all three are the same ambient, no-cold-chain lane CSL can serve today with the van it already owns.",
  },
  {
    id: "OPP-2026-006",
    title: "MedRVA Surgery Centers — Daily Pathology & Supply Runs",
    source: "Commercial",
    naics: "492110",
    location: "Richmond (West Creek & Stony Point), VA",
    dueDate: "2026-08-14",
    fitScore: 85,
    status: "Qualified",
    estValue: 40000,
    agency: "MedRVA (West Creek & Stony Point ASCs)",
    addedISO: "2026-07-21",
    description:
      "Independent, locally governed ambulatory surgery centers generating daily pathology specimens and implant/supply deliveries. Re-verified 2026-07-28, no change. Value is CSL-estimated annual revenue.",
    whyItFits:
      "Independent ASCs choose their own vendors; daily specimen pickup with documented chain-of-custody is core CSL work. Their West Creek and Stony Point locations also sit near Richmond Gastroenterology's and Virginia Urology's sites — a combined loop is plausible.",
    suggestedAction:
      "Contact the administrator at each center; propose a combined two-site daily run, and price it against the wider West Creek / Stony Point cluster now forming on this board.",
  },
  {
    id: "OPP-2026-007",
    title: "VPFW — Surgery Center + Multi-Office Specimen Route",
    source: "Commercial",
    naics: "492110",
    location: "Richmond metro, VA",
    dueDate: "2026-08-14",
    fitScore: 85,
    status: "Qualified",
    estValue: 45000,
    agency: "Virginia Physicians for Women",
    addedISO: "2026-07-21",
    description:
      "Large independent OB/GYN group with multiple offices plus its own surgery center — a steady generator of pathology and lab specimens across sites. Re-verified 2026-07-28, no change. Value is CSL-estimated annual route revenue.",
    whyItFits:
      "Multi-office daily loop fits CSL's scheduled-route model; independent group, local decision-makers.",
    suggestedAction:
      "Ask for the practice administrator; propose a single consolidated daily route across offices and the surgery center.",
  },
  {
    id: "OPP-2026-008",
    title: "Anthem HealthKeepers NEMT — Access2Care Provider Enrollment",
    source: "DMAS / Broker",
    naics: "485991",
    location: "Richmond, VA",
    dueDate: "2026-08-28",
    fitScore: 80,
    status: "Found",
    estValue: 48000,
    agency: "Anthem HealthKeepers Plus / Access2Care",
    addedISO: "2026-07-21",
    description:
      "RE-VERIFIED 2026-07-28. Anthem — the one Cardinal Care MCO not served by ModivCare — runs its NEMT through Access2Care. Contact-number caution: three different numbers appear across sources of different vintages. Anthem's own provider Quick Contact Guide, versioned 2026-06-23, gives (877) 892-3988; the DMAS provider-enrollment sheet dated 2025-07-01 gives (804) 873-5200; a member-facing Anthem page gives (855) 325-7581. The June 2026 provider guide is the freshest, so start there — but treat the number as unconfirmed until someone answers. Value is CSL-estimated annual trip revenue.",
    whyItFits:
      "Adds the fifth Medicaid payer channel on the same van and the same DMV authority as the ModivCare work — incremental volume at near-zero marginal setup cost.",
    suggestedAction:
      "After the DMV OA-151 filing and ModivCare credentialing are underway, call (877) 892-3988 first, falling back to (804) 873-5200. Record which number actually reaches Access2Care provider enrollment so the portal can be corrected.",
  },
  {
    id: "OPP-2026-009",
    title: "VCU Health — Same-Day Courier Gap (No Statewide Contract)",
    source: "Hospital System",
    naics: "492110",
    location: "Richmond, VA",
    dueDate: "2026-09-04",
    fitScore: 82,
    status: "Found",
    estValue: 90000,
    agency: "VCU Health / VCU Procurement",
    addedISO: "2026-07-21",
    description:
      "RE-CONFIRMED 2026-07-28. Virginia's statewide delivery contracts still cover parcel/express only (UPS E194-103735, FedEx MA454) — same-day local courier remains uncovered, so departments buy it ad hoc as small purchases, and no new statewide same-day solicitation has appeared. Important policy update: HB61, which would have set a 42% statewide SWaM utilization goal and strengthened set-asides, passed both chambers but was VETOED on 2026-05-19. The existing $10,000–$100,000 small-purchase set-aside remains the lever — no expansion is coming, so the current rules are what CSL should plan around. Value is CSL-estimated annual potential across departments.",
    whyItFits:
      "A public buyer inside CSL's radius with an uncontracted need that maps to SWaM small purchases — the exact lane CSL's certification unlocks. VCU posts solicitations exclusively on eVA.",
    suggestedAction:
      "Register with VCU Procurement (804-828-1077) and the VCU Health vendor portal; set eVA alerts on NIGP 962-86 / 948-55. Do not wait on policy change — HB61's veto means today's thresholds are the ones to work with.",
  },
  {
    id: "OPP-2026-010",
    title: "Bon Secours Richmond — Vendor Credentialing + Supplier Diversity",
    source: "Hospital System",
    naics: "492110",
    location: "Richmond / Mechanicsville / Midlothian, VA",
    dueDate: "2026-08-21",
    fitScore: 78,
    status: "Found",
    estValue: 65000,
    agency: "Bon Secours Mercy Health (St. Mary's, Memorial Regional, St. Francis)",
    addedISO: "2026-07-21",
    description:
      "Three Richmond-area hospitals plus ASCs with inter-facility lab and pharmacy movement. Vendor credentialing runs through symplr (support 888-476-0377). UPDATE 2026-07-28: Bon Secours is actively expanding — a $370M St. Mary's critical-care tower is under construction, a new parking project advanced in June 2026, and the state approved a 40-bed St. Francis expansion in March 2026. Caveat: their supplier-diversity page is informational only, with no self-service portal or published contact, so expect this to require a phone call rather than a form. Value is CSL-estimated annual potential.",
    whyItFits:
      "CSL's SWaM Small + Minority-Owned certification is a direct match for the supplier-diversity program — the warmest door into a large system — and active construction means new service lines and new vendor needs.",
    suggestedAction:
      "Register in symplr, then call supply chain directly rather than relying on the website; ask for the supplier-diversity contact by name and reference the St. Mary's expansion.",
  },
  {
    id: "OPP-2026-011",
    title: "DGS Consolidated Laboratory Services — Statewide Specimen Logistics",
    source: "eVA",
    naics: "492110",
    location: "Richmond, VA (600 N 5th St)",
    dueDate: "2026-09-18",
    fitScore: 76,
    status: "Found",
    estValue: 85000,
    agency: "Virginia DGS / DCLS",
    addedISO: "2026-07-21",
    sources: [
      {
        label: "Virginia DGS — Division of Consolidated Laboratory Services",
        url:
          "https://dgs.virginia.gov/division-of-consolidated-laboratory-services",
        kind: "organization",
        retrievedISO: "2026-08-17",
        note:
          "DCLS's own page. Confirms the public-health, environmental, food-safety and newborn-screening testing lines. It does NOT mention courier services or how specimens arrive, so the delivery model is still an open question to ask on the call rather than an established gap.",
      },
    ],
    description:
      "The state public-health lab runs a statewide sample-kit collection-and-shipping operation from downtown Richmond and receives specimens from every VDH health district. Confirmed on the live eVA sweep of 2026-07-28: still no open DCLS courier solicitation. DGS buys via eVA. Value is CSL-estimated annual potential.",
    whyItFits:
      "Specimen logistics headquartered inside CSL's radius, at a public buyer where SWaM status counts.",
    suggestedAction:
      "Send the capability statement to DCLS / DGS small-purchase buyers; keep monitoring eVA for DCLS courier and kit-logistics renewals.",
  },
  {
    id: "OPP-2026-012",
    title: "Lab Logistics National Network — Contracted Courier Profile",
    source: "Courier Network",
    naics: "492110",
    location: "Richmond region, VA",
    dueDate: "2026-08-07",
    fitScore: 80,
    status: "Found",
    estValue: 50000,
    agency: "Lab Logistics (450+ hospital & lab clients)",
    addedISO: "2026-07-21",
    description:
      "National 3PL that contracts local courier companies to run dedicated lab routes for its hospital and reference-lab clients. Free contractor profile at lablogistics.com/drive-for-us. Value is CSL-estimated annual potential. The 2026-07-31 target from run 1 lapsed without action — date moved forward.",
    whyItFits:
      "Purpose-built channel for a small fleet running specimen routes under a national contract holder — zero sales cycle to join.",
    suggestedAction:
      "Submit the contractor profile — it takes about 10 minutes and has been open for a week. The Application Assistant has the company data ready.",
  },
  {
    id: "OPP-2026-013",
    title: "Quest Diagnostics — Supplier Registration + Diversity Program",
    source: "Independent Lab",
    naics: "492110",
    location: "Richmond area, VA",
    dueDate: "2026-08-28",
    fitScore: 74,
    status: "Found",
    estValue: 70000,
    agency: "Quest Diagnostics",
    addedISO: "2026-07-21",
    description:
      "Quest procures logistics/courier services corporately and runs an active supplier-diversity program that tracks diverse-supplier spend. Richmond-area patient service centers generate daily specimen logistics. Re-verified 2026-07-28, no change. Value is CSL-estimated annual potential.",
    whyItFits:
      "SWaM Small + Minority-Owned certification is a scored advantage inside a corporate supplier-diversity program; overflow, STAT, and rural-edge routes are the realistic entry point.",
    suggestedAction:
      "Register in Quest's supplier portal and flag diversity status; the Application Assistant has the profile data staged.",
  },
  {
    id: "OPP-2026-014",
    title: "Medzoomer Rx Delivery — Courier Signup (Quick Win)",
    source: "Courier Network",
    naics: "492110",
    location: "Richmond, VA",
    dueDate: "2026-07-31",
    fitScore: 72,
    status: "Found",
    estValue: 18000,
    agency: "Medzoomer (pharmacy last-mile platform)",
    addedISO: "2026-07-21",
    description:
      "Nationwide prescription-delivery platform with open self-serve courier signup at courier.medzoomer.com. Per-delivery pay, app-based dispatch. OVERDUE: this carried a 2026-07-24 target from run 1 and was not completed. It is the lowest-effort item on the entire board and is now the oldest open action. Value is CSL-estimated incremental annual revenue.",
    whyItFits:
      "Immediate incremental Rx-delivery volume between scheduled routes, with zero contract sales cycle. HIPAA training already in place.",
    suggestedAction:
      "Complete the self-serve signup — it is a form, not a sale. This has now slipped one full week and should be closed out before the next sweep.",
  },
  {
    id: "OPP-2026-015",
    title: "Colonial + Great Impressions Dental Labs — Case Pickup Loop",
    source: "Commercial",
    naics: "492110",
    location: "Richmond, VA",
    dueDate: "2026-08-21",
    fitScore: 75,
    status: "Found",
    estValue: 30000,
    agency: "Colonial Dental Laboratories / Great Impressions Dental Lab",
    addedISO: "2026-07-21",
    description:
      "Two Richmond dental labs running daily case pickup/delivery loops between dentist offices and the lab — classic recurring route work. Re-verified 2026-07-28, no change. Value is CSL-estimated annual revenue across both.",
    whyItFits:
      "Reliable filler routes between medical runs; less compliance overhead, steady weekday volume.",
    suggestedAction:
      "Call both lab managers; propose a shared morning/afternoon loop priced per stop.",
  },
];

/** Dashboard aggregates derived from the live opportunities. */
export const opportunityStats = {
  open: opportunities.filter((o) =>
    ["Found", "Qualified", "Contacted", "Meeting", "Bid"].includes(o.status)
  ).length,
  qualified: opportunities.filter((o) => o.fitScore >= 80).length,
  pipelineValue: opportunities
    .filter((o) => !["Lost"].includes(o.status))
    .reduce((sum, o) => sum + o.estValue, 0),
  newThisRun: opportunities.filter((o) => o.addedISO === LATEST_RUN_ISO).length,
};
