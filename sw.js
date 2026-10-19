const CACHE_NAME = 'envelopes-cache-v7';

const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  'apple-touch-icon.png'
];

// Instalação: armazena os recursos essenciais do aplicativo.
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS_TO_CACHE))
      .then(() => self.skipWaiting())
  );
});

// Ativação: remove somente versões antigas do cache deste projeto.
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(cacheNames => Promise.all(
        cacheNames.map(cache => {
          if (
            cache.startsWith('envelopes-cache-') &&
            cache !== CACHE_NAME
          ) {
            return caches.delete(cache);
          }
        })
      ))
      .then(() => self.clients.claim())
  );
});

// Interceptação: consulta somente o cache deste aplicativo.
// Utiliza o cache quando disponível e a rede como alternativa.
self.addEventListener('fetch', event => {
  const request = event.request;

  // Não intercepta requisições que não sejam GET.
  if (request.method !== 'GET') return;

  // Não interfere em requisições para outros domínios.
  const requestUrl = new URL(request.url);
  if (requestUrl.origin !== self.location.origin) return;

  event.respondWith(
    caches.open(CACHE_NAME)
      .then(cache => cache.match(request))
      .then(response => response || fetch(request))
  );
});