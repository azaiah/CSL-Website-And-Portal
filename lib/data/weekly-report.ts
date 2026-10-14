/**
 * lib/data/weekly-report.ts
 * ---------------------------------------------------------------------------
 * LIVE DATA — the weekly briefing compiled by the Weekly Briefing agent.
 * Run 7 — the 10/14 sweep (run Wed 14 Oct 2026, 10:25–10:49 AM ET). Updated on
 * every weekly run.
 * ---------------------------------------------------------------------------
 */

import { outreachStats } from "./outreach";
import type { SourceLink } from "./opportunities";
import { vetLeadStats } from "./vet-leads";

export interface WeeklyMetric {
  label: string;
  value: string;
  delta?: string;
}

export interface WeeklyReport {
  weekOf: string;
  summary: string;
  metrics: WeeklyMetric[];
  newOpportunities: {
    title: string;
    source: string;
    fitScore: number;
    /** Links the headline back to the full record so it can be opened. */
    opportunityId?: string;
  }[];
  topLeads: {
    title: string;
    fitScore: number;
    note: string;
    opportunityId?: string;
  }[];
  outreach: { drafted: number; sent: number; responses: number };
  deadlines: { title: string; dueDate: string }[];
  recommendedMoves: string[];
  corrections?: { item: string; detail: string }[];
  /**
   * Run-level citations — the systems actually swept this week, with the URLs
   * that were opened. Per-record sources live on each Opportunity; this is the
   * evidence for the run as a whole, including the searches that found NOTHING.
   * A null result is only worth reporting if it can be checked.
   */
  sourcesSwept?: SourceLink[];
}

/**
 * Derived once, here, so the briefing cannot quote a different outreach number
 * than the dashboard or the opportunity detail. Previously these were three
 * literals that had to be edited in lockstep by hand.
 */
const outreach = outreachStats();
const vet = vetLeadStats();

export const weeklyReport: WeeklyReport = {
  weekOf: "2026-10-12",

  summary:
    "The 10/14 sweep — the seventh run, carried out on Wednesday 14 October 2026 from 10:25 to 10:49 AM Eastern, two weeks after the 9/30 run. From this run on, every sweep records the time it ran as well as the date, and everything it found is labelled 'New · 10/14' on the boards. The short version has three parts. First, the bid side came back empty, and that is a real finding rather than a gap: SAM.gov has no courier, specimen or pharmacy-delivery notice anywhere in Virginia for the seventh run in a row, eVA has no open courier bid, and Henrico's eight open solicitations are all unrelated. Two items from 9/30 have run their course — the Richmond VAMC transplant-testing notice is now inactive with no follow-on solicitation yet, and the Justice Center pharmacy RFP closed on 8 October. Second, the commercial side produced four new targets, led by JenCare's four senior medical centres, which each run an on-site pharmacy and sit in a ring around CSL's base, and Richmond Heart and Vascular Associates, a three-office cardiology practice with a surgery centre that is building a second campus in western Chesterfield. Two new freestanding emergency rooms (HCA's Scott's Walk and Chesterfield, both opened this summer) and a third under construction (Bon Secours Iron Bridge, fall 2027) are on the board as longer plays. Third, the veterinary board grew from 35 to 43: a second in-home end-of-life provider (Lap of Love), an urgent-care practice open until 8pm six days a week, the board's first practice offering canine reproduction, and five daytime practices. Four of the new practices' websites are built on the same template, which may mean one owner — that is unverified, and it is worth one question on the first call. The backlog is still the largest number on this page: by the engine's data, 48 of the 59 action-by dates on the board have passed, including all 22 records that score 80 or better. If statuses have been updated on the portal since 9/30, those edits win.",

  metrics: [
    {
      label: "New records found",
      value: "12",
      delta: "4 opportunities + 8 vet leads, all tagged New · 10/14",
    },
    {
      label: "Open bids that fit CSL",
      value: "0",
      delta: "SAM.gov, eVA and Henrico all checked 14 Oct",
    },
    {
      label: "Overdue action-by dates",
      value: "48",
      delta: "Of 59 · all 22 records at 80+ fit",
    },
    {
      label: "Outreach drafted",
      value: String(outreach.drafted),
      delta:
        outreach.sent === 0
          ? "Still 0 sent according to the engine's data"
          : `${outreach.sent} sent`,
    },
    { label: "Pipeline value", value: "$2.84M", delta: "Up from $2.78M" },
    {
      label: "Veterinary leads",
      value: String(vet.total),
      delta: "Up from 35 — 8 new on 10/14",
    },
  ],

  newOpportunities: [
    {
      title:
        "JenCare Senior Medical Centers — 4 Richmond-area centres with on-site pharmacy (daily inter-centre loop)",
      source: "Commercial",
      fitScore: 66,
      opportunityId: "OPP-2026-056",
    },
    {
      title:
        "Richmond Heart and Vascular Associates — 3 offices + surgery centre, new Chesterfield campus under construction",
      source: "Commercial",
      fitScore: 58,
      opportunityId: "OPP-2026-057",
    },
    {
      title:
        "HCA Virginia freestanding ERs — Scott's Walk and Chesterfield opened in summer 2026, two more coming",
      source: "Hospital System",
      fitScore: 42,
      opportunityId: "OPP-2026-058",
    },
    {
      title:
        "Bon Secours Iron Bridge Emergency Center — ground broken October 2026, opens fall 2027",
      source: "Hospital System",
      fitScore: 38,
      opportunityId: "OPP-2026-059",
    },
    {
      title:
        "Lap of Love — Richmond: in-home euthanasia, hospice and aftercare, coordinators 24/7 (see Vet Leads)",
      source: "Veterinary",
      fitScore: 66,
    },
    {
      title:
        "Animal Medical Center, Midlothian — urgent-care walk-ins until 8pm, Monday to Saturday (see Vet Leads)",
      source: "Veterinary",
      fitScore: 64,
    },
  ],

  topLeads: [
    {
      title: "JenCare Shockoe Bottom — (804) 344-9848",
      fitScore: 66,
      note:
        "The best new call this run. Four senior primary-care centres — Shockoe Bottom, Hull Street, Mechanicsville Turnpike and Colonial Heights — each with an on-site pharmacy and on-site testing, and all within CSL's radius. One question opens it: how do specimens and pharmacy restock move between the four centres today? Do not pitch patient transport; they already provide it.",
      opportunityId: "OPP-2026-056",
    },
    {
      title: "Richmond Heart and Vascular Associates — (804) 800-6600",
      fitScore: 58,
      note:
        "Three offices on a triangle around CSL's base (Mechanicsville, Midlothian, Hopewell), a surgery centre in Mechanicsville, and a second campus with a cardiac surgery centre and cath lab under construction on East West Road for July 2027. Ask who is planning logistics for the new building — that decision is made before it opens. Their site does not mention an in-office blood lab, so ask rather than assume.",
      opportunityId: "OPP-2026-057",
    },
    {
      title: "Lap of Love — Richmond, (804) 510-0363",
      fitScore: 66,
      note:
        "The aftercare lane gets its second in-home provider. Lap of Love's care coordinators answer around the clock and aftercare is a listed service, which means a pet has to reach a crematory after every home visit, often in the evening. Their crematory is not named, so present CSL as the carrier that works alongside it.",
    },
    {
      title: "Animal Medical Center, Midlothian — (804) 639-3900",
      fitScore: 64,
      note:
        "Takes urgent walk-ins until 8pm six days a week, so it regularly has a patient at closing time who needs an ER overnight. Ask how the records and samples follow that patient. Then ask the template question: its website matches Springfield, River City and Powhatan exactly. If the four share an owner, one conversation covers four hospitals.",
    },
    {
      title: "THE BACKLOG — 48 overdue dates, every 80+ record among them",
      fitScore: 100,
      note:
        "Still the most valuable hour available, and unchanged in kind since 9/30: by the engine's data, 48 of 59 action-by dates have passed, including all 22 of the strongest records. None of this needs research. Re-date what is still alive, mark Lost what is not, and the board becomes a working list again. If statuses were updated on the portal after 9/30, those edits already override these numbers.",
    },
  ],

  outreach: { drafted: 17, sent: 0, responses: 0 },

  deadlines: [
    {
      title: "Call JenCare (Shockoe Bottom) — first call from the 10/14 sweep",
      dueDate: "2026-10-23",
    },
    {
      title: "Call Richmond Heart and Vascular Associates before campus logistics are set",
      dueDate: "2026-10-28",
    },
    {
      title: "HealthTrust supplier registration — needed before any HCA ER conversation",
      dueDate: "2026-11-13",
    },
    {
      title: "Register on Chesterfield County's Bonfire portal (PInG retires 31 Dec 2026)",
      dueDate: "2026-12-15",
    },
    {
      title: "Bon Secours vendor credentialing, ahead of the Iron Bridge ER (fall 2027)",
      dueDate: "2026-12-15",
    },
  ],

  recommendedMoves: [
    "Call JenCare's Shockoe Bottom centre first. It is the strongest new record and the only one that is a daily route from the first conversation.",
    "Call Richmond Heart and Vascular Associates next, and ask about the East West Road campus. Being in the room before July 2027 is the whole point.",
    "On the vet board, call Lap of Love and Animal Medical Center first, and ask Animal Medical Center the ownership question: four of this week's new practices share a website template.",
    "Do not chase the HCA or Bon Secours ERs yet. Finish the HealthTrust and Bon Secours supplier registrations first; without them nobody inside either system can buy from CSL.",
    "Keep watching SAM.gov for the Richmond VAMC transplant-testing solicitation. The sources-sought going inactive is routine and does not tell us whether a solicitation will follow. If one does, the 'specimen transport' search is the one that will catch it.",
    "Spend one afternoon on the status dropdowns. 48 overdue dates is still the biggest number in this report, and every strong record is in that pile.",
    "Send five outreach drafts. The advice is unchanged since August: not seventeen, five.",
  ],

  corrections: [
    {
      item: "The Richmond VAMC transplant-testing notice (36C24627Q0029) is now inactive — no follow-on solicitation yet",
      detail:
        "On 2 October it was active and due to go inactive on 6 October. SAM.gov on 14 October shows it inactive, and searches for the notice number and for 'HLA transplant' found no solicitation to replace it. OPP-2026-047 is updated with this note and stays on the board.",
    },
    {
      item: "The Richmond City Justice Center pharmacy RFP (#260019872) closed on 8 October",
      detail:
        "eVA lists it as Closed, 8 Oct 2026, 2:00pm. OPP-2026-048 is updated and stays on the board as history. The notice links to procurement.opengov.com/portal/rva, which shows the City of Richmond now posts there — see the next item.",
    },
    {
      item: "The City of Richmond's procurement portal could not be read this run",
      detail:
        "The City now publishes on OpenGov, which displayed a 'verify you are human' check. The engine does not get past those checks, so City of Richmond opportunities were NOT swept this run. To close this gap, someone can register CSL as a vendor on that portal and turn on its email alerts for courier and delivery categories.",
    },
    {
      item: "VCU Health already delivers prescriptions by UPS — the opening is same-day, not routine",
      detail:
        "VCU Health announced on 6 November 2025 that all seven of its Richmond-area pharmacies offer free home delivery through UPS within Virginia, excluding controlled substances and short-term therapies such as antibiotics. OPP-2026-009 predated this and did not mention it; it is now noted and cited. Routine refills are covered. Same-day and short-course medication is still the gap.",
    },
    {
      item: "The Omnicare sale has not been reported as closed",
      detail:
        "OPP-2026-049 said closing was expected in October. No completion announcement was found on 14 October; CVS's 13 May release said only 'later this year'. The record is updated and the advice is unchanged.",
    },
    {
      item: "The state Social Services courier procurement (OGS-27-005) has still not issued",
      detail:
        "The same eVA search as 2 October ('Social Services courier') returns the same 18 records, none open. It is now two and a half months past its projected August issue date.",
    },
    {
      item: "Henrico was read in full this time",
      detail:
        "On 9/30 only 7 of 11 open solicitations loaded. On 14 October all 8 open solicitations were read (aircraft, paving, HVAC, snow removal, a treatment coordinator, A&E for a school, recreation software, a comprehensive-plan study). None is courier, delivery or medical work.",
    },
  ],

  sourcesSwept: [
    {
      label: "SAM.gov — active contract opportunities, keyword 'courier'",
      url:
        "https://sam.gov/search/?index=opp&page=1&pageSize=25&sort=-modifiedDate&sfm%5Bstatus%5D%5Bis_active%5D=true&sfm%5BsimpleSearch%5D%5BkeywordRadio%5D=ALL&sfm%5BsimpleSearch%5D%5BkeywordTags%5D%5B0%5D%5Bkey%5D=courier&sfm%5BsimpleSearch%5D%5BkeywordTags%5D%5B0%5D%5Bvalue%5D=courier",
      kind: "search",
      retrievedISO: "2026-10-14",
      note:
        "Run 14 Oct 2026, 10:25–10:35 AM ET. 34 active notices nationwide (39 on 2 Oct), none with a Virginia place of performance. Same check for 'specimen transport' (3), 'medical courier' (13), 'pharmacy delivery' (17), 'laboratory courier' (7), 'specimen' (50), 'messenger' (27) and '492110' (26): none in Virginia. 'courier' + 'Virginia' and 'Richmond courier' returned zero — the seventh consecutive run.",
    },
    {
      label: "SAM.gov — 36C24627Q0029 notice page (now inactive)",
      url: "https://sam.gov/opp/450cbb12ead845878b25ac0b116d504c/view",
      kind: "solicitation",
      retrievedISO: "2026-10-14",
      note: "Status inactive on 14 Oct 2026; no follow-on solicitation found under the notice number or 'HLA transplant'.",
    },
    {
      label: "eVA — Virginia Business Opportunities, public search",
      url: "https://mvendor.cgieva.com/Vendor/public/AllOpportunities.jsp",
      kind: "search",
      retrievedISO: "2026-10-14",
      note:
        "'courier': 295 records, no open bucket (Awarded 157, Closed 36, Bids Opened 6, Intent Posted 5, No Award 63, Cancelled 9, Contact Buyer 19 — identical to 2 Oct). 'specimen': 158, none open. 'pharmacy': 490, 2 open — Albemarle County benefits administration (RFP 129453) and Birmingham Green pharmacy services in Manassas (RFP 129368), neither local nor courier. 'laboratory' 3 open, 'medical' 9 open and 'delivery services' 15 open: none courier or medical delivery. 'Social Services courier': 18, none open. '260019872': Closed 8 Oct 2026.",
    },
    {
      label: "Henrico County — open solicitations",
      url: "https://apds.henrico.gov/ords/prod/f?p=233193%3A410",
      kind: "search",
      retrievedISO: "2026-10-14",
      note: "All 8 open solicitations read; none is courier, delivery, medical or lab work.",
    },
    {
      label: "City of Richmond — OpenGov procurement portal",
      url: "https://procurement.opengov.com/portal/rva",
      kind: "search",
      retrievedISO: "2026-10-14",
      note: "Displayed a bot-verification check and could not be read. City of Richmond opportunities were not swept this run.",
    },
    {
      label: "Richmond BizSense — Breaking Ground: local building permits for 10.14.26",
      url: "https://richmondbizsense.com/2026/10/14/breaking-ground-local-building-permits-for-10-14-26/",
      kind: "news",
      retrievedISO: "2026-10-14",
      note: "Healthcare permits in Chesterfield and Henrico, including Bon Secours Iron Bridge FSED and 15200 East West Rd. Source for OPP-2026-057 and OPP-2026-059.",
    },
    {
      label: "Richmond BizSense — New Business Licenses: 10.2.26",
      url: "https://richmondbizsense.com/2026/10/02/new-business-licenses-10-2-26/",
      kind: "news",
      retrievedISO: "2026-10-14",
      note: "Two health-adjacent licences: Vines & Spines Wellness, and Medical Xpress Non Emergency Transportation (a new NEMT operator in Chesterfield — a possible competitor or partner, not a lead).",
    },
    {
      label: "Lantern — Richmond veterinarians directory",
      url: "https://lantern.llc/va/richmond/pet-services/vets",
      kind: "directory",
      retrievedISO: "2026-10-14",
      note: "36 practices listed; checked against the 35 already on the board to find the ones not yet covered. Every new vet lead was then verified on the practice's own website.",
    },
  ],
};
