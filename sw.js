const CACHE='wardrobe-v10';
const ASSETS=['.','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png','./icon-180.png'];
self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  const url=new URL(e.request.url);
  if(url.origin!==location.origin)return; // 跨域（如字体）走默认网络
  // 页面导航：网络优先，保证每次打开都是最新 HTML；离线时回退缓存
  if(e.request.mode==='navigate'){
    e.respondWith(
      fetch(e.request).then(resp=>{
        const cp=resp.clone();
        caches.open(CACHE).then(c=>c.put(e.request,cp)).catch(()=>{});
        return resp;
      }).catch(()=>caches.match(e.request).then(h=>h||caches.match('./index.html')))
    );
    return;
  }
  // 同域静态资源：缓存优先，离线可用
  e.respondWith(
    caches.match(e.request).then(hit=>{
      if(hit)return hit;
      return fetch(e.request).then(resp=>{
        if(resp.ok){const cp=resp.clone();caches.open(CACHE).then(c=>c.put(e.request,cp)).catch(()=>{});}
        return resp;
      }).catch(()=>Response.error());
    })
  );
});
