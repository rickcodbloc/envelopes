// v70: Seletores de texto com indicador curto e arraste em Análise Visual e Visão mensal.
// v69: Refinamento do destaque dos envelopes, com entrada suave, breve permanência e saída gradual.
// v66: Raio compartilhado dos botões superiores quadrados de 44px.
// v65: Alterada regra do respiro e quebra organizada das referências na Projeção para não restringir ao celular.
// v64: Rótulos temporais neutros no Histórico mensal.
// v63: Mais respiro e quebra organizada das referências na Projeção móvel.
// v62: Refinamentos visuais por contexto e identificação dos parcelamentos no Histórico mensal.
// v61: Harmonia visual das telas internas, com áreas de toque e moldura responsiva do Consolidado.
// v60: Consolidado com resumo do mês, orçamento dos envelopes e análises contextualizadas.
// v59: Lupa consulta todos os períodos; recolher a busca restaura o período anterior.
// v58: Recorrência de despesas fixas por mês de referência, com histórico e backups preservados.
// v57: Busca local nos históricos de envelopes e avulsos, com períodos e ações preservados.
// v56: Organização de parcelamentos por banco e despesas, com rascunho e controles compartilhados.
// v55: Refinamentos visuais do Histórico mensal, seletor de envelope e nomes da Projeção.
// v54: Mantém retenção de 12 meses e legenda refinada; restaura a abertura e a navegação originais.
const CACHE_NAME = 'envelopes-cache-v70';

const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './apple-touch-icon.png',
  './icon-192.png'
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