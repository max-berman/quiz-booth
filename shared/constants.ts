// Shared constants for the QuizBooth application

// Industry options for better organization
export const INDUSTRY_OPTIONS = [
  'Advertising and Marketing',
  'Agriculture',
  'Art and Design',
  'Automotive',
  'Beauty and Cosmetics',
  'Construction',
  'E-commerce',
  'Education',
  'Energy',
  'Entertainment',
  'Environmental Services',
  'Fashion',
  'Finance and Banking',
  'Food and Beverage',
  'Gaming',
  'Healthcare',
  'Logistics and Transport',
  'Manufacturing',
  'Media and Communications',
  'Real Estate',
  'Retail',
  'Sports and Fitness',
  'Technology',
  'Tourism and Hospitality',
  'Wellness and Lifestyle',
  'Other',
] as const

export type Industry = typeof INDUSTRY_OPTIONS[number]
