'use client'

import App from './App'
import { HelmetProvider } from 'react-helmet-async'

export default function ClientApp() {
  return (
    <HelmetProvider>
      <App />
    </HelmetProvider>
  )
}
