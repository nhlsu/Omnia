import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import './styles/theme.css'
import App from './App.jsx'
import * as omnia from './AppContext.jsx'
// TEMPORARY: lets us log in from the browser console until the login page (W2) exists.
if (import.meta.env.DEV) window.omnia = omnia
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)