var V = "atc-v4", A = "atc-audio";
var CORE = ["./", "index.html", "manifest.webmanifest", "icon-64.png", "icon-180.png", "icon-512.png"];
self.addEventListener("install", function (e) { e.waitUntil(caches.open(V).then(function (c) { return c.addAll(CORE); }).then(function () { return self.skipWaiting(); })); });
self.addEventListener("activate", function (e) { e.waitUntil(caches.keys().then(function (k) { return Promise.all(k.filter(function (x) { return x !== V && x !== A; }).map(function (x) { return caches.delete(x); })); }).then(function () { return self.clients.claim(); })); });
function audioResp(r) {
  return caches.open(A).then(function (c) { return c.match(r.url); }).then(function (hit) {
    if (!hit) return fetch(r);
    var rg = r.headers.get("range");
    return hit.blob().then(function (b) {
      var size = b.size, type = "audio/mpeg";
      if (!rg) return new Response(b, { status: 200, headers: { "Content-Type": type, "Content-Length": String(size), "Accept-Ranges": "bytes" } });
      var m = /bytes=(\d*)-(\d*)/.exec(rg), a = m[1] ? parseInt(m[1], 10) : 0, z = m[2] ? parseInt(m[2], 10) : size - 1;
      if (z >= size) z = size - 1;
      return new Response(b.slice(a, z + 1), { status: 206, headers: { "Content-Type": type, "Content-Range": "bytes " + a + "-" + z + "/" + size, "Content-Length": String(z - a + 1), "Accept-Ranges": "bytes" } });
    });
  });
}
self.addEventListener("fetch", function (e) {
  var r = e.request; if (r.method !== "GET") return;
  var u = new URL(r.url);
  if (/\.mp3$/.test(u.pathname)) { e.respondWith(audioResp(r)); return; }
  var isDoc = r.mode === "navigate" || /\/(index\.html)?$/.test(u.pathname);
  if (isDoc) {
    e.respondWith(fetch(r, { cache: "no-cache" }).then(function (res) { var cp = res.clone(); caches.open(V).then(function (c) { c.put(r, cp); }); return res; }).catch(function () { return caches.match(r).then(function (h) { return h || caches.match("index.html"); }); }));
    return;
  }
  e.respondWith(caches.match(r).then(function (hit) {
    var net = fetch(r).then(function (res) { if (res && res.ok && (u.origin === location.origin || /fonts\.(googleapis|gstatic)/.test(u.host))) { var cp = res.clone(); caches.open(V).then(function (c) { c.put(r, cp); }); } return res; }).catch(function () { return hit; });
    return hit || net;
  }));
});
