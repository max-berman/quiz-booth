// Shared constants for the QuizBooth application

// Industry options for better organization
export const INDUSTRY_OPTIONS = [
  // 🔥 Highest Potential Impact
  'Esports & Competitive Gaming',
  'Video Games & Interactive Entertainment',
  'Retail & E-commerce',
  'Food, Beverage & Hospitality',
  'Fashion & Apparel',
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
  'Events & Conferences',
  'Pet Care & Animal Health',
  'Home & Interior Design',
  'Music & Performing Arts',
  'Virtual & Augmented Reality',
  'Aerospace & Aviation',
  'Insurance (Insurtech)',
  'Legal & Professional Services',
  'Recruitment & HR Tech',
  'Senior Care & Aging Tech',
  'Food Tech & Alternative Proteins',
  'Freelance & Gig Economy Platforms',
  'Other'
] as const

export type Industry = typeof INDUSTRY_OPTIONS[number]
