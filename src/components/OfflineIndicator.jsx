import React, { useState, useEffect, useCallback } from 'react';
import { getPendingRequests, syncData } from '../services/offlineSync';

export default function OfflineIndicator() {
  const [online, setOnline]                 = useState(navigator.onLine);
  const [pendingCount, setPendingCount]     = useState(0);
  const [syncInProgress, setSyncInProgress] = useState(false);
  const [showNotification, setShowNotification] = useState(false);

  const updatePendingCount = useCallback(async () => {
    try {
      const requests = await getPendingRequests();
      setPendingCount(requests.length);

      if (requests.length > 0) {
        setShowNotification(true);
      } else if (navigator.onLine) {
        setTimeout(() => setShowNotification(false), 3_000);
      }
    } catch (error) {
      console.error('Error getting pending requests:', error);
    }
  }, []);

  const handleSync = useCallback(async () => {
    if (online && pendingCount > 0 && !syncInProgress) {
      setSyncInProgress(true);
      try {
        await syncData();
        await updatePendingCount();
      } catch (error) {
        console.error('Error syncing data:', error);
      } finally {
        setSyncInProgress(false);
      }
    }
  }, [online, pendingCount, syncInProgress, updatePendingCount]);


  useEffect(() => {
    const handleOnlineChange = () => {
      setOnline(navigator.onLine);
      setShowNotification(true);

      if (navigator.onLine) {
        handleSync();
      }
    };

    window.addEventListener('online',  handleOnlineChange);
    window.addEventListener('offline', handleOnlineChange);

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', event => {
        if (event?.data?.type === 'SYNC_COMPLETED') updatePendingCount();
      });
    }

    // Check inicial
    updatePendingCount();

    return () => {
      window.removeEventListener('online',  handleOnlineChange);
      window.removeEventListener('offline', handleOnlineChange);
    };
  }, [handleSync, updatePendingCount]);

  /* ───────── render ───────── */

  if (!showNotification) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 20,
        right: 20,
        padding: '10px 20px',
        borderRadius: 4,
        backgroundColor: online
          ? pendingCount > 0 ? '#FFC107' : '#4CAF50'
          : '#F44336',
        color: '#fff',
        boxShadow: '0 2px 5px rgba(0,0,0,.2)',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        zIndex: 1000,
        transition: 'all .3s ease'
      }}
    >
      {/* Indicador de conexión */}
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <span
          style={{
            height: 10,
            width: 10,
            backgroundColor: online ? '#4CAF50' : '#F44336',
            borderRadius: '50%',
            display: 'inline-block',
            marginRight: 8
          }}
        />
        {online ? 'Online' : 'Offline'}
      </div>

      {/* Cambios pendientes */}
      {pendingCount > 0 && (
        <>
          <span style={{ marginLeft: 10 }}>
            {pendingCount} {pendingCount === 1 ? 'cambio' : 'cambios'} pendiente
            {pendingCount !== 1 && 's'}
          </span>

          {online && (
            <button
              onClick={handleSync}
              disabled={syncInProgress}
              style={{
                background: 'transparent',
                border: '1px solid #fff',
                color: '#fff',
                padding: '4px 8px',
                borderRadius: 4,
                cursor: syncInProgress ? 'not-allowed' : 'pointer'
              }}
            >
              {syncInProgress ? 'Sincronizando…' : 'Sincronizar ahora'}
            </button>
          )}
        </>
      )}

      {/* Todo sincronizado */}
      {online && pendingCount === 0 && <span>Todos los cambios están sincronizados</span>}

      {/* Cerrar banner */}
      <button
        onClick={() => setShowNotification(false)}
        style={{
          background: 'transparent',
          border: 'none',
          color: '#fff',
          fontSize: 16,
          cursor: 'pointer',
          marginLeft: 'auto',
          padding: '0 5px'
        }}
      >
        ×
      </button>
    </div>
  );
}
