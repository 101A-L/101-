/* تطبيق 101 استراتيجية — Offline-first application shell v9 */
'use strict';
const CACHE_NAME = 'al101-app-shell-v9';
const CACHE_PREFIX = 'al101-app-shell-';
const APP_FILES = [
  './', './index.html', './style.css', './app.js', './visuals.js',
  './data.js', './manifest.webmanifest', './booklet.html',
  './icons/icon-192.png', './icons/icon-512.png',
  './icons/icon-maskable-512.png', './icons/apple-touch-icon.png'
];
self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(APP_FILES);
    await self.skipWaiting();
  })());
});
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME).map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});
self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (request.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const response = await fetch(request);
        if (response.ok) {
          const copy = response.clone();
          event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.put(request, copy)));
        }
        return response;
      } catch (error) {
        const cached = await caches.match(request);
        if (cached) return cached;
        const fallback = await caches.match('./index.html');
        return fallback || Response.error();
      }
    })());
    return;
  }
  event.respondWith((async () => {
    const cached = await caches.match(request);
    if (cached) return cached;
    try {
      const response = await fetch(request);
      if (response.ok) {
        const clone = response.clone();
        event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.put(request, clone)));
      }
      return response;
    } catch {
      return Response.error();
    }
  })());
});
