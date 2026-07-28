import type { Metadata } from "next";

/**
 * app/(print)/layout.tsx
 * ---------------------------------------------------------------------------
 * Minimal layout for print routes.
 *
 * These pages live at /portal/print/... but must NOT inherit the portal shell —
 * a sidebar, topbar and role selector would all be rendered into the PDF. A
 * route group gives them the URL without the layout: only the root layout
 * (fonts, globals.css) wraps them.
 * ---------------------------------------------------------------------------
 */

export const metadata: Metadata = {
  title: "Print — CSL",
  robots: { index: false, follow: false },
};

export default function PrintLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="min-h-svh bg-white">{children}</div>;
}
