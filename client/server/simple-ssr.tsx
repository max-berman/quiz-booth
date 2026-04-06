/**
 * Simple SSR for marketing pages
 * Renders pages directly without Wouter dependencies
 */

import { renderToString } from 'react-dom/server'
import { HelmetProvider } from 'react-helmet-async'
import React from 'react'

// Simple page components for SSR
const AboutPage = () => (
  <div>
    <h1>About QuizBooth</h1>
    <p>AI-powered trivia platform</p>
  </div>
)

const FAQPage = () => (
  <div>
    <h1>Frequently Asked Questions</h1>
    <p>Common questions about QuizBooth</p>
  </div>
)

const PricingPage = () => (
  <div>
    <h1>Pricing</h1>
    <p>Plans and pricing information</p>
  </div>
)

const QuizGamesPage = () => (
  <div>
    <h1>Quiz Games</h1>
    <p>Browse available quiz games</p>
  </div>
)

/**
 * Render a marketing page to HTML string
 */
export function renderMarketingPage(url: string): { html: string; head: string } {
  let PageComponent: React.ComponentType | null = null
  
  // Determine which page to render based on URL
  switch (url) {
    case '/about':
      PageComponent = AboutPage
      break
    case '/faq':
      PageComponent = FAQPage
      break
    case '/pricing':
      PageComponent = PricingPage
      break
    case '/quiz-games':
      PageComponent = QuizGamesPage
      break
    default:
      return { html: '', head: '' }
  }
  
  if (!PageComponent) {
    return { html: '', head: '' }
  }
  
  // Render the page with Helmet for head tags
  const helmetContext: any = {}
  const html = renderToString(
    <HelmetProvider context={helmetContext}>
      <PageComponent />
    </HelmetProvider>
  )
  
  // Extract helmet data
  const { helmet } = helmetContext
  const headParts: string[] = []
  
  if (helmet) {
    if (helmet.title) headParts.push(helmet.title.toString())
    if (helmet.meta) headParts.push(helmet.meta.toString())
    if (helmet.link) headParts.push(helmet.link.toString())
    if (helmet.style) headParts.push(helmet.style.toString())
    if (helmet.script) headParts.push(helmet.script.toString())
  }
  
  const head = headParts.join('\n')
  
  return { html, head }
}