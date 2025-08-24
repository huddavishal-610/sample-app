
import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'

const theme = localStorage.getItem('pf_theme') || 'system'
if (theme === 'light' || theme === 'dark') document.documentElement.setAttribute('data-theme', theme)

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)

// Register service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
  })
}
