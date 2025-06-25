const CACHE_NAME = 'my-cache-v1';
const DYNAMIC_CACHE = 'dynamic-cache-v1';

const urlsToCache = [
  '/',
  '/index.html',
  '/logo192.png',
  '/logo512.png',
  '/manifest.json',
];

// Instalar y cachear recursos iniciales
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

// Activar y limpiar caches antiguos
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME && key !== DYNAMIC_CACHE) {
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim();
});

// Interceptar peticiones
self.addEventListener('fetch', event => {
  //  Evitar cachear APIs, autenticación y métodos no-GET
  if (
    event.request.url.includes('/auth/') ||
    event.request.url.includes('/api/') ||
    event.request.method !== 'GET'
  ) {
    return;
  }

  if (event.request.mode === 'navigate') {
    // Para rutas navegables de una SPA
    event.respondWith(
      fetch(event.request)
        .then(res => {
          if (res.ok) {
            return caches.open(DYNAMIC_CACHE).then(cache => {
              cache.put(event.request.clone(), res.clone());
              return res;
            });
          }
          return res;
        })
        .catch(() =>
          caches.match(event.request.url).then(cached =>
            cached || caches.match('/index.html')
          )
        )
    );
  } else {
    // Para archivos estáticos (imágenes, css, js)
      event.respondWith(
      caches.open(DYNAMIC_CACHE).then(async cache => {
        const cachedResponse = await cache.match(event.request);
        const networkFetch = fetch(event.request)
          .then(networkResponse => {
            if (networkResponse.ok) {
                  cache.put(event.request, networkResponse.clone());

                  //  Notificar al frontend que algo fue actualizado en caché
                  self.clients.matchAll().then(clients => {
                    clients.forEach(client => {
                      client.postMessage({
                        type: 'CACHE_UPDATED',
                        url: event.request.url
                      });
                    });
                  });
                }

            return networkResponse;
          })
          .catch(() => {
            // Si falla la red, devuelve el caché si existe
            return cachedResponse || new Response('Offline', {
              status: 503,
              statusText: 'Offline',
              headers: { 'Content-Type': 'text/plain' }
            });
          });

        // Devuelve cache inmediatamente si existe, pero actualiza en segundo plano
        return cachedResponse || networkFetch;
      })
    );
  }
});
