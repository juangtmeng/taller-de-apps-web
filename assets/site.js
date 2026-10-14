/* Taller de Apps — comportamiento del sitio.
   1) Menú en celular.  2) Links de WhatsApp con mensaje prellenado.  3) Link de la demo.
   4) Link personalizado: el link que Juan le manda a un negocio saluda a ese negocio.
   5) Registro de visitas: una fila por visita en Airtable (vía /api/visita), sin cookies ni IP. */
(function () {
  // === Datos que se cambian en un solo lugar ===
  var WHATSAPP = "5493518508990"; // +54 9 351 850 8990, sin signos
  var DEMO_URL = "https://REEMPLAZAR-POR-LA-URL-DE-LA-DEMO"; // la orden digital publicada
  var REGISTRO_URL = "/api/visita"; // función de Cloudflare que anota la visita; vacía = no se envía nada

  // ---------------------------------------------------------------------------------------------
  // Link personalizado. Ejemplo:
  //   /talleres?para=Taller%20Ruta%2053&zona=R%C3%ADo%20Ceballos&c=recAbCdEfGhIjKlMn&m=2&origen=instagram
  // para = nombre del negocio · zona = localidad · c = id de la cuenta en Airtable
  // m = versión del mensaje con que se mandó · origen = por dónde se mandó (si no, WhatsApp)
  // Sin "para" (o con un valor raro) la página se ve igual que siempre.
  // ---------------------------------------------------------------------------------------------
  function limpiar(v, max) {
    if (!v) return "";
    v = String(v).replace(/[–—]/g, "-").replace(/[^0-9A-Za-zÀ-ÖØ-öø-ÿ .,&+'’°º()\/-]/g, "").replace(/\s+/g, " ").trim();
    return v.length >= 2 && v.length <= max ? v : "";
  }
  function corto(v) { return String(v || "").toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, 20); }
  function leer(clave) {
    try { return JSON.parse(sessionStorage.getItem(clave) || "null"); } catch (e) { return null; }
  }
  function guardar(clave, valor) {
    try { sessionStorage.setItem(clave, JSON.stringify(valor)); } catch (e) { /* sin guardado: no pasa nada */ }
  }
  function soyJuan() {
    try { return localStorage.getItem("tda-soy-juan") === "1"; } catch (e) { return false; }
  }
  var esRec = function (c) { return /^rec[A-Za-z0-9]{14}$/.test(c || ""); };

  var q = new URLSearchParams(location.search);
  // Juan marca su propio celular una vez con ?soy=juan (y lo desmarca con ?soy=otro):
  // así sus propias visitas no se anotan.
  try {
    if (q.get("soy") === "juan") localStorage.setItem("tda-soy-juan", "1");
    if (q.get("soy") === "otro") localStorage.removeItem("tda-soy-juan");
  } catch (e) { /* nada */ }

  var perso = null;
  var para = limpiar(q.get("para"), 80);
  if (para) {
    perso = { para: para, zona: limpiar(q.get("zona"), 40), c: esRec(q.get("c")) ? q.get("c") : "", m: corto(q.get("m")) };
    guardar("tda-para", perso); // para que el saludo siga si navega a otra página del sitio
  } else {
    var g = leer("tda-para");
    if (g && limpiar(g.para, 80)) perso = { para: limpiar(g.para, 80), zona: limpiar(g.zona, 40), c: esRec(g.c) ? g.c : "", m: corto(g.m) };
  }
  var registrar = !!REGISTRO_URL && !soyJuan();

  // Saludo arriba de todo (todo con textContent: lo que viene en el link nunca se interpreta como HTML)
  if (perso) {
    var band = document.createElement("div");
    band.className = "para-band";
    band.setAttribute("role", "note");
    var w = document.createElement("div");
    w.className = "wrap";
    var p = document.createElement("p");
    var b = document.createElement("strong");
    b.textContent = "Hola, " + perso.para + ".";
    p.appendChild(b);
    p.appendChild(document.createTextNode(
      " Esto es lo que te comentaba. La herramienta de ustedes se arma a medida, sobre cómo trabajan hoy" +
      (perso.zona ? ", ahí en " + perso.zona + "." : ".")));
    if (registrar && perso.c) {
      var s = document.createElement("small");
      s.textContent = " Este link me avisa cuando lo abren, así no te escribo de más.";
      p.appendChild(s);
    }
    w.appendChild(p);
    band.appendChild(w);
    var top = document.querySelector(".topbar");
    if (top && top.parentNode) top.parentNode.insertBefore(band, top.nextSibling);
  }

  // ---------------------------------------------------------------------------------------------
  // Registro de visitas. Una visita = esta pestaña mientras esté abierta (se guarda solo en la pestaña).
  // Se anota: de dónde llegó, qué páginas miró, si llegó al proceso dibujado y si tocó WhatsApp.
  // Nada de cookies, ni datos del celular, ni la dirección completa de donde vino (solo el sitio).
  // ---------------------------------------------------------------------------------------------
  function origenDeLaVisita() {
    if (perso) {
      var canal = corto(q.get("origen")) || "whatsapp";
      return ["Link personalizado", "mandado por " + canal + (perso.m ? " · mensaje " + perso.m : "")];
    }
    var o = corto(q.get("origen") || q.get("utm_source"));
    if (o) {
      if (/^(qr|volante|tarjeta|impreso|sticker|cartel)/.test(o)) return ["QR / impreso", o];
      if (/^(ig|instagram)/.test(o)) return ["Instagram", o];
      if (/^(fb|facebook)/.test(o)) return ["Facebook", o];
      if (/^linkedin/.test(o)) return ["LinkedIn", o];
      if (/^(google|maps|gmb)/.test(o)) return ["Google", o];
      if (/^(wa|whatsapp)/.test(o)) return ["WhatsApp", o];
      return ["Otro", o];
    }
    var host = "";
    try { host = document.referrer ? new URL(document.referrer).hostname : ""; } catch (e) { host = ""; }
    if (!host || host === location.hostname) return ["Directo", "sin dato de dónde vino"];
    if (/(^|\.)google\./.test(host)) return ["Google", host];
    if (/instagram\.com$/.test(host)) return ["Instagram", host];
    if (/(facebook\.com|fb\.com|fb\.me)$/.test(host)) return ["Facebook", host];
    if (/(linkedin\.com|lnkd\.in)$/.test(host)) return ["LinkedIn", host];
    if (/(whatsapp\.com|wa\.me)$/.test(host)) return ["WhatsApp", host];
    return ["Otro", host];
  }

  var visita = leer("tda-visita");
  if (!visita || !visita.id) {
    var o = origenDeLaVisita();
    var id = (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : (Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 12));
    visita = { id: id, inicio: Date.now(), origen: o[0], detalle: o[1], paginas: [], proceso: false, whatsapp: false, enviado: "" };
  }
  if (visita.paginas[visita.paginas.length - 1] !== location.pathname) visita.paginas.push(location.pathname);
  visita.paginas = visita.paginas.slice(-30);
  guardar("tda-visita", visita);

  function enviar() {
    if (!registrar) return;
    var datos = {
      id: visita.id, origen: visita.origen, detalle: visita.detalle, paginas: visita.paginas,
      proceso: visita.proceso, whatsapp: visita.whatsapp,
      c: perso ? perso.c : "", para: perso ? perso.para : "", m: perso ? perso.m : ""
    };
    var huella = JSON.stringify(datos);
    if (huella === visita.enviado) return; // nada nuevo desde el último envío
    visita.enviado = huella;
    guardar("tda-visita", visita);
    datos.segundos = Math.round((Date.now() - visita.inicio) / 1000);
    var cuerpo = JSON.stringify(datos);
    try {
      if (navigator.sendBeacon) { navigator.sendBeacon(REGISTRO_URL, new Blob([cuerpo], { type: "application/json" })); }
      else { fetch(REGISTRO_URL, { method: "POST", body: cuerpo, headers: { "Content-Type": "application/json" }, keepalive: true }); }
    } catch (e) { /* si falla, la página sigue igual */ }
  }

  // Link personalizado: se anota apenas lo abren (para que Juan lo vea en el momento).
  // Visitas anónimas: se anotan al salir o cambiar de app, así cada visita usa pocas llamadas a Airtable.
  if (perso && perso.c) enviar();
  document.addEventListener("visibilitychange", function () { if (document.visibilityState === "hidden") enviar(); });
  window.addEventListener("pagehide", enviar);

  var diagrama = document.querySelector(".bpmn"); // el proceso dibujado de ejemplo
  if (registrar && diagrama && "IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (es) {
      if (es.some(function (e) { return e.isIntersecting; })) {
        visita.proceso = true; guardar("tda-visita", visita); io.disconnect();
      }
    }, { threshold: 0.4 });
    io.observe(diagrama);
  }

  // Menú
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.querySelector(".nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.getAttribute("data-open") === "true";
      nav.setAttribute("data-open", open ? "false" : "true");
      toggle.setAttribute("aria-expanded", open ? "false" : "true");
    });
    nav.addEventListener("click", function (e) {
      if (e.target.tagName === "A") { nav.setAttribute("data-open", "false"); toggle.setAttribute("aria-expanded", "false"); }
    });
  }

  // WhatsApp: cada link con data-wa lleva su propio mensaje.
  // Con link personalizado, el mensaje dice de qué negocio escriben (aunque escriban desde otro número).
  document.querySelectorAll("a[data-wa]").forEach(function (a) {
    var msg = a.getAttribute("data-wa") || "Hola Juan, vi la página de Taller de Apps y quiero charlar 20 minutos.";
    if (perso) {
      msg = "Hola Juan, soy de " + perso.para + (perso.zona ? " (" + perso.zona + ")" : "") +
            ". Vi la página que me mandaste y quiero charlar 20 minutos.";
    }
    a.href = "https://wa.me/" + WHATSAPP + "?text=" + encodeURIComponent(msg);
    a.target = "_blank";
    a.rel = "noopener";
    a.addEventListener("click", function () { visita.whatsapp = true; guardar("tda-visita", visita); enviar(); });
  });

  // Demo
  document.querySelectorAll("a[data-demo]").forEach(function (a) {
    a.href = DEMO_URL;
    a.target = "_blank";
    a.rel = "noopener";
    // Los botones vienen ocultos (atributo hidden) y se muestran solo cuando está cargada la URL de la demo.
    if (DEMO_URL.indexOf("REEMPLAZAR") === -1) { a.hidden = false; }
  });
})();
