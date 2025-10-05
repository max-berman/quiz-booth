/**
 * Color utility functions for handling color conversions and customizations
 */

/**
 * Convert hex color to HSL format
 * @param hex - Hex color string (e.g., "#ff0000" or "ff0000")
 * @returns HSL object with h, s, l values
 */
export function hexToHSL(hex: string) {
  // Remove the hash if it exists
  hex = hex.replace(/^#/, '')

  // Parse the hex values
  let r, g, b
  if (hex.length === 3) {
    r = parseInt(hex[0] + hex[0], 16)
    g = parseInt(hex[1] + hex[1], 16)
    b = parseInt(hex[2] + hex[2], 16)
  } else if (hex.length === 6) {
    r = parseInt(hex.slice(0, 2), 16)
    g = parseInt(hex.slice(2, 4), 16)
    b = parseInt(hex.slice(4, 6), 16)
  } else {
    throw new Error('Invalid hex color')
  }

  // Convert to 0-1 range
  r /= 255
  g /= 255
  b /= 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0,
    s = 0,
    l = (max + min) / 2

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0)
        break
      case g:
        h = (b - r) / d + 2
        break
      case b:
        h = (r - g) / d + 4
        break
    }

    h /= 6
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  }
}

/**
 * Apply game customization colors to CSS variables
 * @param customization - Game customization object with color properties
 */
export function applyGameCustomization(customization: {
  primaryColor?: string
  secondaryColor?: string
  tertiaryColor?: string
  quaternaryColor?: string
}) {
  const { primaryColor, secondaryColor, tertiaryColor, quaternaryColor } =
    customization

  // Convert hex colors to HSL and update CSS variables
  const root = document.documentElement

  if (primaryColor) {
    const hsl = hexToHSL(primaryColor)
    root.style.setProperty('--primary-h', hsl.h.toString())
    root.style.setProperty('--primary-s', `${hsl.s}%`)
    root.style.setProperty('--primary-l', `${hsl.l}%`)
  }

  if (secondaryColor) {
    const hsl = hexToHSL(secondaryColor)
    root.style.setProperty('--secondary-h', hsl.h.toString())
    root.style.setProperty('--secondary-s', `${hsl.s}%`)
    root.style.setProperty('--secondary-l', `${hsl.l}%`)
  }

  if (tertiaryColor) {
    const hsl = hexToHSL(tertiaryColor)
    root.style.setProperty('--background-h', hsl.h.toString())
    root.style.setProperty('--background-s', `${hsl.s}%`)
    root.style.setProperty('--background-l', `${hsl.l}%`)
  }

  if (quaternaryColor) {
    const hsl = hexToHSL(quaternaryColor)
    root.style.setProperty('--card-h', hsl.h.toString())
    root.style.setProperty('--card-s', `${hsl.s}%`)
    root.style.setProperty('--card-l', `${hsl.l}%`)
  }
}

/**
 * Clean up game customization CSS variables
 */
export function cleanupGameCustomization() {
  const root = document.documentElement
  root.style.removeProperty('--primary-h')
  root.style.removeProperty('--primary-s')
  root.style.removeProperty('--primary-l')
  root.style.removeProperty('--secondary-h')
  root.style.removeProperty('--secondary-s')
  root.style.removeProperty('--secondary-l')
  root.style.removeProperty('--background-h')
  root.style.removeProperty('--background-s')
  root.style.removeProperty('--background-l')
  root.style.removeProperty('--card-h')
  root.style.removeProperty('--card-s')
  root.style.removeProperty('--card-l')
}
