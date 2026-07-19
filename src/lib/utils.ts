import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Generate a human-readable display ID from a database ID or existing display ID.
 * Falls back to a formatted short hash instead of raw DB ID when no meaningful ID is available.
 */
export function formatDisplayId(rawId: string, prefix: string = "ID"): string {
  if (!rawId) return `${prefix}-0000`;
  // If it already looks like a human-readable ID (e.g., ADM-001, STU-1234), return as-is
  if (/^[A-Za-z]{2,8}-\d{3,}$/.test(rawId)) return rawId;
  if (/^#?[A-Za-z]{2,8}-\d{3,}$/.test(rawId)) return rawId;
  // If it's a short string (likely a meaningful code), return it
  if (rawId.length < 10) return rawId;
  // Otherwise, it's likely a long MongoDB ObjectId - generate a nice short code
  const shortCode = rawId.slice(-6).toUpperCase();
  return `${prefix}-${shortCode}`;
}
