const CACHE_NAME = 'my-cache-v1';
const DYNAMIC_CACHE = 'dynamic-cache-v1';
const DB_NAME = 'surveysaasOfflineDB';
const STORE_NAME = 'offlineRequests';

const urlsToCache = [
  '/',
  '/index.html',
  '/logo192.png',
  '/logo512.png',
  '/manifest.json',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

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
  );  self.clients.claim();
});

self.addEventListener('sync', function(event) {
  if (event.tag === 'sync-surveysaas-data') {
    event.waitUntil(syncOfflineData());
  }
});

async function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onerror = (event) => reject('Error opening DB');
    request.onsuccess = (event) => resolve(event.target.result);
  });
}

let isSyncingInSW = false;

async function syncOfflineData() {
  if (isSyncingInSW) {
    console.log('SW: Sync already in progress, skipping...');
    return false;
  }
  
  isSyncingInSW = true;
  
  try {
    const db = await openDatabase();
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    
    // Filtrar solo aquellas peticiones que no están siendo procesadas
    const pendingRequests = [];
    const cursorRequest = store.openCursor();
    await new Promise((resolve, reject) => {
      cursorRequest.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          if (cursor.value.processing !== true) {
            pendingRequests.push(cursor.value);
          }
          cursor.continue();
        } else {
          resolve();
        }
      };
      cursorRequest.onerror = () => reject('Error getting requests');
    });

    console.log(`Processing ${pendingRequests.length} offline requests in SW`);

    for (const req of pendingRequests) {
      try {
        // Marcar como en proceso
        await markRequestAsProcessingInSW(req.id);
        
        const token = await getTokenFromClient();
        if (!token) {
          console.error('No auth token available');
          // Desmarcar como en proceso si no podemos continuar
          await unmarkRequestAsProcessingInSW(req.id);
          continue;
        }

        const response = await fetch(`https://surveysbackend-production.up.railway.app${req.endpoint}`, {
          method: req.method,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: req.data ? JSON.stringify(req.data) : undefined
        });

        if (response.ok) {
          // Remove from queue if successful
          await removeFromQueue(req.id);
          console.log(`SW: Synced ${req.method} ${req.endpoint}`);

          // Notify clients about successful sync
          self.clients.matchAll().then(clients => {
            clients.forEach(client => {
              client.postMessage({
                type: 'SYNC_COMPLETED',
                endpoint: req.endpoint,
                method: req.method
              });
            });
          });
        } else {
          console.error(`SW: Failed to sync: ${response.status}`);
          // En caso de error, desmarcar como en proceso
          await unmarkRequestAsProcessingInSW(req.id);
        }
      } catch (error) {
        console.error(`SW: Error syncing request:`, error);
        // En caso de error, desmarcar como en proceso
        await unmarkRequestAsProcessingInSW(req.id);
      }
    }
    return true;
  } catch (error) {
    console.error('SW: Error in syncOfflineData:', error);
    return false;
  } finally {
    isSyncingInSW = false;
  }
}

async function removeFromQueue(id) {
  try {
    const db = await openDatabase();
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    return new Promise((resolve, reject) => {
      const request = store.delete(id);
      request.onsuccess = () => resolve(true);
      request.onerror = () => reject('Error removing from queue');
    });
  } catch (error) {
    console.error('Failed to remove from queue:', error);
    throw error;
  }
}

async function getTokenFromClient() {
  try {
    const clientsList = await self.clients.matchAll();
    if (clientsList.length > 0) {
      // Create a message channel
      const messageChannel = new MessageChannel();
      return new Promise((resolve) => {
        messageChannel.port1.onmessage = (event) => {
          resolve(event.data.token);
        };
        
        clientsList[0].postMessage({
          type: 'GET_AUTH_TOKEN'
        }, [messageChannel.port2]);
        
        setTimeout(() => resolve(null), 1000);
      });
    }
    return null;
  } catch (error) {
    console.error('Error getting token from client:', error);
    return null;
  }
}

// Interceptar peticiones
self.addEventListener('fetch', event => {
  //  Evitar cachear APIs, autenticación y métodos no-GET
  if (
    event.request.url.includes('/auth/') ||
    event.request.url.includes('/api/') ||
    event.request.method !== 'GET'
  ) {
    // Para peticiones de API o autenticación, siempre ir a la red
    event.respondWith(fetch(event.request));
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
    );  } else {
    // Para archivos estáticos (imágenes, css, js)
      event.respondWith(
      caches.open(DYNAMIC_CACHE).then(async cache => {
        // Usar estrategia network-first para asegurar datos frescos
        return fetch(event.request)
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
            const cachedResponse = cache.match(event.request);
            return cachedResponse || new Response('Offline', {
              status: 503,
              statusText: 'Offline',
              headers: { 'Content-Type': 'text/plain' }
            });
          });
      })
    );
  }
});

async function markRequestAsProcessingInSW(id) {
  try {
    const db = await openDatabase();
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    
    // First get the request
    const getRequest = store.get(id);
    
    return new Promise((resolve, reject) => {
      getRequest.onsuccess = (event) => {
        const data = event.target.result;
        if (data) {
          data.processing = true;
          
          const updateRequest = store.put(data);
          
          updateRequest.onsuccess = () => {
            resolve(true);
          };
          
          updateRequest.onerror = () => {
            reject('Error updating processing status');
          };
        } else {
          reject('Request not found');
        }
      };
      
      getRequest.onerror = () => {
        reject('Error getting request');
      };
    });
  } catch (error) {
    console.error('SW: Failed to mark request as processing:', error);
    throw error;
  }
}

async function unmarkRequestAsProcessingInSW(id) {
  try {
    const db = await openDatabase();
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    
    // First get the request
    const getRequest = store.get(id);
    
    return new Promise((resolve, reject) => {
      getRequest.onsuccess = (event) => {
        const data = event.target.result;
        if (data) {
          data.processing = false;
          
          const updateRequest = store.put(data);
          
          updateRequest.onsuccess = () => {
            resolve(true);
          };
          
          updateRequest.onerror = () => {
            reject('Error updating processing status');
          };
        } else {
          resolve(true); // Ya no existe, no hay problema
        }
      };
      
      getRequest.onerror = () => {
        reject('Error getting request');
      };
    });
  } catch (error) {
    console.error('SW: Failed to unmark request as processing:', error);
    throw error;
  }
}
