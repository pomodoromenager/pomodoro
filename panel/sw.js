// Minimalny service worker: pozwala zainstalować aplikację i pokazuje ekran startowy bez internetu.
// Dane rozliczeń NIE są tu przechowywane – wszystko idzie prosto do Google Apps Script.
const CACHE = 'pomodoro-panel-v5';
const PLIKI = ['./', 'index.html', 'manifest.json', '../adres.js', '../ikony/panel-192.png', '../ikony/panel-512.png', '../ikony/panel-ekran.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(PLIKI)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(k => Promise.all(k.filter(n => n.startsWith('pomodoro-panel-') && n !== CACHE).map(n => caches.delete(n))))
    .then(() => self.clients.claim()));
});
// najpierw sieć (zawsze aktualne pliki), a bez internetu – kopia
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== self.location.origin) return;
  e.respondWith(fetch(e.request).then(r => {
    const kopia = r.clone(); caches.open(CACHE).then(c => c.put(e.request, kopia)); return r;
  }).catch(() => caches.match(e.request, { ignoreSearch: true }).then(r => r || caches.match('index.html'))));
});
