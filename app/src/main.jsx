import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { routerConfig } from './app/router.jsx'
// AC-P0-C5: CSS split — tokens → layout → components → md3 → index (v2 design system)
import './styles/tokens.css'
import './styles/layout.css'
import './styles/components.css'
import './styles/md3.css'
import { applyTheme } from './lib/applyTheme.js'
import { useStore } from './data/store/index.js'

// Apply persisted theme on mount (AC-P1D-D13)
const persistedTheme = useStore.getState().theme ?? 'light'
applyTheme(persistedTheme)

// AC-S1: Mount the new react-router-dom shell (P1.C) instead of legacy <App />.
// Legacy App.jsx + routes.jsx remain in the tree as deprecated until P1.G close-out.
const router = createBrowserRouter(routerConfig)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
