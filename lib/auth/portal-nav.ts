/**
 * lib/auth/portal-nav.ts
 * ---------------------------------------------------------------------------
 * Portal navigation + route access by role.
 * Viewer = basic info only (for future staff). Owner/Admin = full engine.
 * ---------------------------------------------------------------------------
 */

import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Target,
  KanbanSquare,
  Bot,
  Brain,
  FileBarChart,
  FolderDown,
  Settings,
} from "lucide-react";
import type { Role } from "@/lib/auth/config";
import { hasFullPortalAccess } from "@/lib/auth/config";

export type PortalNavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  /** If true, only Owner/Admin (full access) can see this item. */
  fullAccessOnly: boolean;
};

export const PORTAL_NAV: PortalNavItem[] = [
  { label: "Dashboard", href: "/portal", icon: LayoutDashboard, fullAccessOnly: false },
  { label: "Opportunities", href: "/portal/opportunities", icon: Target, fullAccessOnly: true },
  { label: "Pipeline", href: "/portal/pipeline", icon: KanbanSquare, fullAccessOnly: true },
  { label: "AI Team", href: "/portal/ai-team", icon: Bot, fullAccessOnly: true },
  { label: "Company Brain", href: "/portal/company-brain", icon: Brain, fullAccessOnly: false },
  { label: "Weekly Report", href: "/portal/weekly-report", icon: FileBarChart, fullAccessOnly: true },
  { label: "Documents", href: "/portal/documents", icon: FolderDown, fullAccessOnly: true },
  { label: "Settings", href: "/portal/settings", icon: Settings, fullAccessOnly: false },
];

export function navItemsForRole(role: Role): PortalNavItem[] {
  if (hasFullPortalAccess(role)) return PORTAL_NAV;
  return PORTAL_NAV.filter((item) => !item.fullAccessOnly);
}

/** Block direct URL access to restricted routes for Viewer role. */
export function isPortalRouteAllowed(pathname: string, role: Role): boolean {
  if (hasFullPortalAccess(role)) return true;

  const item = PORTAL_NAV.find(
    (n) =>
      n.href === "/portal"
        ? pathname === "/portal"
        : pathname.startsWith(n.href)
  );

  if (!item) return pathname === "/portal" || pathname.startsWith("/portal/settings");
  return !item.fullAccessOnly;
}

export function defaultPortalPathForRole(role: Role): string {
  return "/portal";
}
