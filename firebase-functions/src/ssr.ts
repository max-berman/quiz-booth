import * as functions from 'firebase-functions'
import * as path from 'path'
import * as fs from 'fs'

const runtimeOpts: functions.RuntimeOptions = {
  minInstances: 1,
  maxInstances: 10,
  memory: '512MB',
  timeoutSeconds: 30,
}

const marketingRoutes = ['/about', '/pricing', '/quiz-games', '/faq']

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
    
    // Check if this is a marketing route that needs SSR
    const isMarketingRoute = marketingRoutes.some(
      (route) => url === route || url.startsWith(route + '/')
    )

    if (!isMarketingRoute) {
      res.status(404).send('Not found')
      return
    }

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

      // Fallback: Return static HTML with meta tags for SEO
      // This works even without the SSR build
      const metaTags = generateMetaTags(url)
      const staticHtml = getStaticHtml(url, metaTags)
      
      res.set('Content-Type', 'text/html')
      res.status(200).send(staticHtml)
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
  <link rel="preload" href="/assets/index.css" as="style">
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
  <script type="module" src="/assets/index.js"></script>
</body>
</html>`
}