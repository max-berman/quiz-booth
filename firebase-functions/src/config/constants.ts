// Shared constants for Firebase Functions

// Score validation constants for consistent validation across client and server
export const SCORE_VALIDATION_CONFIG = {
  // Time validation thresholds (use timer constants for consistency)
  MIN_TIME_PER_QUESTION: 10, // seconds - minimum realistic time per question
  MAX_TIME_PER_QUESTION: 300, // seconds (5 minutes) - maximum realistic time per question
  MIN_TIME_PER_QUESTION_PERFECT: 15, // seconds - minimum time for perfect score
  MAX_SCORE_PER_SECOND: 50, // maximum score per second ratio to detect tampering

  // Score calculation constants
  MAX_POINTS_PER_QUESTION: 100,
  MAX_TIME_BONUS_PER_QUESTION: 60,
  MAX_STREAK_BONUS_PER_QUESTION: 10,

  // Question count validation
  MAX_QUESTIONS: 100,
  QUESTION_COUNT_TOLERANCE: 2, // Allow some flexibility in question count

  // Score range validation buffers
  SCORE_RANGE_BUFFER: 10, // Allow small buffer for rounding errors
  MIN_SCORE_FOR_CORRECT_BUFFER: 5, // Allow small buffer for correct answer minimum
} as const;

// CORS configuration
export const CORS_CONFIG = {
  origin: true, // Allow all origins in development
  credentials: true,
} as const;
