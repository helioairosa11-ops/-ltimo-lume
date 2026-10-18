// Guarda o jogo no aparelho para funcionar offline depois da primeira visita.
const CACHE = 'ultimo-lume-v2';
const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
  './icons/apple-touch-icon.png',
  './audio/m/title.mp3',
  './audio/s/bdie.mp3',
  './audio/s/bgrunt.mp3',
  './audio/s/bow.mp3',
  './audio/s/bpain.mp3',
  './audio/s/breath.mp3',
  './audio/s/burn.mp3',
  './audio/s/cavewind.mp3',
  './audio/s/crumble.mp3',
  './audio/s/crunch.mp3',
  './audio/s/die.mp3',
  './audio/s/drops.mp3',
  './audio/s/echo1.mp3',
  './audio/s/echo2.mp3',
  './audio/s/echo3.mp3',
  './audio/s/echo4.mp3',
  './audio/s/fdie.mp3',
  './audio/s/fhurt.mp3',
  './audio/s/fire.mp3',
  './audio/s/fireball.mp3',
  './audio/s/fireloop.mp3',
  './audio/s/grunt.mp3',
  './audio/s/heal.mp3',
  './audio/s/heart.mp3',
  './audio/s/hurt.mp3',
  './audio/s/levelup.mp3',
  './audio/s/moan.mp3',
  './audio/s/owl.mp3',
  './audio/s/quake.mp3',
  './audio/s/raven.mp3',
  './audio/s/river.mp3',
  './audio/s/shock.mp3',
  './audio/s/snarl.mp3',
  './audio/s/step1.mp3',
  './audio/s/step2.mp3',
  './audio/s/step3.mp3',
  './audio/s/step4.mp3',
  './audio/s/stone.mp3',
  './audio/s/swing1.mp3',
  './audio/s/swing2.mp3',
  './audio/s/swing3.mp3',
  './audio/s/tele.mp3',
  './audio/s/thunder.mp3',
  './audio/s/warcry.mp3',
  './audio/s/wind.mp3',
  './audio/s/yelp.mp3'
];
// As outras músicas são guardadas na primeira vez que tocam.

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  const sameOrigin = url.origin === location.origin;
  const isFont = /fonts\.(googleapis|gstatic)\.com$/.test(url.hostname);
  if (!sameOrigin && !isFont) return;

  // Página: tenta a rede primeiro (pega atualizações), cai para o cache se estiver offline.
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put('./index.html', copy));
          return res;
        })
        .catch(() => caches.match('./index.html'))
    );
    return;
  }

  // Ícones e fontes: cache primeiro.
  e.respondWith(
    caches.match(e.request).then(
      (hit) =>
        hit ||
        fetch(e.request).then((res) => {
          if (res.ok) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(e.request, copy));
          }
          return res;
        })
    )
  );
});
