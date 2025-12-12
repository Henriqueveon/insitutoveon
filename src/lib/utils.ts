import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Normalize DISC score from -50/+50 scale to 0-100 percentage
 * Used across all chart components for consistent score display
 */
export function normalizeScore(score: number): number {
  return Math.round(((score + 50) / 100) * 100);
}
