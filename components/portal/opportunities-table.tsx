"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowUpDown,
  X,
  MapPin,
  Calendar,
  Building2,
  Lightbulb,
  AlertCircle,
} from "lucide-react";
import {
  opportunities as allOpps,
  LATEST_RUN_ISO,
  type Opportunity,
  type OpportunityStatus,
} from "@/lib/data/opportunities";
import { formatCurrency, formatDate, cn } from "@/lib/utils";

type SortKey = "fitScore" | "dueDate" | "estValue";

const statusColors: Record<OpportunityStatus, string> = {
  Found: "bg-navy/10 text-navy",
  Qualified: "bg-success/10 text-success",
  Contacted: "bg-gold/15 text-[#8a6c1f]",
  Meeting: "bg-blue-100 text-blue-700",
  Bid: "bg-purple-100 text-purple-700",
  Won: "bg-success/15 text-success",
  Lost: "bg-red-100 text-red-600",
};

function fitColor(score: number) {
  if (score >= 85) return "bg-success text-white";
  if (score >= 70) return "bg-gold text-navy-deep";
  return "bg-navy/15 text-navy";
}

function isNew(o: Opportunity) {
  return o.addedISO === LATEST_RUN_ISO;
}

const sources = ["All", ...Array.from(new Set(allOpps.map((o) => o.source)))];
const statuses = ["All", "Found", "Qualified", "Contacted", "Meeting", "Bid", "Won", "Lost"];

export function OpportunitiesTable() {
  const [source, setSource] = useState("All");
  const [status, setStatus] = useState("All");
  const [onlyNew, setOnlyNew] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>("fitScore");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [selected, setSelected] = useState<Opportunity | null>(null);

  const newCount = useMemo(() => allOpps.filter(isNew).length, []);

  const rows = useMemo(() => {
    let r = allOpps.filter(
      (o) =>
        (source === "All" || o.source === source) &&
        (status === "All" || o.status === status) &&
        (!onlyNew || isNew(o))
    );
    r = [...r].sort((a, b) => {
      let cmp = 0;
      if (sortKey === "dueDate") cmp = a.dueDate.localeCompare(b.dueDate);
      else cmp = a[sortKey] - b[sortKey];
      return sortDir === "asc" ? cmp : -cmp;
    });
    return r;
  }, [source, status, onlyNew, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-wrap items-end gap-4">
        <label className="text-sm">
          <span className="mb-1.5 block font-medium text-navy-deep">Source</span>
          <select
            value={source}
            onChange={(e) => setSource(e.target.value)}
            className="rounded-xl border border-navy/15 bg-white px-3 py-2 text-sm"
          >
            {sources.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          <span className="mb-1.5 block font-medium text-navy-deep">Status</span>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="rounded-xl border border-navy/15 bg-white px-3 py-2 text-sm"
          >
            {statuses.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>

        {/* Quick filter for whatever the latest sweep added, so Darren can see
            what changed without re-reading the whole board. */}
        <button
          type="button"
          onClick={() => setOnlyNew((v) => !v)}
          aria-pressed={onlyNew}
          className={cn(
            "rounded-xl border px-3 py-2 text-sm font-medium transition-colors",
            onlyNew
              ? "border-gold bg-gold text-navy-deep"
              : "border-navy/15 bg-white text-navy hover:bg-surface"
          )}
        >
          New this week
          <span
            className={cn(
              "ml-2 rounded-full px-1.5 py-0.5 text-xs font-bold",
              onlyNew ? "bg-navy-deep text-gold" : "bg-navy/10 text-navy"
            )}
          >
            {newCount}
          </span>
        </button>

        <p className="ml-auto text-sm text-ink/50">
          {rows.length} {rows.length === 1 ? "opportunity" : "opportunities"}
        </p>
      </div>

      {/* Table */}
      {/* `min-w-0` lets this wrapper shrink below the table's width so the table
          scrolls inside its own box instead of widening the whole page. */}
      <div className="mt-5 min-w-0 overflow-x-auto rounded-2xl border border-navy/10 bg-white shadow-card">
        <table className="w-full min-w-[880px] text-left text-sm">
          <thead className="border-b border-navy/10 bg-surface text-xs uppercase tracking-wide text-ink/60">
            <tr>
              <th className="px-4 py-3 font-semibold">Opportunity</th>
              <th className="px-4 py-3 font-semibold">Source</th>
              <th className="px-4 py-3 font-semibold">NAICS</th>
              <th className="px-4 py-3 font-semibold">Location</th>
              <th className="px-4 py-3 font-semibold">
                <SortBtn label="Due" active={sortKey === "dueDate"} onClick={() => toggleSort("dueDate")} />
              </th>
              <th className="px-4 py-3 font-semibold">
                <SortBtn label="Fit" active={sortKey === "fitScore"} onClick={() => toggleSort("fitScore")} />
              </th>
              <th className="px-4 py-3 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-navy/5">
            {rows.map((o) => (
              <tr
                key={o.id}
                onClick={() => setSelected(o)}
                className="cursor-pointer transition-colors hover:bg-surface"
              >
                <td className="max-w-xs px-4 py-3">
                  {/* The table already scrolls sideways inside its own box, so
                      wrap these instead of truncating — the full opportunity
                      name and agency stay readable. */}
                  <p className="break-words font-medium text-navy-deep">
                    {isNew(o) && (
                      <span className="mr-2 inline-flex rounded-full bg-gold px-1.5 py-0.5 align-middle text-[10px] font-bold uppercase tracking-wide text-navy-deep">
                        New
                      </span>
                    )}
                    {o.title}
                  </p>
                  <p className="break-words text-xs text-ink/50">{o.agency}</p>
                </td>
                <td className="px-4 py-3 text-ink/70">{o.source}</td>
                <td className="px-4 py-3 font-mono text-xs text-ink/70">{o.naics}</td>
                <td className="px-4 py-3 text-ink/70">{o.location}</td>
                <td className="px-4 py-3 text-ink/70">
                  {formatDate(o.dueDate)}
                  {o.hardDeadline && (
                    <span className="ml-1.5 inline-flex items-center rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-red-600">
                      Hard
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span className={cn("inline-flex h-7 w-9 items-center justify-center rounded-md text-xs font-bold", fitColor(o.fitScore))}>
                    {o.fitScore}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={cn("inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold", statusColors[o.status])}>
                    {o.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Detail drawer */}
      <AnimatePresence>
        {selected && (
          <>
            <motion.div
              className="fixed inset-0 z-50 bg-navy-deep/40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelected(null)}
              aria-hidden
            />
            <motion.aside
              className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col overflow-y-auto bg-white shadow-2xl"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.3 }}
              role="dialog"
              aria-label="Opportunity details"
            >
              <div className="sticky top-0 flex items-start justify-between gap-4 border-b border-navy/10 bg-white p-6">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={cn("inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold", statusColors[selected.status])}>
                      {selected.status}
                    </span>
                    {isNew(selected) && (
                      <span className="inline-flex rounded-full bg-gold px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-navy-deep">
                        New this week
                      </span>
                    )}
                  </div>
                  <h2 className="mt-2 text-lg font-semibold text-navy-deep">
                    {selected.title}
                  </h2>
                </div>
                <button
                  onClick={() => setSelected(null)}
                  className="rounded-lg p-1.5 text-ink/50 hover:bg-surface"
                  aria-label="Close details"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-6 p-6">
                <div className="grid grid-cols-2 gap-3">
                  <Meta icon={Building2} label="Agency" value={selected.agency} />
                  <Meta icon={MapPin} label="Location" value={selected.location} />
                  <Meta
                    icon={Calendar}
                    label={selected.hardDeadline ? "Published deadline" : "Action by"}
                    value={formatDate(selected.dueDate)}
                  />
                  <Meta icon={ArrowUpDown} label="Est. value" value={formatCurrency(selected.estValue)} />
                </div>

                {selected.hardDeadline && (
                  <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" aria-hidden />
                    <p className="text-xs text-red-700">
                      This is a real published date from the issuing body — not
                      an internal target. Missing it forfeits the opportunity.
                    </p>
                  </div>
                )}

                <div className="flex items-center gap-3 rounded-xl bg-surface p-4">
                  <span className={cn("flex h-11 w-11 items-center justify-center rounded-lg text-sm font-bold", fitColor(selected.fitScore))}>
                    {selected.fitScore}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-navy-deep">Fit score</p>
                    <p className="text-xs text-ink/60">
                      Scored by the Lead Qualifier
                    </p>
                  </div>
                </div>

                <Detail title="Description">{selected.description}</Detail>
                <Detail title="Why it fits">{selected.whyItFits}</Detail>

                <div className="rounded-xl border border-gold/30 bg-gold/10 p-4">
                  <p className="flex items-center gap-1.5 text-sm font-semibold text-[#8a6c1f]">
                    <Lightbulb className="h-4 w-4" aria-hidden />
                    Suggested next action
                  </p>
                  <p className="mt-1.5 text-sm text-ink/75">
                    {selected.suggestedAction}
                  </p>
                </div>

                <p className="text-xs text-ink/40">
                  Live opportunity · ID {selected.id}
                  {selected.addedISO
                    ? ` · first found ${formatDate(selected.addedISO)}`
                    : ""}
                  . Found by the Opportunity Finder and scored by the Lead
                  Qualifier.
                </p>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function SortBtn({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn("inline-flex items-center gap-1 hover:text-navy", active && "text-navy")}
    >
      {label}
      <ArrowUpDown className="h-3.5 w-3.5" aria-hidden />
    </button>
  );
}

function Meta({ icon: Icon, label, value }: { icon: typeof MapPin; label: string; value: string }) {
  return (
    <div>
      <p className="flex items-center gap-1.5 text-xs text-ink/50">
        <Icon className="h-3.5 w-3.5" aria-hidden />
        {label}
      </p>
      {/* `break-words` so long agency or location names wrap instead of overflowing. */}
      <p className="mt-0.5 break-words text-sm font-medium text-navy-deep">{value}</p>
    </div>
  );
}

function Detail({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-navy-deep">{title}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-ink/70">{children}</p>
    </div>
  );
}
