"use client";

/**
 * components/portal/quotes/quote-print-view.tsx
 * ---------------------------------------------------------------------------
 * The client-side loader behind the quote print page.
 *
 * The existing print routes render static data, so they can use <AutoPrint />
 * from print-controls.tsx — the content is on the page before the component
 * mounts. A quote is fetched from Supabase, so firing the print dialog on mount
 * would snapshot an empty page. The ?auto=1 handling is therefore done here,
 * after the row has arrived.
 * ---------------------------------------------------------------------------
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { getQuote, getCustomer } from "@/lib/quotes/queries";
import type { Customer, Quote } from "@/lib/quotes/types";
import { PrintControls } from "@/components/portal/print-controls";
import { PrintableQuote } from "@/components/portal/printable-document";

export function QuotePrintView({ quoteId }: { quoteId: string }) {
  const params = useSearchParams();
  const autoPrinted = useRef(false);

  const [quote, setQuote] = useState<Quote | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const quoteRes = await getQuote(quoteId);
    if (quoteRes.error || !quoteRes.data) {
      setError(quoteRes.error?.message ?? "Quote not found.");
      setLoading(false);
      return;
    }
    setQuote(quoteRes.data);

    const customerRes = await getCustomer(quoteRes.data.customer_id);
    setCustomer(customerRes.data);
    setLoading(false);
  }, [quoteId]);

  useEffect(() => {
    load();
  }, [load]);

  // Print only once the quote is actually on the page.
  useEffect(() => {
    if (loading || !quote || autoPrinted.current) return;
    if (params.get("auto") !== "1") return;
    autoPrinted.current = true;

    // One beat so fonts and layout settle before the dialog snapshots.
    const id = window.setTimeout(() => window.print(), 350);
    return () => window.clearTimeout(id);
  }, [loading, quote, params]);

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-24 text-ink/50">
        <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
        <span className="text-sm">Loading quote…</span>
      </div>
    );
  }

  if (!quote) {
    return (
      <div className="mx-auto max-w-md py-24 text-center">
        <p className="text-sm font-medium text-navy-deep">Quote not found</p>
        <p className="mt-1 break-words text-xs text-ink/50">{error}</p>
      </div>
    );
  }

  return (
    <>
      <PrintControls backHref={`/portal/quotes/${quote.id}`} />
      <PrintableQuote
        quote={quote}
        customerName={customer?.name ?? "Customer"}
        customerAddress={customer?.address ?? null}
      />
    </>
  );
}
