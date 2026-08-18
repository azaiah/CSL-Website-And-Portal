import type { Metadata } from "next";
import { PortalProvider } from "@/lib/portal-context";
import { StatusProvider } from "@/lib/status-context";
import { PortalShell } from "@/components/portal/shell";
import { StatusBanner } from "@/components/portal/status-control";

export const metadata: Metadata = {
  title: "Client Portal — CSL Lead-Gen Engine",
  description:
    "Capital Solutions & Logistics client portal — Phase 1 lead-generation engine preview.",
  robots: { index: false, follow: false },
};

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PortalProvider>
      {/* Every editable status in the portal reads from this one provider, so
          the dashboard, the pipeline and the detail views cannot disagree
          about what state a record is in. */}
      <StatusProvider>
        <PortalShell>
          {/* Session-level: says once, at the top, when a change could not be
              saved — rather than repeating it beside every chip. */}
          <StatusBanner />
          {children}
        </PortalShell>
      </StatusProvider>
    </PortalProvider>
  );
}
