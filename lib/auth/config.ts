/**
 * lib/auth/config.ts
 * ---------------------------------------------------------------------------
 * Portal access control — only allowlisted Google accounts may use /portal.
 * ---------------------------------------------------------------------------
 */

export type Role = "Owner" | "Admin" | "Viewer";
export const ROLES: Role[] = ["Owner", "Admin", "Viewer"];

/** Portal accounts with sign-in access (unless overridden via env). */
const DEFAULT_ALLOWED = [
  "capitalsolutionslogistics@gmail.com", // Darren — primary operator
  "azaiah@dataisdata.com", // Azaiah — tech support / full visibility
  "tony@dataisdata.com", // Tony — dataisdata team / full visibility
];

/** Fixed role per account. Applied when the profile is first created. */
const ACCOUNT_ROLES: Record<string, Role> = {
  "capitalsolutionslogistics@gmail.com": "Owner",
  "azaiah@dataisdata.com": "Admin",
  "tony@dataisdata.com": "Admin",
};

export function getAllowedPortalEmails(): string[] {
  const fromEnv = process.env.PORTAL_ALLOWED_EMAILS;
  if (fromEnv?.trim()) {
    return fromEnv.split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);
  }
  return DEFAULT_ALLOWED.map((e) => e.toLowerCase());
}

export function isAllowedPortalEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return getAllowedPortalEmails().includes(email.toLowerCase());
}

/** Role assigned when the profile is created or refreshed. */
export function getDefaultRoleForEmail(email: string | null | undefined): Role {
  if (!email) return "Viewer";
  return ACCOUNT_ROLES[email.toLowerCase()] ?? "Viewer";
}

/** Owner + Admin see the full lead-gen engine (agents, pipeline, documents, etc.). */
export function hasFullPortalAccess(role: Role): boolean {
  return role === "Owner" || role === "Admin";
}

/** Only the tech account can preview the limited Viewer experience. */
export function canSwitchRoles(email: string | null | undefined): boolean {
  return (
    email?.toLowerCase() === "azaiah@dataisdata.com" ||
    email?.toLowerCase() === "tony@dataisdata.com"
  );
}
