// Cloudflare Pages Function: GET /v/:id
// Link corto para mandar por WhatsApp, por ejemplo https://taller-de-apps.pages.dev/v/xaa3rg
// No lleva el nombre del negocio ni parámetros largos. Busca la cuenta en Airtable por los últimos
// 6 caracteres de su RECORD_ID() y redirige al "Link para mandar" completo, así la web saluda igual
// y la visita se anota igual (el link completo trae c=rec…).
//
// Variables en Cloudflare (las mismas que /api/visita):
//   AIRTABLE_TOKEN     (secreto) token con permiso data.records:read sobre la base del CRM
//   AIRTABLE_BASE_CRM  (opcional) id de la base del CRM; por defecto la de Radar
//
// Fórmula del campo "Link corto" en Cuentas (es lo que copiás y mandás):
//   IF({Cuenta}, "https://taller-de-apps.pages.dev/v/" & LOWER(RIGHT(RECORD_ID(), 6)))
//
// Si el id no existe, está mal escrito o Airtable no responde, manda al inicio del sitio.

const BASE_CRM = "appqhGg9msmlTKrbE";
const INICIO = "https://taller-de-apps.pages.dev/";
const LARGO = 6;

const alInicio = () => Response.redirect(INICIO, 302);

export async function onRequestGet({ params, env }) {
  const id = String(params.id || "").toLowerCase();
  if (!env.AIRTABLE_TOKEN || !new RegExp(`^[a-z0-9]{${LARGO}}$`).test(id)) return alInicio();

  const base = env.AIRTABLE_BASE_CRM || BASE_CRM;
  const formula = `LOWER(RIGHT(RECORD_ID(), ${LARGO})) = "${id}"`;
  const url = `https://api.airtable.com/v0/${base}/${encodeURIComponent("Cuentas")}` +
    `?maxRecords=2&fields%5B%5D=${encodeURIComponent("Link para mandar")}` +
    `&filterByFormula=${encodeURIComponent(formula)}`;

  let destino = "";
  try {
    const r = await fetch(url, { headers: { Authorization: `Bearer ${env.AIRTABLE_TOKEN}` } });
    if (!r.ok) {
      console.log("Airtable respondió", r.status, (await r.text()).slice(0, 300));
      return alInicio();
    }
    const data = await r.json();
    const registros = Array.isArray(data.records) ? data.records : [];
    if (registros.length !== 1) {
      if (registros.length > 1) console.log("Link corto ambiguo (dos cuentas terminan igual):", id);
      return alInicio();
    }
    destino = String((registros[0].fields || {})["Link para mandar"] || "");
  } catch (e) {
    console.log("No se pudo resolver el link corto:", String(e));
    return alInicio();
  }

  // Solo redirigimos dentro del propio sitio.
  if (!destino.startsWith(INICIO)) return alInicio();
  return new Response(null, { status: 302, headers: { "Location": destino, "Cache-Control": "no-store" } });
}
