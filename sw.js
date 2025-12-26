
const CACHE_NAME = 'elysium-v7';
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  'https://cdn.tailwindcss.com'
];

self.addEventListener('install', (event) => {
  console.log('Elysium SW: Installing...');
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Elysium SW: Activated.');
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((res) => res || fetch(event.request))
  );
});

// The core listener that catches the "Nepamiršk" signal
self.addEventListener('push', (event) => {
  console.log('Elysium SW: Received Push Signal.');
  let data = { 
    title: 'Elysium', 
    body: 'Nepamiršk, kad myliu tave.' 
  };

  if (event.data) {
    try {
      const payload = event.data.json();
      data.title = payload.title || data.title;
      data.body = payload.body || data.body;
    } catch (e) {
      data.body = event.data.text() || data.body;
    }
  }

  const options = {
    body: data.body,
    icon: 'https://images.unsplash.com/photo-1514306191717-452ec28c7814?q=80&w=192&h=192&auto=format&fit=crop',
    badge: 'https://images.unsplash.com/photo-1514306191717-452ec28c7814?q=80&w=96&h=96&auto=format&fit=crop',
    vibrate: [200, 100, 200],
    tag: 'daily-reminder',
    renotify: true,
    requireInteraction: true,
    data: { url: '/' }
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow('/'));
});
