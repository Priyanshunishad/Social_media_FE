import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from "react-router";
import { CookiesProvider } from 'react-cookie';
import { AuthProvider } from './contexts/AuthContext.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
    <AuthProvider>
      <CookiesProvider>
    <App />
    </CookiesProvider>
    </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
