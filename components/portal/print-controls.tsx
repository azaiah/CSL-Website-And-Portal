"use client";

/**
 * components/portal/print-controls.tsx
 * ---------------------------------------------------------------------------
 * The only interactive parts of a print page: the button, and the ?auto=1
 * handler that opens straight into the print dialog.
 *
 * Split out from printable-document.tsx on purpose — the document itself is
 * static and prerenders, so keeping these two behaviours in their own client
 * island means the printed content ships no JavaScript it does not need.
 * ---------------------------------------------------------------------------
 */

import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { Printer, ArrowLeft } from "lucide-react";

/**
 * Print button plus a back link. Marked .no-print so the chrome never appears
 * on the page it produces.
 */
export function PrintControls({ backHref }: { backHref?: string }) {
  return (
    <div className="no-print sticky top-0 z-10 border-b border-navy/10 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-3 px-8 py-3 sm:px-10">
        {backHref ? (
          <a
            href={backHref}
            className="inline-flex items-center gap-1.5 rounded-lg border border-navy/15 bg-white px-3 py-1.5 text-xs font-semibold text-navy transition-colors hover:bg-surface"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
            Back to portal
          </a>
        ) : (
          <span />
        )}
        <button
          type="button"
          onClick={() => window.print()}
          className="btn-navy px-4 py-2 text-sm"
        >
          <Printer className="h-4 w-4" aria-hidden />
          Print / Save as PDF
        </button>
      </div>
    </div>
  );
}

/**
 * Fires the print dialog once when the page is opened with ?auto=1, so a
 * "Download PDF" button elsewhere in the portal can open a tab that goes
 * straight to "Save as PDF" instead of asking the user to press print.
 */
export function AutoPrint() {
  const params = useSearchParams();
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    if (params.get("auto") !== "1") return;
    fired.current = true;

    // One frame of delay so the logo and fonts are laid out before the dialog
    // snapshots the page; printing too early can drop the header image.
    const id = window.setTimeout(() => window.print(), 350);
    return () => window.clearTimeout(id);
  }, [params]);

  return null;
}
