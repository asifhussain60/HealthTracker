import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
// AC-P0-C5: CSS split — tokens → layout → components → index (v2 design system)
import './styles/tokens.css'
import './styles/layout.css'
import './styles/components.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
