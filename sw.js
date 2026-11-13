// sw.js - Service worker de Súper Barrio (hace que la app funcione sin internet)

// Versión de la caché: si cambiás los archivos de la app, cambiá este valor (ej: "v2")
const VERSION = "v1";

// Prefijo común de las cachés de esta app (sirve para no tocar cachés de otras apps)
const PREFIJO_CACHE = "super-barrio-";

// Nombre completo de la caché de esta versión (ej: "super-barrio-v1")
const NOMBRE_CACHE = PREFIJO_CACHE + VERSION;

// Lista de archivos que se guardan para usar sin conexión
const ARCHIVOS = [
  "./",
  "./index.html",
  "./styles.css",
  "./app.js",
  "./manifest.json",
  "./icono-192.png",
  "./icono-512.png"
];

// INSTALL: ocurre una sola vez, cuando el navegador descarga esta versión del service worker
self.addEventListener("install", function (evento) {
  // waitUntil hace que la instalación espere hasta terminar de guardar todo
  evento.waitUntil(
    // Abre (o crea) la caché de esta versión
    caches.open(NOMBRE_CACHE).then(function (cache) {
      // Descarga y guarda todos los archivos de la lista
      return cache.addAll(ARCHIVOS);
    })
  );
});

// ACTIVATE: ocurre cuando esta versión empieza a funcionar (después de instalarse)
self.addEventListener("activate", function (evento) {
  // waitUntil hace que la activación espere hasta terminar la limpieza
  evento.waitUntil(
    // Pide los nombres de todas las cachés que hay guardadas
    caches.keys().then(function (nombres) {
      // Espera a que se terminen de borrar todas las cachés viejas
      return Promise.all(
        nombres
          // Se queda solo con las cachés de esta app que no son la versión actual
          .filter(function (nombre) {
            return nombre.startsWith(PREFIJO_CACHE) && nombre !== NOMBRE_CACHE;
          })
          // Borra cada una de esas cachés viejas
          .map(function (nombre) {
            return caches.delete(nombre);
          })
      );
    })
  );
});

// FETCH: ocurre cada vez que la página pide un archivo (estrategia "primero la caché")
self.addEventListener("fetch", function (evento) {
  // respondWith nos deja elegir con qué responder al pedido
  evento.respondWith(
    // Busca el archivo pedido en las cachés guardadas
    caches.match(evento.request).then(function (copiaGuardada) {
      // Si hay copia guardada la usa; si no, lo busca en internet
      return copiaGuardada || fetch(evento.request);
    })
  );
});
