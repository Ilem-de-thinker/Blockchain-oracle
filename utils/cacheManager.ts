/**
 * PWA Cache Management Utility
 * 
 * Provides programmatic cache management for the PWA.
 * Can be used to clear caches, update service worker, or force refresh.
 * 
 * Usage:
 *   import { clearAllCaches, updateServiceWorker, forceRefresh } from '@/utils/cacheManager';
 *   await clearAllCaches();
 */

const CACHE_VERSION_KEY = 'sw-cache-version';
const CURRENT_CACHE_VERSION = 'v2.0.2';

/**
 * Clear all caches managed by the service worker
 */
export async function clearAllCaches(): Promise<void> {
  try {
    // Clear browser caches via service worker
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'CLEAR_ALL_CACHES',
      });
      console.log('[Cache] Service worker caches clearing initiated');
    }

    // Clear cache API directly
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames
          .filter(name => name.includes('blockchain-oracle') || name.includes('workbox') || name.includes('oracle'))
          .map(name => caches.delete(name))
      );
      console.log('[Cache] Application caches deleted');
    }

    // Unregister service workers
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const registration of registrations) {
        await registration.unregister();
        console.log('[Cache] Service worker unregistered');
      }
    }

    // Clear session storage
    sessionStorage.clear();
    console.log('[Cache] Session storage cleared');

  } catch (error) {
    console.error('[Cache] Failed to clear caches:', error);
    throw error;
  }
}

/**
 * Update service worker to latest version
 */
export async function updateServiceWorker(): Promise<void> {
  try {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready;
      const update = await registration.update();
      
      console.log('[Cache] Service worker update check complete');
      
      // If new version is available, it will be installed automatically
      // Force skip waiting if we have a waiting worker
      if (registration.waiting) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        console.log('[Cache] New service worker activated');
        
        // Reload after a short delay to use new version
        setTimeout(() => {
          window.location.reload();
        }, 500);
      }
      
      return update;
    }
  } catch (error) {
    console.error('[Cache] Failed to update service worker:', error);
    throw error;
  }
}

/**
 * Force a complete refresh with cache clearing
 * This will reload the page with fresh styles and scripts
 */
export async function forceRefresh(): Promise<void> {
  try {
    console.log('[Cache] Initiating force refresh');
    
    // Clear all caches
    await clearAllCaches();
    
    // Update cache version
    localStorage.setItem(CACHE_VERSION_KEY, CURRENT_CACHE_VERSION);
    
    // Add timestamp to force fresh load
    const timestamp = Date.now();
    const url = new URL(window.location.href);
    url.searchParams.set('_refresh', timestamp.toString());
    localStorage.setItem('last-refresh', timestamp.toString());
    
    // Reload with cache-busting parameter
    window.location.href = url.toString();
    
  } catch (error) {
    console.error('[Cache] Force refresh failed:', error);
    // Fallback to simple reload
    window.location.reload();
  }
}

/**
 * Clean stale cache entries (older than specified hours)
 */
export async function cleanStaleCache(maxAgeHours: number = 24): Promise<void> {
  try {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'CLEAN_STALE_CACHE',
      });
      console.log(`[Cache] Stale cache cleanup initiated (> ${maxAgeHours} hours)`);
    }
  } catch (error) {
    console.error('[Cache] Failed to clean stale caches:', error);
  }
}

/**
 * Get current cache version
 */
export function getCacheVersion(): string | null {
  return localStorage.getItem(CACHE_VERSION_KEY);
}

/**
 * Check if caches need updating
 */
export function needsCacheUpdate(): boolean {
  const storedVersion = getCacheVersion();
  return !storedVersion || storedVersion !== CURRENT_CACHE_VERSION;
}

/**
 * Auto-update caches on app load if version mismatch
 * Call this on app initialization
 */
export async function autoUpdateCaches(): Promise<boolean> {
  if (!needsCacheUpdate()) {
    return false;
  }

  console.log('[Cache] Auto-update: version mismatch detected');
  
  try {
    // Update version immediately to prevent loop
    localStorage.setItem(CACHE_VERSION_KEY, CURRENT_CACHE_VERSION);

    // Clear old caches and unregister SW
    await clearAllCaches();
    
    // Reload the page to get everything fresh
    console.log('[Cache] Auto-update: Reloading page for fresh content');
    window.location.reload();
    
    return true;
  } catch (error) {
    console.error('[Cache] Auto-update failed:', error);
    return false;
  }
}

/**
 * Check if service worker is active
 */
export function isServiceWorkerActive(): boolean {
  return 'serviceWorker' in navigator && !!navigator.serviceWorker.controller;
}

/**
 * Get service worker status
 */
export async function getServiceWorkerStatus(): Promise<{
  active: boolean;
  installing: boolean;
  waiting: boolean;
  version: string | null;
}> {
  if (!('serviceWorker' in navigator)) {
    return { active: false, installing: false, waiting: false, version: null };
  }

  const registration = await navigator.serviceWorker.ready;
  
  return {
    active: !!registration.active,
    installing: !!registration.installing,
    waiting: !!registration.waiting,
    version: getCacheVersion(),
  };
}
