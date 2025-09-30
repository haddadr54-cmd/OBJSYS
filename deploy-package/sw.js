// 🚀 Service Worker para cache e performance - SEM FLASH
const CACHE_NAME = 'sistema-objetivo-v1.2';
const STATIC_CACHE_URLS = [
  '/',
  '/index.html',
  '/assets/index.css',
  '/assets/index.js'
];

// 🔧 FIX: Evitar flash de conteúdo antigo
const SKIP_CACHE_PATHS = [
  '/login',
  '/auth',
  '/dashboard'
];

// Instalar Service Worker
self.addEventListener('install', event => {
  console.log('🔧 Service Worker instalado');
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(STATIC_CACHE_URLS);
    })
  );
  self.skipWaiting();
});

// Ativar Service Worker
self.addEventListener('activate', event => {
  console.log('✅ Service Worker ativado');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ Removendo cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Interceptar requisições
self.addEventListener('fetch', event => {
  // 🔧 FIX: Não usar cache para paths que causam flash
  const url = new URL(event.request.url);
  const shouldSkipCache = SKIP_CACHE_PATHS.some(path => url.pathname.includes(path));
  
  if (shouldSkipCache) {
    event.respondWith(fetch(event.request));
    return;
  }

  // Cache first strategy para assets estáticos
  if (event.request.url.includes('/assets/')) {
    event.respondWith(
      caches.match(event.request).then(response => {
        return response || fetch(event.request);
      })
    );
    return;
  }

  // Network first strategy para API calls
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Cache successful API responses
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Fallback para cache se network falhar
          return caches.match(event.request);
        })
    );
    return;
  }

  // Cache first para outras requisições
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request).then(fetchResponse => {
        const responseClone = fetchResponse.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseClone);
        });
        return fetchResponse;
      });
    })
  );
});