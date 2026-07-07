import { Brain } from "lucide-react";
import { PortalPageHeader } from "@/components/portal/portal-ui";
import { CompanyBrainEditor } from "@/components/portal/company-brain-editor";

export default function CompanyBrainPage() {
  return (
    <div className="space-y-6">
      <PortalPageHeader
        title="Company Brain"
        subtitle="The single source of truth about CSL that powers every agent — credentials, codes, service area, insurance, and capability-statement content."
        icon={Brain}
      />
      <CompanyBrainEditor />
    </div>
  );
}
