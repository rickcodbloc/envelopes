// v53: Retenção de 12 meses em envelopes/avulsos, legenda, abertura leve e retorno por gesto.
const CACHE_NAME = 'envelopes-cache-v53';

const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './apple-touch-icon.png',
  './icon-192.png',
  // Imagens estáticas de abertura do iPhone, disponíveis também sem rede após preparar o cache.
  "./startup/iphone-320x568-2x-portrait-light.png",
  "./startup/iphone-320x568-2x-portrait-dark.png",
  "./startup/iphone-320x568-2x-landscape-light.png",
  "./startup/iphone-320x568-2x-landscape-dark.png",
  "./startup/iphone-375x667-2x-portrait-light.png",
  "./startup/iphone-375x667-2x-portrait-dark.png",
  "./startup/iphone-375x667-2x-landscape-light.png",
  "./startup/iphone-375x667-2x-landscape-dark.png",
  "./startup/iphone-414x736-3x-portrait-light.png",
  "./startup/iphone-414x736-3x-portrait-dark.png",
  "./startup/iphone-414x736-3x-landscape-light.png",
  "./startup/iphone-414x736-3x-landscape-dark.png",
  "./startup/iphone-375x812-3x-portrait-light.png",
  "./startup/iphone-375x812-3x-portrait-dark.png",
  "./startup/iphone-375x812-3x-landscape-light.png",
  "./startup/iphone-375x812-3x-landscape-dark.png",
  "./startup/iphone-390x844-3x-portrait-light.png",
  "./startup/iphone-390x844-3x-portrait-dark.png",
  "./startup/iphone-390x844-3x-landscape-light.png",
  "./startup/iphone-390x844-3x-landscape-dark.png",
  "./startup/iphone-393x852-3x-portrait-light.png",
  "./startup/iphone-393x852-3x-portrait-dark.png",
  "./startup/iphone-393x852-3x-landscape-light.png",
  "./startup/iphone-393x852-3x-landscape-dark.png",
  "./startup/iphone-402x874-3x-portrait-light.png",
  "./startup/iphone-402x874-3x-portrait-dark.png",
  "./startup/iphone-402x874-3x-landscape-light.png",
  "./startup/iphone-402x874-3x-landscape-dark.png",
  "./startup/iphone-414x896-2x-portrait-light.png",
  "./startup/iphone-414x896-2x-portrait-dark.png",
  "./startup/iphone-414x896-2x-landscape-light.png",
  "./startup/iphone-414x896-2x-landscape-dark.png",
  "./startup/iphone-414x896-3x-portrait-light.png",
  "./startup/iphone-414x896-3x-portrait-dark.png",
  "./startup/iphone-414x896-3x-landscape-light.png",
  "./startup/iphone-414x896-3x-landscape-dark.png",
  "./startup/iphone-428x926-3x-portrait-light.png",
  "./startup/iphone-428x926-3x-portrait-dark.png",
  "./startup/iphone-428x926-3x-landscape-light.png",
  "./startup/iphone-428x926-3x-landscape-dark.png",
  "./startup/iphone-430x932-3x-portrait-light.png",
  "./startup/iphone-430x932-3x-portrait-dark.png",
  "./startup/iphone-430x932-3x-landscape-light.png",
  "./startup/iphone-430x932-3x-landscape-dark.png",
  "./startup/iphone-440x956-3x-portrait-light.png",
  "./startup/iphone-440x956-3x-portrait-dark.png",
  "./startup/iphone-440x956-3x-landscape-light.png",
  "./startup/iphone-440x956-3x-landscape-dark.png",
  "./startup/iphone-420x912-3x-portrait-light.png",
  "./startup/iphone-420x912-3x-portrait-dark.png",
  "./startup/iphone-420x912-3x-landscape-light.png",
  "./startup/iphone-420x912-3x-landscape-dark.png"
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
// Usa o cache quando disponível e a rede como alternativa; se uma navegação falhar offline,
// entrega o index.html em cache para manter a SPA acessível.
self.addEventListener('fetch', event => {
  const request = event.request;

  // Não intercepta requisições que não sejam GET.
  if (request.method !== 'GET') return;

  // Não interfere em requisições para outros domínios.
  const requestUrl = new URL(request.url);
  if (requestUrl.origin !== self.location.origin) return;

  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      const cachedResponse = await cache.match(request);
      if (cachedResponse) return cachedResponse;

      try {
        return await fetch(request);
      } catch (error) {
        if (request.mode === 'navigate') {
          const appShell = await cache.match('./index.html')
            || await cache.match('./');

          if (appShell) return appShell;
        }

        throw error;
      }
    })()
  );
});