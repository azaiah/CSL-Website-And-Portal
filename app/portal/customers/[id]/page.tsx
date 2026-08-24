import { CustomerDetail } from "@/components/portal/customers/customer-detail";

/**
 * Customers live in Supabase and are read in the browser, so this route cannot
 * be prerendered the way /portal/opportunities/[id] is — there is no build-time
 * list of ids to enumerate. It renders on request and the component loads its
 * own row.
 */
export const metadata = { title: "Customer" };

export default function CustomerDetailPage({ params }: { params: { id: string } }) {
  return <CustomerDetail customerId={params.id} />;
}
