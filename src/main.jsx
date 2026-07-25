import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
// Auth deshabilitada temporalmente (requerimiento de login en checkout en pausa)
// import { AuthProvider } from './auth/AuthContext.jsx'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      {/* <AuthProvider> */}
        <App />
      {/* </AuthProvider> */}
    </BrowserRouter>
  </StrictMode>,
)
