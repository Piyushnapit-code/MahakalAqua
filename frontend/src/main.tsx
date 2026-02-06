import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
// In production, suppress noisy console logs
if (import.meta && import.meta.env && import.meta.env.PROD) {
  const noop = () => {};
  console.log = noop;
  console.debug = noop;
  console.info = noop;
}

import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
