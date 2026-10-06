import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App'
import './index.css'

const container = document.getElementById('root')

if (!container) {
  throw new Error('Root container #root was not found in index.html')
}

createRoot(container).render(
  <StrictMode>
    {/*
      Hash routing keeps every deep link working on GitHub Pages, where the
      server cannot rewrite unknown paths back to index.html.
    */}
    <HashRouter>
      <App />
    </HashRouter>
  </StrictMode>,
)
