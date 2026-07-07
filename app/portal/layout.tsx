import type { Metadata } from "next";
import { PortalProvider } from "@/lib/portal-context";
import { PortalShell } from "@/components/portal/shell";

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
      <PortalShell>{children}</PortalShell>
    </PortalProvider>
  );
}
