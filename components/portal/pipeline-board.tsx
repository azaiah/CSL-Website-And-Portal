"use client";

/**
 * components/portal/pipeline-board.tsx
 * ---------------------------------------------------------------------------
 * The kanban board.
 *
 * Stage now PERSISTS. It used to live in React state alone, which meant every
 * refresh silently threw away the work someone had just done — cards snapped
 * back to wherever the engine had put them. The board is shared: stage is a
 * fact about the deal, so when Darren drags a lead to Contacted it is contacted
 * for everyone, and (where Supabase realtime is enabled) it moves on the other
 * person's screen without a refresh.
 *
 * The persistence model matters. lib/data/pipeline.ts still derives every card
 * from the engine's opportunities; Postgres stores ONLY the human override —
 * one row per moved card. That separation is what lets a weekly sweep rewrite
 * titles, values and fit scores without disturbing where anyone dragged
 * anything.
 * ---------------------------------------------------------------------------
 */

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type DragEvent,
  type PointerEvent as ReactPointerEvent,
  type MouseEvent as ReactMouseEvent,
} from "react";
import {
  GripVertical,
  AlertTriangle,
  Sparkles,
  Clock,
  Layers,
  CloudOff,
  Loader2,
  Check,
} from "lucide-react";
import {
  pipelineCards as seed,
  PIPELINE_STAGES,
  type PipelineCard,
  type PipelineStage,
} from "@/lib/data/pipeline";
import { SWEEPS } from "@/lib/data/opportunities";
import {
  healthFor,
  todayISO,
  isUntouched,
  needsAttention,
} from "@/lib/health";
import { OpportunityModal } from "@/components/portal/opportunity-modal";
import { usePortal } from "@/lib/portal-context";
import {
  fetchPipelineState,
  savePipelineStage,
  subscribeToPipelineState,
  type PipelineOverride,
} from "@/lib/supabase/pipeline-state";
import { formatCurrency, formatRelative, cn } from "@/lib/utils";

/**
 * A drag that ends on the card it started from still fires a click in some
 * browsers, which would pop the detail modal open every time someone reorders
 * the board. Anything past this many pixels of pointer travel is a drag, not a
 * click.
 */
const CLICK_SLOP_PX = 5;

const stageAccent: Record<PipelineStage, string> = {
  Found: "border-t-navy",
  Qualified: "border-t-success",
  Contacted: "border-t-gold",
  Meeting: "border-t-blue-500",
  Bid: "border-t-purple-500",
  "Won/Lost": "border-t-ink",
};

/** Board-level views. Each answers a different question about the same cards. */
type Lens = "all" | "new" | "carried" | "attention";

const LENSES: { key: Lens; label: string; icon: typeof Layers; hint: string }[] = [
  { key: "all", label: "All", icon: Layers, hint: "Everything on the board" },
  {
    key: "new",
    label: "New this sweep",
    icon: Sparkles,
    hint: "Surfaced by the most recent run",
  },
  {
    key: "carried",
    label: "Carried over",
    icon: Clock,
    hint: "Found on an earlier run and still open",
  },
  {
    key: "attention",
    label: "Needs attention",
    icon: AlertTriangle,
    hint: "Overdue, due within 7 days, or never actioned",
  },
];

/** What the board can tell the user about whether their moves are sticking. */
type SaveState =
  | { kind: "idle" }
  | { kind: "saving" }
  | { kind: "saved" }
  | { kind: "error"; message: string };

export function PipelineBoard() {
  const { user, profile } = usePortal();

  /**
   * Human overrides on top of the engine's stages, keyed by opportunity id.
   * The seed is never mutated — that is what keeps a weekly sweep and a drag
   * from fighting over the same object.
   */
  const [overrides, setOverrides] = useState<Map<string, PipelineOverride>>(
    () => new Map()
  );
  const [hydrated, setHydrated] = useState(false);
  /** Set when saving is impossible (no Supabase / migration not run yet). */
  const [persistenceOff, setPersistenceOff] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<SaveState>({ kind: "idle" });

  const [dragId, setDragId] = useState<string | null>(null);
  const [overStage, setOverStage] = useState<PipelineStage | null>(null);
  const [lens, setLens] = useState<Lens>("all");
  const [openId, setOpenId] = useState<string | null>(null);

  // Refs, not state: these are read inside the click handler of the same
  // gesture that sets them, so a re-render would be both wasted and too late.
  const didDragRef = useRef(false);
  const pointerDownRef = useRef<{ x: number; y: number } | null>(null);
  const aliveRef = useRef(true);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Resolved after mount only. These pages are statically generated, so a
  // build-time "today" would be wrong for every visitor after day one.
  const [today, setToday] = useState<string | null>(null);
  useEffect(() => setToday(todayISO()), []);

  useEffect(() => {
    aliveRef.current = true;
    return () => {
      aliveRef.current = false;
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, []);

  /* ── Hydrate the saved board ───────────────────────────────────────────── */
  useEffect(() => {
    let cancelled = false;

    (async () => {
      const res = await fetchPipelineState();
      if (cancelled || !aliveRef.current) return;

      if (res.ok) {
        setOverrides(res.data);
        setPersistenceOff(null);
      } else if (res.error === "not-configured") {
        setPersistenceOff(
          "Card moves are not being saved — the portal database is not connected."
        );
      } else if (res.error === "no-table") {
        setPersistenceOff(
          "Card moves are not being saved yet — run migration 002 in the Supabase SQL editor."
        );
      } else {
        setPersistenceOff(
          "Saved positions could not be loaded, so this board is showing the engine's own stages."
        );
      }
      setHydrated(true);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  /* ── Someone else moved a card ─────────────────────────────────────────── */
  useEffect(() => {
    const unsubscribe = subscribeToPipelineState((incoming) => {
      if (!aliveRef.current) return;
      setOverrides((prev) => {
        const next = new Map(prev);
        next.set(incoming.opportunityId, incoming);
        return next;
      });
    });
    return unsubscribe;
  }, []);

  /** Engine cards with any human override applied. */
  const cards: PipelineCard[] = useMemo(
    () =>
      seed.map((c) => {
        const o = overrides.get(c.id);
        return o ? { ...c, stage: o.stage } : c;
      }),
    [overrides]
  );

  /** Everything the board needs to know about one card, computed once. */
  const decorated = useMemo(
    () =>
      cards.map((c) => {
        const closed = c.stage === "Won/Lost";
        const health = healthFor(c.dueDate, today, closed);
        const override = overrides.get(c.id);
        return {
          card: c,
          health,
          untouched: isUntouched(c),
          // Shared rule — see lib/health. The dashboard banner counts this
          // exact predicate, so the two can never disagree.
          needsAttention: needsAttention(c, today),
          movedByName: override?.movedByName ?? null,
          movedAtISO: override?.movedAtISO ?? null,
        };
      }),
    [cards, today, overrides]
  );

  const counts = useMemo(
    () => ({
      all: decorated.length,
      new: decorated.filter((d) => d.card.isLatestSweep).length,
      carried: decorated.filter((d) => !d.card.isLatestSweep).length,
      attention: decorated.filter((d) => d.needsAttention).length,
    }),
    [decorated]
  );

  const visible = useMemo(
    () =>
      decorated.filter((d) => {
        if (lens === "new") return d.card.isLatestSweep;
        if (lens === "carried") return !d.card.isLatestSweep;
        if (lens === "attention") return d.needsAttention;
        return true;
      }),
    [decorated, lens]
  );

  const flashSaved = useCallback(() => {
    setSaveState({ kind: "saved" });
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      if (aliveRef.current) setSaveState({ kind: "idle" });
    }, 2200);
  }, []);

  /**
   * Move a card and persist it.
   *
   * Optimistic, with a real rollback: the card moves the instant it is dropped,
   * and if the write is refused it goes back where it was AND says why. A board
   * that shows a move it did not save is the exact bug this rewrite fixes, so
   * failing loudly matters more here than usual.
   */
  const move = useCallback(
    async (id: string, stage: PipelineStage) => {
      const previous = overrides.get(id);
      const engineStage = seed.find((c) => c.id === id)?.stage;
      if ((previous?.stage ?? engineStage) === stage) return;

      const movedByName =
        profile?.full_name?.trim() || profile?.email || user?.email || null;

      const optimistic: PipelineOverride = {
        opportunityId: id,
        stage,
        movedByName,
        movedAtISO: new Date().toISOString(),
      };

      setOverrides((prev) => {
        const next = new Map(prev);
        next.set(id, optimistic);
        return next;
      });

      if (persistenceOff) return;
      setSaveState({ kind: "saving" });

      const res = await savePipelineStage({
        opportunityId: id,
        stage,
        movedBy: user?.id ?? null,
        movedByName,
      });
      if (!aliveRef.current) return;

      if (res.ok) {
        setOverrides((prev) => {
          const next = new Map(prev);
          next.set(id, res.data);
          return next;
        });
        flashSaved();
      } else {
        setOverrides((prev) => {
          const next = new Map(prev);
          if (previous) next.set(id, previous);
          else next.delete(id);
          return next;
        });
        setSaveState({ kind: "error", message: res.error });
      }
    },
    [overrides, persistenceOff, profile, user, flashSaved]
  );

  function onDrop(stage: PipelineStage) {
    if (dragId) void move(dragId, stage);
    setDragId(null);
    setOverStage(null);
  }

  function allowDrop(e: DragEvent, stage: PipelineStage) {
    e.preventDefault();
    if (overStage !== stage) setOverStage(stage);
  }

  /** Open the detail only for a genuine click — never at the end of a drag. */
  function onCardClick(e: ReactMouseEvent, id: string) {
    const start = pointerDownRef.current;
    const travelled = start
      ? Math.hypot(e.clientX - start.x, e.clientY - start.y)
      : 0;
    pointerDownRef.current = null;
    if (didDragRef.current || travelled > CLICK_SLOP_PX) return;
    setOpenId(id);
  }

  return (
    <div className="space-y-4">
      {/* Lenses — the same cards, filtered by the question being asked. */}
      <div className="flex flex-wrap items-center gap-2">
        {LENSES.map((l) => {
          const active = lens === l.key;
          const count = counts[l.key];
          const alarm = l.key === "attention" && count > 0;
          return (
            <button
              key={l.key}
              type="button"
              onClick={() => setLens(l.key)}
              aria-pressed={active}
              title={l.hint}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-sm font-medium transition-colors",
                active
                  ? "border-navy-deep bg-navy-deep text-white"
                  : alarm
                    ? "border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
                    : "border-navy/15 bg-white text-navy hover:bg-surface"
              )}
            >
              <l.icon className="h-3.5 w-3.5" aria-hidden />
              {l.label}
              <span
                className={cn(
                  "rounded-full px-1.5 text-xs font-bold",
                  active
                    ? "bg-white/20 text-white"
                    : alarm
                      ? "bg-red-200/70 text-red-800"
                      : "bg-navy/10 text-navy"
                )}
              >
                {count}
              </span>
            </button>
          );
        })}

        <p className="ml-auto flex items-center gap-2 text-xs text-ink/50">
          <SaveIndicator state={saveState} hydrated={hydrated} muted={Boolean(persistenceOff)} />
          Drag a card to move it between stages.
        </p>
      </div>

      {/* Honest banner when a move cannot be saved. Better to say so once, at
          the top, than to let someone rearrange the whole board and lose it. */}
      {persistenceOff && (
        <div className="flex items-start gap-2 rounded-xl border border-gold/40 bg-gold/10 p-3">
          <CloudOff className="mt-0.5 h-4 w-4 shrink-0 text-[#8a6c1f]" aria-hidden />
          <p className="break-words text-xs text-[#8a6c1f]">
            <strong className="font-semibold">Changes are not saving.</strong>{" "}
            {persistenceOff} Cards will still move on screen, but they will
            revert on refresh.
          </p>
        </div>
      )}

      {saveState.kind === "error" && (
        <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" aria-hidden />
          <p className="break-words text-xs text-red-700">
            <strong className="font-semibold">That move was put back.</strong>{" "}
            {saveState.message}
          </p>
        </div>
      )}

      {/* Legend — the colour rail is meaningless without it. */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 rounded-xl border border-navy/10 bg-surface px-3 py-2 text-xs text-ink/60">
        <span className="font-semibold text-navy-deep">Deadline</span>
        <LegendDot className="bg-red-500" label="Overdue" />
        <LegendDot className="bg-gold" label="Within 7 days" />
        <LegendDot className="bg-blue-400" label="Within 3 weeks" />
        <LegendDot className="bg-success" label="On track" />
        <span className="ml-2 font-semibold text-navy-deep">Sweep</span>
        {[...SWEEPS].reverse().map((s) => (
          <span key={s.iso} className="inline-flex items-center gap-1">
            <span
              className={cn(
                "rounded px-1 py-0.5 text-[10px] font-bold",
                s.iso === SWEEPS[SWEEPS.length - 1].iso
                  ? "bg-gold text-navy-deep"
                  : "bg-navy/10 text-navy/70"
              )}
            >
              {s.label}
            </span>
            {s.label === SWEEPS[SWEEPS.length - 1].label ? "newest" : "earlier"}
          </span>
        ))}
        <span className="inline-flex items-center gap-1">
          <span className="rounded bg-red-100 px-1 py-0.5 text-[10px] font-bold uppercase text-red-700">
            Untouched
          </span>
          never actioned since an earlier sweep
        </span>
      </div>

      {/* Board */}
      {/* `min-w-0` keeps the wide column strip scrolling inside this box rather
          than stretching the page sideways on a phone. */}
      <div className="flex min-w-0 gap-4 overflow-x-auto pb-4">
        {PIPELINE_STAGES.map((stage) => {
          const stageCards = visible.filter((d) => d.card.stage === stage);
          const total = stageCards.reduce((s, d) => s + d.card.estValue, 0);
          const flagged = stageCards.filter((d) => d.needsAttention).length;
          return (
            <div
              key={stage}
              onDragOver={(e) => allowDrop(e, stage)}
              onDrop={() => onDrop(stage)}
              className={cn(
                "flex w-72 shrink-0 flex-col rounded-2xl border border-t-4 border-navy/10 bg-surface p-3 transition-colors",
                stageAccent[stage],
                overStage === stage && "bg-gold/5 ring-2 ring-gold/40"
              )}
            >
              <div className="flex items-center justify-between px-1 pb-3">
                <h3 className="text-sm font-semibold text-navy-deep">{stage}</h3>
                <div className="flex items-center gap-1.5">
                  {flagged > 0 && (
                    <span
                      title={`${flagged} need attention`}
                      className="inline-flex items-center gap-1 rounded-full bg-red-100 px-1.5 py-0.5 text-xs font-bold text-red-700"
                    >
                      <AlertTriangle className="h-3 w-3" aria-hidden />
                      {flagged}
                    </span>
                  )}
                  <span className="rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-ink/60">
                    {stageCards.length}
                  </span>
                </div>
              </div>

              <div className="flex flex-1 flex-col gap-2.5">
                {stageCards.map(({ card, health, untouched, movedByName, movedAtISO }) => (
                  <article
                    key={card.id}
                    draggable
                    role="button"
                    tabIndex={0}
                    aria-label={`Open details for ${card.title}`}
                    onPointerDown={(e: ReactPointerEvent) => {
                      pointerDownRef.current = { x: e.clientX, y: e.clientY };
                    }}
                    onDragStart={() => {
                      didDragRef.current = true;
                      setDragId(card.id);
                    }}
                    onDragEnd={() => {
                      didDragRef.current = false;
                      setDragId(null);
                      setOverStage(null);
                    }}
                    onClick={(e) => onCardClick(e, card.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setOpenId(card.id);
                      }
                    }}
                    className={cn(
                      "group relative cursor-grab overflow-hidden rounded-xl border border-navy/10 bg-white p-3 pl-4 text-left shadow-sm transition-all hover:border-gold/40 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-gold active:cursor-grabbing",
                      dragId === card.id && "opacity-50"
                    )}
                  >
                    {/* Deadline rail — readable at a glance down a column. */}
                    <span
                      aria-hidden
                      className={cn(
                        "absolute left-0 top-0 h-full w-1.5",
                        health ? health.rail : "bg-navy/10"
                      )}
                    />

                    <div className="flex items-start gap-2">
                      <GripVertical
                        className="mt-0.5 h-4 w-4 shrink-0 text-ink/25 group-hover:text-ink/40"
                        aria-hidden
                      />
                      <div className="min-w-0 flex-1">
                        {/* Sweep + state tags */}
                        <div className="mb-1 flex flex-wrap items-center gap-1">
                          {card.sweepLabel && (
                            <span
                              className={cn(
                                "rounded px-1 py-0.5 text-[10px] font-bold",
                                card.isLatestSweep
                                  ? "bg-gold text-navy-deep"
                                  : "bg-navy/10 text-navy/70"
                              )}
                            >
                              {card.sweepLabel}
                            </span>
                          )}
                          {untouched && (
                            <span className="rounded bg-red-100 px-1 py-0.5 text-[10px] font-bold uppercase tracking-wide text-red-700">
                              Untouched
                            </span>
                          )}
                          {card.hardDeadline && (
                            <span
                              title="Published deadline, not an internal target"
                              className="rounded bg-purple-100 px-1 py-0.5 text-[10px] font-bold uppercase tracking-wide text-purple-700"
                            >
                              Hard date
                            </span>
                          )}
                        </div>

                        <p className="text-sm font-medium leading-snug text-navy-deep">
                          {card.title}
                        </p>
                        {/* Wrap the agency name so it is not cut off mid-word. */}
                        <p className="mt-1 break-words text-xs text-ink/50">
                          {card.agency}
                        </p>

                        {health && (
                          <p className="mt-1.5">
                            <span
                              className={cn(
                                "inline-flex rounded px-1.5 py-0.5 text-[10px] font-semibold",
                                health.chip
                              )}
                            >
                              {health.label}
                            </span>
                          </p>
                        )}

                        <div className="mt-2 flex items-center justify-between">
                          <span className="text-xs font-semibold text-success">
                            {formatCurrency(card.estValue)}
                          </span>
                          <span className="rounded bg-navy-deep px-1.5 py-0.5 text-[10px] font-bold text-gold">
                            {card.fitScore}
                          </span>
                        </div>

                        {/* Provenance. Without this, a card that moved because
                            someone else dragged it looks like a glitch. */}
                        {movedByName && movedAtISO && (
                          <p className="mt-1.5 break-words text-[10px] text-ink/40">
                            Moved by {movedByName} · {formatRelative(movedAtISO)}
                          </p>
                        )}
                      </div>
                    </div>
                  </article>
                ))}
                {stageCards.length === 0 && (
                  <div className="rounded-xl border border-dashed border-navy/15 py-8 text-center text-xs text-ink/40">
                    {lens === "all" ? "Drop here" : "Nothing in this view"}
                  </div>
                )}
              </div>

              <p className="mt-3 border-t border-navy/10 px-1 pt-2 text-xs text-ink/50">
                {formatCurrency(total)} total
              </p>
            </div>
          );
        })}
      </div>

      {/* Same detail component the opportunities table opens. */}
      <OpportunityModal
        opportunityId={openId}
        onClose={() => setOpenId(null)}
      />
    </div>
  );
}

/** Small, quiet confirmation that the board is actually persisting. */
function SaveIndicator({
  state,
  hydrated,
  muted,
}: {
  state: SaveState;
  hydrated: boolean;
  muted: boolean;
}) {
  if (muted) return null;

  if (!hydrated) {
    return (
      <span className="inline-flex items-center gap-1 text-ink/40">
        <Loader2 className="h-3 w-3 animate-spin" aria-hidden />
        Loading board…
      </span>
    );
  }
  if (state.kind === "saving") {
    return (
      <span className="inline-flex items-center gap-1 text-ink/50">
        <Loader2 className="h-3 w-3 animate-spin" aria-hidden />
        Saving…
      </span>
    );
  }
  if (state.kind === "saved") {
    return (
      <span className="inline-flex items-center gap-1 font-medium text-success">
        <Check className="h-3 w-3" aria-hidden />
        Saved
      </span>
    );
  }
  return null;
}

function LegendDot({ className, label }: { className: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1">
      <span className={cn("h-2 w-2 rounded-full", className)} aria-hidden />
      {label}
    </span>
  );
}
