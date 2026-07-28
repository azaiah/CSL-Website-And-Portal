"use client";

/**
 * components/portal/opportunity-trigger.tsx
 * ---------------------------------------------------------------------------
 * Small client-side triggers that open <OpportunityModal>, so server-rendered
 * pages (documents, dashboard, weekly report) can make an opportunity title
 * clickable without becoming client components themselves.
 *
 * Each trigger owns its own modal instance. That is deliberate: it keeps the
 * call sites to a single tag with no state plumbing, and only one can ever be
 * open at a time anyway.
 * ---------------------------------------------------------------------------
 */

import { useState, type ReactNode } from "react";
import { opportunities } from "@/lib/data/opportunities";
import { cn } from "@/lib/utils";
import { OpportunityModal } from "./opportunity-modal";

/**
 * Wraps arbitrary content (usually a title) in a button that opens the detail.
 * Renders the children unwrapped when the id does not resolve, so a bad link
 * degrades to plain text instead of an inert button.
 */
export function OpportunityButton({
  opportunityId,
  children,
  className,
}: {
  opportunityId?: string;
  children: ReactNode;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const exists =
    opportunityId !== undefined &&
    opportunities.some((o) => o.id === opportunityId);

  if (!exists) return <>{children}</>;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "text-left underline-offset-2 transition-colors hover:text-gold hover:underline",
          className
        )}
      >
        {children}
      </button>
      <OpportunityModal
        opportunityId={open ? opportunityId! : null}
        onClose={() => setOpen(false)}
      />
    </>
  );
}

/**
 * The opportunities a document was prepared for, as chips. Shows each real
 * title rather than a bare count so the link is meaningful before it is
 * clicked.
 */
export function OpportunityChips({
  ids,
  className,
}: {
  ids: string[];
  className?: string;
}) {
  const [openId, setOpenId] = useState<string | null>(null);
  const linked = ids
    .map((id) => opportunities.find((o) => o.id === id))
    .filter((o): o is (typeof opportunities)[number] => Boolean(o));

  if (linked.length === 0) return null;

  return (
    <div className={cn("flex flex-wrap gap-1.5", className)}>
      {linked.map((o) => (
        <button
          key={o.id}
          type="button"
          onClick={() => setOpenId(o.id)}
          title={o.title}
          className="inline-flex max-w-full items-center gap-1 rounded-full border border-navy/15 bg-white px-2.5 py-1 text-xs font-medium text-navy transition-colors hover:border-gold/50 hover:bg-gold/10"
        >
          <span className="shrink-0 font-bold text-gold">
            {o.fitScore}
          </span>
          {/* Wrap rather than truncate — the portal is used on phones. */}
          <span className="break-words text-left">{o.title}</span>
        </button>
      ))}
      <OpportunityModal
        opportunityId={openId}
        onClose={() => setOpenId(null)}
      />
    </div>
  );
}
