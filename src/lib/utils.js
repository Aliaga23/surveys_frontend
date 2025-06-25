import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"
 
export function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

// Función para forzar actualización de datos
export async function forceDataRefresh() {
  // Limpiar caché de API
  if ('caches' in window) {
    try {
      const cacheNames = await caches.keys();
      for (const cacheName of cacheNames) {
        // Solo limpiar caches dinámicas
        if (cacheName.includes('dynamic')) {
          console.log('Limpiando caché:', cacheName);
          await caches.delete(cacheName);
        }
      }
      console.log('Caché limpiada, actualizando datos...');
      return true;
    } catch (error) {
      console.error('Error al limpiar caché:', error);
      return false;
    }
  }
  return false;
}