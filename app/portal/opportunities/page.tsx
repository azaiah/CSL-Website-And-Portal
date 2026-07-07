import { Target } from "lucide-react";
import { PortalPageHeader, SampleDataRibbon } from "@/components/portal/portal-ui";
import { OpportunitiesTable } from "@/components/portal/opportunities-table";

export default function OpportunitiesPage() {
  return (
    <div className="space-y-6">
      <PortalPageHeader
        title="Opportunities"
        subtitle="Every medical-courier, NEMT, and transportation opportunity the engine surfaces — filterable, sortable, and scored. Click a row for full details."
        icon={Target}
      />
      <SampleDataRibbon />
      <OpportunitiesTable />
    </div>
  );
}
