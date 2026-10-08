// Atomic app-shell cache. Activate only on request, or after old windows close.
const PREFIX='frm-shell-'+self.registration.scope;
const CACHE=PREFIX+'1.38.0';
const ASSETS=["./assets/city-category-0.svg","./assets/city-category-1.svg","./assets/city-category-2.svg","./assets/city-category-3.svg","./assets/city-category-4.svg","./assets/city-category-5.svg","./assets/city-category-6.svg","./assets/city-category-7.svg","./assets/city-category-8.svg","./assets/city-category-9.svg","./assets/city-category-10.svg","./assets/city-category-11.svg","./assets/ui/people.svg","./assets/Cave.svg","./assets/Camp.svg","./index.html", "./manifest.webmanifest", "./RULES_AUDIT.md", "./assets/Landmark.png", "./assets/Custom.png", "./assets/Town.png", "./assets/City.png", "./assets/Ruin.png", "./assets/Inn.png", "./assets/Party.png", "./assets/app-512.png", "./assets/logo.png", "./assets/Encounter.png", "./assets/Stronghold.png", "./assets/Village.png", "./assets/app-192.png", "./assets/Dungeon.png", "./assets/app-180.png", "./assets/ui/point.svg", "./assets/ui/list.svg", "./assets/ui/target.svg", "./assets/ui/home.svg", "./assets/ui/map.svg", "./assets/ui/move.svg", "./assets/ui/pen.svg", "./assets/ui/settings.svg", "./assets/ui/download.svg", "./assets/ui/plus.svg", "./assets/ui/close.svg", "./assets/ui/copy.svg", "./assets/ui/image.svg", "./assets/ui/save.svg", "./assets/ui/trash.svg", "./assets/ui/undo.svg", "./assets/ui/route.svg", "./assets/ui/mountain.svg", "./assets/ui/upload.svg", "./css/app.css", "./js/road-routing.js", "./js/export.js", "./js/terrain.js", "./js/harptos.js", "./js/travel.js", "./js/init.js", "./js/routes.js", "./js/locations.js", "./js/map.js", "./js/app.js", "./js/storage.js", "./css/app.css?v=1.38.0", "./js/app.js?v=1.38.0", "./js/road-routing.js?v=1.38.0", "./js/terrain.js?v=1.38.0", "./js/storage.js?v=1.38.0", "./js/map.js?v=1.38.0", "./js/routes.js?v=1.38.0", "./js/locations.js?v=1.38.0", "./js/travel.js?v=1.38.0", "./js/harptos.js?v=1.38.0", "./js/export.js?v=1.38.0", "./js/init.js?v=1.38.0"];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS.map(url=>new Request(url,{cache:"reload"}))))));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith(PREFIX)&&key!==CACHE).map(key=>caches.delete(key))))));
self.addEventListener('fetch',event=>{
 if(event.request.method!=='GET')return;
 const url=new URL(event.request.url),base=new URL(self.registration.scope);
 if(url.origin!==base.origin||!url.pathname.startsWith(base.pathname))return;
 const relative=url.pathname.slice(base.pathname.length);
 const navigation=event.request.mode==='navigate'&&(relative===''||relative==='index.html');
 if(!navigation&&!ASSETS.some(asset=>new URL(asset,self.registration.scope).href===url.href))return;
 event.respondWith(caches.open(CACHE).then(async cache=>{
  const cached=await cache.match(navigation?new URL('index.html',self.registration.scope).href:event.request);
  return cached||fetch(event.request);
 }));
});

self.addEventListener('message',event=>{
 if(event.data?.type!=='FRM_APPLY_UPDATE'||!event.ports[0])return;
 event.waitUntil((async()=>{
  const windows=await self.clients.matchAll({type:'window',includeUncontrolled:true});
  const local=windows.filter(client=>client.url.startsWith(self.registration.scope));
  if(local.length>1){event.ports[0].postMessage({ok:false});return;}
  event.ports[0].postMessage({ok:true});
  await self.skipWaiting();
 })());
});
