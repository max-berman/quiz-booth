/**
 * Centralized PWA Configuration
 * All PWA colors and theme settings should be defined here
 * 
 * USAGE:
 * 1. Update colors in this file
 * 2. The Vite PWA plugin automatically uses these settings
 * 3. Static files (manifest.webmanifest, browserconfig.xml) should match these values
 * 4. HTML meta tags in index.html should also match these values
 * 
 * FILES TO UPDATE WHEN CHANGING COLORS:
 * - This file (centralized configuration)
 * - client/index.html (meta tags)
 * - client/public/manifest.webmanifest (static manifest)
 * - client/public/browserconfig.xml (Windows tile config)
 * 
 * After changing colors, rebuild and redeploy the application
 */

export const PWA_CONFIG = {
  // Theme Colors
  themeColor: '#f4eccf',
  backgroundColor: '#ffffff',

  // App Information
  name: 'QuizBooth - Create Engaging Trivia Games',
  shortName: 'QuizBooth',
  description: 'Create AI-powered custom trivia games for trade shows and events',

  // Display Settings
  display: 'standalone' as const,
  orientation: 'portrait' as const,
  scope: '/',
  startUrl: '/',

  // Icons
  icons: [
    {
      src: '/assets/quiz-booth-icon.png',
      sizes: '192x192',
      type: 'image/png'
    },
    {
      src: '/assets/quiz-booth-icon.png',
      sizes: '512x512',
      type: 'image/png'
    },
    {
      src: '/assets/quiz-booth-icon.png',
      sizes: '512x512',
      type: 'image/png',
      purpose: 'maskable' as const
    }
  ],

  // Categories
  categories: ['business', 'education', 'entertainment'] as const,

  // Meta Tags
  metaTags: {
    themeColor: '#f4eccf',
    msTileColor: '#f4eccf',
    appleMobileWebAppCapable: 'yes',
    appleMobileWebAppStatusBarStyle: 'black-translucent',
    appleMobileWebAppTitle: 'QuizBooth',
    mobileWebAppCapable: 'yes',
    applicationName: 'QuizBooth',
    formatDetection: 'telephone=no'
  }
} as const;
