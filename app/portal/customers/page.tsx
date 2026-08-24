import { Users } from "lucide-react";
import { PortalPageHeader } from "@/components/portal/portal-ui";
import { CustomerDirectory } from "@/components/portal/customers/customer-directory";

export const metadata = { title: "Customers" };

export default function CustomersPage() {
  return (
    <div className="space-y-6">
      <PortalPageHeader
        title="Customers"
        subtitle="Every customer stored once. Quotes and jobs reference them, so contact details are typed in a single place and the rollups are counted rather than kept by hand."
        icon={Users}
      />
      <CustomerDirectory />
    </div>
  );
}
