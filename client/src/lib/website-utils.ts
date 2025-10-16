// Gibberish detection using @lanred/gibberish-detective
import { isGibberish as gibberishDetective } from '@lanred/gibberish-detective'

// Import shared website utilities
import { isWebsite, formatWebsite, commonTLDs } from '@shared/website-utils'

// Re-export shared website utilities
export { isWebsite, formatWebsite, commonTLDs }

// Validation constants for better maintainability
const MIN_COMPANY_NAME_LENGTH = 7
const MIN_CUSTOM_INDUSTRY_LENGTH = 5
const MAX_PRODUCT_DESCRIPTION_LENGTH = 120

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
