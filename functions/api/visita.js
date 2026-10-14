// Cloudflare Pages Function: POST /api/visita
// Recibe el resumen de una visita (lo arma assets/site.js) y lo anota en Airtable, una fila por visita.
//   - Visitas de un link personalizado (con c=recXXXXXXXXXXXXXX) → base del CRM, tabla "Visitas web", vinculada a la cuenta.
//   - Visitas anónimas → base aparte (AIRTABLE_BASE_VISITAS), tabla "Visitas". Si no está configurada, no se anotan.
// No usa cookies ni guarda la IP: la localidad sale de la conexión y es aproximada.
//
// Variables en Cloudflare (Settings → Variables and Secrets):
//   AIRTABLE_TOKEN         (secreto) token de Airtable con permiso data.records:write sobre las dos bases
//   AIRTABLE_BASE_CRM      (opcional) id de la base del CRM; por defecto la de Radar
//   AIRTABLE_BASE_VISITAS  (opcional) id de la base de visitas anónimas ("Visitas · Taller de Apps": appGt3CuZZ6Hovwts)

const BASE_CRM = "appqhGg9msmlTKrbE";

const PAGINAS = {
  "/": "Inicio",
  "/talleres": "Talleres mecánicos",
  "/servicios-tecnicos": "Servicios técnicos",
  "/corralones": "Corralones y reparto",
  "/turnos": "Turnos",
  "/comida": "Locales de comida",
  "/profesionales": "Estudios y empresas",
  "/transporte": "Transporte",
};

const ORIGENES = ["Link personalizado", "Google", "Instagram", "Facebook", "LinkedIn", "WhatsApp", "QR / impreso", "Directo", "Otro"];

// Robots y vistas previas de links (no corren JavaScript, pero por las dudas)
const ROBOT = /bot|crawl|spider|slurp|preview|facebookexternalhit|whatsapp\/|headless|lighthouse|pingdom|uptime/i;

const NADA = () => new Response(null, { status: 204 });

function texto(v, max) {
  return typeof v === "string" ? v.replace(/[\u0000-\u001f<>]/g, "").replace(/\s+/g, " ").trim().slice(0, max) : "";
}

function pagina(p) {
  if (typeof p !== "string") return "";
  let ruta = p.split("?")[0].replace(/\.html$/, "").replace(/\/index$/, "/").replace(/\/+$/, "") || "/";
  return PAGINAS[ruta] || "";
}

export async function onRequestPost({ request, env, waitUntil }) {
  if (!env.AIRTABLE_TOKEN) return NADA();
  const ua = request.headers.get("user-agent") || "";
  if (ROBOT.test(ua)) return NADA();

  // Solo pedidos que salen de la propia web
  const origin = request.headers.get("origin");
  try { if (origin && new URL(origin).host !== new URL(request.url).host) return NADA(); } catch { return NADA(); }

  let d;
  try {
    const crudo = await request.text();
    if (crudo.length > 4000) return NADA();
    d = JSON.parse(crudo);
  } catch { return NADA(); }

  const id = texto(d.id, 40);
  if (!/^[a-z0-9-]{8,40}$/i.test(id)) return NADA();
  const c = /^rec[A-Za-z0-9]{14}$/.test(d.c || "") ? d.c : "";

  // Páginas vistas, en orden, sin repetir recargas seguidas; solo páginas conocidas del sitio
  const paginas = [];
  for (const p of (Array.isArray(d.paginas) ? d.paginas : []).slice(0, 40)) {
    const nombre = pagina(p);
    if (nombre && paginas[paginas.length - 1] !== nombre) paginas.push(nombre);
  }
  if (!paginas.length) return NADA();

  const cf = request.cf || {};
  const localidad = [cf.city, cf.region].filter(Boolean).join(", ") + (cf.country && cf.country !== "AR" ? ` (${cf.country})` : "");
  const dispositivo = /iPad|Tablet/i.test(ua) ? "Tablet" : /Mobi|Android|iPhone/i.test(ua) ? "Celular" : "Computadora";
  const origen = ORIGENES.includes(d.origen) ? d.origen : "Otro";
  const para = texto(d.para, 80);
  const segundos = Math.min(Math.max(parseInt(d.segundos, 10) || 0, 0), 86400);

  const resumen = [para || "Visita", paginas.join(" → "), d.proceso ? "vio el proceso" : "", d.whatsapp ? "tocó WhatsApp" : ""]
    .filter(Boolean).join(" · ").slice(0, 250);

  const fields = {
    "Resumen": resumen,
    "ID de visita": id,
    "Origen": origen,
    "Detalle del origen": texto(d.detalle, 80),
    "Versión del mensaje": texto(d.m, 10),
    "Página de entrada": paginas[0],
    "Páginas vistas": paginas.join(" → "),
    "Vio el proceso": d.proceso === true,
    "Tocó WhatsApp": d.whatsapp === true,
    "Dispositivo": dispositivo,
    "Localidad aproximada": localidad,
    "Segundos": segundos,
  };

  let base, tabla;
  if (c) {
    base = env.AIRTABLE_BASE_CRM || BASE_CRM;
    tabla = "Visitas web";
    fields["Cuenta"] = [c];
  } else if (env.AIRTABLE_BASE_VISITAS) {
    base = env.AIRTABLE_BASE_VISITAS;
    tabla = "Visitas";
  } else {
    return NADA();
  }

  // Una fila por visita: si ya existe una con el mismo "ID de visita", se actualiza (upsert).
  const envio = fetch(`https://api.airtable.com/v0/${base}/${encodeURIComponent(tabla)}`, {
    method: "PATCH",
    headers: { "Authorization": `Bearer ${env.AIRTABLE_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({ performUpsert: { fieldsToMergeOn: ["ID de visita"] }, typecast: true, records: [{ fields }] }),
  }).then(async (r) => {
    if (!r.ok) console.log("Airtable respondió", r.status, (await r.text()).slice(0, 300));
  }).catch((e) => console.log("No se pudo anotar la visita:", String(e)));

  if (typeof waitUntil === "function") waitUntil(envio); else await envio;
  return NADA();
}
