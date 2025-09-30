// Time formatting utilities

/**
 * Format seconds into a human-readable time string (e.g., "2m 30s")
 */
export function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (minutes === 0) {
    return `${remainingSeconds}s`;
  } else if (remainingSeconds === 0) {
    return `${minutes}m`;
  } else {
    return `${minutes}m ${remainingSeconds}s`;
  }
}

/**
 * Format milliseconds into a human-readable time string
 */
export function formatMilliseconds(ms: number): string {
  return formatTime(Math.floor(ms / 1000));
}

/**
 * Calculate average time from an array of time values
 */
export function calculateAverageTime(times: number[]): number {
  if (times.length === 0) return 0;
  return Math.round(times.reduce((sum, time) => sum + time, 0) / times.length);
}
