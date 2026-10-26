const V='boussole-shell-v2';
const SHELL=['./','./index.html','./manifest.json','./icon-192.png','./apple-touch-icon.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(SHELL)).catch(()=>{}).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x.startsWith('boussole-shell')&&x!==V).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
// Réseau d'abord (la dernière version s'affiche tout de suite), cache en secours hors ligne.
self.addEventListener('fetch',e=>{
  const u=new URL(e.request.url);
  if(e.request.method!=='GET'||u.origin!==location.origin)return;
  e.respondWith((async()=>{
    const c=await caches.open(V);
    try{
      const ac=new AbortController(),to=setTimeout(()=>ac.abort(),4000);
      const r=await fetch(e.request,{signal:ac.signal,cache:'no-cache'});clearTimeout(to);
      if(r.ok)c.put(e.request,r.clone());
      return r;
    }catch(err){
      const hit=await c.match(e.request,{ignoreSearch:true});
      if(hit)return hit;
      throw err;
    }
  })());
});
