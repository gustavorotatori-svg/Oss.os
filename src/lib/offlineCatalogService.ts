/**
 * OSS.OS - Offline Catalog & Jiu-Jitsu Product Image Cache Service
 * Gerencia o armazenamento em cache de imagens dos produtos do tatame via Cache API e Service Worker.
 */

import { Product } from '../types';

export const IMAGE_CACHE_NAME = 'oss-bjj-images-v1';
export const SHELL_CACHE_NAME = 'oss-bjj-shell-v6';

export interface OfflineCacheStats {
  imageCount: number;
  isOffline: boolean;
  isSupported: boolean;
  cacheSizeEstimatedMb?: number;
}

/**
 * Checks if Service Worker and Cache Storage are supported in current browser
 */
export function isOfflineStorageSupported(): boolean {
  return typeof window !== 'undefined' && 'caches' in window;
}

/**
 * Returns statistics of cached product images
 */
export async function getOfflineCacheStats(): Promise<OfflineCacheStats> {
  const isSupported = isOfflineStorageSupported();
  const isOffline = typeof navigator !== 'undefined' ? !navigator.onLine : false;

  if (!isSupported) {
    return { imageCount: 0, isOffline, isSupported: false };
  }

  try {
    const cache = await caches.open(IMAGE_CACHE_NAME);
    const keys = await cache.keys();
    
    // Estimate size if storage API is available
    let cacheSizeEstimatedMb: number | undefined;
    if (navigator.storage && navigator.storage.estimate) {
      try {
        const estimate = await navigator.storage.estimate();
        if (estimate.usage) {
          cacheSizeEstimatedMb = Math.round((estimate.usage / (1024 * 1024)) * 10) / 10;
        }
      } catch (e) {}
    }

    return {
      imageCount: keys.length,
      isOffline,
      isSupported: true,
      cacheSizeEstimatedMb
    };
  } catch (err) {
    console.warn('[OfflineCatalog] Erro ao obter estatísticas de cache:', err);
    return { imageCount: 0, isOffline, isSupported: true };
  }
}

/**
 * Extracts all unique image URLs from a list of products
 */
export function extractProductImageUrls(products: Product[]): string[] {
  const urls = new Set<string>();

  for (const product of products) {
    if (product.imageUrl) urls.add(product.imageUrl);
    if (product.galleryImages && Array.isArray(product.galleryImages)) {
      for (const img of product.galleryImages) {
        if (img) urls.add(img);
      }
    }
  }

  return Array.from(urls).filter(url => url && typeof url === 'string' && url.length > 5);
}

/**
 * Checks if a specific image URL is already cached
 */
export async function isImageCached(url: string): Promise<boolean> {
  if (!isOfflineStorageSupported() || !url) return false;

  try {
    const cache = await caches.open(IMAGE_CACHE_NAME);
    const match = await cache.match(url);
    return Boolean(match);
  } catch {
    return false;
  }
}

/**
 * Pre-caches a list of product images in the background with progress reporting
 */
export async function precacheProductImages(
  imageUrls: string[],
  onProgress?: (cachedCount: number, total: number, currentUrl: string) => void
): Promise<{ success: boolean; cachedCount: number; errors: number }> {
  if (!isOfflineStorageSupported()) {
    return { success: false, cachedCount: 0, errors: 0 };
  }

  let cachedCount = 0;
  let errors = 0;
  const total = imageUrls.length;

  try {
    const cache = await caches.open(IMAGE_CACHE_NAME);

    // Also notify active Service Worker
    if (navigator.serviceWorker && navigator.serviceWorker.controller) {
      try {
        navigator.serviceWorker.controller.postMessage({
          type: 'PRECACHE_PRODUCT_IMAGES',
          urls: imageUrls
        });
      } catch (e) {}
    }

    // Direct fetch and cache put for immediate UI feedback
    for (let i = 0; i < imageUrls.length; i++) {
      const url = imageUrls[i];
      try {
        const alreadyCached = await cache.match(url);
        if (alreadyCached) {
          cachedCount++;
          if (onProgress) onProgress(cachedCount, total, url);
          continue;
        }

        // Fetch with no-cors / cors fallback
        const response = await fetch(url, {
          mode: 'cors',
          credentials: 'omit',
          cache: 'reload'
        }).catch(() => {
          // Retry with no-cors for opaque 3rd-party images (e.g. Unsplash, external CDNs)
          return fetch(url, { mode: 'no-cors' });
        });

        if (response && (response.ok || response.type === 'opaque')) {
          await cache.put(url, response.clone());
          cachedCount++;
        } else {
          errors++;
        }
      } catch (err) {
        console.warn(`[OfflineCatalog] Falha ao cachear imagem: ${url}`, err);
        errors++;
      }

      if (onProgress) {
        onProgress(cachedCount, total, url);
      }
    }

    return { success: true, cachedCount, errors };
  } catch (err) {
    console.error('[OfflineCatalog] Erro geral durante o pre-cache:', err);
    return { success: false, cachedCount, errors };
  }
}

/**
 * Clears the dedicated product images cache
 */
export async function clearProductImageCache(): Promise<boolean> {
  if (!isOfflineStorageSupported()) return false;

  try {
    const result = await caches.delete(IMAGE_CACHE_NAME);
    
    // Also notify Service Worker
    if (navigator.serviceWorker && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ type: 'CLEAR_IMAGE_CACHE' });
    }

    return result;
  } catch (err) {
    console.warn('[OfflineCatalog] Erro ao limpar cache de imagens:', err);
    return false;
  }
}
