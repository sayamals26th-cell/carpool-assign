const CACHE_NAME = 'carpool-assign-shell-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/apple-touch-icon.png',
  './icons/favicon.ico'
];

self.addEventListener('install', (event)=>{
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache)=> cache.addAll(ASSETS))
      .then(()=> self.skipWaiting())
  );
});

self.addEventListener('activate', (event)=>{
  event.waitUntil(
    caches.keys()
      .then((keys)=> Promise.all(keys.filter(k=> k!==CACHE_NAME).map(k=> caches.delete(k))))
      .then(()=> self.clients.claim())
  );
});

// 同一オリジンのGETリクエストのみキャッシュ対象にする。
// Firebase（別オリジン）やフォントは素通しし、リアルタイム通信を邪魔しない。
self.addEventListener('fetch', (event)=>{
  const url = new URL(event.request.url);
  if(url.origin !== self.location.origin) return;
  if(event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then((res)=>{
        const resClone = res.clone();
        caches.open(CACHE_NAME).then((cache)=> cache.put(event.request, resClone));
        return res;
      })
      .catch(()=> caches.match(event.request).then((cached)=> cached || caches.match('./index.html')))
  );
});
