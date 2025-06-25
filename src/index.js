import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { AuthProvider } from './context/AuthContext'; 
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import { setupOfflineListeners, syncData } from './services/offlineSync';

// Configurar detectores de eventos offline/online
setupOfflineListeners();

// Configurar escucha de mensajes del service worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('message', event => {
    if (event.data && event.data.type === 'GET_AUTH_TOKEN') {
      // Responder al service worker con el token
      const token = localStorage.getItem('token');
      event.ports[0].postMessage({ token });
    } else if (event.data && event.data.type === 'SYNC_COMPLETED') {
      console.log('Sincronización completada para:', event.data.endpoint);
      // Aquí podrías disparar una actualización en la UI si es necesario
    }
  });

  // Intentar sincronizar datos al inicio si hay conexión
  window.addEventListener('load', async () => {
    try {
      await syncData();
    } catch (error) {
      console.error('Error syncing data on load:', error);
    }
  });
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);
serviceWorkerRegistration.register();

