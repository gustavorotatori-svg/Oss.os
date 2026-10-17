import { safeLocalStorage, safeSessionStorage } from './lib/storage';

// Bulletproof security iframe shims
(() => {
  // 1. Try overriding on Window.prototype (affects all window instances and plain 'localStorage' calls)
  try {
    Object.defineProperty(Window.prototype, 'localStorage', {
      get() { return safeLocalStorage; },
      configurable: true,
      enumerable: true
    });
  } catch (e) {
    console.warn('[Sandbox] Could not define localStorage on Window.prototype:', e);
  }

  try {
    Object.defineProperty(Window.prototype, 'sessionStorage', {
      get() { return safeSessionStorage; },
      configurable: true,
      enumerable: true
    });
  } catch (e) {
    console.warn('[Sandbox] Could not define sessionStorage on Window.prototype:', e);
  }

  // 2. Try overriding directly on window object as a fallback
  try {
    Object.defineProperty(window, 'localStorage', {
      value: safeLocalStorage,
      configurable: true,
      writable: true
    });
  } catch (e) {
    console.warn('[Sandbox] Could not define localStorage directly on window:', e);
  }

  try {
    Object.defineProperty(window, 'sessionStorage', {
      value: safeSessionStorage,
      configurable: true,
      writable: true
    });
  } catch (e) {
    console.warn('[Sandbox] Could not define sessionStorage directly on window:', e);
  }
})();

import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import {HelmetProvider} from 'react-helmet-async';
import { HashRouter } from 'react-router-dom';
import App from './App.tsx';
import './index.css';
import './i18n';
import { NotificationProvider } from './context/NotificationContext';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
      <HashRouter>
        <NotificationProvider>
          <App />
        </NotificationProvider>
      </HashRouter>
    </HelmetProvider>
  </StrictMode>,
);

// Register the Service Worker for Offline access & Firebase Cloud Messaging push notifications
try {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/firebase-messaging-sw.js', { scope: '/' })
        .then((reg) => {
          console.log('[Service Worker] Registro bem-sucedido com escopo: ', reg.scope);
        })
        .catch((err) => {
          console.warn('[Service Worker] Falha no registro: ', err);
        });
    });

    if (!import.meta.env.PROD && 'caches' in window) {
      // In development mode, clear only stale bundle caches while preserving product images and active service workers
      caches.keys().then((names) => {
        for (const name of names) {
          if (name.startsWith('oss-bjj-offline-') || name.startsWith('old-cache-')) {
            caches.delete(name).then(() => {
              console.log('[Cache Storage] Cache obsoleto limpo:', name);
            });
          }
        }
      }).catch(err => {
        console.warn('[Cache Storage] Failed to clear caches:', err);
      });
    }
  }
} catch (e) {
  console.warn('[Sandbox] Service Worker or Cache Storage blocked in sandbox environment:', e);
}

