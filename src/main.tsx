import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'

// @ts-ignore: virtual:pwa-register es un módulo generado por Vite
import { registerSW } from 'virtual:pwa-register'

// Registra el Service Worker de forma limpia
if ('serviceWorker' in navigator) {
  registerSW({ 
    immediate: true,
    onRegistered() {
      console.log('AXIS ops PWA: Lista');
    },
    onRegisterError(error: unknown) {
      console.error('AXIS ops PWA: Error', error);
    }
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)