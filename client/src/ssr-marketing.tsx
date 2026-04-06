/**
 * SSR rendering for marketing pages only
 * This avoids Wouter dependencies for simple static pages
 */

import { renderToString } from 'react-dom/server'
import { HelmetProvider } from 'react-helmet-async'
import { About } from './pages/about'
import { FAQ } from './pages/faq'
import { Pricing } from './pages/pricing'
import { QuizGames } from './pages/quiz-games'

/**
 * Render a marketing page to HTML string
 */
export function renderMarketingPage(url: string): string {
  let PageComponent: React.ComponentType | null = null
  
  // Determine which page to render based on URL
  switch (url) {
    case '/about':
      PageComponent = About
      break
    case '/faq':
      PageComponent = FAQ
      break
    case '/pricing':
      PageComponent = Pricing
      break
    case '/quiz-games':
      PageComponent = QuizGames
      break
    default:
      return ''
  }
  
  if (!PageComponent) {
    return ''
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