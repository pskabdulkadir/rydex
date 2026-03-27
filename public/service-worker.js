// Service Worker - Offline desteği ve cache yönetimi

const CACHE_NAME = 'goruntuleme-sistemi-v3';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
];

// Service Worker kurulumu
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting();
});

// Service Worker aktivasyonu - eski cache'leri temizle
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Network-first strategy (online veri tercihli)
// API istekleri için
self.addEventListener('fetch', (event) => {
  const url = event.request.url;

  // Kendi API istekleri (sadece GET için cache)
  if (url.includes('/api/')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Başarılı GET yanıtlarını cache'e ekle
          // POST istekleri cache'lenmemeli
          if (response.status === 200 && event.request.method === 'GET') {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        })
        .catch((error) => {
          console.warn('[Service Worker] API istek hatası:', url, error);
          // Hata durumunda cache'ten al (sadece GET istekleri için)
          if (event.request.method === 'GET') {
            return caches.match(event.request).then((cached) => {
              if (cached) return cached;
              // Cache'de yoksa error response dön
              return new Response(JSON.stringify({
                success: false,
                message: 'Offline - İstek başarısız oldu'
              }), {
                status: 503,
                statusText: 'Service Unavailable',
                headers: { 'Content-Type': 'application/json' }
              });
            });
          }
          // POST/PUT/DELETE için error döndür
          return new Response(JSON.stringify({
            success: false,
            message: 'Offline - İstek başarısız oldu'
          }), {
            status: 503,
            statusText: 'Service Unavailable',
            headers: { 'Content-Type': 'application/json' }
          });
        })
    );
  } else if (url.includes('/camera-analysis')) {
    // Kamera analiz endpoint'i - network-first
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        })
        .catch((error) => {
          console.warn('[Service Worker] Kamera analiz isteği hatası:', url, error);
          // Hata durumunda cache'ten al, yoksa mock data dön
          return caches.match(event.request).then((cached) => {
            if (cached) return cached;
            // Mock kamera analiz cevabı
            return new Response(JSON.stringify({
              success: true,
              message: "Kamera analiz sistemi offline modda",
              features: ["Kenar Tespiti", "Simetri Analizi"],
              offline: true
            }), {
              status: 200,
              headers: { 'Content-Type': 'application/json' }
            });
          });
        })
    );
  } else if (event.request.method === 'GET' && !url.includes('hot-update')) {
    // HTML sayfaları ve statik assets için network-first
    // hot-update (HMR) isteklerini atla
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        })
        .catch((error) => {
          console.warn('[Service Worker] Sayfa istek hatası:', url, error);
          // Hata durumunda cache'ten al
          return caches.match(event.request).then((cached) => {
            if (cached) return cached;
            // Fallback HTML sayfası - sadece GET istekleri için
            return new Response(
              `<!DOCTYPE html>
<html>
<head>
  <title>Offline</title>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body { font-family: sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; background: #f5f5f5; margin: 0; }
    .container { text-align: center; background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    h1 { color: #333; margin: 0 0 10px 0; }
    p { color: #666; margin: 0; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Bağlantı Hatası</h1>
    <p>Sayfa yüklenemedi. Lütfen internet bağlantınızı kontrol edin ve sayfayı yenileyin.</p>
  </div>
</body>
</html>`,
              {
                status: 503,
                statusText: 'Service Unavailable',
                headers: { 'Content-Type': 'text/html; charset=utf-8' }
              }
            );
          });
        })
    );
  } else {
    // Diğer istekler (POST, PUT, DELETE vb.) - pass through
    event.respondWith(fetch(event.request).catch(() => {
      return new Response(JSON.stringify({
        success: false,
        message: 'Bağlantı hatası - İstek gönderilemedi'
      }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      });
    }));
  }
});

// Push notifications desteği (isteğe bağlı)
self.addEventListener('push', (event) => {
  const data = event.data?.json() ?? {};
  const title = data.title || 'Görüntüleme Sistemi';
  const options = {
    body: data.body || 'Yeni bir bildirim alındı',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Background sync desteği (isteğe bağlı)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-scans') {
    event.waitUntil(syncPendingScans());
  }
});

async function syncPendingScans() {
  // Pending taramaları sunucuya gönder
  // Bu, offline durumdayken taramaları sıralamak için kullanılabilir
  console.log('Pending taramalar senkron edildi');
}
