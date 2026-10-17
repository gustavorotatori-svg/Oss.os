// OSS.OS - Unified Service Worker (Firebase Cloud Messaging + Jiu-Jitsu Product Images Offline Cache)
// Gerencia notificações push em segundo plano, cliques, deep links e estratégia de cache para catálogo de BJJ offline.

importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

// 1. Configurações de Cache
const SHELL_CACHE_NAME = 'oss-bjj-shell-v6';
const IMAGE_CACHE_NAME = 'oss-bjj-images-v1';
const MAX_CACHED_IMAGES = 350;

const SHELL_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/apple-touch-icon.png'
];

// Fallback SVG quando o usuário estiver offline e a imagem específica não tiver sido visualizada/cacheada previamente
const OFFLINE_IMAGE_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
  <rect width="400" height="400" fill="#09090b"/>
  <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#27272a" stroke-width="0.5"/>
  </pattern>
  <rect width="400" height="400" fill="url(#grid)"/>
  <circle cx="200" cy="180" r="48" fill="#18181b" stroke="#3f3f46" stroke-width="2"/>
  <path d="M185 170 L215 170 L205 195 L195 195 Z" fill="#ef4444"/>
  <text x="200" y="186" text-anchor="middle" font-family="monospace" font-size="20" font-weight="900" fill="#ffffff">OSS</text>
  <text x="200" y="255" text-anchor="middle" font-family="monospace" font-size="12" font-weight="900" fill="#e4e4e7" letter-spacing="2">MODO TATAME OFFLINE</text>
  <text x="200" y="275" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#a1a1aa">Equipamento BJJ (Conecte para alta resolução)</text>
</svg>
`.trim();

// 2. Inicialização do Firebase Cloud Messaging
const firebaseConfig = {
  apiKey: "AIzaSyB7WR68mAOWvF0qXC2hwwQ1FZUgRj8k79E",
  authDomain: "gen-lang-client-0267663159.firebaseapp.com",
  projectId: "gen-lang-client-0267663159",
  storageBucket: "gen-lang-client-0267663159.firebasestorage.app",
  messagingSenderId: "852515019719",
  appId: "1:852515019719:web:9f85b4fbfa0a678e1b57e2"
};

try {
  firebase.initializeApp(firebaseConfig);
} catch (initErr) {
  console.warn('[FCM-SW] Firebase já inicializado ou aviso:', initErr);
}

let messaging = null;
try {
  messaging = firebase.messaging();
} catch (e) {
  console.warn('[FCM-SW] Não foi possível instanciar firebase.messaging:', e);
}

// 3. Lifecycle: Instalação e Pré-cache de Recursos Essenciais
self.addEventListener('install', (event) => {
  console.log('[SW] Service Worker instalando com suporte a Offline Image Caching e FCM.');
  event.waitUntil(
    caches.open(SHELL_CACHE_NAME).then((cache) => {
      return cache.addAll(SHELL_ASSETS).catch((err) => {
        console.warn('[SW] Aviso durante pre-cache shell:', err);
      });
    })
  );
  self.skipWaiting();
});

// 4. Lifecycle: Ativação e Limpeza de Caches Antigos
self.addEventListener('activate', (event) => {
  console.log('[SW] Service Worker ativado.');
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== SHELL_CACHE_NAME && key !== IMAGE_CACHE_NAME) {
            console.log('[SW] Removendo cache obsoleto:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 5. Helper para verificar se a requisição é de imagem de produto
function isProductImageRequest(req, url) {
  if (req.destination === 'image') return true;
  
  const pathname = url.pathname.toLowerCase();
  const isImgExt = 
    pathname.endsWith('.jpg') || 
    pathname.endsWith('.jpeg') || 
    pathname.endsWith('.png') || 
    pathname.endsWith('.webp') || 
    pathname.endsWith('.avif') || 
    pathname.endsWith('.svg');

  if (isImgExt) return true;

  // Imagens de CDNs e serviços externos de produtos de Jiu-Jitsu
  if (
    url.hostname.includes('unsplash.com') ||
    url.hostname.includes('cloudinary.com') ||
    url.hostname.includes('thejiujiteiro.com') ||
    pathname.includes('/assets/images/') ||
    pathname.includes('/images/')
  ) {
    return true;
  }

  return false;
}

// 6. Limpeza LRU do cache de imagens para evitar estouro de memória
async function trimImageCache(cache) {
  try {
    const keys = await cache.keys();
    if (keys.length > MAX_CACHED_IMAGES) {
      const excess = keys.length - MAX_CACHED_IMAGES;
      for (let i = 0; i < excess; i++) {
        await cache.delete(keys[i]);
      }
    }
  } catch (e) {}
}

// 7. Interceptação Inteligente de Requisições (Fetch Handler)
self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Apenas métodos GET são cacheados
  if (req.method !== 'GET') {
    return;
  }

  // Ignora chamadas de API, Firebase Firestore, Auth e SSE
  if (
    url.pathname.startsWith('/api/') || 
    url.hostname.includes('firestore.googleapis.com') || 
    url.hostname.includes('firebaseio.com') || 
    url.hostname.includes('securetoken.googleapis.com') ||
    url.hostname.includes('identitytoolkit.googleapis.com')
  ) {
    return;
  }

  // Ignora requisições de desenvolvimento do Vite (HMR / WebSockets)
  if (
    url.pathname.includes('/@vite/') || 
    url.pathname.includes('/@react-refresh') || 
    url.pathname.includes('__vite_ping') ||
    url.pathname.endsWith('.hot-update.json') ||
    url.pathname.endsWith('.hot-update.js')
  ) {
    return;
  }

  // ESTRATÉGIA A: IMAGENS DE PRODUTOS DE JIU-JITSU (Cache-First com Background Revalidation)
  if (isProductImageRequest(req, url)) {
    event.respondWith(
      caches.open(IMAGE_CACHE_NAME).then(async (imageCache) => {
        // 1. Tenta encontrar no cache local
        const cachedResponse = await imageCache.match(req);

        // Se já está no cache, retorna imediatamente para carregamento ultra-rápido e offline
        if (cachedResponse) {
          // Revalida em segundo plano se houver conexão
          if (navigator.onLine) {
            fetch(req).then((networkResponse) => {
              if (networkResponse && (networkResponse.ok || networkResponse.type === 'opaque')) {
                imageCache.put(req, networkResponse.clone());
              }
            }).catch(() => {
              // Falha silenciosa em revalidação em segundo plano (offline)
            });
          }
          return cachedResponse;
        }

        // 2. Se não estiver no cache, busca na rede e armazena dinamicamente
        try {
          const networkResponse = await fetch(req);
          if (networkResponse && (networkResponse.ok || networkResponse.type === 'opaque')) {
            // Clona e salva no cache de imagens de produtos
            imageCache.put(req, networkResponse.clone());
            trimImageCache(imageCache);
          }
          return networkResponse;
        } catch (networkError) {
          console.log('[SW] Imagem não encontrada na rede (offline). Fornecendo fallback BJJ:', url.href);
          
          // Se a busca falhou e o usuário está offline, retorna imagem SVG estilizada de fallback
          return new Response(OFFLINE_IMAGE_SVG, {
            headers: {
              'Content-Type': 'image/svg+xml;charset=utf-8',
              'Cache-Control': 'no-store'
            }
          });
        }
      })
    );
    return;
  }

  // ESTRATÉGIA B: NAVEGAÇÃO DE PÁGINA (Network-First com Fallback Offline SPA)
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req).catch(async () => {
        const shellCache = await caches.open(SHELL_CACHE_NAME);
        const cachedIndex = await shellCache.match('/index.html') || await shellCache.match('/');
        if (cachedIndex) {
          return cachedIndex;
        }
        return new Response('<h1>OSS.OS Tatame Offline</h1><p>Você está sem internet, mas o catálogo em cache está pronto.</p>', {
          headers: { 'Content-Type': 'text/html; charset=utf-8' }
        });
      })
    );
    return;
  }

  // ESTRATÉGIA C: RECURSOS ESTÁTICOS LOCAIS (Stale-While-Revalidate)
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(req).then((cachedResponse) => {
        const fetchPromise = fetch(req).then((networkResponse) => {
          if (networkResponse && networkResponse.ok) {
            const resToCache = networkResponse.clone();
            caches.open(SHELL_CACHE_NAME).then((cache) => cache.put(req, resToCache));
          }
          return networkResponse;
        }).catch(() => {
          // Mantém resposta em cache em caso de falha de rede
          return cachedResponse;
        });

        return cachedResponse || fetchPromise;
      })
    );
  }
});

// 8. Listener Oficial de Mensagens em Segundo Plano do Firebase (FCM)
if (messaging) {
  messaging.onBackgroundMessage((payload) => {
    console.log('[FCM-SW] Mensagem Push em segundo plano recebida via Firebase:', payload);

    const title = payload.notification?.title || 
                  payload.data?.title || 
                  '🥋 OSS.OS - Notificação do Tatame';

    const body = payload.notification?.body || 
                 payload.data?.body || 
                 'Novas ofertas e novidades de Jiu-Jitsu disponíveis agora!';

    const icon = payload.notification?.icon || 
                 payload.notification?.image || 
                 payload.data?.imageUrl || 
                 '/apple-touch-icon.png';

    const targetUrl = payload.data?.url || 
                      payload.data?.click_action || 
                      payload.notification?.click_action || 
                      (payload.data?.productId ? `/?view=SHOP&product=${payload.data.productId}` : '/');

    const notificationOptions = {
      body: body,
      icon: icon,
      badge: '/apple-touch-icon.png',
      image: payload.notification?.image || payload.data?.imageUrl || undefined,
      tag: payload.data?.tag || `oss-fcm-${payload.data?.productId || Date.now()}`,
      renotify: true,
      vibrate: [200, 100, 200, 100, 300],
      requireInteraction: false,
      data: {
        url: targetUrl,
        productId: payload.data?.productId || '',
        type: payload.data?.type || 'fcm_push',
        timestamp: Date.now(),
        ...(payload.data || {})
      },
      actions: [
        { action: 'view_offer', title: '🥋 Ver no Tatame' },
        { action: 'dismiss', title: 'Fechar' }
      ]
    };

    // Notifica abas ativas do cliente via postMessage
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      clients.forEach((client) => {
        client.postMessage({
          type: 'FCM_PUSH_RECEIVED',
          payload: {
            title,
            body,
            icon,
            targetUrl,
            data: notificationOptions.data
          }
        });
      });
    });

    return self.registration.showNotification(title, notificationOptions);
  });
}

// 9. Fallback de evento 'push' nativo para Web Push padrão
self.addEventListener('push', (event) => {
  if (!event.data) return;

  try {
    const rawData = event.data.json();
    console.log('[FCM-SW] Evento push nativo capturado:', rawData);

    if (rawData.from && rawData.from.startsWith('/topics/') && messaging) {
      return;
    }

    const title = rawData.notification?.title || rawData.title || '🥋 OSS.OS Jiu-Jitsu';
    const body = rawData.notification?.body || rawData.body || 'Alerta de kimono ou equipamento favorito!';
    const icon = rawData.notification?.icon || rawData.icon || '/apple-touch-icon.png';
    const url = rawData.data?.url || rawData.url || '/';

    const options = {
      body,
      icon,
      badge: '/apple-touch-icon.png',
      vibrate: [200, 100, 200],
      tag: rawData.tag || 'oss-native-push',
      renotify: true,
      data: {
        url,
        ...(rawData.data || {})
      },
      actions: [
        { action: 'view_offer', title: 'Ver Oferta' },
        { action: 'dismiss', title: 'Dispensar' }
      ]
    };

    event.waitUntil(self.registration.showNotification(title, options));
  } catch (err) {
    const text = event.data.text();
    event.waitUntil(
      self.registration.showNotification('🥋 Alerta OSS.OS', {
        body: text,
        icon: '/apple-touch-icon.png',
        badge: '/apple-touch-icon.png',
        vibrate: [200, 100, 200],
        data: { url: '/' }
      })
    );
  }
});

// 10. Tratamento de clique na notificação
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') {
    return;
  }

  const notificationData = event.notification.data || {};
  const targetUrl = notificationData.url || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          if ('navigate' in client && targetUrl) {
            client.navigate(targetUrl);
          }
          client.postMessage({
            type: 'FCM_NOTIFICATION_CLICK',
            url: targetUrl,
            action: event.action,
            data: notificationData
          });
          return client.focus();
        }
      }

      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});

// 11. Canal de Comunicação com a Aplicação React (Pre-cache, Estatísticas e Limpeza)
self.addEventListener('message', async (event) => {
  if (!event.data) return;

  // Pre-cache de catálogo solicitado pela UI do cliente
  if (event.data.type === 'PRECACHE_PRODUCT_IMAGES' && Array.isArray(event.data.urls)) {
    const urls = event.data.urls;
    console.log(`[SW] Iniciando pré-cache de ${urls.length} imagens de produtos BJJ...`);
    
    try {
      const cache = await caches.open(IMAGE_CACHE_NAME);
      for (const imgUrl of urls) {
        try {
          const match = await cache.match(imgUrl);
          if (!match) {
            const resp = await fetch(imgUrl, { mode: 'no-cors' });
            if (resp) {
              await cache.put(imgUrl, resp);
            }
          }
        } catch (e) {
          // Ignora falhas pontuais de imagens individuais
        }
      }
      console.log('[SW] Pré-cache de imagens de produtos concluído com sucesso.');
      
      // Notifica o cliente do término
      const keys = await cache.keys();
      if (event.source) {
        event.source.postMessage({
          type: 'PRECACHE_PRODUCT_IMAGES_COMPLETE',
          totalCached: keys.length
        });
      }
    } catch (err) {
      console.warn('[SW] Erro durante PRECACHE_PRODUCT_IMAGES:', err);
    }
  }

  // Retorna estatísticas de cache para a UI
  if (event.data.type === 'GET_CACHE_STATS') {
    try {
      const imageCache = await caches.open(IMAGE_CACHE_NAME);
      const keys = await imageCache.keys();
      if (event.source) {
        event.source.postMessage({
          type: 'CACHE_STATS_RESPONSE',
          imageCount: keys.length
        });
      }
    } catch (e) {}
  }

  // Limpa o cache de imagens se solicitado pelo usuário
  if (event.data.type === 'CLEAR_IMAGE_CACHE') {
    caches.delete(IMAGE_CACHE_NAME).then(() => {
      console.log('[SW] Cache de imagens de produtos limpo pelo cliente.');
    });
  }

  // PING / PONG de diagnóstico
  if (event.data.type === 'PING') {
    if (event.source) {
      event.source.postMessage({
        type: 'PONG',
        worker: 'firebase-messaging-sw',
        fcmReady: Boolean(messaging),
        timestamp: Date.now()
      });
    }
  } else if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
