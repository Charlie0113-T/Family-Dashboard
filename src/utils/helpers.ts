// Utility helpers for the Family Dashboard
// Add shared utility functions here

/** Generate a short date string (YYYY-MM-DD) */
export function toDateKey(date: Date = new Date()): string {
  return date.toISOString().split('T')[0];
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
