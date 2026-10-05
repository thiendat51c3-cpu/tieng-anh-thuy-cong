var V="atc-v1";
var CORE=["./","index.html","manifest.webmanifest","icon-64.png","icon-180.png","icon-512.png"];
self.addEventListener("install",function(e){e.waitUntil(caches.open(V).then(function(c){return c.addAll(CORE);}).then(function(){return self.skipWaiting();}));});
self.addEventListener("activate",function(e){e.waitUntil(caches.keys().then(function(k){return Promise.all(k.filter(function(x){return x!==V;}).map(function(x){return caches.delete(x);}));}).then(function(){return self.clients.claim();}));});
self.addEventListener("fetch",function(e){
  var r=e.request; if(r.method!=="GET")return;
  var u=new URL(r.url);
  if(/\.mp3$/.test(u.pathname)){return;} /* âm thanh: để trình duyệt tự tải, hỗ trợ tua */
  e.respondWith(caches.match(r).then(function(hit){
    var net=fetch(r).then(function(res){ if(res&&res.ok&&(u.origin===location.origin||/fonts\.(googleapis|gstatic)/.test(u.host))){var cp=res.clone();caches.open(V).then(function(c){c.put(r,cp);});} return res;}).catch(function(){return hit;});
    return hit||net;
  }));
});
