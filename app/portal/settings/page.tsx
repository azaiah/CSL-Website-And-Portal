import { Settings } from "lucide-react";
import { PortalPageHeader } from "@/components/portal/portal-ui";
import { SettingsPanel } from "@/components/portal/settings-panel";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <PortalPageHeader
        title="Settings"
        subtitle="Notifications, opportunity sources, integrations, and your role. Placeholders for Phase 1 — these preferences aren't persisted yet."
        icon={Settings}
      />
      <SettingsPanel />
    </div>
  );
}
