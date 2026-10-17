const CACHE_NAME = 'oss-bjj-offline-v5';
const OFFLINE_URL = '/';

const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
];

// Install and pre-cache essential resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Pre-caching static resources');
      return cache.addAll(ASSETS_TO_CACHE);
    }).catch(err => {
      console.error('[Service Worker] Error during pre-cache:', err);
    })
  );
  self.skipWaiting();
});

// Clean up old caches on activation
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Intercept requests and fetch from cache or network
self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // We are only interested in caching GET requests
  if (req.method !== 'GET') {
    return;
  }

  // Bypass Firebase / Firestore / API endpoints from service worker caching
  if (
    url.pathname.startsWith('/api/') || 
    url.hostname.includes('firebase') || 
    url.hostname.includes('firestore') || 
    url.hostname.includes('googleapis') ||
    url.hostname.includes('securetoken')
  ) {
    return;
  }

  event.respondWith(
    caches.match(req).then((cachedResponse) => {
      if (cachedResponse) {
        // Implement Stale-While-Revalidate for app's local static assets
        if (url.origin === self.location.origin) {
          fetch(req).then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200 || networkResponse.ok) {
              const resToCache = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(req, resToCache));
            }
          }).catch((err) => {
            console.log('[Service Worker] Stale update failed (running offline):', err.message);
          });
        }
        return cachedResponse;
      }

      // If not in cache, fetch from network and dynamically cache
      return fetch(req).then((networkResponse) => {
        // Cache matches for local origins and external static assets (like images or audios)
        const isStaticAsset = 
          url.origin === self.location.origin || 
          url.hostname.includes('images.unsplash.com') || 
          url.hostname.includes('soundhelix.com') ||
          url.pathname.endsWith('.mp3') ||
          url.pathname.endsWith('.png') ||
          url.pathname.endsWith('.jpg') ||
          url.pathname.endsWith('.jpeg') ||
          url.pathname.endsWith('.woff2');

        if (networkResponse && networkResponse.ok && isStaticAsset) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(req, responseToCache);
          });
        }
        return networkResponse;
      }).catch((error) => {
        // Fallback to local index.html if navigation request fails
        if (req.mode === 'navigate') {
          return caches.match(OFFLINE_URL);
        }
        throw error;
      });
    })
  );
});

// Listen for push notifications
self.addEventListener('push', (event) => {
  let data = {
    title: 'OSS.OS Inteligência',
    body: 'Um novo artigo técnico ou atualização acaba de chegar no tatame eletrônico!',
    icon: 'https://images.unsplash.com/photo-1510279931157-4b703e301233?q=80&w=128&auto=format&fit=crop',
    tag: 'oss-bjj-alert',
    url: '/'
  };

  if (event.data) {
    try {
      const parsed = event.data.json();
      data = { ...data, ...parsed };
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: data.icon,
    badge: data.icon,
    vibrate: [100, 50, 100],
    data: {
      url: data.url
    },
    actions: [
      { action: 'open_url', title: 'Ver Agora 🥋' },
      { action: 'close', title: 'Fechar' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Listen for notification click
self.addEventListener('notificationclick', (event) => {
  const notification = event.notification;
  const action = event.action;

  notification.close();

  if (action === 'close') {
    return;
  }

  const urlToOpen = notification.data && notification.data.url ? notification.data.url : '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(urlToOpen);
      }
    })
  );
});
