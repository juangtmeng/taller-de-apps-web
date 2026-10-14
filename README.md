# Taller de Apps · sitio web

Sitio estático: HTML, CSS y JS sin dependencias ni build. Nueve páginas: el inicio y una por rubro.

| Archivo | Qué es | URL en Vercel |
|---|---|---|
| `index.html` | Página principal: qué hacemos, dolores, 4 pasos, para quién, compromisos, preguntas, quién soy, contacto | `/` |
| `talleres.html` | Talleres mecánicos | `/talleres` |
| `servicios-tecnicos.html` | Refrigeración, climatización, seguridad electrónica, piscinas | `/servicios-tecnicos` |
| `corralones.html` | Corralones, ferreterías y distribuidoras con reparto | `/corralones` |
| `turnos.html` | Negocios con turnos: veterinarias, estética, consultorios, gimnasios | `/turnos` |
| `comida.html` | Locales de comida que toman pedidos: rotiserías, pizzerías, viandas | `/comida` |
| `profesionales.html` | Estudios contables y jurídicos, inmobiliarias, arquitectura, empresas de servicios | `/profesionales` |
| `transporte.html` | Fletes, mudanzas, cargas | `/transporte` |
| `organizaciones.html` | Cooperativas de servicios, clubes, fundaciones, asociaciones | `/organizaciones` |

Las cinco últimas landings se generan con `make-landings.py` a partir de `landings_data.py` (herramientas aparte). Para cambiar un texto de esas páginas, conviene cambiarlo ahí y volver a generar; si se edita el HTML a mano, el próximo generado lo pisa.

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

`vercel.json` hace que las URLs salgan sin `.html` (`/talleres`) y que los archivos de `assets/` se guarden en caché una semana.

## Dónde se cambia cada cosa

| Quiero cambiar… | Dónde |
|---|---|
| Textos de una página | El `.html` correspondiente. Los textos están en el orden en que se leen. |
| Colores, tipografías, tamaños | `assets/styles.css`, bloque `:root` al principio. |
| Logo | El ícono está como SVG en el encabezado y el pie de cada página; los íconos del navegador y del celular en `assets/` (ver "Marca"). |
| Mensaje de WhatsApp de un botón | Atributo `data-wa="…"` de ese botón. |
| Imágenes para compartir por WhatsApp | `assets/img/mockup-*.png` (los dos celulares de cada rubro) y `assets/img/og-*.png` (la vista previa del link de cada página). Se regeneran con `render-mockups.py` (herramienta aparte, no hace falta subirla). |
| Años de experiencia, zona, teléfono | Buscá "Más de 10 años", "Unquillo" y "850 8990" en los `.html`. |

## Marca

Todo sigue el **Manual de marca v1** de Taller de Apps (hecho con Claude Design, 2026-10-14).

- **Ícono:** la regla (un celular de costado que también es una regla). En el encabezado va como SVG dentro del HTML, en verde, y hereda el color; en el pie va en crema sobre tinta. En celular, el encabezado muestra solo el ícono.
- **Nombre:** siempre "Taller de Apps", en Archivo 800 con interletrado −2,5 %.
- **Colores** (bloque `:root` de `styles.css`): crema `#F3EDE2` (fondo), tinta `#1E1B18` (texto y fondos oscuros), verde sierra `#1F6B4A` (botones, enlaces, ícono) y cobre `#C2653A` (subrayados y numeración; nunca en botones ni en texto chico). Tonos de apoyo: `#4A453E`, `#6B655C`, `#DDD6CA`, `#175338`.
- **Íconos del sitio:** `assets/favicon.svg` (versión de 3 marcas), `favicon-32.png`, `favicon-16.png`, `apple-touch-icon.png` (fondo verde, sin redondear), `android-chrome-192.png` e `icono-512.png` (para `site.webmanifest`).
- Las demás piezas (logo horizontal y apilado, foto de perfil de WhatsApp, imagen para compartir) están en el kit de Claude Design.

## Tipografías

Una sola: **Archivo** (pesos 400, 500, 600 y 800), servida desde `assets/fonts/` con su licencia Open Font License. Títulos 800, subtítulos 600, texto 400, etiquetas 500 en mayúsculas. No hay pedidos a Google Fonts ni a ningún tercero: el sitio no envía datos de los visitantes a nadie.

## Lo que no tiene a propósito

- Precios: no hay lista de precios (decisión del servicio). Las páginas explican que el precio sale por etapas, después del documento del proceso.
- Formulario de contacto: el canal es WhatsApp. Un formulario necesitaría backend y sería otro lugar donde responder.
- Analítica: no hay seguimiento de visitantes. Si más adelante querés medir, Vercel Analytics se activa desde el panel sin tocar el código.
