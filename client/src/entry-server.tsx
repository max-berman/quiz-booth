/**
 * Server entry point for SSR rendering
 * This file handles the server-side rendering of the React app
 */
import { renderToPipeableStream } from 'react-dom/server'
import { App } from './render-app'
import { PassThrough } from 'node:stream'
import fs from 'node:fs'
import path from 'node:path'

// Environment detection
const isProduction = process.env.NODE_ENV === 'production'
const PORT = parseInt(process.env.PORT || '3000', 10)

// Load the HTML template
const templatePath = isProduction
  ? path.join(process.cwd(), 'dist', 'public', 'index.html')
  : path.join(process.cwd(), 'client', 'index.html')

let template = ''

try {
  template = fs.readFileSync(templatePath, 'utf-8')
} catch (error) {
  console.error(`Failed to load template from ${templatePath}:`, error)
  process.exit(1)
}

/**
 * Inject the rendered app into the HTML template
 */
function injectAppIntoTemplate(appHtml: string, head: string = ''): string {
  return template
    .replace('<!--app-head-->', head)
    .replace('<div id="root"></div>', `<div id="root">${appHtml}</div>`)
    .replace('<!--ssr-mode-->', 'data-ssr="true"')
}

/**
 * Extract helmet data from the rendered app
 */
function extractHelmetData(helmetContext: any): string {
  const { helmet } = helmetContext
  const headParts: string[] = []
  
  if (helmet) {
    if (helmet.title) headParts.push(helmet.title.toString())
    if (helmet.meta) headParts.push(helmet.meta.toString())
    if (helmet.link) headParts.push(helmet.link.toString())
    if (helmet.style) headParts.push(helmet.style.toString())
    if (helmet.script) headParts.push(helmet.script.toString())
  }
  
  return headParts.join('\n')
}

/**
 * Render the app to HTML for SSR
 */
export function render(url: string, manifest: Record<string, string[]>): string {
  return new Promise((resolve, reject) => {
    const helmetContext: any = { helmet: null }
    
    const { pipe } = renderToPipeableStream(
      <App location={url} ssrMode={true} />,
      {
        onShellReady() {
          // Shell (above Suspense boundaries) is ready
          // Start streaming the response
        },
        onShellError(error) {
          // Something errored before we could start streaming
          console.error('Shell error:', error)
          reject(error)
        },
        onAllReady() {
          // Everyone is ready
          // For complete SSR without streaming, use onAllReady
          const chunks: Buffer[] = []
          const passThrough = new PassThrough()
          
          passThrough.on('data', (chunk) => {
            chunks.push(Buffer.from(chunk))
          })
          
          passThrough.on('end', () => {
            const html = Buffer.concat(chunks).toString('utf-8')
            const head = extractHelmetData(helmetContext)
            const fullHtml = injectAppIntoTemplate(html, head)
            resolve(fullHtml)
          })
          
          passThrough.on('error', reject)
          
          pipe(passThrough)
        },
        onError(error) {
          console.error('Render error:', error)
        },
      }
    )
  })
}

/**
 * Development mode renderer using Vite's SSR transform
 */
export async function renderDev(url: string): Promise<string> {
  // In development, Vite handles SSR transforms
  const { createServer } = await import('vite')
  const vite = await createServer({
    server: { middlewareMode: true },
    appType: 'custom',
  })
  
  try {
    const { default: render } = await vite.ssrLoadModule('./src/entry-server.tsx')
    return await render(url, {})
  } finally {
    await vite.close()
  }
}
