#!/usr/bin/env node

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Base URL for the site
const BASE_URL = 'https://quizbooth.games'

// List of static routes
const staticRoutes = [
	'/',
	'/setup',
	'/quiz-games',
	'/dashboard',
	'/auth/sign-in',
	'/about',
	'/faq',
	'/pricing',
]

// Dynamic routes that might need to be generated from data
// For now, we'll include the main static routes
const routes = [...staticRoutes]

// Generate sitemap XML
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes
	.map((route) => {
		const url = `${BASE_URL}${route}`
		const priority =
			route === '/' ? '1.0' : route === '/quiz-games' ? '0.9' : '0.8'
		const changefreq = route === '/quiz-games' ? 'daily' : 'weekly'

		return `  <url>
    <loc>${url}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`
	})
	.join('\n')}
</urlset>`

// Ensure the public directory exists
const publicDir = path.join(__dirname, '../client/public')
if (!fs.existsSync(publicDir)) {
	fs.mkdirSync(publicDir, { recursive: true })
}

// Write sitemap to file
const sitemapPath = path.join(publicDir, 'sitemap.xml')
fs.writeFileSync(sitemapPath, sitemap)

console.log('✅ Sitemap generated successfully at:', sitemapPath)
console.log(`📄 Generated ${routes.length} URLs`)
