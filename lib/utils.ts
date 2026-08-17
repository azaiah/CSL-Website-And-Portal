import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge Tailwind class names safely (conditional + conflict-resolving). */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format a number as USD with no cents. */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

/** Format an ISO date string as a short, readable US date. */
export function formatDate(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Format a full timestamp (as Postgres returns it) for human-authored records
 * such as notes and pipeline moves.
 *
 * Unlike formatDate, the input here already carries a time and a zone, so it is
 * parsed as-is and rendered in the reader's own timezone — a note written at
 * 4pm in Richmond should read 4pm to Darren.
 */
export function formatDateTime(isoTimestamp: string): string {
  const d = new Date(isoTimestamp);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/**
 * "3 minutes ago" / "yesterday" for recent activity, falling back to an
 * absolute date once relative wording stops being useful.
 */
export function formatRelative(isoTimestamp: string, now: Date = new Date()): string {
  const d = new Date(isoTimestamp);
  if (Number.isNaN(d.getTime())) return "";

  const seconds = Math.round((now.getTime() - d.getTime()) / 1000);
  if (seconds < 45) return "just now";

  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;

  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hr${hours === 1 ? "" : "s"} ago`;

  const days = Math.round(hours / 24);
  if (days === 1) return "yesterday";
  if (days < 7) return `${days} days ago`;

  return formatDateTime(isoTimestamp);
}
