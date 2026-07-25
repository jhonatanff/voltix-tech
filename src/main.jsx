import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Analytics } from '@vercel/analytics/react'
// Auth deshabilitada temporalmente (requerimiento de login en checkout en pausa)
// import { AuthProvider } from './auth/AuthContext.jsx'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      {/* <AuthProvider> */}
        <App />
        <Analytics />
      {/* </AuthProvider> */}
    </BrowserRouter>
  </StrictMode>,
)
