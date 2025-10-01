#!/usr/bin/env node

/**
 * Script to automatically update the SSR asset resolver with current build file names
 * This should be run after each client build to ensure SSR uses the correct asset names
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Paths
const assetsDir = path.join(__dirname, '../dist/public/assets')
const assetResolverFile = path.join(
	__dirname,
	'../firebase-functions/src/ssr/utils/asset-resolver.ts'
)

function getAssetFiles() {
	if (!fs.existsSync(assetsDir)) {
		console.error('Assets directory not found:', assetsDir)
		process.exit(1)
	}

	const files = fs.readdirSync(assetsDir)

	// Find files by pattern
	const cssFile = files.find(
		(file) => file.startsWith('index-') && file.endsWith('.css')
	)
	const jsFile = files.find(
		(file) => file.startsWith('index-') && file.endsWith('.js')
	)
	const vendorReact = files.find(
		(file) => file.startsWith('vendor-react-') && file.endsWith('.js')
	)
	const vendorRadix = files.find(
		(file) => file.startsWith('vendor-radix-') && file.endsWith('.js')
	)
	const vendorQuery = files.find(
		(file) => file.startsWith('vendor-query-') && file.endsWith('.js')
	)
	const vendorCharts = files.find(
		(file) => file.startsWith('vendor-charts-') && file.endsWith('.js')
	)
	const vendorIcons = files.find(
		(file) => file.startsWith('vendor-icons-') && file.endsWith('.js')
	)
	const vendorForms = files.find(
		(file) => file.startsWith('vendor-forms-') && file.endsWith('.js')
	)

	// Validate that all required files are found
	const missingFiles = []
	if (!cssFile) missingFiles.push('CSS file')
	if (!jsFile) missingFiles.push('JS file')
	if (!vendorReact) missingFiles.push('vendor-react file')
	if (!vendorRadix) missingFiles.push('vendor-radix file')
	if (!vendorQuery) missingFiles.push('vendor-query file')
	if (!vendorCharts) missingFiles.push('vendor-charts file')
	if (!vendorIcons) missingFiles.push('vendor-icons file')
	if (!vendorForms) missingFiles.push('vendor-forms file')

	if (missingFiles.length > 0) {
		console.error('Missing required asset files:', missingFiles.join(', '))
		process.exit(1)
	}

	return {
		cssFile,
		jsFile,
		vendorFiles: {
			react: vendorReact,
			radix: vendorRadix,
			query: vendorQuery,
			charts: vendorCharts,
			icons: vendorIcons,
			forms: vendorForms,
		},
	}
}

function updateAssetResolver(assets) {
	if (!fs.existsSync(assetResolverFile)) {
		console.error('Asset resolver file not found:', assetResolverFile)
		process.exit(1)
	}

	const currentContent = fs.readFileSync(assetResolverFile, 'utf8')

	// Create the new assets object content
	const newAssetsContent = `const CURRENT_ASSETS: ResolvedAssets = {
  cssFile: '${assets.cssFile}',
  jsFile: '${assets.jsFile}',
  vendorFiles: {
    react: '${assets.vendorFiles.react}',
    radix: '${assets.vendorFiles.radix}',
    query: '${assets.vendorFiles.query}',
    charts: '${assets.vendorFiles.charts}',
    icons: '${assets.vendorFiles.icons}',
    forms: '${assets.vendorFiles.forms}'
  }
};`

	// Find the start and end of the CURRENT_ASSETS object
	const startMarker = 'const CURRENT_ASSETS: ResolvedAssets = {'
	const startIndex = currentContent.indexOf(startMarker)

	if (startIndex === -1) {
		console.error('CURRENT_ASSETS object not found in file')
		process.exit(1)
	}

	// Find the matching closing brace
	let braceCount = 1
	let currentIndex = startIndex + startMarker.length
	let endIndex = -1

	while (currentIndex < currentContent.length && braceCount > 0) {
		const char = currentContent[currentIndex]
		if (char === '{') braceCount++
		if (char === '}') braceCount--
		if (braceCount === 0) {
			endIndex = currentIndex
			break
		}
		currentIndex++
	}

	if (endIndex === -1) {
		console.error(
			'Could not find matching closing brace for CURRENT_ASSETS object'
		)
		process.exit(1)
	}

	// Find the semicolon after the closing brace
	const semicolonIndex = currentContent.indexOf(';', endIndex)
	if (semicolonIndex === -1) {
		console.error('Could not find semicolon after CURRENT_ASSETS object')
		process.exit(1)
	}

	// Replace the content
	const before = currentContent.substring(0, startIndex)
	const after = currentContent.substring(semicolonIndex + 1)
	const updatedContent = before + newAssetsContent + after

	fs.writeFileSync(assetResolverFile, updatedContent, 'utf8')
	console.log('✅ SSR asset resolver updated successfully')
	console.log(`   CSS: ${assets.cssFile}`)
	console.log(`   JS: ${assets.jsFile}`)
	console.log(
		`   Vendor files updated: react, radix, query, charts, icons, forms`
	)
}

// Main execution
try {
	console.log('🔄 Updating SSR asset resolver with current build files...')
	const assets = getAssetFiles()
	updateAssetResolver(assets)
} catch (error) {
	console.error('❌ Failed to update SSR assets:', error.message)
	process.exit(1)
}
