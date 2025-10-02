import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'
import { analytics } from './lib/analytics'

// Initialize analytics in production only
if (
	window.location.hostname !== 'localhost' &&
	window.location.hostname !== '127.0.0.1'
) {
	analytics.initialize()
}

createRoot(document.getElementById('root')!).render(<App />)
