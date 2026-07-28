import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft, Target } from "lucide-react";
import { PortalPageHeader, SampleDataRibbon } from "@/components/portal/portal-ui";
import { OpportunityDetail } from "@/components/portal/opportunity-detail";
import { opportunities } from "@/lib/data/opportunities";

/**
 * Prerender every opportunity so a deep link is a real, shareable page rather
 * than something that only exists once the table has been clicked.
 */
export function generateStaticParams() {
  return opportunities.map((o) => ({ id: o.id }));
}

export function generateMetadata({
  params,
}: {
  params: { id: string };
}): Metadata {
  const o = opportunities.find((x) => x.id === params.id);
  if (!o) return { title: "Opportunity not found" };
  return {
    title: `${o.title} — CSL Portal`,
    description: o.whyItFits,
  };
}

export default function OpportunityPage({
  params,
}: {
  params: { id: string };
}) {
  const opportunity = opportunities.find((o) => o.id === params.id);
  if (!opportunity) notFound();

  return (
    <div className="space-y-6">
      <PortalPageHeader
        title="Opportunity detail"
        subtitle="The full record, its linked documents, and every outreach draft written for it."
        icon={Target}
        action={
          <Link
            href="/portal/opportunities"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-gold hover:underline"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            All opportunities
          </Link>
        }
      />
      <SampleDataRibbon />

      <div className="card">
        <OpportunityDetail opportunity={opportunity} />
      </div>
    </div>
  );
}
