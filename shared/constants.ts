// Shared constants for the QuizBooth application

// Industry options for better organization
export const INDUSTRY_OPTIONS = [
  // 🔥 Highest Potential Impact
  'Esports',
  'Gaming',
  'Retail (Physical & Omni-channel)',
  'E-commerce & Online Marketplaces',
  'Food, Beverage & Restaurants',
  'Fashion & Apparel',
  'Beauty, Cosmetics & Personal Care',
  'Sports, Fitness & Recreation',
  'Tourism, Travel & Hospitality',
  'Entertainment & Media',
  'Technology, Software & IT Services',
  'Consumer Goods & Electronics',
  'Automotive & Mobility',

  // ⚡ Strong Opportunities
  'Healthcare & Pharmaceuticals',
  'Wellness, Lifestyle & Mental Health',
  'Finance, Banking & Fintech',
  'Education & EdTech',
  'Art, Design & Creative',
  'Luxury Goods & Jewelry',
  'Advertising & Marketing',
  'Telecommunications & Connectivity',
  'Environmental & Sustainability Services',
  'Cannabis',

  // 🌍 Emerging & Sector-Specific
  'Agriculture & Agritech',
  'Construction & Infrastructure',
  'Energy & Utilities',
  'Real Estate & Property Development',
  'Logistics, Transport & Supply Chain',
  'Manufacturing & Industrial',
  'Kids’ Products & Learning Toys',
  'Nonprofit & Social Impact',
  'Government & Public Services',

  // 🎯 Niche / Specialized
  'Events, Exhibitions & Conferences',
  'Pet Care & Animal Services',
  'Home & Interior Design',
  'Music & Performing Arts',
  'Virtual Reality & Metaverse',
  'Aerospace & Aviation',
  'Insurance',
  'Legal & Professional Services',
  'Recruitment & HR Tech',
  'Other'
] as const

export type Industry = typeof INDUSTRY_OPTIONS[number]
