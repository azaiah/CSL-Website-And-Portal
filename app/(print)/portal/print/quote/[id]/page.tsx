import { Suspense } from "react";
import { QuotePrintView } from "@/components/portal/quotes/quote-print-view";

/**
 * The printable quote.
 *
 * Unlike the doc and outreach print routes, there is no generateStaticParams
 * here: quotes are Supabase rows, so there is no build-time list of ids. The
 * page renders on request and the view loads its own row.
 */
export const metadata = { title: "Quote" };

export default function PrintQuotePage({ params }: { params: { id: string } }) {
  return (
    // useSearchParams (for ?auto=1) needs a Suspense boundary.
    <Suspense fallback={null}>
      <QuotePrintView quoteId={params.id} />
    </Suspense>
  );
}
