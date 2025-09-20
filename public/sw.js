// Service Worker for Grocery PWA Platform
// Provides offline caching, background sync, and push notifications

const CACHE_NAME = 'grocery-pwa-v1'
const OFFLINE_URL = '/offline'

// Files to cache immediately
const ESSENTIAL_FILES = [
  '/',
  '/offline',
  '/manifest.json',
  '/_next/static/css/app.css',
  '/images/icon-192x192.png',
  '/images/icon-512x512.png',
]

// Cache strategies
const CACHE_STRATEGIES = {
  // Cache first for static assets
  CACHE_FIRST: [
    /\/_next\/static\/.*/,
    /\.(?:js|css|woff2|png|jpg|jpeg|gif|svg|ico)$/,
    /\/images\/.*/,
  ],

  // Network first for API calls and dynamic content
  NETWORK_FIRST: [
    /\/api\/.*/,
    /\/stores\/.*\/products/,
    /\/stores\/.*\/orders/,
    /\/stores\/.*\/cart/,
  ],

  // Stale while revalidate for pages
  STALE_WHILE_REVALIDATE: [
    /\/stores\/.*\/$/,
    /\/stores\/.*\/category\/.*/,
    /\/stores\/.*\/product\/.*/,
  ],
}

// Install event - cache essential files
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...')

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Caching essential files')
        return cache.addAll(ESSENTIAL_FILES)
      })
      .then(() => {
        console.log('Service Worker installed successfully')
        return self.skipWaiting()
      })
      .catch((error) => {
        console.error('Service Worker installation failed:', error)
      })
  )
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...')

  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('Deleting old cache:', cacheName)
              return caches.delete(cacheName)
            }
          })
        )
      })
      .then(() => {
        console.log('Service Worker activated')
        return self.clients.claim()
      })
  )
})

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET requests and chrome-extension requests
  if (request.method !== 'GET' || url.protocol === 'chrome-extension:') {
    return
  }

  // Handle different routes with appropriate strategies
  if (shouldUseCacheFirst(request.url)) {
    event.respondWith(cacheFirst(request))
  } else if (shouldUseNetworkFirst(request.url)) {
    event.respondWith(networkFirst(request))
  } else if (shouldUseStaleWhileRevalidate(request.url)) {
    event.respondWith(staleWhileRevalidate(request))
  } else {
    // Default to network first for everything else
    event.respondWith(networkFirst(request))
  }
})

// Cache first strategy - for static assets
async function cacheFirst(request) {
  try {
    const cache = await caches.open(CACHE_NAME)
    const cachedResponse = await cache.match(request)

    if (cachedResponse) {
      return cachedResponse
    }

    const networkResponse = await fetch(request)

    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone())
    }

    return networkResponse
  } catch (error) {
    console.error('Cache first strategy failed:', error)

    // Try to return cached version as fallback
    const cache = await caches.open(CACHE_NAME)
    const cachedResponse = await cache.match(request)

    if (cachedResponse) {
      return cachedResponse
    }

    // Return offline page for navigation requests
    if (request.destination === 'document') {
      return caches.match(OFFLINE_URL)
    }

    throw error
  }
}

// Network first strategy - for API calls and dynamic content
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request)

    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME)
      cache.put(request, networkResponse.clone())
    }

    return networkResponse
  } catch (error) {
    console.error('Network first strategy failed:', error)

    const cache = await caches.open(CACHE_NAME)
    const cachedResponse = await cache.match(request)

    if (cachedResponse) {
      return cachedResponse
    }

    // Return offline page for navigation requests
    if (request.destination === 'document') {
      return caches.match(OFFLINE_URL)
    }

    throw error
  }
}

// Stale while revalidate strategy - for pages
async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME)
  const cachedResponse = await cache.match(request)

  // Always try to fetch from network in background
  const networkPromise = fetch(request)
    .then((networkResponse) => {
      if (networkResponse.ok) {
        cache.put(request, networkResponse.clone())
      }
      return networkResponse
    })
    .catch((error) => {
      console.error('Background fetch failed:', error)
    })

  // Return cached response immediately if available
  if (cachedResponse) {
    // Don't await the network promise, let it run in background
    networkPromise
    return cachedResponse
  }

  // If no cache, wait for network
  try {
    return await networkPromise
  } catch (error) {
    // Return offline page for navigation requests
    if (request.destination === 'document') {
      return caches.match(OFFLINE_URL)
    }
    throw error
  }
}

// Helper functions to determine strategy
function shouldUseCacheFirst(url) {
  return CACHE_STRATEGIES.CACHE_FIRST.some(pattern => pattern.test(url))
}

function shouldUseNetworkFirst(url) {
  return CACHE_STRATEGIES.NETWORK_FIRST.some(pattern => pattern.test(url))
}

function shouldUseStaleWhileRevalidate(url) {
  return CACHE_STRATEGIES.STALE_WHILE_REVALIDATE.some(pattern => pattern.test(url))
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('Background sync triggered:', event.tag)

  if (event.tag === 'cart-sync') {
    event.waitUntil(syncCartData())
  } else if (event.tag === 'order-sync') {
    event.waitUntil(syncOrderData())
  }
})

// Sync cart data when connection is restored
async function syncCartData() {
  try {
    // Get pending cart actions from IndexedDB
    const pendingActions = await getPendingCartActions()

    for (const action of pendingActions) {
      try {
        await fetch('/api/cart', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(action),
        })

        // Remove from pending actions after successful sync
        await removePendingCartAction(action.id)
      } catch (error) {
        console.error('Failed to sync cart action:', error)
      }
    }
  } catch (error) {
    console.error('Cart sync failed:', error)
  }
}

// Sync order data when connection is restored
async function syncOrderData() {
  try {
    // Implementation for syncing order data
    console.log('Syncing order data...')
    // This would sync any pending order submissions
  } catch (error) {
    console.error('Order sync failed:', error)
  }
}

// Push notification handler
self.addEventListener('push', (event) => {
  console.log('Push message received:', event)

  const options = {
    body: event.data ? event.data.text() : 'New notification',
    icon: '/images/icon-192x192.png',
    badge: '/images/icon-192x192.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1,
    },
    actions: [
      {
        action: 'explore',
        title: 'View Details',
        icon: '/images/checkmark.png',
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/images/xmark.png',
      },
    ],
  }

  event.waitUntil(
    self.registration.showNotification('Grocery PWA', options)
  )
})

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event)

  event.notification.close()

  if (event.action === 'explore') {
    // Open the app
    event.waitUntil(
      clients.openWindow('/')
    )
  }
})

// Helper functions for IndexedDB operations
async function getPendingCartActions() {
  // Implementation would use IndexedDB to store offline actions
  return []
}

async function removePendingCartAction(actionId) {
  // Implementation would remove action from IndexedDB
  console.log('Removing pending cart action:', actionId)
}

// Handle service worker updates
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})

console.log('Service Worker script loaded')