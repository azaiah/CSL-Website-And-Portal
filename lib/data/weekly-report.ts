/**
 * lib/data/weekly-report.ts
 * ---------------------------------------------------------------------------
 * LIVE DATA — the weekly briefing compiled by the Weekly Briefing agent.
 * Run 4: 2026-08-17. Updated on every weekly run.
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
  weekOf: "2026-08-17",
  summary:
    "Fourth run, completed August 17, 2026, and it is a deliberate change of direction rather than another fourteen records. Two things happened. First, the public market gave the same answer for the fourth consecutive week, and this time it was checked in a way anyone can re-check: a live SAM.gov sweep returned 31 active courier notices nationwide and zero with a Virginia place of performance, a specimen-transport sweep returned 7 and zero in Virginia, and eVA's own status facet showed NO OPEN BUCKET AT ALL for courier — 294 records, every one of them awarded, closed, cancelled or no-award. Second, at Darren's direction the engine opened a new niche: Richmond-area veterinary practices, which now have their own board with fifteen verified practices across nineteen physical sites. The honest headline on that niche is a disqualifier, not a number — IDEXX and Antech run their own courier fleets and bundle routine specimen collection into the lab contract, so the daily send-out route everyone assumes is the prize is already gone. What is genuinely uncovered is movement between sites in multi-location groups, STAT blood products, the after-hours transfer lane, and controlled substances. Every lead is written around that. From this run onward every record also cites the URLs the engine actually opened, so when a lab manager asks Darren how CSL found them, there is a real answer. And the bottleneck has not moved: seventeen drafts are now written, zero have been sent, and the oldest has been waiting four weeks.",
  metrics: [
    {
      // Derived, not typed in: one new opportunity plus every lead on the new
      // veterinary board. Same rule as the outreach figure below — a count in
      // this report must never be a literal someone has to remember to edit.
      label: "New records found",
      value: String(1 + vet.total),
      delta: `1 opportunity + ${vet.total} vet leads`,
    },
    { label: "Top-scored leads (80+ fit)", value: "22", delta: "Up from 21" },
    {
      label: "Outreach drafted",
      value: String(outreach.drafted),
      delta:
        outreach.sent === 0
          ? "Still 0 sent — 4 weeks"
          : `${outreach.sent} sent`,
    },
    { label: "Pipeline value", value: "$2.56M", delta: "Up from $2.51M" },
  ],
  newOpportunities: [
    {
      title:
        "Richmond Veterinary Referral Network — inter-hospital, STAT & after-hours transfer lane",
      source: "Veterinary",
      fitScore: 87,
      opportunityId: "OPP-2026-044",
    },
    {
      title:
        "Virginia Veterinary Centers — 3-hospital group, 2 sites inside the radius (see Vet Leads)",
      source: "Veterinary",
      fitScore: 93,
    },
    {
      title:
        "Veterinary Referral & Critical Care — privately owned since 1997, referral-only specialties",
      source: "Veterinary",
      fitScore: 91,
    },
    {
      title:
        "Partner Veterinary — 2-state group, critical care only in Richmond",
      source: "Veterinary",
      fitScore: 88,
    },
    {
      title: "UrgentVet — three metro clinics forming a ready-made route",
      source: "Veterinary",
      fitScore: 82,
    },
  ],
  topLeads: [
    {
      title: "Veterinary Referral & Critical Care — Manakin-Sabot",
      fitScore: 91,
      note:
        "Make this the first call of the week, and the reason is ownership rather than size. VRCC has been privately owned and operated since 1997, so the person who can approve a courier arrangement works in the building — which is not true at BluePearl, at UrgentVet, or at any corporate group on the new board. Internal medicine and surgery are referral-only, so cases arrive from general practices across the metro every day, and the hospital closes Sunday, which means something is always backed up on Monday. (804) 784-8722. The call script is written and on the board.",
    },
    {
      title: "Virginia Physicians Inc — 11-Site Spoke-to-Hub Core Lab Route",
      fitScore: 92,
      opportunityId: "OPP-2026-030",
      note:
        "Still the strongest lead on the main board and still not called, one week after being named the best structural fit in three runs. Nothing has changed except that a week has passed. VPI owns its own laboratory at 4900 Cox Road and ten sites draw into it. The lab's direct line is (804) 836-1136 — ask for the laboratory manager, not the practice line. This record now carries its source: VPI's own laboratory services page.",
    },
    {
      title: "Virginia Veterinary Centers — Short Pump & Midlothian",
      fitScore: 93,
      note:
        "The anchor account for the new niche and the highest-scoring lead the engine has produced in any run. Three hospitals in one group means an inter-site lane exists before a single outside client is signed; radiation oncology means scheduled repeat-visit patients travelling in from other practices. One conversation covers both metro hospitals — do not call them separately. (804) 353-9000.",
    },
    {
      title: "GENETWORx — Daily Specimen Routes",
      fitScore: 90,
      opportunityId: "OPP-2026-003",
      note:
        "Four weeks since this draft was written and it has still not been sent. A CLIA lab fifteen minutes away in Glen Allen, (800) 858-5909. There is no new intelligence to report because nobody has made contact — that is the entire status.",
    },
    {
      title: "Richmond VAMC Courier — Subcontract Target (IDIQ 36C24625D0070)",
      fitScore: 88,
      opportunityId: "OPP-2026-001",
      note:
        "New evidence, and it points the right way. This run's SAM.gov sweep surfaced award notice 36C25026Q0784 — Lab Courier Services, published 8/12/2026, awarded to ALL AMERICAN EXPRESS SOLUTIONS LLC, the same Indianapolis prime that holds the Richmond VAMC IDIQ. They are actively winning more VA lab courier work. A prime expanding its VA footprint from out of state has a real reason to want local capacity, which is exactly the conversation CSL wants to have.",
    },
    {
      title: "Partner Veterinary Emergency & Specialty — Henrico",
      fitScore: 88,
      note:
        "A two-hospital group where only the Richmond site carries critical care. That asymmetry is the pitch: anything Frederick cannot handle has a reason to move. Small enough to decide quickly. (804) 206-9122 — and note the address correction below before anyone drives there.",
    },
  ],
  outreach,
  deadlines: [
    {
      title:
        "SEND THE SEVENTEEN DRAFTS — the oldest are four weeks old and nothing else on this list matters until they go",
      dueDate: "2026-08-21",
    },
    {
      title: "Call VRCC (804) 784-8722 — first call of the vet run, script ready",
      dueDate: "2026-08-21",
    },
    {
      title: "Call VPI Core Lab (804) 836-1136 — carried over, still uncalled",
      dueDate: "2026-08-21",
    },
    {
      title:
        "Download the VDOT NOA + Bid Tab from eVA (captcha — 60 seconds) and name the awardee",
      dueDate: "2026-08-24",
    },
    { title: "Medzoomer courier signup — OVERDUE since run 1 (4 weeks)", dueDate: "2026-08-19" },
    { title: "File DMV Form OA-151 online — gates 4 broker records", dueDate: "2026-08-28" },
    {
      title: "Call Virginia Veterinary Centers (804) 353-9000 — covers both metro hospitals",
      dueDate: "2026-08-28",
    },
  ],
  corrections: [
    {
      item: "VDOT IFB161013 — AWARDED on 8/11/2026. The awardee is still not named, and this run says exactly why.",
      detail:
        "Last week's record said a Notice of Intent to Award had been posted on 7/15/2026 and that the intended awardee could not be identified. Re-checked live in eVA on 8/17/2026: the status is now AWARDED, the Award tab shows an Award Date of 8/11/2026, and BOTH a Notice of Award and a public Bid Tab were posted that day. The awardee's name is still not readable from the portal — the NOA and Bid Tab downloads are captcha-gated, and the engine did not bypass that. This is a two-minute job for a human: open the eVA opportunity search, look up IFB161013, clear the captcha and open the Bid Tab, which will also show every bidder and their price. That last part is worth more than the name — it prices the market. Buyer Kimberly Palmer, (804) 729-6317, is still the better call.",
    },
    {
      item: "The Richmond VAMC prime just won another VA lab courier contract",
      detail:
        "New this run, from the live SAM.gov sweep. Award notice 36C25026Q0784, 'Lab Courier Services', Network Contract Office 10, published 8/12/2026, awarded to ALL AMERICAN EXPRESS SOLUTIONS LLC (UEI TYNPRZ48FMJ7) — the same company that holds Richmond VAMC IDIQ 36C24625D0070. Two runs ago this record was written down on the theory the vehicle was dormant; last run that was corrected on the obligation data; this run adds that the prime is actively expanding its VA lab courier book from an Indianapolis base. The subcontract approach is the strongest it has looked.",
    },
    {
      item: "Virginia DSS OGS-27-005 — still gone, three weeks past its estimated issue date",
      detail:
        "Re-checked live in eVA on 8/17/2026. A courier search returns 294 records and the STATUS facet contains NO 'Open' bucket whatsoever — awarded, closed, bids-opened, intent-posted, no-award, cancelled and contact-buyer only. A veterinary search returns 398 records with the same result: no Open bucket. OGS-27-005 has not reappeared. The record stays a watch item at 79. This is now the fourth consecutive run finding zero live Commonwealth courier solicitations, and it should be treated as the market's answer rather than a run of bad luck.",
    },
    {
      item: "THE VETERINARY NICHE: the obvious pitch is already taken, and it is better to know now",
      detail:
        "Before anyone calls a veterinary practice about daily specimen pickup: IDEXX and Antech both operate their own courier fleets and fold collection into the practice's reference-lab contract — IDEXX publishes online courier scheduling for exactly this. A pitch built on routine send-outs will be corrected on the first call and will cost credibility for the rest of the conversation. The lanes that are genuinely uncovered are movement between sites in multi-location groups, STAT blood products between emergency hubs, after-hours transfer of records and imaging following a patient to whichever ER received them, controlled-substance movement between sites, and cremation and aftercare transport. Every one of the fifteen vet leads is written around those, and each carries the opening question to use instead of a pitch.",
    },
    {
      item: "Two addresses on the metro's most-shared referral list are wrong",
      detail:
        "The Richmond Animal League publishes the emergency and urgent-care list that Richmond veterinary clients get handed, and it is partly stale. It gives Partner Veterinary as 6506 W Broad St; Partner's own site says 1616 Three Chopt Road, Henrico. It gives Virginia Veterinary Centers' Midlothian hospital as 2460 Colony Crossing Place and a Richmond hospital at 3312 W Cary Street; VVC's own site lists Midlothian at 12077 Hull Street Road in a facility that opened in July 2024, and lists no Cary Street hospital at all — the metro sites are Short Pump and Midlothian. Where the two disagreed, the practice's own site won and the conflict is recorded on the lead card. Anyone working from the RAL list alone would have lost a morning.",
    },
    {
      item: "'Dogwood Veterinary Emergency & Specialty Center' is BluePearl",
      detail:
        "Worth stating because Dogwood still has an active social presence and shows up in local searches. Dogwood and 'The Oncology Service — Dogwood' operated at 5918 W Broad Street — the same address as BluePearl Pet Hospital Richmond — and are now listed as closed. Do not pursue Dogwood as a separate account. Also noted on the BluePearl lead: their emergency service runs Sunday 7am to Wednesday 7pm, is closed Thursday, and runs Friday 7am to 7pm. That is a real gap in metro emergency coverage, and the cases it displaces go to the other hubs.",
    },
    {
      item: "Every record from this run cites its sources — and the older ones honestly do not",
      detail:
        "New capability, added at Darren's request so that 'how did you find us?' has a real answer. Each record now carries the URLs the engine actually opened, with the date it opened them and what each one establishes, shown under 'Where this came from' on the opportunity and on every vet lead. Six earlier high-value records were back-filled where the sources could be re-verified this week. The remaining records from runs 1 to 3 predate the rule and show that plainly rather than having plausible-looking URLs invented for them after the fact — a fabricated citation would be worse than an absent one.",
    },
  ],
  recommendedMoves: [
    "Send the drafts. Fourth week, same first recommendation, and it is no longer a nag — it is the finding. Seventeen drafts exist, zero have been sent, and the oldest has been waiting four weeks. The board has 44 opportunities and 15 veterinary leads on it. Opportunity supply has never been the constraint; approval is, and every week that gap stays open is a week of engine output going nowhere.",
    "Call VRCC at (804) 784-8722 and ask for the hospital administrator or the owner. First call of the vet run. Private ownership since 1997 means the decision-maker is in the building. Open with the question that is printed on the card — how do referrals from general practices physically reach you — and do not mention lab pickup.",
    "Call Virginia Veterinary Centers at (804) 353-9000. One conversation covers Short Pump and Midlothian and puts the Fredericksburg lane on the table. This is the highest-scoring lead in four runs.",
    "Call the VPI Core Lab at (804) 836-1136. Unchanged from last week, because nothing about it changed except that another week passed. Ask for the laboratory manager and ask how specimens get from the ten satellites to Glen Allen.",
    "Spend two minutes on the VDOT captcha. Open eVA's public opportunity search, look up IFB161013, and download the Bid Tab. It names the awardee and every bidder's price — that is a market price for statewide courier work in Virginia, and CSL currently has none.",
    "File DMV Form OA-151. Fourth week on this list. It still gates ModivCare, Access2Care, Roundtrip and MediDrive simultaneously, and it is still the single highest-leverage filing available. $350,000 liability, a $25,000 bond held three years, a $50 fee and a $3 registration fee.",
    "Do not buy anything for the vet niche yet. The whole veterinary board can be served with the van CSL already owns — inter-site transfers, records, imaging media and controlled substances are ambient and need no cold chain. Prove the lane with a two-week trial at one hospital before spending on anything.",
  ],
  sourcesSwept: [
    {
      label: "SAM.gov — active courier notices (live search, 8/17/2026)",
      url: "https://sam.gov/search/?index=opp&page=1&pageSize=25&sort=-modifiedDate&sfm%5Bstatus%5D%5Bis_active%5D=true&sfm%5BsimpleSearch%5D%5BkeywordRadio%5D=ALL&sfm%5BsimpleSearch%5D%5BkeywordTags%5D%5B0%5D%5Bkey%5D=courier&sfm%5BsimpleSearch%5D%5BkeywordTags%5D%5B0%5D%5Bvalue%5D=courier",
      kind: "search",
      retrievedISO: "2026-08-17",
      note:
        "31 active notices nationwide, none with a Virginia place of performance. Also surfaced the 8/12/2026 award of 36C25026Q0784 to ALL AMERICAN EXPRESS SOLUTIONS LLC.",
    },
    {
      label: "SAM.gov — active specimen transport notices (live search, 8/17/2026)",
      url: "https://sam.gov/search/?index=opp&page=1&pageSize=100&sort=-modifiedDate&sfm%5Bstatus%5D%5Bis_active%5D=true&sfm%5BsimpleSearch%5D%5BkeywordRadio%5D=ALL&sfm%5BsimpleSearch%5D%5BkeywordTags%5D%5B0%5D%5Bkey%5D=specimen%20transport&sfm%5BsimpleSearch%5D%5BkeywordTags%5D%5B0%5D%5Bvalue%5D=specimen%20transport",
      kind: "search",
      retrievedISO: "2026-08-17",
      note: "7 active notices nationwide, none in Virginia.",
    },
    {
      label: "eVA — public opportunity search (courier and veterinary, 8/17/2026)",
      url: "https://mvendor.cgieva.com/Vendor/public/AllOpportunities.jsp",
      kind: "search",
      retrievedISO: "2026-08-17",
      note:
        "Courier: 294 records, no Open status bucket. Veterinary: 398 records, no Open status bucket. IFB161013 re-opened and confirmed AWARDED with an award date of 8/11/2026.",
    },
    {
      label: "Richmond Animal League — emergency & urgent care clinic list",
      url: "https://www.ral.org/posts/emergency-and-urgent-care-clinics",
      kind: "directory",
      retrievedISO: "2026-08-17",
      note:
        "The starting map for the veterinary sweep. Every entry was re-checked against the practice's own site; two addresses were found to be stale.",
    },
    {
      label: "IDEXX Reference Laboratories — lab courier management",
      url: "https://www.idexx.com/en/veterinary/reference-laboratories/lab-courier-management/",
      kind: "organization",
      retrievedISO: "2026-08-17",
      note:
        "The evidence for the vet niche's central caveat: the reference labs run their own courier networks with online pickup scheduling.",
    },
  ],
};
