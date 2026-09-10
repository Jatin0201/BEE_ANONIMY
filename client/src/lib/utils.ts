/**
 * Anonimy — Utility helpers
 */

/**
 * Format an ISO 8601 date string into a short relative time label.
 * e.g. "just now", "14m ago", "3h ago", "2d ago"
 */
export function formatRelativeTime(isoString: string): string {
  const now = Date.now();
  const then = new Date(isoString).getTime();
  const diffMs = now - then;

  const seconds = Math.floor(diffMs / 1000);
  if (seconds < 60) return 'just now';

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;

  // Fallback: locale date string
  return new Date(isoString).toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Format a date as "Month YYYY" — used on the profile page "Member since" row.
 */
export function formatMemberSince(isoString: string): string {
  return new Date(isoString).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });
}

/**
 * Merge class names — lightweight helper to avoid installing clsx for MVP.
 */
export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(' ');
}
