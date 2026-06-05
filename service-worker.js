const CACHE_NAME = 'calma-tu-estres-cache-v5'; // Cambia la versión si modificas los assets
const urlsToCache = [
  '/', // La página principal
  '/index.html', // Asegúrate de que el index.html está en caché
  '/styles.css', // Tu archivo de estilos si lo tienes externo
  '/main.js', // Tu script principal si lo tienes externo
  '/firebase-config.js', // Si tienes la configuración de Firebase en un archivo separado
  '/favicon.png', // Tu favicon
  '/manifest.webmanifest', // El manifiesto de la PWA
  '/logo.png', // Tu logo de la splash screen
  '/assets/images/apple-touch-icon.png', // Tu icono de Apple
  // Añade aquí todas las rutas a tus iconos para el manifiesto:
  '/assets/icons/icon-72x72.png',
  '/assets/icons/icon-96x96.png',
  '/assets/icons/icon-128x128.png',
  '/assets/icons/icon-144x144.png',
  '/assets/icons/icon-152x152.png',
  '/assets/icons/icon-192x192.png',
  '/assets/icons/icon-384x384.png',
  '/assets/icons/icon-512x512.png',
  // ¡IMPORTANTE! Añade aquí cualquier otro archivo estático (imágenes, fuentes, otros JS/CSS) que tu aplicación necesite para funcionar sin conexión.
];

// Instalación del Service Worker: cachea todos los assets
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        // Agrega solo los assets críticos para la app shell
        return cache.addAll(urlsToCache).then(() => {
            console.log('Assets added to cache.');
        }).catch(err => {
            console.error('Failed to add assets to cache:', err);
            // Si algún asset falla, puedes decidir si abortar la instalación o continuar
        });
      })
      .catch((error) => {
        console.error('Cache open failed:', error);
      })
  );
});

// Activación del Service Worker: limpia cachés antiguas
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Asegura que el service worker toma el control de las páginas existentes inmediatamente
  event.waitUntil(self.clients.claim());
});

// Fetch del Service Worker: sirve desde la caché o va a la red
self.addEventListener('fetch', (event) => {
  // Estrategia Cache-First para los assets estáticos
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Devuelve la respuesta desde la caché si está disponible
        if (response) {
          return response;
        }
        // Si no está en caché, va a la red
        return fetch(event.request);
      })
      .catch((error) => {
        console.error('Fetch failed:', error);
        // Puedes devolver una página offline personalizada aquí si lo deseas
        // Por ejemplo: return caches.match('/offline.html');
      })
  );
});
