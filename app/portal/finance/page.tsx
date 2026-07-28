import { Wallet } from "lucide-react";
import { PortalPageHeader } from "@/components/portal/portal-ui";
import { FinanceDashboard } from "@/components/portal/finance/finance-dashboard";

export default function FinancePage() {
  return (
    <div className="space-y-6">
      <PortalPageHeader
        title="Finance"
        subtitle="Expense and income tracker with a real P&L summary. Add custom fields from the UI without a migration."
        icon={Wallet}
      />
      <FinanceDashboard />
    </div>
  );
}
