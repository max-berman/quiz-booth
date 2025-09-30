// Date formatting utilities

/**
 * Format a date to a localized date string
 */
export function formatDate(date: Date | string | number): string {
  return new Date(date).toLocaleDateString();
}

/**
 * Format a date to a localized date and time string
 */
export function formatDateTime(date: Date | string | number): string {
  return new Date(date).toLocaleString();
}

/**
 * Format a date to a relative time string (e.g., "2 days ago")
 */
export function formatRelativeTime(date: Date | string | number): string {
  const now = new Date();
  const target = new Date(date);
  const diffInMs = now.getTime() - target.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) {
    return 'Today';
  } else if (diffInDays === 1) {
    return 'Yesterday';
  } else if (diffInDays < 7) {
    return `${diffInDays} days ago`;
  } else if (diffInDays < 30) {
    const weeks = Math.floor(diffInDays / 7);
    return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
  } else {
    return formatDate(date);
  }
}
