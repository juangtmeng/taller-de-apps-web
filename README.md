# Taller de Apps · sitio web

Sitio estático: HTML, CSS y JS sin dependencias ni build. Ocho páginas: el inicio y una por rubro. Todo el sitio repite la misma idea: cada herramienta se hace a medida, sobre cómo trabaja hoy cada negocio.

| Archivo | Qué es | URL en Vercel |
|---|---|---|
| `index.html` | Página principal: qué hacemos, dolores, 4 pasos (el primero con un proceso dibujado de ejemplo), para quién, compromisos, preguntas, quién soy, contacto | `/` |
| `talleres.html` | Talleres mecánicos | `/talleres` |
| `servicios-tecnicos.html` | Refrigeración, climatización, seguridad electrónica, piscinas | `/servicios-tecnicos` |
| `corralones.html` | Corralones, ferreterías y distribuidoras con reparto | `/corralones` |
| `turnos.html` | Negocios con turnos: veterinarias, estética, consultorios, gimnasios | `/turnos` |
| `comida.html` | Locales de comida que toman pedidos: rotiserías, pizzerías, viandas | `/comida` |
| `profesionales.html` | Estudios contables y jurídicos, inmobiliarias, arquitectura, empresas de servicios | `/profesionales` |
| `transporte.html` | Fletes, mudanzas, cargas | `/transporte` |

La página de organizaciones se sacó por ahora: `vercel.json` manda `/organizaciones` al inicio, así que si el archivo `organizaciones.html` sigue en GitHub no molesta (se puede borrar).

Las cuatro últimas landings se generan con `make-landings.py` a partir de `landings_data.py` (herramientas aparte). Para cambiar un texto de esas páginas, conviene cambiarlo ahí y volver a generar; si se edita el HTML a mano, el próximo generado lo pisa.

## Datos en `assets/site.js`

```js
var WHATSAPP = "5493518508990";                 // ya está cargado
var DEMO_URL = "https://REEMPLAZAR-POR-LA-URL-DE-LA-DEMO"; // ← poner la URL de la orden digital cuando esté publicada
```

Todos los botones "Escribime por WhatsApp" arman solos el link `wa.me` con un mensaje prellenado distinto por página (atributo `data-wa` en cada botón). Todos los botones "Ver la demo" apuntan a `DEMO_URL`; **mientras `DEMO_URL` siga diciendo REEMPLAZAR, esos botones no se muestran**, así que la web se puede publicar antes que la demo.

## Publicar en Vercel (2 minutos)

1. Subí esta carpeta a un repo de GitHub (por ejemplo `taller-de-apps-web`).
2. En Vercel: **Add New → Project → Import** ese repo. Framework: *Other*. Sin comando de build. Deploy.
3. Queda en `https://<nombre>.vercel.app`. Cuando tengas dominio propio, se agrega en *Settings → Domains*.

`vercel.json` hace que las URLs salgan sin `.html` (`/talleres`) y que solo las tipografías se guarden en caché por mucho tiempo. `styles.css` y `site.js` se piden con un número de versión (`styles.css?v=20261014c`): **si los cambiás, subí ese número en las 8 páginas** (o en `brand.py` si usás el generador), así los navegadores no siguen mostrando la copia vieja.

## Dónde se cambia cada cosa

| Quiero cambiar… | Dónde |
|---|---|
| Textos de una página | El `.html` correspondiente. Los textos están en el orden en que se leen. |
| Colores, tipografías, tamaños | `assets/styles.css`, bloque `:root` al principio. |
| Logo | El ícono está como SVG en el encabezado y el pie de cada página; los íconos del navegador y del celular en `assets/` (ver "Marca"). |
| Mensaje de WhatsApp de un botón | Atributo `data-wa="…"` de ese botón. |
| Imágenes para compartir por WhatsApp | `assets/img/mockup-*.png` (los dos celulares de cada rubro) y `assets/img/og-*.png` (la vista previa del link de cada página). Se regeneran con `render-mockups.py` (herramienta aparte, no hace falta subirla). |
| Años de experiencia, zona, teléfono | Buscá "más de 12 años", "Unquillo" y "850 8990" en los `.html`. |
| Diagramas de proceso ("Tu proceso, dibujado tal como es") | Son SVG dentro de cada página, uno de ejemplo por rubro. Se generan con `bpmn.py` (herramienta aparte): los carriles son las personas, las cajas los pasos y los puntos de cobre marcan dónde algo se anota dos veces, se pierde o alguien tiene que preguntar. |

## Marca

Todo sigue el **Manual de marca v1** de Taller de Apps (hecho con Claude Design, 2026-10-14).

- **Ícono:** la regla (un celular de costado que también es una regla). En el encabezado va como SVG dentro del HTML, en verde, y hereda el color; en el pie va en crema sobre tinta. En celular, el encabezado muestra solo el ícono.
- **Nombre:** siempre "Taller de Apps", en Archivo 800 con interletrado −2,5 %.
- **Lema** (en el pie de todas las páginas): "Hecho a tu medida. Lo ves andar antes de pagar."
- **Colores** (bloque `:root` de `styles.css`): crema `#F3EDE2` (fondo), tinta `#1E1B18` (texto y fondos oscuros), verde sierra `#1F6B4A` (botones, enlaces, ícono) y cobre `#C2653A` (subrayados y numeración; nunca en botones ni en texto chico). Tonos de apoyo: `#4A453E`, `#6B655C`, `#DDD6CA`, `#175338`.
- **Íconos del sitio:** `assets/favicon.svg` (versión de 3 marcas), `favicon-32.png`, `favicon-16.png`, `apple-touch-icon.png` (fondo verde, sin redondear), `android-chrome-192.png` e `icono-512.png` (para `site.webmanifest`).
- Las demás piezas (logo horizontal y apilado, foto de perfil de WhatsApp, imagen para compartir) están en el kit de Claude Design.

## Tipografías

Una sola: **Archivo** (pesos 400, 500, 600 y 800), servida desde `assets/fonts/` con su licencia Open Font License. Títulos 800, subtítulos 600, texto 400, etiquetas 500 en mayúsculas. No hay pedidos a Google Fonts ni a ningún tercero: el sitio no envía datos de los visitantes a nadie.

## Lo que no tiene a propósito

- Precios: no hay lista de precios (decisión del servicio). Las páginas explican que el precio sale por etapas, después del documento del proceso.
- Formulario de contacto: el canal es WhatsApp. Un formulario necesitaría backend y sería otro lugar donde responder.
- Analítica: no hay seguimiento de visitantes. Si más adelante querés medir, Vercel Analytics se activa desde el panel sin tocar el código.
