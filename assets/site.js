/* Taller de Apps — comportamiento mínimo.
   1) Menú en celular.  2) Links de WhatsApp con mensaje prellenado.  3) Link de la demo. */
(function () {
  // === Datos que se cambian en un solo lugar ===
  var WHATSAPP = "5493518508990"; // +54 9 351 850 8990, sin signos
  var DEMO_URL = "https://REEMPLAZAR-POR-LA-URL-DE-LA-DEMO"; // la orden digital publicada en Vercel

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

  // WhatsApp: cada link con data-wa lleva su propio mensaje
  document.querySelectorAll("a[data-wa]").forEach(function (a) {
    var msg = a.getAttribute("data-wa") || "Hola Juan, vi la página de Taller de Apps y quiero charlar 20 minutos.";
    a.href = "https://wa.me/" + WHATSAPP + "?text=" + encodeURIComponent(msg);
    a.target = "_blank";
    a.rel = "noopener";
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
