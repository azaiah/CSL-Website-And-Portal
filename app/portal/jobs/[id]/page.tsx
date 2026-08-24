import { JobDetail } from "@/components/portal/jobs/job-detail";

/**
 * Jobs live in Supabase and are read in the browser, so this route cannot be
 * prerendered — there is no build-time list of ids to enumerate. It renders on
 * request and the component loads its own row, the same way
 * /portal/customers/[id] and /portal/quotes/[id] do.
 */
export const metadata = { title: "Job" };

export default function JobDetailPage({ params }: { params: { id: string } }) {
  return <JobDetail jobId={params.id} />;
}
