import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
// AC-P0-C5: CSS split — tokens → layout → components → index (v2 design system)
import './styles/tokens.css'
import './styles/layout.css'
import './styles/components.css'
import { applyTheme } from './lib/applyTheme.js'
import { useStore } from './data/store/index.js'

// Apply persisted theme on mount (AC-P1D-D13)
const persistedTheme = useStore.getState().theme ?? 'light'
applyTheme(persistedTheme)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
