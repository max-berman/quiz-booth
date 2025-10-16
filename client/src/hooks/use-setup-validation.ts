import { useState, useCallback } from 'react'
import {
  validateSetupForm,
  type ValidationResult,
} from '@/lib/website-utils'

interface UseSetupValidationProps {
  formData: {
    companyName: string
    industry: string
    customIndustry: string
    productDescription: string
  }
}

/**
 * Custom hook for managing setup form validation state and interactions
 * 
 * @param formData - The current form data to validate
 * @returns Object containing validation state and functions
 */
export function useSetupValidation({ formData }: UseSetupValidationProps) {
  // Validation state
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [validationMessages, setValidationMessages] = useState<Record<string, string>>({})

  // Track field interactions and delayed validation display
  const [fieldInteractions, setFieldInteractions] = useState<Record<string, boolean>>({})
  const [delayedValidationErrors, setDelayedValidationErrors] = useState<Record<string, string>>({})
  const [delayedValidationMessages, setDelayedValidationMessages] = useState<Record<string, string>>({})

  /**
   * Track when a user interacts with a form field
   * This helps determine when to show validation messages
   */
  const handleFieldInteraction = useCallback((fieldName: string) => {
    setFieldInteractions((prev) => ({
      ...prev,
      [fieldName]: true,
    }))
  }, [])

  /**
   * Validate the entire form and update validation state
   * @returns Whether the form is currently valid
   */
  const validateForm = useCallback(() => {
    const validation = validateSetupForm(formData, fieldInteractions)
    setValidationErrors(validation.errors)
    setValidationMessages(validation.messages)
    return validation.isValid
  }, [formData, fieldInteractions])

  /**
   * Update delayed validation state after a timeout
   * This creates a better UX by not showing validation messages immediately
   */
  const updateDelayedValidation = useCallback(() => {
    const timer = setTimeout(() => {
      setDelayedValidationErrors(validationErrors)
      setDelayedValidationMessages(validationMessages)
    }, 1000) // 1 second delay

    return () => clearTimeout(timer)
  }, [validationErrors, validationMessages])

  return {
    // Current validation state
    validationErrors,
    validationMessages,

    // Delayed validation state (for better UX)
    delayedValidationErrors,
    delayedValidationMessages,

    // Field interaction tracking
    fieldInteractions,

    // Functions
    handleFieldInteraction,
    validateForm,
    updateDelayedValidation,

    // Setters for external state management
    setValidationErrors,
    setValidationMessages,
    setDelayedValidationErrors,
    setDelayedValidationMessages,
  }
}
