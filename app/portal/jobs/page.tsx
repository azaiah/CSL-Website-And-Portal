import { Truck } from "lucide-react";
import { PortalPageHeader } from "@/components/portal/portal-ui";
import { JobList } from "@/components/portal/jobs/job-list";

export const metadata = { title: "Jobs" };

export default function JobsPage() {
  return (
    <div className="space-y-6">
      <PortalPageHeader
        title="Jobs"
        subtitle="Every run, with what it billed and what it cost. Costs logged on a job are finance entries — there is no second ledger to reconcile."
        icon={Truck}
      />
      <JobList />
    </div>
  );
}
