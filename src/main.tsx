import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { App } from './app/App'
import { StartupErrorBoundary } from './app/StartupErrorBoundary'
import './styles.css'

const root = document.getElementById('root')

if (root === null) {
  throw new Error('Application root element was not found')
}

createRoot(root).render(
  <StrictMode>
    <StartupErrorBoundary>
      <App />
    </StartupErrorBoundary>
  </StrictMode>,
)

