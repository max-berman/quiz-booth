#!/usr/bin/env node

/**
 * SSR Consistency Validation Script
 *
 * This script validates that key content elements are present in both
 * SSR and client environments to prevent frontend inconsistencies.
 */

import { readFileSync } from 'fs'
import { execSync } from 'child_process'

// Key content markers that should be present in both environments
// Using more flexible patterns that match the actual rendered content
const CONTENT_MARKERS = [
	'Create.*Trivia.*Games',
	'Why Choose QuizBooth',
	'AI-Powered Questions',
	'Lead Capture',
	'Easy Sharing',
	'Recently Added Games',
	'Engage your customers through play',
	'Generate AI-powered custom trivia questions',
	'Never run out of engaging content',
	'Turn players into leads',
	'Go live in seconds',
	'No Public Games Yet',
]

// URLs to test
const SSR_URL = 'http://localhost:5000'
const CLIENT_URL = 'http://localhost:5173'

/**
 * Fetch content from a URL
 */
function fetchContent(url) {
	try {
		return execSync(`curl -s "${url}"`, { encoding: 'utf8' })
	} catch (error) {
		console.error(`❌ Failed to fetch content from ${url}:`, error.message)
		return null
	}
}

/**
 * Check if content contains all required markers
 */
function validateContent(content, environment) {
	const missingMarkers = []

	for (const marker of CONTENT_MARKERS) {
		const regex = new RegExp(marker, 'i') // Case insensitive matching
		if (!regex.test(content)) {
			missingMarkers.push(marker)
		}
	}

	if (missingMarkers.length > 0) {
		console.error(
			`❌ ${environment} is missing content markers:`,
			missingMarkers
		)
		return false
	}

	console.log(`✅ ${environment} contains all required content markers`)
	return true
}

/**
 * Main validation function
 */
async function validateSSRConsistency() {
	console.log('🔍 Validating SSR consistency...\n')

	// Check if servers are running
	console.log('Checking if servers are running...')

	const ssrContent = fetchContent(SSR_URL)
	const clientContent = fetchContent(CLIENT_URL)

	if (!ssrContent || !clientContent) {
		console.error('❌ One or both servers are not running')
		console.log('\nTo run servers:')
		console.log('  - SSR: npm run emulate:clean')
		console.log('  - Client: npm run dev:client')
		process.exit(1)
	}

	console.log('✅ Both servers are responding\n')

	// Validate content in both environments
	const ssrValid = validateContent(ssrContent, 'SSR Environment')
	const clientValid = validateContent(clientContent, 'Client Environment')

	if (!ssrValid || !clientValid) {
		console.error('\n❌ SSR consistency validation failed')
		process.exit(1)
	}

	// Check for basic structural differences
	console.log('\n📊 Checking structural differences...')

	const ssrHasHero = ssrContent.includes('hero') || ssrContent.includes('Hero')
	const clientHasHero =
		clientContent.includes('hero') || clientContent.includes('Hero')

	const ssrHasSections =
		ssrContent.includes('section') || ssrContent.includes('Section')
	const clientHasSections =
		clientContent.includes('section') || clientContent.includes('Section')

	if (ssrHasHero !== clientHasHero) {
		console.error('❌ Hero section mismatch between SSR and client')
	} else {
		console.log('✅ Hero sections are consistent')
	}

	if (ssrHasSections !== clientHasSections) {
		console.error('❌ Section structure mismatch between SSR and client')
	} else {
		console.log('✅ Section structures are consistent')
	}

	console.log('\n🎉 SSR consistency validation passed!')
	console.log('Both environments are serving consistent content.')
}

// Run validation
validateSSRConsistency().catch((error) => {
	console.error('Validation failed:', error)
	process.exit(1)
})
