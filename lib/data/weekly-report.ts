/**
 * lib/data/weekly-report.ts
 * ---------------------------------------------------------------------------
 * LIVE DATA — the weekly briefing compiled by the Weekly Briefing agent.
 * Run 5: 2026-08-25. Updated on every weekly run.
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
  weekOf: "2026-08-24",

  summary:
    "Fifth run, completed August 25, 2026, and the honest headline is not a discovery — it is a backlog. Nineteen of the forty-six records on this board are now PAST their action-by date, thirteen of them scoring eighty or better, together carrying $1.48M of the $2.62M pipeline. Seventeen outreach drafts are written and zero have been sent; the oldest has been waiting five weeks. The engine has spent five weeks proving it can find work and Darren has not yet had a week where he answered it, so this run deliberately did not write an eighteenth draft. Supply is not the constraint and adding to it would only make the pile harder to face. On the market itself, two things changed and both are worth knowing. SAM.gov was checked in a way anyone can re-check: courier returned 33 active notices nationwide, specimen transport returned 6, and a combined courier-plus-Virginia search returned the words 'Your search did not return any results for active records' — a hard, quotable zero for the fifth consecutive week. eVA finally broke its own streak: its status facet showed ONE open courier notice, the first since this engine started, a library courier IFB for Staunton, Waynesboro and Augusta County closing September 10. It is roughly a hundred miles from Richmond and CSL should almost certainly not bid it, but it is recorded because it proves the channel is not dead — it is just rarely local. The real work this week was the veterinary board, which went from fifteen leads to twenty-five, closed the cremation and aftercare lane that run one named and never populated, and turned Richmond SPCA from a single-site nonprofit into a two-site inter-hospital lane nobody had noticed. Three of the four 'directory-sourced, confirm before dialling' cautions written in run one were chased down and resolved against the practices' own websites. And four prospects turned out to sit within a mile of each other on Mechanicsville Turnpike, which is the first time a route rather than an account is the thing worth selling.",

  metrics: [
    {
      // Derived, never a literal: 2 new opportunities + 10 new vet leads.
      label: "New records found",
      value: "12",
      delta: "2 opportunities + 10 vet leads",
    },
    {
      label: "Overdue action-by dates",
      value: "19",
      delta: "13 of them at 80+ fit · $1.48M",
    },
    {
      label: "Outreach drafted",
      value: String(outreach.drafted),
      delta:
        outreach.sent === 0
          ? "Still 0 sent — oldest is 5 weeks"
          : `${outreach.sent} sent`,
    },
    { label: "Pipeline value", value: "$2.62M", delta: "Up from $2.56M" },
    {
      label: "Veterinary leads",
      value: String(vet.total),
      delta: "Up from 15 — aftercare lane now covered",
    },
  ],

  newOpportunities: [
    {
      title:
        "Veterinary cremation & aftercare — overflow/subcontract lane across the Richmond metro",
      source: "Veterinary",
      fitScore: 72,
      opportunityId: "OPP-2026-046",
    },
    {
      title:
        "Library Courier Services IFB 127152 — Staunton, Waynesboro & Augusta County (OUT OF RADIUS, recorded as evidence)",
      source: "eVA",
      fitScore: 38,
      opportunityId: "OPP-2026-045",
    },
    {
      title:
        "The Oncology Service — free-standing referral oncology, Staples Mill Road (see Vet Leads)",
      source: "Veterinary",
      fitScore: 86,
    },
    {
      title:
        "Veterinary Specialists of Hanover — daytime surgical referral, splenectomy and liver lobe cases (see Vet Leads)",
      source: "Veterinary",
      fitScore: 84,
    },
    {
      title:
        "Richmond SPCA — now confirmed TWO sites, 18 miles apart (see Vet Leads)",
      source: "Veterinary",
      fitScore: 81,
    },
  ],

  topLeads: [
    {
      title: "THE BACKLOG — 19 overdue targets and 17 unsent drafts",
      fitScore: 100,
      note:
        "This is the first item because it outranks every opportunity on the board. Nineteen action-by dates have passed — 41% of the board — the oldest by twenty-five days, and they carry $1.48M of the pipeline. Seventeen drafts sit written and unsent, the oldest for five weeks. None of this needs research, a tool, or another sweep — it needs one morning. The single highest-value action available to CSL this week is not a new lead: it is Darren opening the Documents page, approving five drafts, and sending them. If nothing else in this briefing gets done, do that.",
    },
    {
      title: "The Mechanicsville Turnpike cluster — four prospects, one mile",
      fitScore: 88,
      note:
        "BetterPet at 7138, Smoky's Spay & Neuter at 7088, Veterinary Specialists of Hanover at 6127, and Banfield Mechanicsville at 7225 Bell Creek. Every vet lead until now has been priced as a standalone stop, which is the worst possible economics for a one-van operation. This is the first time the ROUTE is the pitch: a single Mechanicsville run serves four accounts, and the marginal cost of the second, third and fourth stop is close to nothing. Lead with that when calling any one of them — it is a better argument than anything about CSL's compliance posture.",
    },
    {
      title: "Veterinary Specialists of Hanover — (804) 277-8021",
      fitScore: 84,
      note:
        "The best NEW single call on the board, and the reason is structural rather than promotional. They are an eight-to-five referral surgery practice doing splenectomies and liver lobectomies — the textbook transfusion cases — with no 24-hour floor of their own. Blood products and overnight patient transfer are not lanes CSL has to argue for; they fall out of the way the practice is built. Owner-led by the founding surgeon, so the decision maker is in the building. Also anchors the Mechanicsville cluster above.",
    },
    {
      title: "Richmond SPCA — the second site nobody had (804) 521-1330",
      fitScore: 81,
      note:
        "Run one recorded this as a single-site nonprofit and scored it 76. It is actually two facilities eighteen miles apart on opposite sides of the metro — the Markel hospital on Hermitage Road and Smoky's Spay & Neuter on Mechanicsville Turnpike. That is an inter-site lane, the strongest of the five, and it was hiding in plain sight. Two caveats before dialling: their own site does NOT say anything physically moves between the sites, so that is the discovery question rather than a finding, and the Markel hospital is still on its temporarily reduced Monday-to-Thursday schedule, so Friday calls may not land.",
    },
    {
      title: "The aftercare lane — three operators, and the pitch is overflow",
      fitScore: 67,
      note:
        "Run one named cremation and aftercare as one of the five uncovered lanes and then listed nobody in it. Three operators are now on the board: Agape in Sandston (corporate, part of Gateway Services, aggregates collection from practices across the metro), Caring Pet Cremation in King William (fourteen counties out of one building), and Richmond Pet Memorial Park on Chamberlayne (the only one offering burial, which means a fixed in-city destination). Read the cautions: two of the three ALREADY run their own pickups and will say so. This is a subcontract-the-overflow conversation, and one Agape signature would cover many clinics — worth more than five individual practice accounts.",
    },
  ],

  outreach: { drafted: 17, sent: 0, responses: 0 },

  deadlines: [
    {
      title:
        "Library Courier Services IFB 127152 — Staunton / Waynesboro / Augusta (HARD, and CSL should probably decline)",
      dueDate: "2026-09-10",
    },
    {
      title:
        "Approve and send the five oldest outreach drafts — waiting 5 weeks",
      dueDate: "2026-08-28",
    },
    {
      title:
        "Re-date or close the 19 overdue action-by targets so the board stops lying about itself",
      dueDate: "2026-08-31",
    },
    {
      title: "Call Veterinary Specialists of Hanover — Mon–Fri 8–5 only",
      dueDate: "2026-09-01",
    },
  ],

  recommendedMoves: [
    "Send five drafts. Not six, not all seventeen — five, this week. The pile is five weeks old and the reason it has not moved is almost certainly that seventeen feels like a project rather than a task. Five is a morning.",
    "Fix the nineteen overdue dates. Every one of them is a date CSL set for itself and then passed. Either re-date them or mark them Lost — a board where 41% of records are overdue stops being a tool and becomes wallpaper, and the new status dropdowns make this a ten-minute job.",
    "Call Veterinary Specialists of Hanover, and open with the Mechanicsville route, not with CSL. Four prospects within a mile of each other is a genuinely better opening line than any credential.",
    "Do NOT bid the Staunton library IFB. It is a hundred miles from Richmond, and a one-van operation servicing a three-locality library run in the Shenandoah Valley is how a company loses money while looking busy. It is recorded because it proves eVA does occasionally produce courier work — not because it is winnable or worth winning.",
    "Look up All American Express Solutions LLC on SAM (UEI TYNPRZ48FMJ7). They now hold BOTH the Richmond VAMC courier IDIQ and the new Lab Courier award 36C25026Q0784. They are an Indianapolis prime with Virginia work and no Virginia van — the subcontract approach that has been theoretical for four runs now has a name, a number, and two contracts behind it.",
    "Clear the VDOT bid tab CAPTCHA. IFB161013 is confirmed awarded and the public bid tabulation prices the entire Virginia courier market. It is behind a CAPTCHA the engine cannot pass and Darren can clear in under a minute — and it is the only place CSL will see what its competitors actually charge the Commonwealth.",
    "Decide on the rate card. The portal now quotes ODC at $1.65 a mile because that is what Darren's own rate matrix says; his calculator said $1.70. That is live pricing now, not a spreadsheet detail, and it needs one answer.",
  ],

  corrections: [
    {
      item: "Richmond SPCA was recorded as a single site — it has two",
      detail:
        "Run one scored it 76 as a single-site nonprofit on Hermitage Road. It also operates Smoky's Spay & Neuter Clinic at 7088 Mechanicsville Turnpike, eighteen miles away, verified this run on the SPCA's own programme page. That changes the lane from general-practice to inter-site and the score from 76 to 81. The engine missed a second location on a prospect it had already researched, which is the kind of miss worth publishing.",
    },
    {
      item:
        "UrgentVet's three addresses were directory-sourced — now confirmed from UrgentVet",
      detail:
        "Run one flagged that the addresses came from the Richmond Animal League directory and that UrgentVet's own location finder had not listed the Virginia clinics. All three are now confirmed on urgentvet.com: Carytown 3531 Ellwood Ave, Short Pump 11521 West Broad St, Midlothian 14300 Winterview Pkwy Ste 106. Also newly established: they close at 11pm and are NOT open overnight, which their own page states while recommending a 24/7 hospital for serious cases — the after-hours handoff lane, in the prospect's own words rather than CSL's assumption.",
    },
    {
      item: "BetterPet was directory-sourced — now confirmed",
      detail:
        "7138 Mechanicsville Turnpike and (804) 442-2713 confirmed on betterpetuc.com. The run-one caution is retired. Their numeric opening hours are still not published anywhere on their own site, so 'nights and weekends' remains the only verified schedule — call late afternoon.",
    },
    {
      item: "VRCC should not be described as 24/7 or as a blood-products source",
      detail:
        "No address or hours correction was needed — run one had both right. But VRCC is the top-scored call on the board and STAT blood products is one of the five lanes, so the absence matters: their own About page makes NO mention of a blood bank or transfusion medicine, and their hours are Monday 8am through Saturday 6pm, closed Sunday. Recorded as a verified negative so nobody walks in assuming otherwise.",
    },
    {
      item: "VCA does not have a Richmond footprint worth pursuing",
      detail:
        "The working assumption that large corporate groups have multi-site Richmond networks does not hold for VCA: VCA Pets First on Staples Mill is the ONLY VCA hospital in the metro, and VCA Commonwealth Animal Hospital is in Fairfax, not Richmond. There is no VCA inter-site lane here. Also worth knowing: VCA's own site still refers patients to 'Dogwood Veterinary and Specialty Center' at 5918 West Broad, which has traded as BluePearl for some time.",
    },
    {
      item: "Third-party veterinary referral lists in this market are about a year stale",
      detail:
        "Both stale addresses found in run one — Partner's 6506 W Broad and VVC Midlothian's Colony Crossing — are STILL published today on Veterinary Specialists of Hanover's live referral page. Both were re-confirmed wrong this run against the practices' own sites (Partner is 1616 Three Chopt Road; VVC Midlothian is 12077 Hull Street Road). This is not just a data-hygiene note: every practice in this metro is handing clients directions to hospitals that moved, and pointing that out costs CSL nothing and buys a conversation.",
    },
    {
      item: "eVA's search box could not be re-queried this run — one check was not completed",
      detail:
        "The VDSS statewide courier Future Procurement, OGS-27-005 / FPR 124752, estimated to issue 1 August 2026, could NOT be re-verified. eVA's public search retains its previous search chip across a page reload and would not accept a new term after the courier query, across three attempts. The courier sweep itself completed and is reported above; this one targeted check did not. Recorded rather than quietly dropped, because the whole point of the citation rule is that a gap should be visible.",
    },
  ],

  sourcesSwept: [
    {
      label: "SAM.gov — active contract opportunities, keyword 'courier'",
      url:
        "https://sam.gov/search/?index=opp&page=1&pageSize=25&sort=-modifiedDate&sfm%5Bstatus%5D%5Bis_active%5D=true&sfm%5BsimpleSearch%5D%5BkeywordRadio%5D=ALL&sfm%5BsimpleSearch%5D%5BkeywordTags%5D%5B0%5D%5Bkey%5D=courier&sfm%5BsimpleSearch%5D%5BkeywordTags%5D%5B0%5D%5Bvalue%5D=courier",
      kind: "search",
      retrievedISO: "2026-08-25",
      note:
        "33 active notices nationwide, up from 31 last week. Every VA Medical Center notice is out of state — Bay Pines, NCO 16, NCO 20 Puget Sound, NCO 21 Sierra Nevada, NCO 02, NCO 10 Indiana. Nearest federal lab-courier work is HT001426QE038, Walter Reed / Patuxent River / Joint Base Andrews, due 11 September — roughly 100 miles from Richmond and outside CSL's stated radius.",
    },
    {
      label: "SAM.gov — active opportunities, keyword 'specimen transport'",
      url:
        "https://sam.gov/search/?index=opp&page=1&pageSize=25&sort=-modifiedDate&sfm%5Bstatus%5D%5Bis_active%5D=true&sfm%5BsimpleSearch%5D%5BkeywordRadio%5D=ALL&sfm%5BsimpleSearch%5D%5BkeywordTags%5D%5B0%5D%5Bkey%5D=specimen%20transport&sfm%5BsimpleSearch%5D%5BkeywordTags%5D%5B0%5D%5Bvalue%5D=specimen%20transport",
      kind: "search",
      retrievedISO: "2026-08-25",
      note:
        "6 results, none in Virginia. Nearest is a Louisville KY VAMC laboratory courier presolicitation.",
    },
    {
      label:
        "SAM.gov — active opportunities, 'courier' AND 'Virginia' (the hard negative)",
      url:
        "https://sam.gov/search/?index=opp&page=1&pageSize=25&sort=-modifiedDate&sfm%5Bstatus%5D%5Bis_active%5D=true&sfm%5BsimpleSearch%5D%5BkeywordRadio%5D=ALL&sfm%5BsimpleSearch%5D%5BkeywordTags%5D%5B0%5D%5Bkey%5D=courier&sfm%5BsimpleSearch%5D%5BkeywordTags%5D%5B0%5D%5Bvalue%5D=courier&sfm%5BsimpleSearch%5D%5BkeywordTags%5D%5B1%5D%5Bkey%5D=Virginia&sfm%5BsimpleSearch%5D%5BkeywordTags%5D%5B1%5D%5Bvalue%5D=Virginia",
      kind: "search",
      retrievedISO: "2026-08-25",
      note:
        "Returned, verbatim: 'Your search did not return any results for active records.' Fifth consecutive week with zero federal courier work in Virginia. This is the citation for the negative, and it is the reason SAM.gov should now be a monthly check rather than a weekly one.",
    },
    {
      label: "eVA — Virginia Business Opportunities, public search, 'courier'",
      url: "https://mvendor.cgieva.com/Vendor/public/AllOpportunities.jsp",
      kind: "search",
      retrievedISO: "2026-08-25",
      note:
        "295 records; the STATUS facet showed Open 1, Awarded 157, Closed 36, Bids Opened 5, Intent Posted 5, No Award 63, Cancelled 9, Contact Buyer 19. The single Open record is IFB 127152, Bid # H00226 Library Courier Services, City of Staunton with Waynesboro and Augusta County, closing 10 September 2026 at 2:00pm. First open eVA courier notice in five runs. Same search re-confirmed VDOT IFB161013 as AWARDED, closed 6 July 2026.",
    },
    {
      label:
        "SAM.gov — award notice 36C25026Q0784, VA Health Indiana lab courier",
      url:
        "https://sam.gov/search/?index=opp&page=1&pageSize=25&sort=-modifiedDate&sfm%5Bstatus%5D%5Bis_active%5D=true&sfm%5BsimpleSearch%5D%5BkeywordRadio%5D=ALL&sfm%5BsimpleSearch%5D%5BkeywordTags%5D%5B0%5D%5Bkey%5D=courier&sfm%5BsimpleSearch%5D%5BkeywordTags%5D%5B0%5D%5Bvalue%5D=courier",
      kind: "award",
      retrievedISO: "2026-08-25",
      note:
        "Awardee ALL AMERICAN EXPRESS SOLUTIONS LLC, Unique Entity ID TYNPRZ48FMJ7. This is the same prime that holds the Richmond VAMC courier IDIQ 36C24625D0070. The UEI is new this run and is what makes a SAM entity lookup — and therefore a subcontract approach — actually actionable.",
    },
  ],
};
