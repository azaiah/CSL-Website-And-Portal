"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { usePortal } from "@/lib/portal-context";
import {
  defaultPortalPathForRole,
  isPortalRouteAllowed,
} from "@/lib/auth/portal-nav";

/** Redirects Viewer-role users away from AI agents, pipeline, documents, etc. */
export function PortalAccessGuard({ children }: { children: React.ReactNode }) {
  const { role, ready, signedIn } = usePortal();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!ready || !signedIn) return;
    if (!isPortalRouteAllowed(pathname, role)) {
      router.replace(defaultPortalPathForRole(role));
    }
  }, [ready, signedIn, pathname, role, router]);

  if (!ready || !signedIn) return <>{children}</>;

  if (!isPortalRouteAllowed(pathname, role)) {
    return null;
  }

  return <>{children}</>;
}
