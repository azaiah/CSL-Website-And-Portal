"use client";

/**
 * components/portal/opportunity-modal.tsx
 * ---------------------------------------------------------------------------
 * Modal chrome around <OpportunityDetail>. Every surface that shows an
 * opportunity — the table, the pipeline board, the documents page, the
 * dashboard — opens this, so there is exactly one detail view in the product
 * and it cannot drift between them.
 *
 * It takes an id rather than a record so callers never have to hold a copy of
 * the opportunity in their own state; they hold a string and this resolves it.
 * ---------------------------------------------------------------------------
 */

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { opportunities } from "@/lib/data/opportunities";
import { OpportunityDetail, opportunityHref } from "./opportunity-detail";

/** Everything inside the panel a keyboard user can land on. */
const FOCUSABLE =
  'a[href], button:not([disabled]), textarea, input, select, iframe, [tabindex]:not([tabindex="-1"])';

export function OpportunityModal({
  opportunityId,
  onClose,
}: {
  opportunityId: string | null;
  onClose: () => void;
}) {
  const panelRef = useRef<HTMLElement>(null);
  // Held in a ref so the trap effect depends only on open/closed and does not
  // tear down (and steal focus back) every time the parent re-renders.
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  const opportunity =
    opportunityId === null
      ? undefined
      : opportunities.find((o) => o.id === opportunityId);
  const open = Boolean(opportunity);

  useEffect(() => {
    if (!open) return;

    const restoreTo = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const visibleFocusable = () => {
      const root = panelRef.current;
      if (!root) return [] as HTMLElement[];
      return Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        // An iframe has no offsetParent quirk worth chasing; everything else
        // that is display:none should be skipped.
        (el) => el.tagName === "IFRAME" || el.offsetParent !== null
      );
    };

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        onCloseRef.current();
        return;
      }
      if (e.key !== "Tab") return;

      const items = visibleFocusable();
      if (items.length === 0) {
        e.preventDefault();
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;
      const inside = panelRef.current?.contains(active as Node) ?? false;

      if (e.shiftKey) {
        if (!inside || active === first) {
          e.preventDefault();
          last.focus();
        }
      } else if (!inside || active === last) {
        e.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    // Defer so the panel has mounted before we reach into it.
    const t = setTimeout(() => {
      (visibleFocusable()[0] ?? panelRef.current)?.focus();
    }, 0);

    return () => {
      clearTimeout(t);
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      restoreTo?.focus?.();
    };
  }, [open]);

  return (
    <AnimatePresence>
      {opportunity && (
        <>
          <motion.div
            className="fixed inset-0 z-50 bg-navy-deep/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            aria-hidden
          />
          <motion.aside
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label={`Opportunity details: ${opportunity.title}`}
            tabIndex={-1}
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-2xl flex-col overflow-y-auto bg-white shadow-2xl focus:outline-none"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.3 }}
          >
            {/* Chrome only — the title lives in OpportunityDetail's own header
                so the modal and the full page read identically. */}
            <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-navy/10 bg-white px-6 py-4">
              <p className="eyebrow">Opportunity</p>
              <div className="flex items-center gap-2">
                <a
                  href={opportunityHref(opportunity.id)}
                  className="text-xs font-semibold text-gold hover:underline"
                >
                  Open full page
                </a>
                <button
                  onClick={onClose}
                  className="rounded-lg p-1.5 text-ink/50 transition-colors hover:bg-surface"
                  aria-label="Close details"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <OpportunityDetail opportunity={opportunity} />
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
