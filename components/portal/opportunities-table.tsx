"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowUpDown } from "lucide-react";
import {
  opportunities as engineOpps,
  LATEST_RUN_ISO,
  SWEEPS,
  sweepFor,
  type Opportunity,
} from "@/lib/data/opportunities";
import { healthFor, todayISO } from "@/lib/health";
import { OpportunityModal } from "@/components/portal/opportunity-modal";
import { fitColor } from "@/components/portal/opportunity-detail";
import { StatusControl } from "@/components/portal/status-control";
import { useStatuses } from "@/lib/status-context";
import {
  OPPORTUNITY_STATUS_OPTIONS,
  opportunityStatusStyle,
} from "@/lib/status-options";
import { formatDate, cn } from "@/lib/utils";

type SortKey = "fitScore" | "dueDate" | "estValue";

function isNew(o: Opportunity) {
  return o.addedISO === LATEST_RUN_ISO;
}

const sources = ["All", ...Array.from(new Set(engineOpps.map((o) => o.source)))];
const statuses = ["All", "Found", "Qualified", "Contacted", "Meeting", "Bid", "Won", "Lost"];

export function OpportunitiesTable() {
  // Rows are filtered and sorted on the OVERRIDDEN statuses, so filtering by
  // "Contacted" finds what Darren has marked contacted — not what the engine
  // last guessed.
  const { resolvedOpportunities } = useStatuses();

  const [source, setSource] = useState("All");
  const [status, setStatus] = useState("All");
  const [sweep, setSweep] = useState("All");
  const [sortKey, setSortKey] = useState<SortKey>("fitScore");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  // Only the id — the modal resolves the record, so there is no second copy of
  // an opportunity living in component state.
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Client-only: this page is statically generated, so a build-time "today"
  // would be wrong for every visitor after day one. Shared with the pipeline
  // board via lib/health so both views agree on what "overdue" means.
  const [today, setToday] = useState<string | null>(null);
  useEffect(() => setToday(todayISO()), []);

  const rows = useMemo(() => {
    let r = resolvedOpportunities.filter(
      (o) =>
        (source === "All" || o.source === source) &&
        (status === "All" || o.status === status) &&
        (sweep === "All" || o.addedISO === sweep)
    );
    r = [...r].sort((a, b) => {
      let cmp = 0;
      if (sortKey === "dueDate") cmp = a.dueDate.localeCompare(b.dueDate);
      else cmp = a[sortKey] - b[sortKey];
      return sortDir === "asc" ? cmp : -cmp;
    });
    return r;
  }, [resolvedOpportunities, source, status, sweep, sortKey, sortDir]);

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

        {/* Filter by which weekly sweep surfaced the opportunity, so it stays
            obvious what run 2 added versus what carried over from run 1. */}
        <label className="text-sm">
          <span className="mb-1.5 block font-medium text-navy-deep">Sweep</span>
          <select
            value={sweep}
            onChange={(e) => setSweep(e.target.value)}
            className="rounded-xl border border-navy/15 bg-white px-3 py-2 text-sm"
          >
            <option value="All">All sweeps</option>
            {[...SWEEPS]
              .reverse()
              .map((s) => (
                <option key={s.iso} value={s.iso}>
                  {s.label} — {formatDate(s.iso)} (
                  {engineOpps.filter((o) => o.addedISO === s.iso).length})
                </option>
              ))}
          </select>
        </label>

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
                onClick={() => setSelectedId(o.id)}
                className="cursor-pointer transition-colors hover:bg-surface"
              >
                <td className="max-w-xs px-4 py-3">
                  {/* The table already scrolls sideways inside its own box, so
                      wrap these instead of truncating — the full opportunity
                      name and agency stay readable. */}
                  <p className="break-words font-medium text-navy-deep">
                    {sweepFor(o) && (
                      <span
                        title={`Found on the ${formatDate(
                          sweepFor(o)!.iso
                        )} sweep`}
                        className={cn(
                          "mr-2 inline-flex rounded-full px-1.5 py-0.5 align-middle text-[10px] font-bold uppercase tracking-wide",
                          isNew(o)
                            ? "bg-gold text-navy-deep"
                            : "bg-navy/10 text-navy/70"
                        )}
                      >
                        {sweepFor(o)!.label}
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
                  <span className="whitespace-nowrap">{formatDate(o.dueDate)}</span>
                  {o.hardDeadline && (
                    <span
                      title="Published deadline, not an internal target"
                      className="ml-1.5 inline-flex items-center rounded bg-purple-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-purple-700"
                    >
                      Hard
                    </span>
                  )}
                  {(() => {
                    // Won/Lost is settled — pass `closed` so a finished deal
                    // reads "Closed" here exactly as it does on the board,
                    // rather than nagging about a date nobody has to hit.
                    const h = healthFor(
                      o.dueDate,
                      today,
                      o.status === "Won" || o.status === "Lost"
                    );
                    return h ? (
                      <span
                        className={cn(
                          "mt-1 block w-fit rounded px-1.5 py-0.5 text-[10px] font-semibold",
                          h.chip
                        )}
                      >
                        {h.label}
                      </span>
                    ) : null;
                  })()}
                </td>
                <td className="px-4 py-3">
                  <span className={cn("inline-flex h-7 w-9 items-center justify-center rounded-md text-xs font-bold", fitColor(o.fitScore))}>
                    {o.fitScore}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {/* Editable in place — same fact as the card's column on the
                      pipeline board, so changing it here moves it there. The
                      row's own click handler must not fire when the select is
                      used, hence stopPropagation. */}
                  <span
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => e.stopPropagation()}
                  >
                    <StatusControl
                      kind="opportunity"
                      id={o.id}
                      engineStatus={o.status}
                      options={OPPORTUNITY_STATUS_OPTIONS}
                      styleFor={opportunityStatusStyle}
                      size="sm"
                      label={`Status for ${o.title}`}
                      showProvenance={false}
                    />
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* The shared detail — same component the pipeline board and the
          /portal/opportunities/[id] page render. */}
      <OpportunityModal
        opportunityId={selectedId}
        onClose={() => setSelectedId(null)}
      />
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
