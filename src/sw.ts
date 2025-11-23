
/// <reference lib="webworker" />
import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching';
import { clientsClaim } from 'workbox-core';
import { registerRoute, NavigationRoute } from 'workbox-routing';
import { StaleWhileRevalidate, CacheFirst, NetworkOnly } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';

declare let self: ServiceWorkerGlobalScope;

// 1. Immediate Control
self.skipWaiting();
clientsClaim();

// 2. Precache Assets (injected by Vite)
// @ts-ignore
precacheAndRoute(self.__WB_MANIFEST);

// 3. Clean up old caches
cleanupOutdatedCaches();

// 4. Runtime Caching Strategies

// API Calls (Prayer Times, Quran) - Stale While Revalidate
registerRoute(
  ({ url }) => url.href.includes('api.aladhan.com') || url.href.includes('api.alquran.cloud'),
  new StaleWhileRevalidate({
    cacheName: 'api-cache',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 60 * 60 * 24 * 30, // 30 Days
      }),
    ],
  })
);

// Map Tiles (OpenStreetMap) - Cache First
registerRoute(
  ({ url }) => url.href.includes('tile.openstreetmap.org'),
  new CacheFirst({
    cacheName: 'map-tiles',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 500,
        maxAgeSeconds: 60 * 60 * 24 * 365, // 1 Year
      }),
    ],
  })
);

// Fonts (Google Fonts) - Cache First
registerRoute(
  ({ url }) => url.origin === 'https://fonts.googleapis.com' || url.origin === 'https://fonts.gstatic.com',
  new CacheFirst({
    cacheName: 'google-fonts',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 30,
        maxAgeSeconds: 60 * 60 * 24 * 365, // 1 Year
      }),
    ],
  })
);

// 5. Offline Fallback for Navigation
const navigationRoute = new NavigationRoute(
  new NetworkOnly(), 
  {
    denylist: [
      new RegExp('/api/.*'),
    ]
  }
);

registerRoute(
  ({ request }) => request.mode === 'navigate',
  async (args) => {
    try {
      return await new NetworkOnly().handle(args);
    } catch (error) {
      return caches.match('/offline.html') as Promise<Response>;
    }
  }
);

// 6. Push Notifications
self.addEventListener('push', (event) => {
  const data = event.data?.json() ?? {};
  const title = data.title || 'Mawaqit Neon';
  const options = {
    body: data.body || 'New Notification',
    icon: '/pwa-192x192.png',
    badge: '/pwa-192x192.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/'
    }
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      if (clientList.length > 0) {
        let client = clientList[0];
        if ('focus' in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(event.notification.data.url);
      }
    })
  );
});
