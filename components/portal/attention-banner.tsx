"use client";

/**
 * components/portal/attention-banner.tsx
 * ---------------------------------------------------------------------------
 * The dashboard's link into the pipeline's "Needs attention" view.
 *
 * It deliberately reuses lib/health rather than counting things its own way,
 * so the number shown here is always the same set of records the pipeline
 * board highlights. Client-side because the counts depend on today's date and
 * these pages are statically generated.
 * ---------------------------------------------------------------------------
 */

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AlertTriangle, ArrowRight, CheckCircle2 } from "lucide-react";
import { toPipelineCard, isClosedStage } from "@/lib/data/pipeline";
import { healthFor, todayISO, isUntouched, needsAttention } from "@/lib/health";
import { useStatuses } from "@/lib/status-context";
import { cn } from "@/lib/utils";

export function AttentionBanner() {
  const [today, setToday] = useState<string | null>(null);
  useEffect(() => setToday(todayISO()), []);

  // Reads the same overridden board the pipeline renders. Counting the
  // engine's raw statuses here would mean marking a deal Won never cleared it
  // from the dashboard's attention count.
  const { resolvedOpportunities } = useStatuses();

  const stats = useMemo(() => {
    let overdue = 0;
    let thisWeek = 0;
    let untouched = 0;

    // One pass, one rule. `flagged` counts distinct records via the shared
    // needsAttention() so this headline number is the pipeline's attention
    // lens by construction, not by two tallies that happen to agree. The
    // three sub-counts below it are a breakdown, not a partition — an item
    // that is both overdue and untouched appears in two of them.
    let flagged = 0;

    for (const o of resolvedOpportunities) {
      const c = toPipelineCard(o);
      if (isClosedStage(c.stage)) continue;
      if (needsAttention(c, today)) flagged++;
      const h = healthFor(c.dueDate, today);
      if (h?.key === "expired") overdue++;
      else if (h?.key === "urgent") thisWeek++;
      if (isUntouched(c)) untouched++;
    }

    return { overdue, thisWeek, untouched, flagged };
  }, [today, resolvedOpportunities]);

  // Nothing to say until the date is known on the client.
  if (!today) return null;

  const clear = stats.flagged === 0;

  return (
    <Link
      href="/portal/pipeline"
      className={cn(
        "flex items-center gap-3 rounded-2xl border p-4 transition-colors",
        clear
          ? "border-success/30 bg-success/5 hover:bg-success/10"
          : "border-red-200 bg-red-50 hover:bg-red-100"
      )}
    >
      {clear ? (
        <CheckCircle2 className="h-5 w-5 shrink-0 text-success" aria-hidden />
      ) : (
        <AlertTriangle className="h-5 w-5 shrink-0 text-red-600" aria-hidden />
      )}

      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "text-sm font-semibold",
            clear ? "text-success" : "text-red-700"
          )}
        >
          {clear
            ? "Nothing overdue — the board is current"
            : `${stats.flagged} ${
                stats.flagged === 1 ? "opportunity needs" : "opportunities need"
              } attention`}
        </p>
        {!clear && (
          <p className="mt-0.5 text-xs text-red-700/80">
            {[
              stats.overdue > 0 && `${stats.overdue} overdue`,
              stats.thisWeek > 0 && `${stats.thisWeek} due within 7 days`,
              stats.untouched > 0 &&
                `${stats.untouched} never actioned since an earlier sweep`,
            ]
              .filter(Boolean)
              .join(" · ")}
          </p>
        )}
      </div>

      <span
        className={cn(
          "inline-flex shrink-0 items-center gap-1 text-sm font-semibold",
          clear ? "text-success" : "text-red-700"
        )}
      >
        Open pipeline
        <ArrowRight className="h-4 w-4" aria-hidden />
      </span>
    </Link>
  );
}
