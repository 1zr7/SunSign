import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './styles/tokens.css'
import './styles/globals.css'
import './styles/animations.css'
import './i18n/i18n' 

/**
 * main.tsx
 * ========
 * This is the very first file that runs when you open the website.
 * It grabs the "root" div in the HTML and tells React to build the 
 * App inside it.
 */

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
