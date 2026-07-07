import { KanbanSquare } from "lucide-react";
import { PortalPageHeader, SampleDataRibbon } from "@/components/portal/portal-ui";
import { PipelineBoard } from "@/components/portal/pipeline-board";

export default function PipelinePage() {
  return (
    <div className="space-y-6">
      <PortalPageHeader
        title="Pipeline"
        subtitle="Track every opportunity from Found to Won. Drag cards between stages to update their position."
        icon={KanbanSquare}
      />
      <SampleDataRibbon />
      <PipelineBoard />
    </div>
  );
}
