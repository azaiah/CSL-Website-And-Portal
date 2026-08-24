import { QuoteDetail } from "@/components/portal/quotes/quote-detail";

/**
 * Like the customer detail route, this cannot be prerendered — quotes live in
 * Supabase and there is no build-time list of ids to enumerate.
 */
export const metadata = { title: "Quote" };

export default function QuoteDetailPage({ params }: { params: { id: string } }) {
  return <QuoteDetail quoteId={params.id} />;
}
