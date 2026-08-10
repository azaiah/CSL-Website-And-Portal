/**
 * lib/data/weekly-report.ts
 * ---------------------------------------------------------------------------
 * LIVE DATA — the weekly briefing compiled by the Weekly Briefing agent.
 * Run 3: 2026-08-10. Updated on every weekly run.
 * ---------------------------------------------------------------------------
 */

import { outreachStats } from "./outreach";

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
}

/**
 * Derived once, here, so the briefing cannot quote a different outreach number
 * than the dashboard or the opportunity detail. Previously these were three
 * literals that had to be edited in lockstep by hand.
 */
const outreach = outreachStats();

export const weeklyReport: WeeklyReport = {
  weekOf: "2026-08-10",
  summary:
    "Third run of the engine, completed August 10, 2026. The headline is a correction, not a find: the Virginia DSS statewide courier procurement — last week's number one item at a fit score of 94 — DID NOT ISSUE. Its estimated issue date of August 1 passed, an exact search for OGS-27-005 in eVA now returns no results, the Future Procurement notice has been withdrawn from the board entirely, and no courier search anywhere in eVA shows an open solicitation. It has been rescored 94 to 79 and reframed as a watch item. Two live sweeps of SAM.gov likewise returned zero open courier or specimen-transport solicitations with a Virginia place of performance, which is now the same answer three runs running. The honest read is that public bidding is not where CSL's next dollar comes from, and this run was built accordingly: fourteen new opportunities, twelve of them commercial, chosen for what one van and no new equipment can actually serve. The best of them, Virginia Physicians Inc, is the strongest structural fit the engine has produced — eleven metro sites feeding a laboratory the practice owns itself. Five earlier records were corrected, including one that materially favours CSL: the Richmond VAMC contract is not dormant after all. Outreach remains the bottleneck and it is now the only thing standing between this board and revenue — ten drafts have gone unsent for two full weeks, so only three new drafts were written this run rather than fourteen.",
  metrics: [
    { label: "New opportunities found", value: "14", delta: "Board now at 43" },
    { label: "Top-scored leads (80+ fit)", value: "21", delta: "Up from 14" },
    {
      label: "Outreach drafted",
      value: String(outreach.drafted),
      delta:
        outreach.sent === 0
          ? "Still 0 sent — 2 weeks"
          : `${outreach.sent} sent`,
    },
    { label: "Pipeline value", value: "$2.51M", delta: "Up from $2.07M" },
  ],
  newOpportunities: [
    {
      title: "Virginia Physicians Inc — 11 sites feeding their own Glen Allen core lab",
      source: "Commercial",
      fitScore: 92,
      opportunityId: "OPP-2026-030",
    },
    {
      title: "MediDrive — new NEMT broker for Aetna Better Health VA since 4/1/2026",
      source: "DMAS / Broker",
      fitScore: 86,
      opportunityId: "OPP-2026-031",
    },
    {
      title: "Remedi SeniorCare (Ashland) — LTC cycle-fill & STAT routes",
      source: "Pharmacy",
      fitScore: 85,
      opportunityId: "OPP-2026-033",
    },
    {
      title: "Patient First — 9-center send-out specimen & inter-center route",
      source: "Commercial",
      fitScore: 84,
      opportunityId: "OPP-2026-032",
    },
    {
      title: "VDOT Statewide Courier Services — next-cycle positioning",
      source: "eVA",
      fitScore: 80,
      opportunityId: "OPP-2026-035",
    },
  ],
  topLeads: [
    {
      title: "Virginia Physicians Inc — 11-Site Spoke-to-Hub Core Lab Route",
      fitScore: 92,
      opportunityId: "OPP-2026-030",
      note: "The best-fit lead in three runs, and the reason is structural rather than promotional: VPI owns its own laboratory at 4900 Cox Road in Glen Allen, and ten of its eleven sites draw into it. A practice that runs its own core lab cannot treat specimen transport as optional. Every site is inside the radius, there is no 24/7 requirement, and being independent they choose their own vendor. Call the lab at (804) 836-1136 and ask for the laboratory manager — not the practice line. The call script is written and waiting.",
    },
    {
      title: "GENETWORx — Daily Specimen Routes",
      fitScore: 90,
      opportunityId: "OPP-2026-003",
      note: "Still the strongest lab lead, still not contacted, now fourteen days since the draft was written. CLIA lab fifteen minutes away in Glen Allen, (800) 858-5909. Nothing about this lead has changed except that two weeks have passed.",
    },
    {
      title: "Richmond VAMC Courier — Subcontract Target (IDIQ 36C24625D0070)",
      fitScore: 88,
      opportunityId: "OPP-2026-001",
      note: "Rescored UP, 84 to 88, on corrected facts. Last week's record called this vehicle nearly dormant on the basis of a single $6,411.84 delivery order. USAspending now shows five child awards totalling $245,816.84 — about 32% of the $769,850 ceiling — with activity as recent as July 10. The prime is running real Richmond volume from an Indianapolis base. That makes the subcontract call worth making, where last week's data said skip it.",
    },
    {
      title: "MediDrive — Aetna Better Health of Virginia NEMT Onboarding",
      fitScore: 86,
      opportunityId: "OPP-2026-031",
      note: "A genuinely new door. Aetna moved its transportation benefit off ModivCare to MediDrive on 4/1/2026, and a broker that has just taken over an MCO is still filling network gaps — the easiest moment to enroll there will ever be. Member line (800) 734-0430. Gated by the same DMV Form OA-151 as ModivCare and Access2Care.",
    },
    {
      title: "Remedi SeniorCare — LTC Cycle-Fill & STAT Facility Routes",
      fitScore: 85,
      opportunityId: "OPP-2026-033",
      note: "The best capability match on the board, which is a different thing from the best revenue. LTC pharmacy delivery is ambient or small-cooler — no validated cold chain, no freezer, no dry ice — so CSL can serve this fully with the van it already owns. Ashland hub, (804) 550-4856. Lead with STAT coverage, not the cycle-fill route. PharMerica and Guardian Pharmacy were both checked and ruled out: neither has a Richmond-metro pharmacy.",
    },
    {
      title: "Owens & Minor — Supplier Diversity Registration",
      fitScore: 84,
      opportunityId: "OPP-2026-020",
      note: "Last week's open question is answered and the answer is yes. O&M accepts certification from a 'state agency responsible for this function,' so Virginia SWaM qualifies — NMSDC is not required. Register and attach the certificate. Note the ownership change: the distribution business was sold to Platinum Equity on 12/31/2025 and stays in Mechanicsville; the old public parent is now Accendra Health. Approach the distributor, not the parent.",
    },
  ],
  outreach,
  deadlines: [
    { title: "Send the thirteen outreach drafts — ten are two weeks old", dueDate: "2026-08-14" },
    { title: "Medzoomer courier signup — OVERDUE since run 1 (3 weeks)", dueDate: "2026-08-12" },
    { title: "File DMV Form OA-151 online — gates 4 broker records", dueDate: "2026-08-21" },
    { title: "Call VPI Core Lab (804) 836-1136 — highest-fit lead on the board", dueDate: "2026-08-21" },
    { title: "Call VDOT buyer Kimberly Palmer re: courier cycle + awardee", dueDate: "2026-08-21" },
    { title: "Register with HealthTrust + ask whether SWaM is recognized", dueDate: "2026-09-04" },
    { title: "Price validated 2-8°C shippers + data loggers (unlocks 3 lanes)", dueDate: "2026-09-04" },
  ],
  corrections: [
    {
      item: "Virginia DSS Statewide Courier Services (OGS-27-005 / FPR 124752) — DID NOT ISSUE",
      detail:
        "This was last week's number one item at a fit score of 94, with a hard deadline of August 1 and a recommendation to contact the buyer before the solicitation dropped. It never dropped. Verified live in eVA on 2026-08-10: an exact search for OGS-27-005 returns NO RESULTS, the notice is absent from all 80 Future Procurements currently posted, and neither a 'courier' nor a 'Statewide Courier Services' search shows any Open status bucket. The estimated issue date passed and the notice was withdrawn. Fit lowered 94 to 79, the hard-deadline flag removed, and the record reframed from a bid to a watch item. Buyer Pedro Andrade is still an active VDSS buyer on other postings, so the contact remains good — the question to ask him is now whether it was cancelled, deferred, or absorbed.",
    },
    {
      item: "Richmond VAMC IDIQ 36C24625D0070 — corrected in CSL's favour",
      detail:
        "Last week this record was lowered from 92 to 84 on the finding that only one delivery order of $6,411.84 had ever been issued against a $769,850 ceiling. That was already stale. USAspending now shows FIVE child awards totalling $245,816.84 obligated, roughly 32% of ceiling, with IDV transaction activity as recent as 7/10/2026. The vehicle is being used steadily. Fit raised back to 88. The set-aside constraint is unchanged — single-award SDVOSB through 2030, so CSL still cannot bid it directly and this stays a subcontract and teaming target.",
    },
    {
      item: "Virginia statewide courier IS contracted — VDOT ran one in June",
      detail:
        "Standing intel said Virginia's statewide delivery contracts are parcel and express only and that same-day local courier remains uncontracted. That is wrong. VDOT issued IFB161013 (eVA IFB-122257) 'Courier Services' statewide on 6/11/2026; it closed 7/6/2026 and a Notice of Intent to Award was posted 7/15/2026. The window opened and closed before this engine's first sweep, so nothing was missed — but the recurring cycle is now on the board as OPP-2026-035, with buyer Kimberly Palmer, (804) 729-6317. eVA history shows VDOT re-procures this repeatedly (2014, 2019, 2021, 2026) and the 2014 cycle was expressly SET ASIDE FOR SMALL BUSINESS. The intended awardee could not be identified: the award document is captcha-gated and was deliberately not bypassed, and no other public source names it. Ask the buyer.",
    },
    {
      item: "ModivCare covers three of five MCOs, not four — and one phone number was wrong",
      detail:
        "Aetna Better Health of Virginia moved its NEMT benefit from ModivCare to MediDrive effective 4/1/2026. ModivCare now covers fee-for-service plus Humana, Sentara and UnitedHealthcare. Aetna is tracked separately as a new opportunity. Separately, the number (804) 873-5200 recorded in run 2 appears in no ModivCare or DMAS published contact list and has been STRUCK from the file — use ModivCare Provider Assistance (866) 810-8302. The Access2Care number (877) 892-3988 is confirmed current, but it is the Anthem member line, not a ModivCare number, and run 2 filed it under the wrong organization.",
    },
    {
      item: "Owens & Minor — SWaM IS accepted, and the company changed hands",
      detail:
        "Run 2 flagged this as an open question worth one phone call. It is answered: O&M's supplier diversity page accepts certification from NMSDC, the Office of Small Business Certification, US DOT, 'or state agency responsible for this function' — so a Virginia SWaM certificate qualifies and no second certification track is needed. Self-certification is not accepted, so the actual certificate matters. Also corrected: O&M is no longer a Richmond-headquartered public company. The distribution business was sold to Platinum Equity on 12/31/2025 and remains Mechanicsville-based; the former public parent renamed itself Accendra Health, Inc. Fit raised 79 to 84.",
    },
    {
      item: "DMV Form OA-151 — confirmed, with two additions",
      detail:
        "Every figure from run 2 checks out against DMV's current published materials: OA-151 is the NEMT Carrier application (OA-150 is the Broker application), $350,000 liability for the 1–6 passenger tier, a $25,000 surety bond or letter of credit held three years, and a $50 filing fee. Two things run 2 missed: there is also a $3 operating authority registration fee, and while online filing became available 1/1/2026 it does not become mandatory until 2/1/2027.",
    },
    {
      item: "Bremo Pharmacy — Skipwith Road closure confirmed, and the better number found",
      detail:
        "Run 2 reduced this record from $55,000 to $45,000 on a third-party listing showing the Skipwith Road site closed. Confirmed: Bremo's own website lists only three sites, all on Staples Mill Road. The estimate stands. The useful addition is that the LTC division has its own direct line, (804) 285-7823, and its own published cycle-fill model — that is the number to call, not the retail line.",
    },
    {
      item: "No hard published deadline exists on the board this week",
      detail:
        "Worth stating plainly rather than leaving to inference. With the VDSS hard-deadline flag removed, zero of the 43 records now carry a published bid deadline — every date on the board is a CSL internal target. That is not a data gap; it is the actual state of the market for this business right now, and it is why the recommended moves below are all calls and filings rather than bid preparation.",
    },
  ],
  recommendedMoves: [
    "Send the drafts. This is the same first recommendation as last week and the week before, and it is now the only thing separating a 43-record board from revenue. Ten drafts have sat unsent for two weeks; three more were added this run and no more will be added next run until some go out. Opportunity supply is not the constraint and has not been for three weeks — approval is.",
    "Call the VPI Core Lab at (804) 836-1136 and ask for the laboratory manager. This is the highest-fit lead the engine has found in three runs, the call script is written, and the qualifying question takes ninety seconds: how do specimens get from the ten satellite offices to Glen Allen today. If the answer is 'our staff drive them,' that is the whole sale.",
    "File DMV Form OA-151 online. Unchanged from last week and still the highest-leverage single filing available: it gates ModivCare, Access2Care, Roundtrip and now the new MediDrive record all at once. Budget $350,000 liability coverage, a $25,000 bond held three years, a $50 fee and a $3 registration fee.",
    "Call VDOT buyer Kimberly Palmer at (804) 729-6317. Four questions, ten minutes: the term of the contract about to be awarded, who the intended awardee is, whether the requirement has ever been split by district, and whether small-business set-aside was considered. This converts a contract cycle CSL didn't know existed into a dated plan and a subcontract target.",
    "Work the ambient lane first, deliberately. Remedi SeniorCare, Family Care Pharmacy and Bremo LTC are all cycle-fill and STAT pharmacy delivery — no validated cold chain, no freezer, no hazmat. CSL can serve all three today with the van it owns. Chasing home infusion or trial-kit work before buying validated 2–8°C shippers and data loggers would mean failing a quality audit rather than winning a client.",
    "Close out Medzoomer. It has now been open for three weeks, it is a form rather than a sale, and it is the oldest unresolved action on the board.",
    "Stop treating public bidding as the primary channel. Three consecutive live sweeps of SAM.gov and eVA have produced zero open courier or specimen solicitations CSL can bid in Virginia. Public procurement is worth staying registered and notified for — the VDOT and VDSS cycles will come back — but the twelve commercial records added this run are where the next contract realistically comes from.",
  ],
};
