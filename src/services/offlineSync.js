// Database configuration
const DB_NAME = 'surveysaasOfflineDB';
const DB_VERSION = 1;
const STORE_NAME = 'offlineRequests';

// Function to open the database
const openDatabase = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = (event) => {
      reject('Error opening IndexedDB: ' + event.target.errorCode);
    };
    
    request.onsuccess = (event) => {
      resolve(event.target.result);
    };
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
        store.createIndex('endpoint', 'endpoint', { unique: false });
        store.createIndex('method', 'method', { unique: false });
        store.createIndex('timestamp', 'timestamp', { unique: false });
        store.createIndex('processing', 'processing', { unique: false });
      }
    };
  });
};

export const addToOfflineQueue = async (endpoint, method, data) => {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      
      const request = store.add({
        endpoint,
        method,
        data,
        timestamp: new Date().getTime(),
        processing: false 
      });
      
      request.onsuccess = () => {
        console.log('Request queued for offline sync');
        resolve(true);
      };
      
      request.onerror = (event) => {
        reject('Error adding to offline queue: ' + event.target.errorCode);
      };
    });
  } catch (error) {
    console.error('Failed to add to offline queue:', error);
    throw error;
  }
};

export const getPendingRequests = async () => {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      
      const pendingRequests = [];
      const cursor = store.openCursor();
      
      cursor.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          if (cursor.value.processing !== true) {
            pendingRequests.push(cursor.value);
          }
          cursor.continue();
        } else {
          resolve(pendingRequests);
        }
      };
      
      cursor.onerror = (event) => {
        reject('Error getting pending requests: ' + event.target.errorCode);
      };
    });
  } catch (error) {
    console.error('Failed to get pending requests:', error);
    throw error;
  }
};

// Function to remove a request from queue after it's processed
export const removeFromQueue = async (id) => {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(id);
      
      request.onsuccess = () => {
        resolve(true);
      };
      
      request.onerror = (event) => {
        reject('Error removing from queue: ' + event.target.errorCode);
      };
    });
  } catch (error) {
    console.error('Failed to remove from queue:', error);
    throw error;
  }
};

// Function to check online status
export const isOnline = () => {
  return navigator.onLine;
};

// Function to register a sync event
export const registerSync = async () => {
  if ('serviceWorker' in navigator && 'SyncManager' in window) {
    try {
      const registration = await navigator.serviceWorker.ready;
      // Verificar si el tag ya existe para evitar registros duplicados
      const tags = await registration.sync.getTags();
      if (!tags.includes('sync-surveysaas-data')) {
        await registration.sync.register('sync-surveysaas-data');
      }
      return true;
    } catch (error) {
      console.error('Failed to register sync:', error);
      return false;
    }
  } else {
    console.warn('Background Sync not supported');
    return false;
  }
};

// Variable para evitar ejecuciones concurrentes
let isSyncing = false;

export const syncData = async () => {
  // Evitar ejecuciones concurrentes
  if (isSyncing) {
    console.log('Sync already in progress, skipping...');
    return false;
  }
  
  if (!isOnline()) {
    console.log('Device is offline. Sync postponed.');
    return false;
  }
  
  isSyncing = true;
  
  try {
    const requests = await getPendingRequests();
    if (requests.length > 0) {
      console.log(`Processing ${requests.length} offline requests...`);
      
      // Process each request one by one
      for (const request of requests) {
        try {
          // Marcar como en proceso
          await markRequestAsProcessing(request.id);
          
          const token = localStorage.getItem('token');
          if (!token) {
            console.error('No auth token available for sync');
            return false;
          }
          
          const response = await fetch(`https://surveysbackend-production.up.railway.app${request.endpoint}`, {
            method: request.method,
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: request.data ? JSON.stringify(request.data) : undefined
          });
          
          if (response.ok) {
            // Remove from queue if successful
            await removeFromQueue(request.id);
            console.log(`Successfully synced request: ${request.method} ${request.endpoint}`);
          } else {
            console.error(`Failed to sync: ${response.status} ${response.statusText}`);
            // Si falla, desmarcar como en proceso para intentar más tarde
            await unmarkRequestAsProcessing(request.id);
            // Could implement retry logic or notify user here
          }
        } catch (error) {
          console.error(`Error processing offline request:`, error);
          // Si hay error, desmarcar como en proceso
          await unmarkRequestAsProcessing(request.id);
        }
      }
      
      return true;
    } else {
      console.log('No pending requests to sync');
      return true;
    }
  } catch (error) {
    console.error('Error syncing data:', error);
    return false;
  } finally {
    isSyncing = false;
  }
};

// Event listeners for online/offline status
export const setupOfflineListeners = () => {
  // Solo ejecutar syncData en el evento online si Background Sync no está disponible
  if (!('SyncManager' in window)) {
    window.addEventListener('online', async () => {
      console.log('You are now online! Background Sync no disponible, sincronizando manualmente.');
      await syncData();
    });
  } else {
    window.addEventListener('online', () => {
      console.log('You are now online! Background Sync se encargará de la sincronización.');
    });
  }

  window.addEventListener('offline', () => {
    console.log('You are now offline. Changes will be saved locally.');
  });
};

export const markRequestAsProcessing = async (id) => {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      
      const getRequest = store.get(id);
      
      getRequest.onsuccess = (event) => {
        const data = event.target.result;
        if (data) {
          data.processing = true;
          
          const updateRequest = store.put(data);
          
          updateRequest.onsuccess = () => {
            resolve(true);
          };
          
          updateRequest.onerror = (event) => {
            reject('Error updating processing status: ' + event.target.errorCode);
          };
        } else {
          reject('Request not found');
        }
      };
      
      getRequest.onerror = (event) => {
        reject('Error getting request: ' + event.target.errorCode);
      };
    });
  } catch (error) {
    console.error('Failed to mark request as processing:', error);
    throw error;
  }
};

export const unmarkRequestAsProcessing = async (id) => {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      
      const getRequest = store.get(id);
      
      getRequest.onsuccess = (event) => {
        const data = event.target.result;
        if (data) {
          // Update the processing status
          data.processing = false;
          
          // Put it back
          const updateRequest = store.put(data);
          
          updateRequest.onsuccess = () => {
            resolve(true);
          };
          
          updateRequest.onerror = (event) => {
            reject('Error updating processing status: ' + event.target.errorCode);
          };
        } else {
          reject('Request not found');
        }
      };
      
      getRequest.onerror = (event) => {
        reject('Error getting request: ' + event.target.errorCode);
      };
    });
  } catch (error) {
    console.error('Failed to unmark request as processing:', error);
    throw error;
  }
};
