/**
 * Color utility functions for handling color conversions and customizations
 */

/**
 * Validate if a string is a valid hex color
 * @param color - Color string to validate
 * @returns boolean indicating if the color is valid
 */
export function isValidHexColor(color: string): boolean {
  if (!color || typeof color !== 'string') return false

  // Remove hash if present
  const cleanColor = color.replace(/^#/, '')

  // Check for valid hex characters and length
  return /^([0-9A-F]{3}){1,2}$/i.test(cleanColor)
}

/**
 * Convert any color format to hex
 * @param color - Color string in any format (hex, rgb, hsl, named color)
 * @returns Hex color string or null if invalid
 */
export function colorToHex(color: string): string | null {
  if (!color || typeof color !== 'string') return null

  // If it's already a valid hex color, return it
  if (isValidHexColor(color)) {
    return color.startsWith('#') ? color : `#${color}`
  }

  // Handle named colors (basic set)
  const namedColors: Record<string, string> = {
    red: '#ff0000', green: '#008000', blue: '#0000ff',
    yellow: '#ffff00', cyan: '#00ffff', magenta: '#ff00ff',
    black: '#000000', white: '#ffffff', gray: '#808080',
    grey: '#808080', silver: '#c0c0c0', maroon: '#800000',
    olive: '#808000', lime: '#00ff00', aqua: '#00ffff',
    teal: '#008080', navy: '#000080', purple: '#800080',
    fuchsia: '#ff00ff', orange: '#ffa500', brown: '#a52a2a'
  }

  const lowerColor = color.toLowerCase()
  if (namedColors[lowerColor]) {
    return namedColors[lowerColor]
  }

  // Handle rgb() format
  const rgbMatch = color.match(/^rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/i)
  if (rgbMatch) {
    const r = parseInt(rgbMatch[1])
    const g = parseInt(rgbMatch[2])
    const b = parseInt(rgbMatch[3])
    if (r >= 0 && r <= 255 && g >= 0 && g <= 255 && b >= 0 && b <= 255) {
      return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`
    }
  }

  // Handle rgba() format (ignore alpha)
  const rgbaMatch = color.match(/^rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*[\d.]+\s*\)$/i)
  if (rgbaMatch) {
    const r = parseInt(rgbaMatch[1])
    const g = parseInt(rgbaMatch[2])
    const b = parseInt(rgbaMatch[3])
    if (r >= 0 && r <= 255 && g >= 0 && g <= 255 && b >= 0 && b <= 255) {
      return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`
    }
  }

  // Handle hsl() format
  const hslMatch = color.match(/^hsl\(\s*(\d+)\s*,\s*(\d+)%\s*,\s*(\d+)%\s*\)$/i)
  if (hslMatch) {
    const h = parseInt(hslMatch[1]) / 360
    const s = parseInt(hslMatch[2]) / 100
    const l = parseInt(hslMatch[3]) / 100

    if (h >= 0 && h <= 1 && s >= 0 && s <= 1 && l >= 0 && l <= 1) {
      // Convert HSL to RGB
      let r, g, b

      if (s === 0) {
        r = g = b = l
      } else {
        const hue2rgb = (p: number, q: number, t: number) => {
          if (t < 0) t += 1
          if (t > 1) t -= 1
          if (t < 1 / 6) return p + (q - p) * 6 * t
          if (t < 1 / 2) return q
          if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
          return p
        }

        const q = l < 0.5 ? l * (1 + s) : l + s - l * s
        const p = 2 * l - q
        r = hue2rgb(p, q, h + 1 / 3)
        g = hue2rgb(p, q, h)
        b = hue2rgb(p, q, h - 1 / 3)
      }

      const toHex = (x: number) => {
        const hex = Math.round(x * 255).toString(16)
        return hex.length === 1 ? '0' + hex : hex
      }

      return `#${toHex(r)}${toHex(g)}${toHex(b)}`
    }
  }

  return null
}

/**
 * Convert hex color to HSL format with robust error handling
 * @param color - Color string in any format
 * @param fallback - Fallback color if conversion fails (default: '#000000')
 * @returns HSL object with h, s, l values
 */
export function colorToHSL(color: string, fallback: string = '#000000'): { h: number; s: number; l: number } {
  // First try to convert to hex
  const hexColor = colorToHex(color)

  // If conversion failed, use fallback
  const finalHex = hexColor || colorToHex(fallback) || '#000000'

  // Remove the hash if it exists
  const cleanHex = finalHex.replace(/^#/, '')

  // Parse the hex values
  let r, g, b
  if (cleanHex.length === 3) {
    r = parseInt(cleanHex[0] + cleanHex[0], 16)
    g = parseInt(cleanHex[1] + cleanHex[1], 16)
    b = parseInt(cleanHex[2] + cleanHex[2], 16)
  } else if (cleanHex.length === 6) {
    r = parseInt(cleanHex.slice(0, 2), 16)
    g = parseInt(cleanHex.slice(2, 4), 16)
    b = parseInt(cleanHex.slice(4, 6), 16)
  } else {
    // This should never happen with our validation, but as a last resort
    console.warn(`Invalid hex color format: ${cleanHex}, using fallback`)
    return { h: 0, s: 0, l: 0 }
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
 * Convert hex color to HSL format (legacy function, uses new robust implementation)
 * @param hex - Hex color string (e.g., "#ff0000" or "ff0000")
 * @returns HSL object with h, s, l values
 */
export function hexToHSL(hex: string) {
  return colorToHSL(hex)
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
