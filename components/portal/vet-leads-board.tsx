"use client";

/**
 * components/portal/vet-leads-board.tsx
 * ---------------------------------------------------------------------------
 * The veterinary call list.
 *
 * Deliberately NOT a second copy of the opportunities table. These leads have
 * no deadline, no NAICS match and no solicitation — they are businesses to
 * ring. So the unit is a card built around the phone number, and the visual
 * language is gold-forward rather than navy, so nobody confuses this board with
 * the procurement pipeline at a glance.
 *
 * Three things every card must do, because this is used standing up with a
 * phone in one hand:
 *   1. Dial. The number is a tel: link, sized to be hit with a thumb.
 *   2. Say something true. The opening question is printed on the card, because
 *      the first sentence is where a cold call is won or lost.
 *   3. Admit what is not known. Cautions are shown in red on the card itself,
 *      not buried — a stale address costs a wasted morning.
 * ---------------------------------------------------------------------------
 */

import { useMemo, useState } from "react";
import {
  Phone,
  MapPin,
  Globe,
  AlertTriangle,
  MessageSquareQuote,
  Building2,
  Clock,
  Layers,
  Copy,
  Check,
  ChevronDown,
} from "lucide-react";
import {
  vetLeads,
  vetLeadStats,
  vetLeadMapUrl,
  VET_CATEGORIES,
  VET_PRIORITY_ORDER,
  type VetLead,
  type VetLeadCategory,
  type VetLeadPriority,
} from "@/lib/data/vet-leads";
import { SourceLinks } from "@/components/portal/source-links";
import { NotesThread } from "@/components/portal/notes-thread";
import { cn } from "@/lib/utils";

const PRIORITY_STYLE: Record<VetLeadPriority, string> = {
  HOT: "bg-gold text-navy-deep",
  WARM: "bg-navy/10 text-navy",
  WATCH: "bg-ink/10 text-ink/60",
};

const PRIORITY_HINT: Record<VetLeadPriority, string> = {
  HOT: "Call this week",
  WARM: "Worth a call once the hot list is worked",
  WATCH: "Something is unverified — check before dialling",
};

const CATEGORY_STYLE: Record<VetLeadCategory, string> = {
  "ER & Specialty Hub": "border-l-gold",
  "Urgent Care": "border-l-blue-400",
  "General Practice": "border-l-navy",
  "Nonprofit / High-Volume": "border-l-success",
};

type PriorityFilter = "All" | VetLeadPriority;
type CategoryFilter = "All" | VetLeadCategory;

export function VetLeadsBoard() {
  const [priority, setPriority] = useState<PriorityFilter>("All");
  const [category, setCategory] = useState<CategoryFilter>("All");
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);

  const stats = useMemo(() => vetLeadStats(), []);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return vetLeads
      .filter((l) => priority === "All" || l.priority === priority)
      .filter((l) => category === "All" || l.category === category)
      .filter((l) => {
        if (!q) return true;
        return (
          l.name.toLowerCase().includes(q) ||
          l.city.toLowerCase().includes(q) ||
          l.address.toLowerCase().includes(q) ||
          (l.phone ?? "").toLowerCase().includes(q) ||
          l.pitch.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        const p =
          VET_PRIORITY_ORDER.indexOf(a.priority) -
          VET_PRIORITY_ORDER.indexOf(b.priority);
        return p !== 0 ? p : b.fitScore - a.fitScore;
      });
  }, [priority, category, query]);

  return (
    <div className="space-y-5">
      {/* ── The honest frame. Read this before the list. ─────────────────── */}
      <div className="rounded-2xl border border-gold/40 bg-gold/10 p-4">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-[#8a6c1f]">
          <AlertTriangle className="h-4 w-4" aria-hidden />
          Read this before the first call
        </h2>
        <p className="mt-2 break-words text-sm leading-relaxed text-ink/75">
          <strong className="font-semibold">
            Do not pitch routine lab pickup.
          </strong>{" "}
          IDEXX and Antech both run their own courier fleets and bundle specimen
          collection into the practice&apos;s lab contract, so a pitch built on
          daily send-outs gets corrected on the first call. The lanes that are
          genuinely uncovered in Richmond are{" "}
          <strong className="font-semibold">
            movement between sites in multi-location groups
          </strong>
          , <strong className="font-semibold">STAT blood products</strong>{" "}
          between emergency hubs,{" "}
          <strong className="font-semibold">after-hours transfer</strong> —
          records and imaging following a patient to whichever ER took them —{" "}
          <strong className="font-semibold">controlled substances</strong>{" "}
          between sites, and{" "}
          <strong className="font-semibold">cremation and aftercare</strong>.
          Every card below carries the opening question to use instead.
        </p>
      </div>

      {/* ── Stat strip ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Leads" value={String(stats.total)} hint="First vet run" />
        <Stat
          label="Physical sites"
          value={String(stats.sites)}
          hint="Routes are planned per site"
        />
        <Stat
          label="Call this week"
          value={String(stats.byPriority.HOT)}
          hint="Marked HOT"
          accent
        />
        <Stat
          label="Sources cited"
          value={String(stats.sourcesCited)}
          hint="Every address traced"
        />
      </div>

      {/* ── Filters ─────────────────────────────────────────────────────── */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          {(["All", ...VET_PRIORITY_ORDER] as PriorityFilter[]).map((p) => {
            const active = priority === p;
            const count =
              p === "All" ? vetLeads.length : stats.byPriority[p as VetLeadPriority];
            return (
              <button
                key={p}
                type="button"
                onClick={() => setPriority(p)}
                aria-pressed={active}
                title={p === "All" ? "Everything" : PRIORITY_HINT[p as VetLeadPriority]}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-sm font-medium transition-colors",
                  active
                    ? "border-navy-deep bg-navy-deep text-white"
                    : "border-navy/15 bg-white text-navy hover:bg-surface"
                )}
              >
                {p === "All" ? "All priorities" : p}
                <span
                  className={cn(
                    "rounded-full px-1.5 text-xs font-bold",
                    active ? "bg-white/20 text-white" : "bg-navy/10 text-navy"
                  )}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-end gap-3">
          <label className="text-sm">
            <span className="mb-1.5 block font-medium text-navy-deep">Type</span>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as CategoryFilter)}
              className="rounded-xl border border-navy/15 bg-white px-3 py-2 text-sm"
            >
              <option value="All">All types</option>
              {VET_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c} ({vetLeads.filter((l) => l.category === c).length})
                </option>
              ))}
            </select>
          </label>

          <label className="min-w-[200px] flex-1 text-sm">
            <span className="mb-1.5 block font-medium text-navy-deep">
              Search
            </span>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Name, city, street, phone…"
              className="w-full rounded-xl border border-navy/15 bg-white px-3 py-2 text-sm outline-none focus:border-gold/60 focus:ring-2 focus:ring-gold/25"
            />
          </label>

          <p className="ml-auto text-sm text-ink/50">
            {rows.length} {rows.length === 1 ? "lead" : "leads"}
          </p>
        </div>
      </div>

      {/* ── Cards ───────────────────────────────────────────────────────── */}
      {rows.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-navy/15 p-8 text-center text-sm text-ink/45">
          No leads match those filters.
        </p>
      ) : (
        <ul className="space-y-4">
          {rows.map((l) => (
            <VetLeadCard
              key={l.id}
              lead={l}
              expanded={openId === l.id}
              onToggle={() => setOpenId((cur) => (cur === l.id ? null : l.id))}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

/* ──────────────────────────────── One lead ──────────────────────────────── */

function VetLeadCard({
  lead: l,
  expanded,
  onToggle,
}: {
  lead: VetLead;
  expanded: boolean;
  onToggle: () => void;
}) {
  const fullAddress = [l.address, l.city, l.state, l.zip]
    .filter(Boolean)
    .join(", ");

  return (
    <li
      className={cn(
        "overflow-hidden rounded-2xl border border-l-4 border-navy/10 bg-white shadow-card",
        CATEGORY_STYLE[l.category]
      )}
    >
      <div className="p-4 sm:p-5">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={cn(
                  "inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
                  PRIORITY_STYLE[l.priority]
                )}
                title={PRIORITY_HINT[l.priority]}
              >
                {l.priority}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-navy/5 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-navy/70">
                <Building2 className="h-3 w-3" aria-hidden />
                {l.category}
              </span>
              {l.siteCount && l.siteCount > 1 && (
                <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-success">
                  <Layers className="h-3 w-3" aria-hidden />
                  {l.siteCount} sites
                </span>
              )}
            </div>
            <h3 className="mt-2 break-words text-base font-semibold leading-snug text-navy-deep">
              {l.name}
            </h3>
            <p className="mt-0.5 break-words text-xs text-ink/55">
              {fullAddress}
            </p>
            {l.hours && (
              <p className="mt-1 flex items-start gap-1.5 break-words text-xs text-ink/50">
                <Clock className="mt-px h-3 w-3 shrink-0" aria-hidden />
                {l.hours}
              </p>
            )}
          </div>

          <span
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-navy-deep text-sm font-bold text-gold"
            title="Fit score"
          >
            {l.fitScore}
          </span>
        </div>

        {/* Actions — big enough to hit with a thumb. */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {l.phone && l.tel ? (
            <a
              href={`tel:${l.tel}`}
              className="inline-flex items-center gap-2 rounded-xl bg-navy-deep px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-navy"
            >
              <Phone className="h-4 w-4" aria-hidden />
              {l.phone}
            </a>
          ) : (
            <span className="inline-flex items-center gap-2 rounded-xl border border-dashed border-red-300 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700">
              <Phone className="h-4 w-4" aria-hidden />
              No number published
            </span>
          )}

          {l.phone && <CopyChip label="Copy number" text={l.phone} />}

          {l.zip && (
            <a
              href={vetLeadMapUrl(l)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl border border-navy/15 bg-white px-3 py-2.5 text-sm font-semibold text-navy transition-colors hover:bg-surface"
            >
              <MapPin className="h-4 w-4" aria-hidden />
              Map
            </a>
          )}

          {l.website && (
            <a
              href={l.website}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl border border-navy/15 bg-white px-3 py-2.5 text-sm font-semibold text-navy transition-colors hover:bg-surface"
            >
              <Globe className="h-4 w-4" aria-hidden />
              Website
            </a>
          )}
        </div>

        {/* The caution goes above the pitch on purpose. */}
        {l.caution && (
          <p className="mt-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs leading-relaxed text-red-700">
            <AlertTriangle className="mt-px h-3.5 w-3.5 shrink-0" aria-hidden />
            <span className="break-words">
              <strong className="font-semibold">Before you dial:</strong>{" "}
              {l.caution}
            </span>
          </p>
        )}

        <p className="mt-4 break-words text-sm leading-relaxed text-ink/75">
          {l.pitch}
        </p>

        {/* The first sentence of the call. */}
        <div className="mt-4 rounded-xl border border-gold/30 bg-gold/10 p-3.5">
          <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-[#8a6c1f]">
            <MessageSquareQuote className="h-3.5 w-3.5" aria-hidden />
            Open with this
          </p>
          <p className="mt-1.5 break-words text-sm italic leading-relaxed text-ink/80">
            &ldquo;{l.openingQuestion}&rdquo;
          </p>
          <div className="mt-2.5">
            <CopyChip label="Copy opener" text={l.openingQuestion} />
          </div>
        </div>

        <button
          type="button"
          onClick={onToggle}
          aria-expanded={expanded}
          className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-gold hover:underline"
        >
          <ChevronDown
            className={cn(
              "h-4 w-4 transition-transform",
              expanded && "rotate-180"
            )}
            aria-hidden
          />
          {expanded ? "Hide" : "Sites, sources & notes"}
        </button>
      </div>

      {expanded && (
        <div className="space-y-6 border-t border-navy/10 bg-surface p-4 sm:p-5">
          {l.sites && l.sites.length > 1 && (
            <section>
              <h4 className="flex items-center gap-2 text-sm font-semibold text-navy-deep">
                <Layers className="h-4 w-4 text-gold" aria-hidden />
                All sites
                <span className="rounded-full bg-navy/10 px-1.5 text-xs font-bold text-navy">
                  {l.sites.length}
                </span>
              </h4>
              <ul className="mt-3 space-y-2">
                {l.sites.map((s) => (
                  <li
                    key={s.address}
                    className="rounded-xl border border-navy/10 bg-white p-3"
                  >
                    <p className="break-words text-sm font-semibold text-navy-deep">
                      {s.label}
                    </p>
                    <p className="mt-0.5 break-words text-xs text-ink/60">
                      {s.address}
                    </p>
                    {s.phone && s.tel && (
                      <a
                        href={`tel:${s.tel}`}
                        className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-navy/15 bg-white px-2.5 py-1.5 text-xs font-semibold text-navy hover:bg-surface"
                      >
                        <Phone className="h-3 w-3" aria-hidden />
                        {s.phone}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section>
            <h4 className="text-sm font-semibold text-navy-deep">
              What is verified about them
            </h4>
            <ul className="mt-2 space-y-1.5">
              {l.capabilities.map((c) => (
                <li
                  key={c}
                  className="flex items-start gap-2 break-words text-xs leading-relaxed text-ink/70"
                >
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-gold" aria-hidden />
                  {c}
                </li>
              ))}
            </ul>
          </section>

          <SourceLinks sources={l.sources} />

          <NotesThread
            subjectKind="vet-lead"
            subjectId={l.id}
            hint="Shared with everyone on the portal — log what happened on the call so the next person picks up where you left off."
          />

          <p className="break-words text-[10px] text-ink/35">
            {l.id} · added on the {l.addedISO} veterinary sweep
          </p>
        </div>
      )}
    </li>
  );
}

/* ──────────────────────────────── Small bits ────────────────────────────── */

function Stat({
  label,
  value,
  hint,
  accent,
}: {
  label: string;
  value: string;
  hint?: string;
  accent?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border p-3.5",
        accent
          ? "border-gold/40 bg-gold/10"
          : "border-navy/10 bg-white shadow-card"
      )}
    >
      <p className="text-xs font-medium text-ink/55">{label}</p>
      <p
        className={cn(
          "mt-1 text-2xl font-bold tabular-nums",
          accent ? "text-[#8a6c1f]" : "text-navy-deep"
        )}
      >
        {value}
      </p>
      {hint && <p className="mt-0.5 break-words text-[10px] text-ink/45">{hint}</p>}
    </div>
  );
}

function CopyChip({ label, text }: { label: string; text: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard is unavailable outside a secure context. Say nothing rather
      // than claim a copy that did not happen.
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="inline-flex items-center gap-1.5 rounded-xl border border-navy/15 bg-white px-3 py-2 text-xs font-semibold text-navy transition-colors hover:bg-surface"
    >
      {copied ? (
        <Check className="h-3.5 w-3.5 text-success" aria-hidden />
      ) : (
        <Copy className="h-3.5 w-3.5" aria-hidden />
      )}
      {copied ? "Copied" : label}
    </button>
  );
}
