/**
 * lib/data/opportunities.ts
 * ---------------------------------------------------------------------------
 * LIVE DATA — real opportunities surfaced by the Opportunity Finder and scored
 * by the Lead Qualifier.
 *
 * Run 1: 2026-07-21 (15 records)
 * Run 2: 2026-07-28 (14 new records; run-1 records re-verified and corrected)
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
  | "Commercial";

export type OpportunityStatus =
  | "Found"
  | "Qualified"
  | "Contacted"
  | "Meeting"
  | "Bid"
  | "Won"
  | "Lost";

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
] as const;

export type Sweep = (typeof SWEEPS)[number];

/** ISO date of the most recent sweep. */
export const LATEST_RUN_ISO = SWEEPS[SWEEPS.length - 1].iso;

/** Which sweep first surfaced this opportunity. */
export function sweepFor(o: Pick<Opportunity, "addedISO">): Sweep | undefined {
  return SWEEPS.find((s) => s.iso === o.addedISO);
}

export const opportunities: Opportunity[] = [
  // ───────────────────────── Run 2 — 2026-07-28 ─────────────────────────
  {
    id: "OPP-2026-016",
    title: "Virginia DSS — Statewide Courier Services (Future Procurement OGS-27-005)",
    source: "eVA",
    naics: "492110",
    location: "Statewide Virginia (agency HQ: Richmond)",
    dueDate: "2026-08-01",
    fitScore: 94,
    status: "Found",
    estValue: 120000,
    agency: "Virginia Department of Social Services",
    addedISO: "2026-07-28",
    hardDeadline: true,
    description:
      "Posted on eVA as Future Procurement OGS-27-005 (eVA reference FPR 124752): \"Purchase of Statewide Courier Services\" for the Virginia Department of Social Services. Estimated issue date 8/1/2026; estimated price range not published. Buyer of record is Pedro Andrade, pedro.andrade@dss.virginia.gov, (804) 726-7184. Value shown is a CSL estimate of a realistic Richmond/Central-region share, not a published figure. This was verified directly in eVA on 2026-07-28 and is the single most actionable public bid on the board.",
    whyItFits:
      "A Future Procurement notice is the best possible timing for a small firm — the requirement is public but the solicitation has not dropped, so there is a window to introduce CSL to the buyer, ask how the regions are structured, and shape the questions before bids are due. VDSS is headquartered in Richmond and runs 120 local departments of social services, so document and records courier work is recurring and inside CSL's radius. CSL's new SWaM Small + Minority-Owned certification is a scored advantage on Commonwealth solicitations. A single van cannot cover the whole state — the realistic plays are a regional lot (if the IFB is divided) or a subcontract/teaming position under a statewide prime.",
    suggestedAction:
      "Call or email Pedro Andrade THIS WEEK, before the 8/1 issue date: confirm whether the solicitation will be split into regional lots, whether SWaM set-aside or evaluation preference applies, and ask to be added to the notification list. Confirm CSL's eVA vendor profile carries NIGP 962-86 so the solicitation auto-notifies. Then watch eVA daily from 8/1.",
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
    fitScore: 79,
    status: "Found",
    estValue: 80000,
    agency: "Owens & Minor",
    addedISO: "2026-07-28",
    description:
      "A Fortune 500 medical-surgical distributor headquartered 20 minutes from CSL's base, with a published three-step supplier diversity process: registration, qualification, then approval through a competitive RFQ. Owens & Minor has been expanding into last-mile healthcare logistics, which is directly adjacent to CSL's service line. Value is a CSL estimate of potential and is speculative — this is a registration play, not a live bid.",
    whyItFits:
      "The largest healthcare logistics buyer physically inside CSL's radius, with a formal diversity-supplier front door rather than a cold sales cycle. IMPORTANT CAVEAT: their published criteria reference third-party certification (NMSDC / SBA). Virginia SWaM is a state certification and may not satisfy that on its own — confirm before assuming eligibility.",
    suggestedAction:
      "Submit the supplier diversity intake form, and in the same week call to ask one specific question: does Owens & Minor accept Virginia SWaM Small + Minority-Owned certification, or is NMSDC/SBA 8(a) required? If NMSDC is required, that answer reshapes CSL's certification roadmap and is worth knowing now.",
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
    fitScore: 84,
    status: "Qualified",
    estValue: 769850,
    agency: "VA Network Contracting Office 6 (VISN 6)",
    addedISO: "2026-07-21",
    description:
      "CORRECTED 2026-07-28. The Richmond VAMC courier requirement was awarded 2025-07-21 as a 5-year single-award SDVOSB set-aside IDIQ — ceiling $769,850, period of performance through 2030-07-20 — to All American Express Solutions LLC of Indianapolis. Two corrections to last week's record: the award's NAICS is 492210 (Local Messengers and Local Delivery), not 492110; and the contract is NOT being heavily used — USAspending shows a single delivery order (36C24625N0988) at $6,411.84 against the $769,850 ceiling, so last week's 'delivery orders are actively being issued' was too optimistic. Value shown remains the published ceiling, not expected revenue.",
    whyItFits:
      "Read honestly, this is a relationship play, not a bid. CSL cannot compete for it: it is a single-award SDVOSB set-aside locked through 2030, and CSL's SDVOSB certification is still in progress. What makes it worth keeping is that the prime is an out-of-state company with very low measured utilization at a facility 20 minutes from CSL's base — that is the profile of a prime who would rather subcontract local coverage than staff Richmond themselves.",
    suggestedAction:
      "Approach All American Express Solutions as a local subcontractor, leading with the low-utilization observation as a reason they may want overflow and STAT coverage. Separately, keep SAM.gov saved searches on office 36C246 + PSC R602 — NCO 6 is demonstrably active (it posted a courier award on 2026-07-20) and its response windows run 3–9 days.",
  },
  {
    id: "OPP-2026-002",
    title: "Virginia Medicaid NEMT — ModivCare Network Enrollment (FFS + 4 of 5 MCOs)",
    source: "DMAS / Broker",
    naics: "485991",
    location: "Central Virginia",
    dueDate: "2026-08-14",
    fitScore: 88,
    status: "Qualified",
    estValue: 96000,
    agency: "Virginia DMAS / ModivCare",
    addedISO: "2026-07-21",
    description:
      "RE-VERIFIED 2026-07-28. ModivCare remains the statewide fee-for-service NEMT broker for Cardinal Care and the NEMT subcontractor for 4 of the 5 managed-care plans (Aetna, Sentara, Humana, UnitedHealthcare). Enrollment is rolling — no RFP needed. Network Development: (866) 810-8305 x2645. Two updates this week: the correct DMV filing is Form OA-151 (NEMT Carrier authority) — last week's record said OA-150, which is the Broker application and is the wrong form; and since 2026-01-01 Virginia DMV accepts these applications online. Requirements for CSL's 1–6 passenger tier: $350,000 liability minimum, $25,000 surety bond or letter of credit held 3 years, $50 filing fee. Note also that DMAS revised its NEMT Driver/Attendant/Vehicle Requirements on 2026-05-26 — get the current version before credentialing. Value is CSL-estimated first-year ambulatory trip revenue for one van.",
    whyItFits:
      "One credentialing pass unlocks five payer channels, NAICS 485991 is already on CSL's code list, and the Transit handles ambulatory trips without a lift. The DMV for-hire authority is the single gating item — it also unlocks the Anthem/Access2Care and Roundtrip records, so it is the highest-leverage filing on the board.",
    suggestedAction:
      "File DMV Form OA-151 online this week (not OA-150) with the $25,000 bond and $50 fee, and confirm CSL's insurance meets the $350,000 minimum. In parallel, call ModivCare Network Development at (866) 810-8305 x2645 and request the current credentialing checklist plus the 2026-05-26 driver/vehicle requirements document.",
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
      "Independent retail + compounding pharmacy with a long-term-care division making scheduled daily medication deliveries to nursing facilities. FLAG RAISED 2026-07-28: the Skipwith Road location now shows as closed on public listings, while the main Staples Mill Road site and the LTC division appear active. This may indicate consolidation, so the opportunity size has been revised down pending confirmation. Value is a reduced CSL-estimated annual route figure.",
    whyItFits:
      "LTC pharmacies run daily med-pass routes plus STAT doses — recurring revenue that fits one-van operations. HIPAA training and pharmacy-delivery experience apply directly. A consolidating pharmacy may actually be more open to outsourcing delivery than one that is expanding.",
    suggestedAction:
      "Before pitching, call and confirm which locations are currently operating and whether delivery is still handled in-house. Then pitch the owner or LTC operations manager on a dedicated or overflow route with proof-of-delivery.",
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
