import * as functions from 'firebase-functions'
import * as path from 'path'
import * as fs from 'fs'
import React from 'react'
import { renderToString } from 'react-dom/server'

const runtimeOpts: functions.RuntimeOptions = {
  minInstances: 1,
  maxInstances: 10,
  memory: '512MB',
  timeoutSeconds: 30,
}

const marketingRoutes = ['/', '/about', '/pricing', '/quiz-games', '/faq']

/**
 * SSR Cloud Function for marketing pages
 * 
 * For production, this function needs to:
 * 1. Build the SSR bundle: `npm run build:ssr`
 * 2. The server bundle will be at dist/server/server.js
 * 3. The client bundle will be at dist/public/assets/
 * 
 * For local testing, use: `npm run dev:ssr`
 */
export const ssrServer = functions
  .region('us-central1')
  .runWith(runtimeOpts)
  .https.onRequest(async (req, res) => {
    const url = req.path || req.url?.split('?')[0] || '/'
    
    console.log(`SSR Server called for URL: ${url}, path: ${req.path}, originalUrl: ${req.originalUrl}`)
    
    // Check if this is a marketing route that needs SSR
    const isMarketingRoute = marketingRoutes.some(
      (route) => url === route || url.startsWith(route + '/')
    )

    if (!isMarketingRoute) {
      console.log(`Not a marketing route: ${url}`)
      res.status(404).send('Not found')
      return
    }

    console.log(`Rendering marketing route: ${url}`)
    
    try {
      // Try to render SSR - in production this loads the built bundle
      const serverBundlePath = path.join(process.cwd(), '..', 'dist', 'server', 'server.js')
      
      if (fs.existsSync(serverBundlePath)) {
        // In production, dynamically import and use the SSR server
        // This keeps the function cold-start friendly
        const { render } = await import(serverBundlePath)
        
        if (typeof render === 'function') {
          const html = await render(url)
          res.set('Content-Type', 'text/html')
          res.status(200).send(html)
          return
        }
      }

      // Simple SSR renderer as fallback
      const metaTags = generateMetaTags(url)
      const { html: appHtml, head } = renderMarketingPage(url)
      
      if (appHtml) {
        // Load the template and inject the rendered app
        const templatePath = path.join(process.cwd(), '..', 'dist', 'public', 'app.html')
        let template = ''
        
        if (fs.existsSync(templatePath)) {
          template = fs.readFileSync(templatePath, 'utf-8')
        } else {
          // Fallback template if app.html doesn't exist
          template = getFallbackTemplate(metaTags)
        }
        
        const fullHtml = injectAppIntoTemplate(template, appHtml, head, metaTags)
        res.set('Content-Type', 'text/html')
        res.status(200).send(fullHtml)
      } else {
        // If no page component found, use the old static HTML fallback
        const staticHtml = getStaticHtml(url, metaTags)
        res.set('Content-Type', 'text/html')
        res.status(200).send(staticHtml)
      }
    } catch (error) {
      console.error('SSR Error:', error)
      res.status(500).send('Server Error')
    }
  })

function generateMetaTags(url: string): { title: string; description: string } {
  const metaMap: Record<string, { title: string; description: string }> = {
    '/about': {
      title: 'About QuizBooth - AI-Powered Trivia Platform',
      description: 'Learn about QuizBooth, the free AI-powered trivia platform. Create custom quizzes, compete on leaderboards, and have fun with friends.',
    },
    '/pricing': {
      title: 'Pricing - QuizBooth',
      description: 'QuizBooth is free! Create unlimited AI-powered trivia games at no cost. No subscription required.',
    },
    '/quiz-games': {
      title: 'Quiz Games - QuizBooth',
      description: 'Discover AI-generated trivia games on QuizBooth. Play thousands of quizzes across categories like science, history, pop culture, and more.',
    },
    '/faq': {
      title: 'FAQ - QuizBooth',
      description: 'Frequently asked questions about QuizBooth. Learn how to create quizzes, play games, and use our AI question generator.',
    },
  }

  return metaMap[url] || {
    title: 'QuizBooth - AI-Powered Trivia Platform',
    description: 'Create and play AI-powered trivia games for free. Perfect for classrooms, parties, and team building.',
  }
}

// Simple React components for SSR
const HomePageSSR = () => (
  React.createElement('div', null, [
    React.createElement('h1', { key: 'title' }, 'QuizBooth - Create Engaging Trivia Games for Your Business'),
    React.createElement('p', { key: 'desc' }, 'Create AI-powered custom trivia games for trade shows and events. Engage customers, capture leads, and drive business growth through interactive gameplay.'),
    React.createElement('div', { key: 'features' }, [
      React.createElement('h2', { key: 'features-title' }, 'Why Choose QuizBooth?'),
      React.createElement('ul', { key: 'features-list' }, [
        React.createElement('li', { key: 'f1' }, 'AI-Powered Questions - Never run out of engaging content'),
        React.createElement('li', { key: 'f2' }, 'Lead Capture - Turn players into leads'),
        React.createElement('li', { key: 'f3' }, 'Easy Sharing - Go live in seconds with QR codes'),
      ])
    ])
  ])
)

const AboutPageSSR = () => (
  React.createElement('div', null, [
    React.createElement('h1', { key: 'title' }, 'About QuizBooth'),
    React.createElement('p', { key: 'desc' }, 'QuizBooth is a comprehensive platform designed specifically for trade shows and events, combining AI-powered content generation with robust engagement tools to help businesses connect with their audience through interactive trivia experiences.'),
    React.createElement('div', { key: 'features' }, [
      React.createElement('h2', { key: 'features-title' }, 'Comprehensive Feature Set'),
      React.createElement('ul', { key: 'features-list' }, [
        React.createElement('li', { key: 'f1' }, 'AI-Powered Question Generation with DeepSeek AI Integration'),
        React.createElement('li', { key: 'f2' }, 'Game Creation & Management with multi-step wizard'),
        React.createElement('li', { key: 'f3' }, 'Player Experience & Engagement with mobile swipe gestures'),
        React.createElement('li', { key: 'f4' }, 'Security & Anti-Cheating with first completion lock'),
        React.createElement('li', { key: 'f5' }, 'Sharing & Distribution with dynamic QR code generation'),
      ])
    ])
  ])
)

const PricingPageSSR = () => (
  React.createElement('div', null, [
    React.createElement('h1', { key: 'title' }, 'Simple, Transparent Pricing'),
    React.createElement('p', { key: 'desc' }, 'Choose the plan that works best for your trade show and event needs. All plans include our full feature set during the beta period.'),
    React.createElement('div', { key: 'plans' }, [
      React.createElement('h2', { key: 'plans-title' }, 'Pricing Plans'),
      React.createElement('ul', { key: 'plans-list' }, [
        React.createElement('li', { key: 'p1' }, 'Starter Plan (Free) - Perfect for small events'),
        React.createElement('li', { key: 'p2' }, 'Professional Plan - Ideal for regular trade shows'),
        React.createElement('li', { key: 'p3' }, 'Pay As You Go - Flexible pricing for occasional events'),
      ])
    ])
  ])
)

const FAQPageSSR = () => (
  React.createElement('div', null, [
    React.createElement('h1', { key: 'title' }, 'Frequently Asked Questions'),
    React.createElement('p', { key: 'desc' }, 'Everything you need to know about using QuizBooth for trade shows and events. Learn how to engage attendees, capture leads, and maximize your event ROI.'),
    React.createElement('div', { key: 'benefits' }, [
      React.createElement('h2', { key: 'benefits-title' }, 'Key Benefits for Trade Show Vendors'),
      React.createElement('ul', { key: 'benefits-list' }, [
        React.createElement('li', { key: 'b1' }, 'Increased Booth Traffic - Attract more visitors with engaging trivia'),
        React.createElement('li', { key: 'b2' }, 'Qualified Lead Generation - Capture contact information from genuinely interested prospects'),
        React.createElement('li', { key: 'b3' }, 'Brand Differentiation - Stand out from competitors with innovative engagement'),
        React.createElement('li', { key: 'b4' }, 'Extended Dwell Time - Keep attendees at your booth longer'),
        React.createElement('li', { key: 'b5' }, 'Easy Distribution - Quick setup with QR codes and shareable links'),
        React.createElement('li', { key: 'b6' }, 'Event Analytics - Measure engagement and demonstrate ROI'),
      ])
    ])
  ])
)

const QuizGamesPageSSR = () => (
  React.createElement('div', null, [
    React.createElement('h1', { key: 'title' }, 'Quiz Games'),
    React.createElement('p', { key: 'desc' }, 'Discover AI-generated trivia games on QuizBooth. Play thousands of quizzes across categories like science, history, pop culture, and more.'),
    React.createElement('p', { key: 'note' }, 'Games are loaded dynamically on the client side for the best experience.'),
  ])
)

/**
 * Render a marketing page to HTML string
 */
function renderMarketingPage(url: string): { html: string; head: string } {
  let PageComponent: React.ComponentType | null = null

  // Determine which page to render based on URL
  switch (url) {
    case '/':
      PageComponent = HomePageSSR
      break
    case '/about':
      PageComponent = AboutPageSSR
      break
    case '/faq':
      PageComponent = FAQPageSSR
      break
    case '/pricing':
      PageComponent = PricingPageSSR
      break
    case '/quiz-games':
      PageComponent = QuizGamesPageSSR
      break
    default:
      return { html: '', head: '' }
  }

  if (!PageComponent) {
    return { html: '', head: '' }
  }

  // Render the page
  const html = renderToString(React.createElement(PageComponent))

  // Return empty head for now - meta tags are in the template
  const head = ''

  return { html, head }
}

/**
 * Get fallback template when index.html doesn't exist
 */
function getFallbackTemplate(meta: { title: string; description: string }): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${meta.title}</title>
  <meta name="description" content="${meta.description}">
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="https://quizbooth.games">
  
  <!-- Open Graph -->
  <meta property="og:title" content="${meta.title}">
  <meta property="og:description" content="${meta.description}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://quizbooth.games">
  <meta property="og:image" content="https://quizbooth.games/assets/quizbooth.png">
  
  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${meta.title}">
  <meta name="twitter:description" content="${meta.description}">
  
  <!-- Favicon -->
  <link rel="icon" type="image/svg+xml" href="/assets/favicon.svg">
  
  <!-- Preload critical assets -->
  <link rel="preload" href="/assets/index-32nE0hzA.css" as="style">
  <link rel="preload" href="/assets/logo.png" as="image">
  
  <!-- Critical CSS -->
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #333;
    }
    .loading-container {
      text-align: center;
      padding: 2rem;
    }
    .loading-title {
      font-size: 2rem;
      font-weight: 700;
      color: white;
      margin-bottom: 1rem;
    }
    .loading-spinner {
      width: 40px;
      height: 40px;
      border: 4px solid rgba(255,255,255,0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 1rem;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    .loading-text {
      color: rgba(255,255,255,0.9);
      font-size: 1.1rem;
    }
  </style>
</head>
<body>
  <div id="root"></div>
  
  <!-- App will hydrate this -->
  <script type="module" src="/assets/index-BxZJFuoM.js"></script>
</body>
</html>`
}

/**
 * Inject rendered app into HTML template
 */
function injectAppIntoTemplate(template: string, appHtml: string, head: string, meta: { title: string; description: string }): string {
  // Update title and description in the template
  let html = template
    .replace(/<title>.*?<\/title>/, `<title>${meta.title}</title>`)
    .replace(/<meta name="description" content=".*?"\/>/, `<meta name="description" content="${meta.description}" />`)
    .replace(/<meta property="og:title" content=".*?"\/>/, `<meta property="og:title" content="${meta.title}" />`)
    .replace(/<meta property="og:description" content=".*?"\/>/, `<meta property="og:description" content="${meta.description}" />`)
    .replace(/<meta name="twitter:title" content=".*?"\/>/, `<meta name="twitter:title" content="${meta.title}" />`)
    .replace(/<meta name="twitter:description" content=".*?"\/>/, `<meta name="twitter:description" content="${meta.description}" />`)
  
  // Inject the rendered app
  html = html.replace('<div id="root"></div>', `<div id="root">${appHtml}</div>`)
  
  // Inject head content if any
  if (head) {
    html = html.replace('</head>', `${head}</head>`)
  }
  
  return html
}

function getStaticHtml(url: string, meta: { title: string; description: string }): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${meta.title}</title>
  <meta name="description" content="${meta.description}">
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="https://quizbooth.games${url}">
  
  <!-- Open Graph -->
  <meta property="og:title" content="${meta.title}">
  <meta property="og:description" content="${meta.description}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://quizbooth.games${url}">
  <meta property="og:image" content="https://quizbooth.games/assets/quizbooth.png">
  
  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${meta.title}">
  <meta name="twitter:description" content="${meta.description}">
  
  <!-- Favicon -->
  <link rel="icon" type="image/svg+xml" href="/assets/favicon.svg">
  
  <!-- Preload critical assets -->
  <link rel="preload" href="/assets/index-32nE0hzA.css" as="style">
  <link rel="preload" href="/assets/logo.png" as="image">
  
  <!-- Critical CSS -->
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #333;
    }
    .loading-container {
      text-align: center;
      padding: 2rem;
    }
    .loading-title {
      font-size: 2rem;
      font-weight: 700;
      color: white;
      margin-bottom: 1rem;
    }
    .loading-spinner {
      width: 40px;
      height: 40px;
      border: 4px solid rgba(255,255,255,0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 1rem;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    .loading-text {
      color: rgba(255,255,255,0.9);
      font-size: 1.1rem;
    }
  </style>
</head>
<body>
  <div id="root">
    <div class="loading-container">
      <h1 class="loading-title">QuizBooth</h1>
      <div class="loading-spinner"></div>
      <p class="loading-text">Loading...</p>
    </div>
  </div>
  
  <!-- App will hydrate this -->
  <script type="module" src="/assets/index-BxZJFuoM.js"></script>
</body>
</html>`
}
