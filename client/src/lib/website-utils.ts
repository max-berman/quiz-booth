// Gibberish detection using @lanred/gibberish-detective
import { isGibberish as gibberishDetective } from '@lanred/gibberish-detective'

// Validation constants for better maintainability
const MIN_COMPANY_NAME_LENGTH = 7
const MIN_CUSTOM_INDUSTRY_LENGTH = 7
const MAX_PRODUCT_DESCRIPTION_LENGTH = 100

// Common TLDs that are likely to be websites
export const commonTLDs = [
  // Classic and legacy TLDs
  '.com', '.net', '.org', '.info', '.biz', '.edu', '.gov', '.mil',
  // Tech & startup favorites
  '.io', '.ai', '.co', '.dev', '.app', '.tech', '.cloud', '.tools', '.digital', '.xyz',
  // General commercial & creative
  '.site', '.online', '.store', '.blog', '.shop', '.design', '.space', '.world', '.club', '.studio', '.media', '.live', '.solutions', '.agency', '.works', '.company',
  // Geographic & national
  '.us', '.uk', '.ca', '.au', '.de', '.fr', '.cn', '.jp', '.in', '.nl', '.br', '.it', '.es', '.ru',
  // New and notable TLDs (ccTLDs also used globally)
  '.me', '.tv', '.cc', '.to', '.gg', '.fm', '.ly', '.ws', '.io', '.ai',
  // Industry and niche
  '.finance', '.law', '.legal', '.consulting', '.health', '.care', '.clinic', '.hospital', '.pharmacy', '.eco', '.energy', '.solar', '.green',
  // E-commerce & business
  '.buy', '.sale', '.shop', '.market', '.marketing', '.business', '.money', '.finance', '.cash', '.fund', '.capital', '.investments', '.ventures',
  // Creative & lifestyle
  '.art', '.photo', '.photography', '.gallery', '.fashion', '.music', '.films', '.movie', '.games', '.game', '.fun', '.play', '.video', '.studio', '.stream',
  // Educational & informational
  '.academy', '.school', '.college', '.university', '.training', '.courses', '.education', '.news', '.press', '.wiki', '.review',
  // Localized & geo TLDs
  '.africa', '.london', '.paris', '.nyc', '.berlin', '.tokyo', '.madrid', '.sydney', '.melbourne', '.dubai',
  // Miscellaneous and trendy
  '.top', '.wow', '.vip', '.pro', '.name', '.page', '.site', '.world', '.zone', '.today', '.global', '.one', '.win', '.cool', '.club', '.link'
];

// Helper function to check if company name is a website
export function isWebsite(text: string): boolean {
  if (!text.includes('.')) return false;
  if (text.startsWith('http://') || text.startsWith('https://')) return true;

  return commonTLDs.some((tld) => {
    const index = text.indexOf(tld);
    if (index === -1) return false;
    const afterTLD = text.substring(index + tld.length);
    const beforeTLD = text.substring(0, index);

    const isValidPosition =
      afterTLD.length === 0 ||
      afterTLD.startsWith('/') ||
      afterTLD.startsWith('?') ||
      afterTLD.startsWith('#') ||
      afterTLD.startsWith('.');

    const hasDomainName = beforeTLD.length > 0;

    return isValidPosition && hasDomainName;
  });
}

// Format website for display
export function formatWebsite(website: string): string {
  try {
    const url = new URL(
      website.startsWith('http') ? website : `https://${website}`
    );
    return url.hostname;
  } catch {
    return website;
  }
}

// Main gibberish detection function
export function isGibberish(text: string): boolean {
  const trimmed = text.trim()

  // Skip very short texts - they're often legitimate short names
  if (trimmed.length < MIN_COMPANY_NAME_LENGTH) return false

  // Skip if it's a website - websites are valid even if they look like gibberish
  if (isWebsite(trimmed)) return false

  // Use the gibberish-detective package for advanced detection
  return gibberishDetective(trimmed)
}

// Validation utilities for setup form
export interface ValidationResult {
  isValid: boolean
  message: string
}

// Validate company name based on the rules
export function validateCompanyName(companyName: string, hasInteracted: boolean = false): ValidationResult {
  const trimmedName = companyName.trim()

  if (!trimmedName) {
    return {
      isValid: false,
      message: hasInteracted ? "Company name or website is required - our AI needs something to work with!" : ""
    }
  }

  // Check if it's a website
  if (isWebsite(trimmedName)) {
    return {
      isValid: true,
      message: hasInteracted ? "Great! We'll use your website to generate relevant questions." : ""
    }
  }

  // Check for gibberish
  if (isGibberish(trimmedName)) {
    return {
      isValid: false,
      message: hasInteracted ? "That looks like gibberish! Please provide a real company name or website." : ""
    }
  }

  // Not a website, check character length
  if (trimmedName.length < MIN_COMPANY_NAME_LENGTH) {
    return {
      isValid: false,
      message: hasInteracted ? `That company name is a bit shy! Give us at least ${MIN_COMPANY_NAME_LENGTH} characters to work with.` : ""
    }
  }

  return {
    isValid: true,
    message: hasInteracted ? "Perfect! We'll create questions based on your company name." : ""
  }
}

// Validate custom industry when "Other" is selected
export function validateCustomIndustry(industry: string, customIndustry: string, hasInteracted: boolean = false): ValidationResult {
  if (industry !== 'Other') {
    return {
      isValid: true,
      message: ""
    }
  }

  const trimmedCustom = customIndustry.trim()

  // When industry is "Other", always show validation regardless of interaction
  // This is because the field becomes required immediately when "Other" is selected
  const shouldShowValidation = industry === 'Other'

  if (!trimmedCustom) {
    return {
      isValid: false,
      message: shouldShowValidation ? "Custom industry is required when 'Other' is selected - tell us what makes you unique!" : ""
    }
  }

  // Check for gibberish
  if (isGibberish(trimmedCustom)) {
    return {
      isValid: false,
      message: shouldShowValidation ? "That looks like gibberish! Please provide a meaningful industry description." : ""
    }
  }

  if (trimmedCustom.length < MIN_CUSTOM_INDUSTRY_LENGTH) {
    return {
      isValid: false,
      message: shouldShowValidation ? `Custom industry? Tell us more! We need at least ${MIN_CUSTOM_INDUSTRY_LENGTH} characters to understand your world.` : ""
    }
  }

  return {
    isValid: true,
    message: shouldShowValidation ? "Thanks for sharing your unique industry!" : ""
  }
}

// Validate product description based on company name
export function validateProductDescription(
  companyName: string,
  productDescription: string,
  hasInteracted: boolean = false,
  companyNameInteracted: boolean = false
): ValidationResult {
  const trimmedCompany = companyName.trim()
  const trimmedProduct = productDescription.trim()

  // If company name is a website, product description is optional
  if (isWebsite(trimmedCompany)) {
    return {
      isValid: true,
      message: hasInteracted ? (trimmedProduct ? "Great details! This will help us create better questions." : "Product description is optional when you provide a website.") : ""
    }
  }

  // Not a website, product description becomes mandatory
  if (!trimmedProduct) {
    return {
      isValid: false,
      message: (hasInteracted || companyNameInteracted) ? `No website detected! Help our AI by describing what you do (at least ${MIN_COMPANY_NAME_LENGTH} characters, please).` : ""
    }
  }

  if (trimmedProduct.length < MIN_COMPANY_NAME_LENGTH) {
    return {
      isValid: false,
      message: hasInteracted ? `Tell us more about your products! We need at least ${MIN_COMPANY_NAME_LENGTH} characters to create great questions.` : ""
    }
  }

  return {
    isValid: true,
    message: hasInteracted ? "Perfect! This information will help us create relevant questions." : ""
  }
}

// Comprehensive form validation
export function validateSetupForm(formData: {
  companyName: string
  industry: string
  customIndustry: string
  productDescription: string
}, fieldInteractions: Record<string, boolean> = {}): {
  isValid: boolean
  errors: Record<string, string>
  messages: Record<string, string>
} {
  const companyValidation = validateCompanyName(formData.companyName, fieldInteractions.companyName)
  const industryValidation = validateCustomIndustry(formData.industry, formData.customIndustry, fieldInteractions.customIndustry)
  const productValidation = validateProductDescription(
    formData.companyName,
    formData.productDescription,
    fieldInteractions.productDescription,
    fieldInteractions.companyName
  )

  const errors: Record<string, string> = {}
  const messages: Record<string, string> = {}

  if (!companyValidation.isValid) {
    errors.companyName = companyValidation.message
  } else {
    messages.companyName = companyValidation.message
  }

  if (!industryValidation.isValid) {
    errors.customIndustry = industryValidation.message
  } else if (industryValidation.message) {
    messages.customIndustry = industryValidation.message
  }

  if (!productValidation.isValid) {
    errors.productDescription = productValidation.message
  } else if (productValidation.message) {
    messages.productDescription = productValidation.message
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    messages
  }
}
