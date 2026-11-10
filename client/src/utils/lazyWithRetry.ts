import React from 'react';

/**
 * Resilient lazy loader for route chunks.
 * Automatically recovers from failed dynamic module imports caused by new production
 * deployments (where previously hashed chunk filenames have been replaced on the server).
 */
export function lazyWithRetry<T extends React.ComponentType<any>>(
  factory: () => Promise<{ default: T }>,
  chunkName?: string
): React.LazyExoticComponent<T> {
  return React.lazy(async () => {
    const key = `indraprasth_retry_${chunkName || 'module'}`;
    const hasRetried = sessionStorage.getItem(key);

    try {
      const module = await factory();
      // Reset retry flag upon successful load
      sessionStorage.removeItem(key);
      return module;
    } catch (error: any) {
      const message = String(error?.message || error || '');
      const isChunkLoadError =
        message.includes('Failed to fetch dynamically imported module') ||
        message.includes('Importing a module script failed') ||
        message.includes('error loading dynamically imported module') ||
        error?.name === 'ChunkLoadError';

      if (isChunkLoadError && !hasRetried) {
        console.warn(`[Vite] Chunk load error for "${chunkName || 'route'}". Reloading application to fetch latest deployment...`);
        sessionStorage.setItem(key, 'true');
        // Force reload from server to fetch latest index.html with new asset hashes
        window.location.reload();
        // Return a never-resolving promise so React doesn't crash before the reload triggers
        return new Promise(() => {});
      }

      // If already retried or different error, clear flag and propagate
      sessionStorage.removeItem(key);
      throw error;
    }
  });
}
