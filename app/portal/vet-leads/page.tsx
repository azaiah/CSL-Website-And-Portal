import type { Metadata } from "next";
import { Stethoscope } from "lucide-react";
import { PortalPageHeader } from "@/components/portal/portal-ui";
import { VetLeadsBoard } from "@/components/portal/vet-leads-board";
import { VET_SWEEPS, vetLeadStats } from "@/lib/data/vet-leads";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Vet Leads — CSL Portal",
  description:
    "Richmond-area veterinary practices worked as a dedicated target niche, separate from the procurement pipeline.",
  robots: { index: false, follow: false },
};

export default function VetLeadsPage() {
  const latest = VET_SWEEPS[VET_SWEEPS.length - 1];
  const stats = vetLeadStats();

  return (
    <div className="space-y-6">
      <PortalPageHeader
        title="Vet Leads"
        subtitle="Richmond-area veterinary practices — a separate target niche, worked as a call list rather than a bid board. Every address and phone number is traced to the page it came from."
        icon={Stethoscope}
      />

      {/* Its own ribbon rather than the shared SampleDataRibbon: this board has
          its own sweep cadence, so quoting the procurement run's date here
          would be quietly wrong. */}
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-gold/40 bg-gold/10 px-4 py-2.5 text-sm text-[#8a6c1f]">
        <Stethoscope className="h-4 w-4 shrink-0" aria-hidden />
        <span className="break-words">
          <strong className="font-semibold">
            Veterinary sweep {latest.label}.
          </strong>{" "}
          {stats.total} practices across {stats.sites} sites, verified{" "}
          {formatDate(latest.iso)}. Separate from the procurement pipeline on
          purpose — these are businesses to call, not solicitations to bid.
        </span>
      </div>

      <VetLeadsBoard />
    </div>
  );
}
