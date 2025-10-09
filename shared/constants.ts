// Shared constants for the QuizBooth application

// Industry options for better organization
export const INDUSTRY_OPTIONS = [
  // 🔥 Highest Potential Impact
  'Esports & Competitive Gaming',
  'Video Games & Interactive Entertainment',
  'Gaming',
  'Software-as-a-Service (SaaS)',
  'Retail & E-commerce',
  'Food & Beverage',
  'Fashion & Apparel',
  'Vintage & Retro Fashion',
  'Beauty, Cosmetics & Personal Care',
  'Sports, Fitness & Recreation',
  'Travel, Tourism & Hospitality',
  'Entertainment & Media',
  'Technology & Software',
  'Consumer Goods & Electronics',
  'Automotive & Mobility',
  'Blockchain, Crypto & Web3',
  'Fintech & Digital Finance',
  'Clean Energy & Climate Tech',
  'Creator Economy & Influencer Marketing',

  // ⚡ Strong Opportunities
  'Healthcare & Pharmaceuticals',
  'Wellness & Mental Health',
  'Finance, Banking & Investment',
  'Education & EdTech',
  'Art, Design & Creative Industries',
  'Luxury Goods & Jewelry',
  'Advertising, Marketing & PR',
  'Telecommunications & 5G',
  'Sustainability & Green Tech',
  'Cannabis & CBD Products',
  'Cybersecurity',
  'BioTech & Life Sciences',

  // 🌍 Emerging & Sector-Specific
  'Agriculture & Agritech',
  'Construction & Engineering',
  'Energy & Utilities',
  'Real Estate & PropTech',
  'Logistics & Supply Chain',
  'Manufacturing & Industrial',
  'Children\'s Products & Family Services',
  'Nonprofit & Social Impact',
  'Government & Public Sector',
  'Space & Satellite Tech',
  'Smart Cities & Urban Tech',

  // 🎯 Niche / Specialized
  'Car & Vehicle Rental',
  'Consumer Goods Rental',
  'Equipment & Industrial Rental',
  'Home Services',
  'Events & Conferences',
  'Pet Care & Animal Health',
  'Home & Interior Design',
  'Music & Performing Arts',
  'Virtual & Augmented Reality',
  'Aerospace & Aviation',
  'Insurance',
  'Legal Services',
  'Recruitment & HR Tech',
  'Senior Care & Aging Tech',
  'Food Tech & Alternative Proteins',
  'Freelance & Gig Economy Platforms',
  'iGaming',
  'Other'
] as const

export type Industry = typeof INDUSTRY_OPTIONS[number]

// Timer constants for consistent timing across client and server
export const QUESTION_TIMER_DURATION = 30 // seconds per question
export const MAX_TIME_PER_QUESTION = 31 // seconds (timer duration + buffer for transitions)
export const MIN_TIME_PER_QUESTION = 0.5 // seconds (reasonable minimum to prevent instant answers)

// Score validation constants for consistent validation across client and server
export const SCORE_VALIDATION_CONFIG = {
  // Time validation thresholds (use timer constants for consistency)
  MIN_TIME_PER_QUESTION: MIN_TIME_PER_QUESTION, // Minimum seconds per question (reasonable minimum to prevent instant answers)
  MAX_TIME_PER_QUESTION: MAX_TIME_PER_QUESTION,  // Maximum seconds per question (increased from 35 for validation leniency)
  MIN_TIME_PER_QUESTION_PERFECT: 1, // Minimum seconds per question for perfect score (reduced from 3 for validation leniency)

  // Score validation thresholds
  MAX_SCORE_PER_SECOND: 300, // Maximum points per second (increased from 200 for validation leniency)

  // Score calculation constants
  MAX_POINTS_PER_QUESTION: 100,
  MAX_TIME_BONUS_PER_QUESTION: 60,
  MAX_STREAK_BONUS_PER_QUESTION: 10,

  // Range validation buffers
  SCORE_RANGE_BUFFER: 10, // Buffer for score range validation
  MIN_SCORE_FOR_CORRECT_BUFFER: 10, // Buffer for minimum score validation

  // Question count validation
  MAX_QUESTIONS: 100,
  QUESTION_COUNT_TOLERANCE: 2, // Allow some flexibility in question count
} as const
