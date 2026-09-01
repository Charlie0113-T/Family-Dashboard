// Utility helpers for the Family Dashboard
// Add shared utility functions here

/** Generate a short date string (YYYY-MM-DD) in local time */
export function toDateKey(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Generate a month key (YYYY-MM) in local time */
export function toMonthKey(date: Date = new Date()): string {
  return toDateKey(date).slice(0, 7);
}

/** Shift a YYYY-MM month key by a number of months (negative = earlier) */
export function shiftMonthKey(month: string, delta: number): string {
  const [y, m] = month.split('-').map(Number);
  return toMonthKey(new Date(y, m - 1 + delta, 1));
}

/** Format a month key for display, e.g. "September 2026" */
export function formatMonthLabel(month: string): string {
  const [y, m] = month.split('-').map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });
}

/** Format a date for display */
export function formatDisplayDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

/** Whether the user prefers reduced motion (skip decorative animations) */
export function prefersReducedMotion(): boolean {
  return (
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}
