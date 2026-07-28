/**
 * lib/health.ts
 * ---------------------------------------------------------------------------
 * ONE shared vocabulary for "what state is this opportunity in?", used by the
 * opportunities table, the pipeline board, and the dashboard.
 *
 * The point of putting it here rather than inside any one component: a lead
 * that reads "Overdue" on the pipeline must read "Overdue" in the table too,
 * and the dashboard's "needs attention" count must be the same set of records
 * the board highlights. If each view computed its own thresholds they would
 * drift apart the first time one of them changed, and the portal would quietly
 * start contradicting itself.
 *
 * Every date calculation is client-side. These pages are statically generated,
 * so anything derived from "today" at module scope would freeze at build time
 * and silently go stale. Components pass `today` in (null until mounted) and
 * these helpers return null until it is known.
 * ---------------------------------------------------------------------------
 */

export type HealthKey = "expired" | "urgent" | "soon" | "onTrack" | "closed";

export interface Health {
  key: HealthKey;
  /** Precise, e.g. "Overdue 4d" / "Due today" / "Due in 3d". */
  label: string;
  /** Category name, e.g. "Overdue". */
  short: string;
  /** Left rail colour on a pipeline card. */
  rail: string;
  /** Chip classes for inline badges. */
  chip: string;
  /** Small status dot. */
  dot: string;
}

/** Days from `today` until an item is due. Negative means overdue. */
export function daysUntil(dueISO: string, todayISO: string): number {
  const due = Date.parse(dueISO + "T00:00:00Z");
  const now = Date.parse(todayISO + "T00:00:00Z");
  return Math.round((due - now) / 86_400_000);
}

/** Today as yyyy-mm-dd in the viewer's own timezone. */
export function todayISO(d: Date = new Date()): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

const CLOSED: Health = {
  key: "closed",
  label: "Closed",
  short: "Closed",
  rail: "bg-ink/30",
  chip: "bg-navy/10 text-navy/60",
  dot: "bg-ink/40",
};

/**
 * Deadline health for an item. Pass `closed` for Won/Lost, which should not
 * be nagging anyone about dates.
 */
export function healthFor(
  dueISO: string,
  today: string | null,
  closed = false
): Health | null {
  if (closed) return CLOSED;
  if (!today) return null;

  const d = daysUntil(dueISO, today);

  if (d < 0) {
    const n = Math.abs(d);
    return {
      key: "expired",
      label: `Overdue ${n}d`,
      short: "Overdue",
      rail: "bg-red-500",
      chip: "bg-red-100 text-red-700",
      dot: "bg-red-500",
    };
  }
  if (d <= 7) {
    return {
      key: "urgent",
      label: d === 0 ? "Due today" : `Due in ${d}d`,
      short: "This week",
      rail: "bg-gold",
      chip: "bg-gold/20 text-[#8a6c1f]",
      dot: "bg-gold",
    };
  }
  if (d <= 21) {
    return {
      key: "soon",
      label: `Due in ${d}d`,
      short: "Coming up",
      rail: "bg-blue-400",
      chip: "bg-blue-50 text-blue-700",
      dot: "bg-blue-400",
    };
  }
  return {
    key: "onTrack",
    label: `Due in ${d}d`,
    short: "On track",
    rail: "bg-success/60",
    chip: "bg-success/10 text-success",
    dot: "bg-success",
  };
}

/** Health states that mean "someone needs to do something now". */
export const ATTENTION_KEYS: HealthKey[] = ["expired", "urgent"];

/**
 * An item found by an earlier sweep that nobody has acted on — still sitting
 * in "Found" a week or more after it was surfaced. This is the quiet failure
 * mode of a lead engine: it keeps producing, nobody works the output, and the
 * board looks busy while nothing moves.
 */
export function isUntouched(card: {
  stage: string;
  isLatestSweep: boolean;
}): boolean {
  return card.stage === "Found" && !card.isLatestSweep;
}

/**
 * "Needs attention", defined once for every view.
 *
 * The dashboard banner and the pipeline's attention lens must flag the *same
 * records*, so neither is allowed to spell this rule out for itself — widening
 * ATTENTION_KEYS has to move both numbers together or the portal starts
 * contradicting itself.
 *
 * Before `today` resolves on the client this falls back to the untouched check
 * alone, which needs no date.
 */
export function needsAttention(
  card: { stage: string; dueDate: string; isLatestSweep: boolean },
  today: string | null
): boolean {
  // Won/Lost is settled; it should never nag.
  if (card.stage === "Won/Lost") return false;
  const health = healthFor(card.dueDate, today);
  return (
    (health !== null && ATTENTION_KEYS.includes(health.key)) ||
    isUntouched(card)
  );
}
