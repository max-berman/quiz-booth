/**
 * Express SSR Server for QuizBooth
 * Serves static assets and handles SSR for marketing pages
 */
import express, { Request, Response, NextFunction } from 'express'
import fs from 'node:fs'
import path from 'node:path'
import { renderMarketingPage } from './simple-ssr'

// Mock browser globals for SSR
if (typeof window === 'undefined') {
  // @ts-ignore
  global.window = {
    location: {
      href: 'http://localhost:3000',
      hostname: 'localhost',
      pathname: '/',
      search: '',
      hash: '',
    },
    document: {
      title: '',
    },
  }
  
  // @ts-ignore
  global.location = global.window.location
  // @ts-ignore
  global.document = global.window.document
}

// Environment
const PORT = parseInt(process.env.PORT || '3000', 10)
const isProduction = process.env.NODE_ENV === 'production'
const distPublicPath = path.join(process.cwd(), 'dist', 'public')

// Marketing pages that require SSR
const SSR_ROUTES = ['/', '/about', '/pricing', '/quiz-games', '/faq']

// Initialize Express app
const app = express()

// Disable express default x-powered-by
app.disable('x-powered-by')

/**
 * Load HTML template
 */
function loadTemplate(): string {
  const templatePath = isProduction
    ? path.join(distPublicPath, 'index.html')
    : path.join(process.cwd(), 'client', 'index.html')

  try {
    return fs.readFileSync(templatePath, 'utf-8')
  } catch (error) {
    console.error(`Failed to load template from ${templatePath}:`, error)
    return '<!DOCTYPE html><html><head><title>QuizBooth</title></head><body><div id="root"></div></body></html>'
  }
}

/**
 * Inject rendered app into HTML template
 */
function injectAppIntoTemplate(html: string, appHtml: string, head: string = ''): string {
  return html
    .replace('<!--app-head-->', head)
    .replace('<div id="root"></div>', `<div id="root">${appHtml}</div>`)
}

/**
 * Check if route requires SSR
 */
function requiresSSR(pathname: string): boolean {
  return SSR_ROUTES.some(route => pathname === route || pathname.startsWith(route + '/'))
}

// Serve static files in production
if (isProduction) {
  app.use(
    express.static(distPublicPath, {
      maxAge: '1y',
      etag: true,
      index: false, // We handle index.html ourselves
    })
  )
}

// Request logging middleware
app.use((req: Request, _res: Response, next: NextFunction) => {
  const start = Date.now()
  _res.on('finish', () => {
    const duration = Date.now() - start
    console.log(`${req.method} ${req.path} ${_res.statusCode} ${duration}ms`)
  })
  next()
})

// SSR handler for marketing pages - using actual React components
app.use(async (req: Request, res: Response, next: NextFunction) => {
  const { pathname } = new URL(req.url, `http://${req.headers.host}`)

  // Only SSR marketing routes
  if (!requiresSSR(pathname)) {
    return next()
  }

  try {
    console.log(`[SSR] Rendering: ${pathname}`)

    // Use the simple SSR renderer for marketing pages
    const { html: appHtml, head } = renderMarketingPage(pathname)
    
    if (!appHtml) {
      return next()
    }

    const template = loadTemplate()
    const html = injectAppIntoTemplate(template, appHtml, head)

    res.status(200)
    res.type('html')
    res.send(html)
    
  } catch (error) {
    console.error(`[SSR] Error rendering ${pathname}:`, error)
    next(error)
  }
})

// SPA fallback - serve index.html for client-side routes
app.use((_req: Request, res: Response) => {
  const indexPath = isProduction
    ? path.join(distPublicPath, 'index.html')
    : path.join(process.cwd(), 'client', 'index.html')

  res.status(200)
  res.type('html')
  res.send(fs.readFileSync(indexPath, 'utf-8'))
})

// Error handling middleware
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[Error]', err)
  res.status(500)
  res.type('html')
  res.send('<html><body><h1>500 Server Error</h1></body></html>')
})

/**
 * Start the server
 */
export function startServer(port: number = PORT): Promise<void> {
  return new Promise((resolve) => {
    app.listen(port, () => {
      console.log(`
╔════════════════════════════════════════════════════════════╗
║                    QuizBooth SSR Server                       ║
╠════════════════════════════════════════════════════════════╣
║  Server running at: http://localhost:${port}                    ║
║  Environment: ${isProduction ? 'production' : 'development'}                           ║
║  SSR Routes: ${SSR_ROUTES.join(', ')}      ║
╚════════════════════════════════════════════════════════════╝
      `)
      resolve()
    })
  })
}

// Start server if run directly
const isMainModule = import.meta.url === `file://${process.argv[1]}`
if (isMainModule || process.argv[1]?.includes('server')) {
  startServer(PORT)
}

export { app }