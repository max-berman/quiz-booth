/**
 * Input sanitization utilities to prevent XSS attacks
 */

/**
 * Sanitizes HTML content by removing dangerous tags and attributes
 */
export function sanitizeHtml(html: string): string {
  if (!html) return ''

  // Create a temporary div element to parse and sanitize HTML
  const tempDiv = document.createElement('div')
  tempDiv.innerHTML = html

  // Remove dangerous tags
  const dangerousTags = ['script', 'style', 'iframe', 'object', 'embed', 'link']
  dangerousTags.forEach(tag => {
    const elements = tempDiv.getElementsByTagName(tag)
    while (elements.length > 0) {
      elements[0].parentNode?.removeChild(elements[0])
    }
  })

  // Remove dangerous attributes from all elements
  const allElements = tempDiv.getElementsByTagName('*')
  const dangerousAttributes = ['onclick', 'onload', 'onerror', 'onmouseover', 'href', 'src']

  for (let i = 0; i < allElements.length; i++) {
    const element = allElements[i]
    dangerousAttributes.forEach(attr => {
      element.removeAttribute(attr)
    })
  }

  return tempDiv.innerHTML
}

/**
 * Sanitizes plain text by escaping HTML entities
 */
export function sanitizeText(text: string): string {
  if (!text) return ''

  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

/**
 * Sanitizes user input for display in UI
 * Use this for question text, explanations, and other user-generated content
 */
export function sanitizeUserInput(input: string): string {
  if (!input) return ''

  // First escape HTML entities
  let sanitized = sanitizeText(input)

  // Then allow only safe HTML tags if needed (for rich text)
  // For now, we'll keep it simple and only allow basic formatting
  const allowedTags = ['b', 'i', 'u', 'em', 'strong', 'br', 'p']
  const tempDiv = document.createElement('div')
  tempDiv.innerHTML = sanitized

  // Remove any tags not in the allowed list
  const allElements = tempDiv.getElementsByTagName('*')
  for (let i = allElements.length - 1; i >= 0; i--) {
    const element = allElements[i]
    if (!allowedTags.includes(element.tagName.toLowerCase())) {
      const parent = element.parentNode
      if (parent) {
        while (element.firstChild) {
          parent.insertBefore(element.firstChild, element)
        }
        parent.removeChild(element)
      }
    }
  }

  return tempDiv.innerHTML
}

/**
 * Validates and sanitizes URLs
 */
export function sanitizeUrl(url: string): string {
  if (!url) return ''

  try {
    const parsedUrl = new URL(url)
    // Only allow http and https protocols
    if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
      return ''
    }
    return parsedUrl.toString()
  } catch {
    // If URL parsing fails, return empty string
    return ''
  }
}

/**
 * Sanitizes file names to prevent path traversal attacks
 */
export function sanitizeFileName(fileName: string): string {
  if (!fileName) return ''

  // Remove path traversal sequences
  let sanitized = fileName.replace(/\.\.\//g, '')
  sanitized = sanitized.replace(/\.\.\\/g, '')

  // Remove any characters that could be used in path traversal
  sanitized = sanitized.replace(/[\/\\]/g, '_')

  // Limit length
  if (sanitized.length > 255) {
    sanitized = sanitized.substring(0, 255)
  }

  return sanitized
}

/**
 * Validates email addresses
 */
export function sanitizeEmail(email: string): string {
  if (!email) return ''

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return ''
  }

  return email.trim().toLowerCase()
}

/**
 * Sanitizes numeric input
 */
export function sanitizeNumber(input: string | number): number {
  if (typeof input === 'number') {
    return isNaN(input) ? 0 : input
  }

  const num = parseFloat(input)
  return isNaN(num) ? 0 : num
}

/**
 * Sanitizes boolean input
 */
export function sanitizeBoolean(input: any): boolean {
  if (typeof input === 'boolean') return input
  if (typeof input === 'string') {
    return input.toLowerCase() === 'true' || input === '1'
  }
  if (typeof input === 'number') {
    return input === 1
  }
  return false
}
