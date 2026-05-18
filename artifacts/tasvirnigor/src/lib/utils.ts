import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Ensures a stored URL has an absolute protocol so browsers don't
 * treat it as a relative path.  Handles nullish values gracefully.
 *
 * Examples:
 *   "https://t.me/tasvir_14"  → "https://t.me/tasvir_14"   (unchanged)
 *   "t.me/tasvir_14"          → "https://t.me/tasvir_14"   (protocol added)
 *   ""  / null / undefined    → null                        (no link)
 */
export function ensureProtocol(url: string | null | undefined): string | null {
  if (!url || !url.trim()) return null;
  const trimmed = url.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}
