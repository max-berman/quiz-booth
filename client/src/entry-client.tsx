/**
 * Client entry point for SSR hydration
 * This file handles the client-side hydration of the server-rendered app
 */
import { hydrateRoot } from 'react-dom/client'
import { App } from './render-app'
import './index.css'

// Get the server-rendered HTML element
const container = document.getElementById('root')

if (!container) {
  throw new Error('Root element not found')
}

// For SSR hydration, we use hydrateRoot instead of createRoot
// This attaches to the existing server-rendered HTML and "hydrates" it
// The initial HTML was rendered by entry-server.tsx
hydrateRoot(container, <App />)