const CACHE='wardrobe-v3';
const ASSETS=['.','./index.html','./manifest.webmanifest','./icon.svg','./icon-192.png','./icon-512.png','./icon-180.png'];
self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  const same=new URL(e.request.url).origin===location.origin;
  e.respondWith(
    caches.match(e.request).then(hit=>{
      if(hit)return hit;
      return fetch(e.request).then(resp=>{
        if(resp.ok&&same){const cp=resp.clone();caches.open(CACHE).then(c=>c.put(e.request,cp)).catch(()=>{})}
        return resp;
      }).catch(()=>same?caches.match('./index.html'):Response.error());
    })
  );
});
