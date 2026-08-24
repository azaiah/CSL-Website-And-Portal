import { Calculator } from "lucide-react";
import { PortalPageHeader } from "@/components/portal/portal-ui";
import { QuoteList } from "@/components/portal/quotes/quote-list";

export const metadata = { title: "Quotes" };

export default function QuotesPage() {
  return (
    <div className="space-y-6">
      <PortalPageHeader
        title="Quotes"
        subtitle="Price a run from the live rate card, then freeze those rates onto the quote. Changing a rate later never reprices a quote that has already gone out."
        icon={Calculator}
      />
      <QuoteList />
    </div>
  );
}
