import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from './context/themeContext.tsx'
import { AuthProvider } from './context/AuthContext.tsx'
import { LanguageProvider } from './context/LanguageContext'
import './i18n'
import { NotificationProvider } from './context/NotificationContext'
import emailjs from '@emailjs/browser';

emailjs.init("eQjd1EjlnE0-7vaNr");

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <LanguageProvider>
            <ThemeProvider>
              <App />
            </ThemeProvider>
          </LanguageProvider>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
