/**
 * lib/data/weekly-report.ts
 * ---------------------------------------------------------------------------
 * LIVE DATA — the weekly briefing compiled by the Weekly Briefing agent.
 * Run 6 — the 9/30 sweep (2026-09-30, swept 30 Sep – 2 Oct). Updated on every
 * weekly run.
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
  weekOf: "2026-09-28",

  summary:
    "The 9/30 sweep — the sixth run, and the first in five weeks, so it is labelled by date rather than as W6 and every record it added carries a '9/30' chip on the board. It ran 30 September to 2 October 2026. The headline has two halves and both matter. The good half: for the first time in six runs SAM.gov produced a courier requirement INSIDE Richmond. A VA sources-sought notice for transplant (HLA) testing at the Richmond VAMC, published 14 September, writes the courier leg into the scope in plain words — the contractor 'shall provide transportation/courier services to transport samples from Richmond VAMC to VCU HLA laboratory.' The prime will be a laboratory, so CSL's route in is as the named courier on that lab's quote, and the notice goes inactive on 6 October — this week. eVA also has one genuinely open, genuinely local item: the City of Richmond's Justice Center pharmacy RFP, closing 8 October, which CSL can only join as a pharmacy's delivery subcontractor. The bad half is the same as last time, only larger. Five weeks without a run means 44 of the 55 records on the board are now past their action-by date, including every single one of the 22 that score 80 or better, carrying $2.56M of the $2.78M pipeline. Seventeen outreach drafts are still written and unsent according to the engine's data, the oldest now ten weeks old. If any of that has moved on the portal's status controls since 25 August, those edits win — but if it has not, the board is no longer a list of opportunities so much as a list of dates that passed. On the veterinary side the board went from 25 leads to 35 and opened two lanes nobody had touched: the first multi-site independent general practice (Locke A. Taylor, three hospitals), and equine medicine, led by a 24/7 owner-run surgical referral hospital in Ashland. One existing record was materially wrong and is corrected: BluePearl's emergency service is now closed every weekend.",

  metrics: [
    {
      label: "New records found",
      value: "19",
      delta: "9 opportunities + 10 vet leads, all tagged 9/30",
    },
    {
      label: "Overdue action-by dates",
      value: "44",
      delta: "All 22 records at 80+ fit · $2.56M",
    },
    {
      label: "Outreach drafted",
      value: String(outreach.drafted),
      delta:
        outreach.sent === 0
          ? "Still 0 sent — oldest is 10 weeks"
          : `${outreach.sent} sent`,
    },
    { label: "Pipeline value", value: "$2.78M", delta: "Up from $2.62M" },
    {
      label: "Veterinary leads",
      value: String(vet.total),
      delta: "Up from 25 — equine lane and first 3-site independent",
    },
  ],

  newOpportunities: [
    {
      title:
        "Richmond VAMC HLA transplant testing + courier — sources sought 36C24627Q0029, courier leg to the VCU HLA lab",
      source: "VA Medical Center",
      fitScore: 78,
      opportunityId: "OPP-2026-047",
    },
    {
      title:
        "Family Care Pharmacy — independent LTC pharmacy promising 24/7 emergency delivery (Richmond + Mechanicsville)",
      source: "Pharmacy",
      fitScore: 70,
      opportunityId: "OPP-2026-050",
    },
    {
      title:
        "Omnicare of Richmond — LTC pharmacy changing owners in October (CVS sale to GenieRx)",
      source: "Pharmacy",
      fitScore: 65,
      opportunityId: "OPP-2026-049",
    },
    {
      title:
        "Richmond City Justice Center pharmacy RFP #260019872 — OPEN, closes 8 Oct (subcontract only)",
      source: "eVA",
      fitScore: 55,
      opportunityId: "OPP-2026-048",
    },
    {
      title:
        "Woodside Equine Clinic, Ashland — 24/7 owner-run surgical referral hospital for horses (see Vet Leads)",
      source: "Veterinary",
      fitScore: 82,
    },
    {
      title:
        "Locke A. Taylor Veterinary Hospital — three hospitals, one owner group, open to 8pm (see Vet Leads)",
      source: "Veterinary",
      fitScore: 80,
    },
  ],

  topLeads: [
    {
      title: "THE BACKLOG — 44 overdue dates, every 80+ record among them",
      fitScore: 100,
      note:
        "Still the most valuable hour available to CSL, and the five-week gap made it worse: 44 of 55 action-by dates have passed, including all 22 of the strongest records, together $2.56M of a $2.78M pipeline. The oldest has been overdue since 31 July. None of this needs research — it needs the status dropdowns. Re-date what is still alive, mark Lost what is not, and the board becomes useful again in an afternoon. Equally, if the 17 drafts have been sent and the portal shows it, this card is out of date and the briefing should say so next run.",
    },
    {
      title: "Richmond VAMC courier leg — email the contracting officer before 6 October",
      fitScore: 78,
      note:
        "The most time-sensitive item on the board: the only one on the board with a clock that runs out this week and a federal client asking, in writing, for exactly what CSL does. The VA's sources-sought for HLA transplant testing at the Richmond VAMC requires the winning lab to courier samples from the VAMC to VCU's HLA laboratory. CSL cannot bid it — it is a 621511 laboratory buy — but the lab that wins needs a local courier it can name. Two actions: email Gordon Burns (gordon.burns@va.gov) asking to be notified of the follow-on solicitation and whether the courier leg may be subcontracted, and find who at VCU Health's HLA lab will respond. This is also the first time in six runs that the 'subcontract to the prime' strategy has a prime that genuinely has no van.",
      opportunityId: "OPP-2026-047",
    },
    {
      title: "Woodside Equine Clinic — (804) 798-3281",
      fitScore: 82,
      note:
        "The best new veterinary call, and an entirely new lane for the board. Owner-run since 1989, eleven vets, two board-certified surgeons, 24/7 surgical referrals for colic. Referring vets send horses at all hours, and the bloodwork, films and history have to follow. Read the caution: they run their own lab, they do nuclear scintigraphy (CSL must not imply it can carry radioactive material), and the new Emergency & Surgery facility has no published address yet — ask for it.",
    },
    {
      title: "Locke A. Taylor — three hospitals, one owner group, (804) 262-8629",
      fitScore: 80,
      note:
        "The multi-site independent general practice this board has been missing: Woodman Road, N Parham Road and Glen Allen Animal Hospital, roughly fifteen minutes apart, open until 8pm two nights a week. A standing inter-site lane plus a same-evening ER hand-off. Two cautions: their emergency page still points clients to 'Dogwood' (now BluePearl, which is closed at weekends) — do not repeat that name on the call — and the current owner is not published, so ask who decides.",
    },
    {
      title: "Lee Park Road — the Mechanicsville route gets two more stops",
      fitScore: 72,
      note:
        "Mechanicsville Animal Hospital at 7044 Lee Park Rd and Family Care Pharmacy's Mechanicsville site at 7016 Lee Park Rd are neighbours on the same street, in the same 23111 corridor as the four Mechanicsville Turnpike prospects flagged in August. Drive distances have not been measured, so check them on a map before saying it on a call — but if they hold, one Mechanicsville run could serve six accounts across two industries, which is a better opening line than any credential.",
    },
  ],

  outreach: { drafted: 17, sent: 0, responses: 0 },

  deadlines: [
    {
      title:
        "Richmond VAMC HLA + courier sources sought goes inactive — email Gordon Burns before then",
      dueDate: "2026-10-06",
    },
    {
      title:
        "Richmond City Justice Center pharmacy RFP #260019872 closes 2:00pm (HARD — subcontract offers to bidders by 5 Oct)",
      dueDate: "2026-10-08",
    },
    {
      title: "Re-date or close the 44 overdue action-by targets",
      dueDate: "2026-10-09",
    },
    {
      title: "Register on Chesterfield County's Bonfire portal (PInG retires 31 Dec 2026)",
      dueDate: "2026-12-15",
    },
  ],

  recommendedMoves: [
    "Email the VA contracting officer this week. The Richmond VAMC sources-sought goes inactive on 6 October; one polite email asking to be notified of the solicitation, and whether the courier leg can be subcontracted, costs ten minutes and puts CSL on the record before a single competitor has a reason to look.",
    "Decide on the Justice Center RFP by Monday. It closes 8 October. Read the delivery and subcontracting sections first — if delivery is by mail-order or the prime's own fleet, let it go without regret. If it is not, offer two or three likely pharmacy bidders a SWaM delivery subcontract by 5 October.",
    "Spend one afternoon on the status dropdowns. 44 overdue dates is not a pipeline, it is a backlog. Re-date what is alive, mark Lost what is not. Every strong record on the board is in that pile.",
    "Send five drafts. The advice from August stands unchanged: not seventeen, five. The oldest is now ten weeks old.",
    "Call Woodside Equine and Locke A. Taylor first among the new vet leads. One opens a lane nobody else in this market is serving; the other is the inter-site general practice the board has been missing.",
    "Do not bid the Staunton library IFB — and do not worry about it: eVA now shows it as 'Bids Opened', so it closed on 10 September without CSL, which was the right outcome.",
    "Register on Chesterfield County's Bonfire portal before January. Chesterfield moves its solicitations from PInG to Bonfire on 1 January 2027, and a county that is building three hospitals is a county whose procurement CSL should be able to see.",
  ],

  corrections: [
    {
      item: "BluePearl Richmond's emergency hours were wrong on the board — it is now closed every weekend",
      detail:
        "V1 recorded emergency as Sunday 7am to Wednesday 7pm, closed Thursday. BluePearl's own page, re-opened 30 September, now reads: Monday and Wednesday 12–7am and 9am–midnight, Tuesday, Thursday and Friday 24 hours, Saturday and Sunday CLOSED. The hours, pitch and opening question on VET-2026-005 were corrected and the new citation appended. It changes the after-hours picture for the whole west end: weekend emergencies now go to VVC Short Pump, VRCC (closed Sundays) or further.",
    },
    {
      item: "The VDSS statewide courier procurement (OGS-27-005) has still not issued — two months late",
      detail:
        "OPP-2026-016 was the top-valued eVA item for four runs on the strength of a Future Procurement estimated to issue 1 August 2026. An eVA search for 'Social Services courier' on 2 October returned 18 records with NO open status at all (Awarded 11, Intent Posted 2, No Award 4, Cancelled 1); the newest DSS courier solicitation listed is SP-CSE-24-049 from 2024. Last run this check could not be completed; this run it was, and the answer is that nothing has been issued. Its 15 September action-by date has passed for a solicitation that does not yet exist — it should be re-dated, not chased.",
    },
    {
      item: "Staunton library courier IFB is closed — 'Bids Opened'",
      detail:
        "OPP-2026-045 was recorded in August as an open eVA notice closing 10 September. eVA now lists IFB 127152 as 'Bids Opened'. The record's advice was not to bid, and it was not bid; it stays on the board as evidence that eVA does occasionally produce courier work.",
    },
    {
      item: "Richmond SPCA's Monday–Thursday schedule is a staffing problem, not a short-term blip",
      detail:
        "Their own page still shows the temporary Monday–Thursday schedule that began 6 April. 12 On Your Side reported in May that it is due to a veterinarian and technician shortage, and that the hospital sees about 9,000 patients a year. Citation appended to VET-2026-009. Friday calls still will not land.",
    },
    {
      item: "Third-party referral lists are still stale — two new practices are sending clients to old names",
      detail:
        "Locke A. Taylor's emergency page still sends clients to 'Dogwood Specialty Center', and Iron Bridge Animal Hospital's still lists 'Veterinary Emergency Center – South' and '– Cary Street' (now VVC Midlothian and VVC Short Pump). Same pattern as August. Unverified and NOT acted on: VVC's own Short Pump page still mentions a 'Cary St. Hospital' while its locations page lists only three hospitals — call before routing anything to Cary Street.",
    },
    {
      item: "Some practice websites could not be verified this run and were left off rather than guessed",
      detail:
        "Prevent A Litter (W Cary St), Hanover Animal Hospital, Fan Animal Hospital and Goochland Animal Clinic all failed to load or were blocked; Richmond Animal Care & Control, Henrico Animal Protection, Chesterfield Animal Services and Maymont publish no on-site veterinary clinic. None was added on directory evidence alone. City of Richmond, Chesterfield, Hanover, VCU and Richmond Public Schools procurement listings could not be read either (JavaScript-rendered or blocked) — so 'nothing open' is confirmed only for eVA, Henrico's visible rows and GRTC.",
    },
  ],

  sourcesSwept: [
    {
      label: "SAM.gov — active contract opportunities, keyword 'courier'",
      url:
        "https://sam.gov/search/?index=opp&page=1&pageSize=25&sort=-modifiedDate&sfm%5Bstatus%5D%5Bis_active%5D=true&sfm%5BsimpleSearch%5D%5BkeywordRadio%5D=ALL&sfm%5BsimpleSearch%5D%5BkeywordTags%5D%5B0%5D%5Bkey%5D=courier&sfm%5BsimpleSearch%5D%5BkeywordTags%5D%5B0%5D%5Bvalue%5D=courier",
      kind: "search",
      retrievedISO: "2026-10-02",
      note:
        "39 active notices nationwide, up from 33 in August. Every VA courier notice is out of state — Northern California SPS courier, NCO 16, Cincinnati VAMC (due 15 Oct), Stratton VAMC, VISN 22. Award notices worth knowing: Allstate Courier Systems won Stratton VAMC FY27 courier, FCX LLC the C.W. Bill Young pharmacy on-demand courier, Tri-Tone Management Services the Overton Brooks courier — the VA medical-courier market is a market of small primes.",
    },
    {
      label: "SAM.gov — active opportunities, 'courier' AND 'Virginia' (the hard negative)",
      url:
        "https://sam.gov/search/?index=opp&page=1&pageSize=25&sort=-modifiedDate&sfm%5Bstatus%5D%5Bis_active%5D=true&sfm%5BsimpleSearch%5D%5BkeywordRadio%5D=ALL&sfm%5BsimpleSearch%5D%5BkeywordTags%5D%5B0%5D%5Bkey%5D=courier&sfm%5BsimpleSearch%5D%5BkeywordTags%5D%5B0%5D%5Bvalue%5D=courier&sfm%5BsimpleSearch%5D%5BkeywordTags%5D%5B1%5D%5Bkey%5D=Virginia&sfm%5BsimpleSearch%5D%5BkeywordTags%5D%5B1%5D%5Bvalue%5D=Virginia",
      kind: "search",
      retrievedISO: "2026-10-02",
      note:
        "Returned, verbatim: 'Your search did not return any results for active records.' Sixth consecutive run. Note the keyword search MISSED the Richmond VAMC notice below, because its text says 'Richmond VAMC' rather than 'Virginia' — the specimen-transport search is what found it, and both should stay in the weekly routine.",
    },
    {
      label: "SAM.gov — active opportunities, keyword 'specimen transport'",
      url:
        "https://sam.gov/search/?index=opp&page=1&pageSize=25&sort=-modifiedDate&sfm%5Bstatus%5D%5Bis_active%5D=true&sfm%5BsimpleSearch%5D%5BkeywordRadio%5D=ALL&sfm%5BsimpleSearch%5D%5BkeywordTags%5D%5B0%5D%5Bkey%5D=specimen%20transport&sfm%5BsimpleSearch%5D%5BkeywordTags%5D%5B0%5D%5Bvalue%5D=specimen%20transport",
      kind: "search",
      retrievedISO: "2026-10-02",
      note:
        "5 active results. One is in Richmond: 36C24627Q0029, VCU Heart and Renal Lab and Transplant Testing, a sources-sought from NCO 6 for the Richmond VAMC that includes a courier requirement (OPP-2026-047).",
    },
    {
      label: "SAM.gov — 36C24627Q0029 notice page",
      url: "https://sam.gov/opp/450cbb12ead845878b25ac0b116d504c/view",
      kind: "solicitation",
      retrievedISO: "2026-10-02",
      note:
        "Published 14 Sep 2026, response 21 Sep, inactive 6 Oct; NAICS 621511; no set-aside; contact Gordon Burns, gordon.burns@va.gov, 757-251-4333.",
    },
    {
      label: "eVA — Virginia Business Opportunities, public search, 'courier'",
      url: "https://mvendor.cgieva.com/Vendor/public/AllOpportunities.jsp",
      kind: "search",
      retrievedISO: "2026-10-02",
      note:
        "295 records; STATUS facet: Awarded 157, Closed 36, Bids Opened 6, Intent Posted 5, No Award 63, Cancelled 9, Contact Buyer 19 — NO open bucket. The Staunton library IFB 127152 that was open in August is now 'Bids Opened'; VDOT IFB161013 still 'Awarded'. Same search page also run for 'specimen' (157 records, none open), 'veterinary' (402 records; the 2 open are a Northern Virginia Community College K-9 RFP and a VCCS dosimeter RFP, neither relevant), 'Social Services courier' (18 records, none open — see corrections) and '260019872' (the open Justice Center RFP).",
    },
    {
      label: "Henrico County — open solicitations",
      url: "https://apds.henrico.gov/ords/prod/f?p=233193%3A410",
      kind: "search",
      retrievedISO: "2026-09-30",
      note:
        "11 open solicitations; the 7 rows that loaded were HVAC, A&E, recreation software, water and road works and police equipment, closing 7–21 October. Nothing for courier, delivery, medical or lab in those rows.",
    },
    {
      label: "Chesterfield County — Procurement (PInG to Bonfire move)",
      url: "https://www.chesterfield.gov/840/Procurement",
      kind: "regulation",
      retrievedISO: "2026-09-30",
      note:
        "States solicitations stay on PInG until 31 December 2026 and move to Bonfire on 1 January 2027. The listings themselves could not be read. Procurement contact 804-748-1617, procurement@chesterfield.gov.",
    },
    {
      label: "GRTC — procurement bid opportunities",
      url: "https://www.ridegrtc.com/business/procurement-bid-opportunities/",
      kind: "search",
      retrievedISO: "2026-09-30",
      note: "No open items and no planned courier or paratransit work listed.",
    },
  ],
};
