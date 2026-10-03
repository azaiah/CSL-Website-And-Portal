/**
 * 9/30 sweep data assertions — run with: node scripts/verify-930.mjs
 * Node 22+ strips TypeScript types natively, so the data modules import directly.
 */
import { pathToFileURL } from "node:url";
import { register } from "node:module";
import path from "node:path";

// The data modules use extensionless relative imports ("./outreach"), which
// Next resolves but plain Node does not. Retry unresolved specifiers as .ts.
register(
  "data:text/javascript," +
    encodeURIComponent(`export async function resolve(s, c, next) {
      try { return await next(s, c); }
      catch (e) { if (s.startsWith(".") && !/\\.[cm]?[jt]s$/.test(s)) return next(s + ".ts", c); throw e; }
    }`)
);

const root = path.resolve(import.meta.dirname, "..");
const load = (p) => import(pathToFileURL(path.join(root, p)).href);

const { opportunities, SWEEPS, LATEST_RUN_ISO } = await load("lib/data/opportunities.ts");
const { vetLeads, VET_SWEEPS, LATEST_VET_RUN_ISO, vetLeadStats } = await load("lib/data/vet-leads.ts");
const { weeklyReport } = await load("lib/data/weekly-report.ts");

const RUN = "2026-09-30";
const OK_DATES = new Set(["2026-09-30", "2026-10-02"]);
let fails = 0;
const check = (name, ok, got = "") => {
  console.log(`${ok ? "PASS" : "FAIL"}: ${name}${got !== "" ? ` — got ${got}` : ""}`);
  if (!ok) fails++;
};

const live = opportunities.filter((o) => o.status !== "Lost");
const pipeline = live.reduce((s, o) => s + o.estValue, 0);
const overdue = opportunities.filter((o) => o.dueDate < RUN);
const vs = vetLeadStats();

check("SWEEPS latest is 9/30", SWEEPS.at(-1).label === "9/30" && LATEST_RUN_ISO === RUN, SWEEPS.at(-1).label);
check("VET_SWEEPS latest is 9/30", VET_SWEEPS.at(-1).label === "9/30" && LATEST_VET_RUN_ISO === RUN, VET_SWEEPS.at(-1).label);
check("opportunities.length === 55", opportunities.length === 55, opportunities.length);
check("new opportunities this run === 9", opportunities.filter((o) => o.addedISO === RUN).length === 9);
check("pipeline === 2783950 ($2.78M)", pipeline === 2783950, pipeline);
check("fit >= 80 === 22", opportunities.filter((o) => o.fitScore >= 80).length === 22);
check("overdue (due < 9/30) === 44", overdue.length === 44, overdue.length);
check("overdue at 80+ === 22", overdue.filter((o) => o.fitScore >= 80).length === 22);
check("overdue value === 2559850 ($2.56M)", overdue.reduce((s, o) => s + o.estValue, 0) === 2559850);
check("vetLeads.length === 35", vetLeads.length === 35, vetLeads.length);
check("new vet leads this run === 10", vetLeads.filter((l) => l.addedISO === RUN).length === 10);
check("vet priorities HOT 10 / WARM 14 / WATCH 11", vs.byPriority.HOT === 10 && vs.byPriority.WARM === 14 && vs.byPriority.WATCH === 11, JSON.stringify(vs.byPriority));

const newRecs = [...opportunities, ...vetLeads].filter((r) => r.addedISO === RUN);
check("every 9/30 record has sources", newRecs.every((r) => r.sources?.length > 0));
check("every 9/30 source dated 9/30 or 10/2", newRecs.every((r) => r.sources.every((s) => OK_DATES.has(s.retrievedISO))));
check("every 9/30 source has an https URL", newRecs.every((r) => r.sources.every((s) => /^https:\/\//.test(s.url))));
check("every 9/30 record maps to a sweep", opportunities.filter((o) => o.addedISO === RUN).every((o) => SWEEPS.some((s) => s.iso === o.addedISO)));
check("unique opportunity ids", new Set(opportunities.map((o) => o.id)).size === opportunities.length);
check("unique vet ids", new Set(vetLeads.map((l) => l.id)).size === vetLeads.length);
check("vet tel digits match phone", vetLeads.every((l) => !l.phone || l.tel === l.phone.replace(/\D/g, "")));
check("report weekOf 2026-09-28", weeklyReport.weekOf === "2026-09-28");
check("report links resolve", [...weeklyReport.newOpportunities, ...weeklyReport.topLeads].every((x) => !x.opportunityId || opportunities.some((o) => o.id === x.opportunityId)));
check("report metric: new records 19", weeklyReport.metrics[0].value === String(9 + 10));
check("report metric: vet total derived", weeklyReport.metrics.at(-1).value === "35");

console.log(fails === 0 ? "\nALL PASS" : `\n${fails} FAILED`);
process.exit(fails ? 1 : 0);
