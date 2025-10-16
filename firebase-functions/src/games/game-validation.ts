import { isWebsite } from '@shared/website-utils';
import { SCORE_VALIDATION_CONFIG } from '../config/constants';

// Validation utilities for setup form
interface ValidationResult {
  isValid: boolean;
  message: string;
}

// Validate company name based on the rules
export function validateCompanyName(companyName: string): ValidationResult {
  const trimmedName = companyName.trim();

  if (!trimmedName) {
    return {
      isValid: false,
      message: "Company name or website is required - our AI needs something to work with!"
    };
  }

  // Check if it's a website
  if (isWebsite(trimmedName)) {
    return {
      isValid: true,
      message: "Great! We'll use your website to generate relevant questions."
    };
  }

  // Not a website, check character length
  if (trimmedName.length < 7) {
    return {
      isValid: false,
      message: "That company name is a bit shy! Give us at least 7 characters to work with."
    };
  }

  return {
    isValid: true,
    message: "Perfect! We'll create questions based on your company name."
  };
}

// Validate custom industry when "Other" is selected
export function validateCustomIndustry(industry: string, customIndustry: string): ValidationResult {
  if (industry !== 'Other') {
    return {
      isValid: true,
      message: ""
    };
  }

  const trimmedCustom = customIndustry.trim();

  if (!trimmedCustom) {
    return {
      isValid: false,
      message: "Custom industry is required when 'Other' is selected - tell us what makes you unique!"
    };
  }

  if (trimmedCustom.length < 7) {
    return {
      isValid: false,
      message: "Custom industry? Tell us more! We need at least 7 characters to understand your world."
    };
  }

  return {
    isValid: true,
    message: "Thanks for sharing your unique industry!"
  };
}

// Validate product description based on company name
export function validateProductDescription(
  companyName: string,
  productDescription: string
): ValidationResult {
  const trimmedCompany = companyName.trim();
  const trimmedProduct = productDescription.trim();

  // If company name is a website, product description is optional
  if (isWebsite(trimmedCompany)) {
    return {
      isValid: true,
      message: trimmedProduct ? "Great details! This will help us create better questions." : "Product description is optional when you provide a website."
    };
  }

  // Not a website, product description becomes mandatory
  if (!trimmedProduct) {
    return {
      isValid: false,
      message: "No website detected! Help our AI by describing what you do (at least 7 characters, please)."
    };
  }

  if (trimmedProduct.length < 7) {
    return {
      isValid: false,
      message: "Tell us more about your products! We need at least 7 characters to create great questions."
    };
  }

  return {
    isValid: true,
    message: "Perfect! This information will help us create relevant questions."
  };
}

// Comprehensive form validation
export function validateSetupForm(formData: {
  companyName: string;
  industry: string;
  customIndustry: string;
  productDescription: string;
}): {
  isValid: boolean;
  errors: Record<string, string>;
} {
  const companyValidation = validateCompanyName(formData.companyName);
  const industryValidation = validateCustomIndustry(formData.industry, formData.customIndustry);
  const productValidation = validateProductDescription(formData.companyName, formData.productDescription);

  const errors: Record<string, string> = {};

  if (!companyValidation.isValid) {
    errors.companyName = companyValidation.message;
  }

  if (!industryValidation.isValid) {
    errors.customIndustry = industryValidation.message;
  }

  if (!productValidation.isValid) {
    errors.productDescription = productValidation.message;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

// Score validation helper function
export function validateScoreSubmission(data: {
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  timeSpent: number;
  gameQuestionCount: number;
}): string[] {
  const errors: string[] = [];
  const { score, correctAnswers, totalQuestions, timeSpent, gameQuestionCount } = data;

  // Validate basic numeric ranges
  if (score < 0) {
    errors.push('Score cannot be negative');
  }

  if (correctAnswers < 0 || correctAnswers > totalQuestions) {
    errors.push('Invalid correct answers count');
  }

  if (totalQuestions <= 0 || totalQuestions > SCORE_VALIDATION_CONFIG.MAX_QUESTIONS) {
    errors.push('Invalid total questions count');
  }

  if (timeSpent < 0) {
    errors.push('Time spent cannot be negative');
  }

  // Validate consistency between correct answers and total questions
  if (correctAnswers > totalQuestions) {
    errors.push('Correct answers cannot exceed total questions');
  }

  // Validate score calculation consistency
  const maxPossibleScore = totalQuestions * (
    SCORE_VALIDATION_CONFIG.MAX_POINTS_PER_QUESTION +
    SCORE_VALIDATION_CONFIG.MAX_TIME_BONUS_PER_QUESTION +
    SCORE_VALIDATION_CONFIG.MAX_STREAK_BONUS_PER_QUESTION
  );

  if (score > maxPossibleScore) {
    errors.push('Score exceeds maximum possible value for this game');
  }

  // Validate that total questions matches game configuration
  if (gameQuestionCount > 0 && Math.abs(totalQuestions - gameQuestionCount) > SCORE_VALIDATION_CONFIG.QUESTION_COUNT_TOLERANCE) {
    errors.push('Submitted question count does not match game configuration');
  }

  // Validate time spent is reasonable
  const avgTimePerQuestion = totalQuestions > 0 ? timeSpent / totalQuestions : 0;

  if (avgTimePerQuestion < SCORE_VALIDATION_CONFIG.MIN_TIME_PER_QUESTION) {
    errors.push('Time spent per question is unrealistically low');
  }

  if (avgTimePerQuestion > SCORE_VALIDATION_CONFIG.MAX_TIME_PER_QUESTION) {
    errors.push('Time spent per question is unrealistically high');
  }

  return errors;
}
