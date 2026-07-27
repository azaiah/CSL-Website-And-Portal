/**
 * lib/data/opportunities.ts
 * ---------------------------------------------------------------------------
 * LIVE DATA — real opportunities surfaced by the Opportunity Finder and scored
 * by the Lead Qualifier on the 2026-07-21 sweep of SAM.gov, Virginia eVA,
 * DMAS/NEMT broker networks, and Richmond-area health systems and labs.
 * Every record cites a real organization, solicitation, or program. Estimated
 * values are either published contract ceilings or CSL-estimated annual
 * revenue potential (noted per record).
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
}

export const IS_SAMPLE_DATA = false;

export const opportunities: Opportunity[] = [
  {
    id: "OPP-2026-001",
    title: "Richmond VAMC Courier — Subcontract & Recompete (IDIQ 36C24625D0070)",
    source: "SAM.gov",
    naics: "492110",
    location: "Richmond, VA 23249",
    dueDate: "2026-08-14",
    fitScore: 92,
    status: "Qualified",
    estValue: 769850,
    agency: "VA Network Contracting Office 6 (VISN 6)",
    description:
      "The Richmond VA Medical Center's courier requirement (solicitation 36C24625Q0784) was awarded July 21, 2025 as a 5-year SDVOSB set-aside IDIQ — ceiling $769,850, period of performance through July 2030 — to All American Express Solutions LLC of Indianapolis, IN. 18 offers were received. Delivery orders are actively being issued. Value shown is the published contract ceiling.",
    whyItFits:
      "This is CSL's core service at a facility inside its radius on an SDVOSB set-aside contract — a subcontract opportunity for CSL as a Virginia SWaM-certified small business. The prime is an out-of-state company; a local, HIPAA/BBP-trained operator is a natural subcontractor now and a credible recompete bidder in FY2030. NCO 6 also issues separate short-window courier solicitations (e.g., surgical-department courier) for this facility.",
    suggestedAction:
      "Contact All American Express Solutions about local subcontracting; create SAM.gov saved searches on office 36C246 + PSC R602 + NAICS 492110/485991 (their response windows run 3–9 days); run the VISN 6 forecast query at vendorportal.ecms.va.gov.",
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
    description:
      "ModivCare remains the statewide fee-for-service NEMT broker for Virginia Medicaid (Cardinal Care) and is also the NEMT subcontractor for 4 of the 5 managed-care plans (Aetna, Sentara, Humana, UnitedHealthcare). Enrollment is rolling — no RFP needed. Their Virginia network office is in Mechanicsville, inside CSL's radius. Value shown is CSL-estimated first-year ambulatory trip revenue for one van.",
    whyItFits:
      "NAICS 485991 is on CSL's code list, the Transit van handles ambulatory trips without a wheelchair lift, and one credentialing covers five payer channels. Requires Virginia DMV intrastate for-hire passenger authority (separate from CSL's courier USDOT/MC authority) plus broker credentialing (driver checks, vehicle inspection, insurance).",
    suggestedAction:
      "Call ModivCare Network Development at (866) 810-8305 x2645 to start credentialing; in parallel, confirm VA DMV for-hire passenger authority. The Application Assistant has the enrollment checklist ready.",
  },
  {
    id: "OPP-2026-003",
    title: "GENETWORx Reference Lab — Daily Specimen Routes",
    source: "Independent Lab",
    naics: "492110",
    location: "Glen Allen, VA",
    dueDate: "2026-07-31",
    fitScore: 90,
    status: "Qualified",
    estValue: 60000,
    agency: "GENETWORx (Logistic and Distribution LLC)",
    description:
      "CLIA reference lab at 4060 Innslake Drive, Glen Allen — pharmacogenomics and pathogen panels — with daily inbound specimen logistics from regional providers. Phone (800) 858-5909. Value is CSL-estimated annual route revenue.",
    whyItFits:
      "A specimen-dependent lab 15 minutes from CSL's base. Daily scheduled pickups with chain-of-custody and BBP handling are exactly CSL's flagship service. Local decision-makers, no GPO gatekeeping.",
    suggestedAction:
      "Call this week and ask for the lab operations / logistics manager; outreach draft is ready for approval.",
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
    description:
      "Independent oncology practice with 6+ Richmond-area sites (West End, Parham, Johnston-Willis, Mechanicsville, Hull Street, Petersburg). Business office: 7202 Glen Forest Drive, Henrico — (804) 673-2024. Daily inter-site specimen and medication movement is a natural multi-stop route. Value is CSL-estimated annual route revenue.",
    whyItFits:
      "Independent practice = local decision-making. Multi-site daily route matches CSL's scheduled-route model; chemo/hazardous-drug safe-handling training is a direct differentiator few local couriers hold.",
    suggestedAction:
      "Call the business office and ask for the practice administrator; outreach draft ready for approval.",
  },
  {
    id: "OPP-2026-005",
    title: "Bremo Pharmacy & Bremo LTC — Daily Facility Delivery Routes",
    source: "Pharmacy",
    naics: "492110",
    location: "Richmond, VA",
    dueDate: "2026-08-07",
    fitScore: 87,
    status: "Qualified",
    estValue: 55000,
    agency: "Bremo Pharmacy / Bremo Long Term Care",
    description:
      "Independent retail + compounding pharmacy with a long-term-care division making scheduled daily medication deliveries to nursing facilities. Delivery is already core to their model. Value is CSL-estimated annual route revenue.",
    whyItFits:
      "LTC pharmacies run daily med-pass routes plus STAT doses — recurring revenue that fits one-van operations. HIPAA training and pharmacy-delivery experience apply directly.",
    suggestedAction:
      "Pitch the owner / LTC operations manager a dedicated or overflow route with proof-of-delivery; outreach draft ready for approval.",
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
    description:
      "Independent, locally governed ambulatory surgery centers generating daily pathology specimens and implant/supply deliveries. Value is CSL-estimated annual revenue.",
    whyItFits:
      "Independent ASCs choose their own vendors; daily specimen pickup with documented chain-of-custody is core CSL work.",
    suggestedAction:
      "Contact the administrator at each center; propose a combined two-site daily run.",
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
    description:
      "Large independent OB/GYN group with multiple offices plus its own surgery center — a steady generator of pathology and lab specimens across sites. Value is CSL-estimated annual route revenue.",
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
    fitScore: 82,
    status: "Found",
    estValue: 48000,
    agency: "Anthem HealthKeepers Plus / Access2Care",
    description:
      "Anthem — the one Cardinal Care MCO not served by ModivCare — runs its NEMT through Access2Care, with a Richmond-local provider line (804-873-5200 per DMAS's published contact sheet). Separate enrollment from ModivCare. Value is CSL-estimated annual trip revenue.",
    whyItFits:
      "Adds the fifth Medicaid payer channel on the same van and credentials as the ModivCare work.",
    suggestedAction:
      "After ModivCare credentialing is underway, call Access2Care at 804-873-5200 to open enrollment.",
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
    description:
      "Virginia's statewide delivery contracts cover parcel/express only (UPS E194-103735, FedEx MA454) — same-day local courier is NOT covered, so VCU departments buy it ad hoc as small purchases. Commonwealth policy allows SWaM set-asides on purchases from $10k to $100k. Value is CSL-estimated annual potential across departments.",
    whyItFits:
      "A public buyer inside CSL's radius with an uncontracted need that maps to SWaM small purchases — the exact lane CSL's pending SWaM certification unlocks. VCU posts solicitations exclusively on eVA.",
    suggestedAction:
      "Register with VCU Procurement (804-828-1077) and the VCU Health vendor portal; set eVA alerts on NIGP 962-86 / 948-55; finish SWaM certification to be eligible for set-asides.",
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
    description:
      "Three Richmond-area hospitals plus ASCs with inter-facility lab and pharmacy movement. Vendor credentialing runs through symplr (support 888-476-0377); the system operates a Supplier Diversity Initiative. Value is CSL-estimated annual potential.",
    whyItFits:
      "CSL's SWaM Small + Minority-Owned certification is a direct match for the supplier-diversity program — the warmest door into a large system.",
    suggestedAction:
      "Register in symplr and the Bon Secours supplier-diversity program, then request an introduction to supply chain via the diversity office.",
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
    description:
      "The state public-health lab (DCLS) runs a statewide sample-kit collection-and-shipping operation from downtown Richmond and receives specimens from every VDH health district. No open solicitation today; DGS buys via eVA. Value is CSL-estimated annual potential.",
    whyItFits:
      "Specimen logistics headquartered inside CSL's radius, at a public buyer where SWaM status will count.",
    suggestedAction:
      "Send the capability statement to DCLS / DGS small-purchase buyers; monitor eVA for DCLS courier and kit-logistics renewals.",
  },
  {
    id: "OPP-2026-012",
    title: "Lab Logistics National Network — Contracted Courier Profile",
    source: "Courier Network",
    naics: "492110",
    location: "Richmond region, VA",
    dueDate: "2026-07-31",
    fitScore: 80,
    status: "Found",
    estValue: 50000,
    agency: "Lab Logistics (450+ hospital & lab clients)",
    description:
      "National 3PL that contracts local courier companies to run dedicated lab routes for its hospital and reference-lab clients. Free contractor profile at lablogistics.com/drive-for-us; they reach out when Richmond-area work opens. Value is CSL-estimated annual potential.",
    whyItFits:
      "Purpose-built channel for a small fleet running specimen routes under a national contract holder — zero sales cycle to join.",
    suggestedAction:
      "Submit the contractor profile this week (10 minutes); the Application Assistant has the company data ready.",
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
    description:
      "Quest procures logistics/courier services corporately and runs an active supplier-diversity program that tracks diverse-supplier spend. Richmond-area patient service centers generate daily specimen logistics. Value is CSL-estimated annual potential.",
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
    dueDate: "2026-07-24",
    fitScore: 72,
    status: "Found",
    estValue: 18000,
    agency: "Medzoomer (pharmacy last-mile platform)",
    description:
      "Nationwide prescription-delivery platform (integrates with independent-pharmacy software) with open self-serve courier signup at courier.medzoomer.com. Per-delivery pay; app-based dispatch. Value is CSL-estimated incremental annual revenue.",
    whyItFits:
      "Immediate incremental Rx-delivery volume between scheduled routes, with zero contract sales cycle. HIPAA training already in place.",
    suggestedAction:
      "Complete the self-serve signup this week — fastest first-dollar item on the board.",
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
    description:
      "Two Richmond dental labs running daily case pickup/delivery loops between dentist offices and the lab — classic recurring route work. Value is CSL-estimated annual revenue across both.",
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
};
