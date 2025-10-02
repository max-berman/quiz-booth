/**
 * Script to generate PWA manifest from centralized configuration
 * Run this script before building to ensure manifest is up to date
 */

const fs = require('fs')
const path = require('path')

// Import the centralized PWA configuration
const { PWA_CONFIG } = require('../client/src/lib/pwa-config.ts')

// Create the manifest object
const manifest = {
	name: PWA_CONFIG.name,
	short_name: PWA_CONFIG.shortName,
	description: PWA_CONFIG.description,
	start_url: PWA_CONFIG.startUrl,
	display: PWA_CONFIG.display,
	background_color: PWA_CONFIG.backgroundColor,
	theme_color: PWA_CONFIG.themeColor,
	lang: 'en',
	scope: PWA_CONFIG.scope,
	orientation: PWA_CONFIG.orientation,
	icons: PWA_CONFIG.icons,
	categories: PWA_CONFIG.categories,
}

// Write the manifest file
const manifestPath = path.join(
	__dirname,
	'../client/public/manifest.webmanifest'
)
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2))

console.log(
	'✅ PWA manifest generated successfully from centralized configuration'
)
console.log(`📁 Manifest saved to: ${manifestPath}`)
